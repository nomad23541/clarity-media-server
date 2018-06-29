const db = require('../setup/setup-db').db()
const config = require('../../config')
const titleCleaner = require('../utils/title-cleaner')
const path = require('path')
const tmdb = require('../tmdb')
const fs = require('fs')
const getVideoInfo = require('get-video-info')
const isVideo = require('is-video')
const io = require('../setup/setup-socket-io').io()

const movie = require('./fetch-movie')
const show = require('./fetch-show')

const API_KEY = config.tmdbApiKey

/**
 * Read a file and fetch it's metadata, if found
 */
module.exports.fetchMoviesMetadata = function() {
    // get current iteration, used for sending progress to client
    let currentIndex = 0;
    let files = fs.readdirSync(config.moviesDirectory)

    // tell the client that there is no media to scan
    if(files.length == 0) {
        io.emit('scanProgress', { msg: "NOMEDIA" })
        return
    }

    files.forEach(file => {
        // skip this file if it isn't a video file
        if(!isVideo(file)) {
            // if we don't increase the current index, the client will stall
            currentIndex++
            return
        }

        let cleaned = titleCleaner.cleanupTitle(file)
        let title = cleaned.title
        let year = cleaned.year
    
        movie.fetchMovieMetadata({ title, year, file }, function(doc) {
            db.insert(doc, function(err, newDoc) {
                currentIndex++
                let percentage = parseInt((currentIndex / files.length) * 100)
                io.emit('scanProgress', { msg: percentage })
            })
        })
    })
}

// seperate function for testing show metadata
module.exports.fetchShowsMetadata = function() {
    // get current iteration, used for sending progress to client
    let currentIndex = 0;

    // scan shows directory
    let showDirectories = fs.readdirSync(config.showsDirectory)
    showDirectories.forEach(directory => {
        show.fetchShowMetadata({ showDir: directory }, function(episodeDoc) {
            db.insert(episodeDoc, function(err, newDoc) {
                currentIndex++
                let percentage = parseInt((currentIndex / showDirectories.length) * 100)
                io.emit('scanProgress', { msg: percentage })
            })
        })
    })
}

// fix the metadata with a preexising id in the db with a new tmdbid
module.exports.fixMetadata = function(tmdbid, id, callback) {
    db.findOne({ _id: id }, function(err, doc) {
        if(!doc) return console.log(err)
        updateAndReplace(tmdbid, doc, function(newDoc) {
            callback(newDoc)
        })
    })
}

/**
 * This will need to be cleaned up and probably turn into it's own function
 * instead of copying directly from fetchMetadata()
*/
updateAndReplace = function(tmdbid, oldDoc, callback) {
    let file = oldDoc.file
    // skip this file if it isn't a video file
    if(!isVideo(file)) {
        // if we don't increase the current index, the client will stall
        currentIndex++
        return
    }

    const id = tmdbid
    let detailsPromise = tmdb.getMovieDetails({ id: id, apiKey: API_KEY })
    let releaseDatesPromise = tmdb.getReleaseDates({ id: id, apiKey: API_KEY })
    let creditsPromise = tmdb.getCredits({ id: id, apiKey: API_KEY })
    let videoInfo = getVideoInfo(path.join(config.moviesDirectory, file))

    Promise.all([detailsPromise, releaseDatesPromise, creditsPromise, videoInfo]).then(function(results) {
        let details = results[0]
        let releaseDates = results[1]
        let credits = results[2]
        let videoInfo = results[3]

        let images = downloadImages(details)
        let creditImages = downloadCreditImages(credits)
        // find the US release and grab the MPAA rating
        // some movies won't have a US release, so don't set the rating for those
        let rated = releaseDates.results.find(release => release.iso_3166_1 === ('US'))
        if(!rated) {
            rated = ''
        } else {
            rated = rated.release_dates[0].certification
        }

        // determine if this file will need to be transcoded.
        // must check for file extension instead of codec, browser won't playback
        // if codec is h264 but the file container is .mkv
        let needsTranscoding = false
        if(file.split('.').pop() != 'mp4') {
            needsTranscoding = true
        }

        // object to be inserted into db
        let doc = {
            title: details.title,
            year: details.release_date.split('-')[0],
            releaseDate: details.relase_date,
            rated,
            runtime: details.runtime,
            tagline: details.tagline,
            plot: details.overview,
            images: {
                posterLocal: images.poster_local,
                posterWeb: images.poster_web,
                backdropLocal: images.backdrop_local,
                backdropWeb: images.backdrop_web
            },
            genres: details.genres,
            tmdbid: details.id,
            imdbid: details.imdb_id,
            file,
            location: path.join(config.moviesDirectory, file),
            videoInfo: {
                videoCodec: videoInfo.streams[0].codec_name,
                audioCodec: videoInfo.streams[1].codec_name,
                width: videoInfo.streams[0].width,
                height: videoInfo.streams[0].height,
                duration: videoInfo.format.duration,
            },
            cast: creditImages.cast,
            director: creditImages.director,
            needsTranscoding
        }


        // remove the preexisting id and insert a new one,
        // then call ze callback with the new Document
        db.remove({ _id: oldDoc._id }, {})
        db.insert(doc, function(err, newDoc) {
            callback(newDoc)
        })
    }).catch(function(err) {
        console.log(err)
    })
}