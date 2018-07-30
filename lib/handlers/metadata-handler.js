const config = require('../../config')
const titleCleaner = require('../utils/title-cleaner')
const path = require('path')
const tmdb = require('../tmdb')
const fs = require('fs')
const getVideoInfo = require('get-video-info')
const isVideo = require('is-video')
const io = require('../setup/setup-socket-io').io()

const Movie = require('../../models/movie')
const Show = require('../../models/show') 

const movie = require('./movie-processor')
const show = require('./show-processor')

const API_KEY = config.tmdbApiKey

/**
 * Read a file and fetch it's metadata, if found
 */
module.exports.processMovies = function() {
    // get current iteration, used for sending progress to client
    let currentIndex = 0;
    let files = fs.readdirSync(config.moviesDirectory)

    // tell the client that there is no media to scan
    if(files.length == 0) {
        io.emit('scanProgress', { msg: "NOMEDIA" })
        return
    }

    files.forEach(file => {
        // only use files that ARE video files
        if(!isVideo(file)) {
            currentIndex++
            return
        }

        let cleanedTitle = titleCleaner.cleanupTitle(file)
        let title = cleanedTitle.title
        let year = cleanedTitle.year
        let location = path.join(config.moviesDirectory, file)

        let newMovie = Movie({
            title: title,
            year: year,
            location: location,
            needsTranscoding: file.split('.').pop() != 'mp4'
        })

        getVideoInfo(location).then(info => {
            newMovie.videoInfo.videoCodec = info.streams[0].codec_name
            newMovie.videoInfo.audioCodec = info.streams[1].codec_name
            newMovie.videoInfo.width = info.streams[0].width
            newMovie.videoInfo.height = info.streams[0].height
            newMovie.videoInfo.duration = info.format.duration
        }).catch(function(err) {
            console.log('Error while getting videoInfo ' + location + ' ' + err)
        }).then(function() {
            // now search for the movie
            tmdb.searchMovies({
                title: title, 
                year: year,
                apiKey: API_KEY
            }).catch(function(err) {
                console.log(err)
                // if we couldn't find the movie, fallback and only insert the basics
                newMovie.save(function(err) {
                    if(err) console.log(err)
                    currentIndex++
                    let percentage = parseInt((currentIndex / files.length) * 100)
                    io.emit('scanProgress', { msg: percentage })
                })
            }).then(function(results) {
                movie.processMetadata(results.results[0].id, newMovie, function() {
                    // save this document with metadata information
                    newMovie.save(function(err) {
                        if(err) console.log(err)
                        currentIndex++
                        let percentage = parseInt((currentIndex / files.length) * 100)
                        io.emit('scanProgress', { msg: percentage })
                    })
                })
            })
        })
    })
}

// seperate function for testing show metadata
module.exports.processShows = function() {
    // get current iteration, used for sending progress to client
    let currentIndex = 0;

    // scan shows directory
    let showDirs = fs.readdirSync(config.showsDirectory)
    showDirs.forEach(directory => {
        let cleanedTitle = titleCleaner.cleanupTitle(directory)
        let name = cleanedTitle.title
        let location = path.join(config.showsDirectory, directory)

        let newShow = Show({
            name: name,
            location: location
        })

        // get how many seasons and episodes are on disk for this show
        // we're only going to be fetching metadata for these
        let seasonDirs = fs.readdirSync(location)
        for(let i = 0; i < seasonDirs.length; i++) {
            let dir = seasonDirs[i]
            let seasonDirContent = fs.readdirSync(path.join(location, dir))
            let episodeCount = 0
            
            for(let j = 0; j < seasonDirContent.length; j++) {
                let file = seasonDirContent[j]

                if(isVideo(file)) {
                    episodeCount++
                }
            }

            newShow.seasons.push({
                location: path.join(location, dir),
                seasonNumber: parseInt(dir.match(/\d+/g)[0]),
                episodeCount: episodeCount
            })
        }

        tmdb.searchShows({
            title: name,
            apiKey: API_KEY
        }).catch(function(err) {
            console.log('Failed to search for: ' + title + ' ' + err)
            newShow.save(function(err) {
                if(err) console.log(err)
                currentIndex++
                let percentage = parseInt((currentIndex / showDirs.length) * 100)
                io.emit('scanProgress', { msg: percentage })
            })
        }).then(function(results) {
            show.processMetadata(results.results[0].id, newShow, function(episodeDoc) {
                newShow.save(function(err) {
                    if(err) console.log(err)
                    currentIndex++
                    let percentage = parseInt((currentIndex / showDirs.length) * 100)
                    io.emit('scanProgress', { msg: percentage })
                })
            })
        })
    })
}

/**
 * This will update a document according to new tmdbid
 * 
 * Sometimes this will need to be called if the metadata processor 
 * fetches the wrong metadata
 */
module.exports.fixMovie = function(tmdbid, id, callback) {
    // find the movie we want to fix
    Movie.findOne({ _id: id }, function(err, doc) {
        if(err || !doc) return console.log(err)
        // get new metdata by tmdbid provided
        movie.processMetadata(tmdbid, doc, function(updatedDoc) {
            // finally find the original and update it!
            Movie.findOneAndUpdate({ _id: id }, updatedDoc, function(err, doc) {
                if(err) console.log(err)
                callback(doc)
            })
        })
    })
}