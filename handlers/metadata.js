const db = require('../utils/setup-db').db()
const config = require('../config')
const titleCleaner = require('../utils/title-cleaner')
const path = require('path')
const tmdb = require('../handlers/tmdb')
const fs = require('fs')
const getVideoInfo = require('get-video-info')
const isVideo = require('is-video')
const io = require('../utils/setup-socketio').io()

const API_KEY = config.tmdbApiKey

/**
 * Read a file and fetch it's metadata, if found
 */
module.exports.fetchMetadata = function() {
    var files = fs.readdirSync(config.mediaDirectory)
    // get current iteration, used for sending progress to client
    var currentIndex = 0;

    // tell the client that there is no media to scan
    if(files.length == 0) {
        io.emit('scanProgress', { msg: "NOMEDIA" })
        return
    }

    files.forEach(file => {
        // skip this file if it isn't a video file
        if(!isVideo(path.join(config.mediaDirectory, file))) {
            // if we don't increase the current index, the client will stall
            currentIndex++
            return
        }

        var cleaned = titleCleaner.cleanupTitle(file)
        var title = cleaned.title
        var year = cleaned.year
    
        tmdb.search({
            title: title,
            year: year,
            apiKey: API_KEY
        }).then(function(results) {
            const id = results.results[0].id
            var detailsPromise = tmdb.getMovieDetails({ id: id, apiKey: API_KEY })
            var releaseDatesPromise = tmdb.getReleaseDates({ id: id, apiKey: API_KEY })
            var creditsPromise = tmdb.getCredits({ id: id, apiKey: API_KEY })
            var videoInfo = getVideoInfo(path.join(config.mediaDirectory, file))
    
            Promise.all([detailsPromise, releaseDatesPromise, creditsPromise, videoInfo]).then(function(results) {
                var details = results[0]
                var releaseDates = results[1]
                var credits = results[2]
                var videoInfo = results[3]
    
                var images = downloadImages(details)
                var creditImages = downloadCreditImages(credits)
                // find the US release and grab the MPAA rating
                var rated = releaseDates.results.find(release => release.iso_3166_1 === 'US').release_dates[0].certification
                // object to be inserted into db
                var doc = {
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
                    location: path.join(config.mediaDirectory, file),
                    videoInfo: {
                        videoCodec: videoInfo.streams[0].codec_name,
                        audioCodec: videoInfo.streams[1].codec_name,
                        width: videoInfo.streams[0].width,
                        height: videoInfo.streams[0].height
                    },
                    cast: creditImages.cast,
                    director: creditImages.director
                }
            
                db.insert(doc, function(err, newDoc) {
                    currentIndex++
                    var percentage = parseInt((currentIndex / files.length) * 100)
                    io.emit('scanProgress', { msg: percentage })
                })
            }).catch(function(err) {
                console.log(err)
            })
        }).catch(function(err) {
            console.warn('Failed to search for: ' + title + ' (' + year + ')')
            console.log(err)
        })
    })
}

downloadCreditImages = function(credits) {
    // create profiles folder if it doesn't exist
    var profilesDirectory = path.join(config.posterDirectory, '/profiles')
    if(!fs.existsSync(profilesDirectory)) {
        fs.mkdirSync(profilesDirectory)
    }
    
    // download profile images for each cast member
    credits.cast.forEach(member => {
        tmdb.getImage(member.profile_path, 'w185').then(function(image) {
            fs.writeFile(path.join(profilesDirectory, member.id + '.jpg'), image, 'binary', function(err) {
                if(err) return console.log('Failed to download profile for ' + member.id)
            })
        })
    })

    // get only the details I want from each cast member
    let cast = []
    // limit how many cast members we store
    let castLimit = 15
    for(let i = 0; i < credits.cast.length; i++) {
        if(i == castLimit) {
            break;
        }

        let member = credits.cast[i]
        cast.push({
            name: member.name,
            character: member.character,
            id: member.id,
            profileLocal: path.join(profilesDirectory, member.id + '.jpg'),
            profileWeb: '/profiles/' + member.id + '.jpg'
        })
    }

    // now get the director
    let directorObj = credits.crew.find(member => member.job === 'Director')
    // also download their profile image
    tmdb.getImage(directorObj.profile_path, 'w185').then(function(image) {
        fs.writeFile(path.join(profilesDirectory, directorObj.id + '.jpg'), image, 'binary', function(err) {
            if(err) return console.log('Failed to download profile for director: ' + directorObj.id)
        })
    })

    var director = {
        name: directorObj.name,
        id: directorObj.id,
        profileLocal: path.join(profilesDirectory, directorObj.id + '.jpg'),
        profileWeb: '/profiles/' + directorObj.id + '.jpg'
    }

    return { cast, director };
}

downloadImages = function(result) {
    // create poster folder if it doesn't exist
    if(!fs.existsSync(config.posterDirectory)) {
        fs.mkdirSync(config.posterDirectory)
    }

    var posterOutput = 'poster_' + result.id + '.jpg'
    var backdropOutput = 'backdrop_' + result.id + '.jpg'

    tmdb.getImages({
        poster_path: result.poster_path,
        backdrop_path: result.backdrop_path
    }).then(function(images) {
        fs.writeFile(path.join(config.posterDirectory, posterOutput), images.poster, 'binary', function(err) {
            if(err) return console.log('Failed to download poster for ' + result.id)
        })

        fs.writeFile(path.join(config.posterDirectory, backdropOutput), images.backdrop, 'binary', function(err) {
            if(err) return console.log('Failed to download backdrop for ' + result.id)
        })
    })

    return {
        poster_local: path.join(config.posterDirectory, posterOutput),
        poster_web: path.join('/posters', posterOutput),
        backdrop_local: path.join(config.posterDirectory, backdropOutput),
        backdrop_web: path.join('/posters', backdropOutput)
    }
}