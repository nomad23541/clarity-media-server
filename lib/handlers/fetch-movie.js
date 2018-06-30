const tmdb = require('../tmdb.js')
const config = require('../../config')
const getVideoInfo = require('get-video-info')
const path = require('path')
const fs = require('fs')
const db = require('../setup/setup-db').db()
const tools = require('./metadata-tools')

const API_KEY = config.tmdbApiKey

// params = title, year, file
module.exports.fetchMovieMetadata = function(params, callback) {
    tmdb.searchMovies({
        title: params.title,
        year: params.year,
        apiKey: API_KEY
    }).then(function(results) {
        const id = results.results[0].id
        let detailsPromise = tmdb.getMovieDetails({ id: id, apiKey: API_KEY })
        let releaseDatesPromise = tmdb.getReleaseDates({ id: id, apiKey: API_KEY })
        let creditsPromise = tmdb.getCredits({ id: id, apiKey: API_KEY })
        let videoInfo = getVideoInfo(path.join(config.moviesDirectory, params.file))

        Promise.all([detailsPromise, releaseDatesPromise, creditsPromise, videoInfo]).then(function(results) {
            let details = results[0]
            let releaseDates = results[1]
            let credits = results[2]
            let videoInfo = results[3]

            let poster = tools.downloadPoster(details.poster_path, details.id)
            let backdrop = tools.downloadBackdrop(details.backdrop_path, details.id)
            let creditImages = downloadCreditImages(credits)
            // find the US release and grab the MPAA rating
            // some movies won't have a US release, so don't set the rating for those
            let rated = releaseDates.results.find(release => release.iso_3166_1 === 'US')
            if(!rated) {
                rated = ''
            } else {
                rated = rated.release_dates[0].certification
            }

            // determine if this file will need to be transcoded.
            // must check for file extension instead of codec, browser won't playback
            // if codec is h264 but the file container is .mkv
            let needsTranscoding = false
            if(params.file.split('.').pop() != 'mp4') {
                needsTranscoding = true
            }

            // object to be inserted into db
            let doc = {
                title: details.title,
                year: details.release_date.split('-')[0],
                releaseDate: details.release_date,
                rated,
                runtime: details.runtime,
                tagline: details.tagline,
                plot: details.overview,
                images: {
                    posterLocal: poster.imageLocal,
                    posterWeb: poster.imageWeb,
                    backdropLocal: backdrop.imageLocal,
                    backdropWeb: backdrop.imageWeb
                },
                genres: details.genres,
                tmdbid: details.id,
                imdbid: details.imdb_id,
                file: params.file,
                location: path.join(config.moviesDirectory, params.file),
                videoInfo: {
                    videoCodec: videoInfo.streams[0].codec_name,
                    audioCodec: videoInfo.streams[1].codec_name,
                    width: videoInfo.streams[0].width,
                    height: videoInfo.streams[0].height,
                    duration: videoInfo.format.duration,
                },
                cast: creditImages.cast,
                director: creditImages.director,
                needsTranscoding,
                type: 'movie'
            }
        
            callback(doc)
        }).catch(function(err) {
            console.log('Error occurred while fetching metadata for: ' + params.title + ' (' + params.year + ') tmdbid: ' + id + ' - ' + err)
        })
    }).catch(function(err) {
        console.warn('Failed to search for: ' + params.title + ' (' + params.year + ')')
        console.log(err)
    })
}

downloadCreditImages = function(credits) {
    // create profiles folder if it doesn't exist
    let profilesDirectory = path.join(config.posterDirectory, '/profiles')
    if(!fs.existsSync(profilesDirectory)) {
        fs.mkdirSync(profilesDirectory)
    }
    
    // download profile images for each cast member
    // some cast members don't have an image, so ignore any errors that occur here
    credits.cast.forEach(member => {
        tmdb.getImage({
            path: member.profile_path,
            size: 'w185'
        }).then(function(image) {
            fs.writeFile(path.join(profilesDirectory, member.id + '.jpg'), image, 'binary', function(err) {
                if(err) return console.log('Failed to download profile for ' + member.id)
            })
        }).catch(function(err) {})
    })

    // get only the details I want from each cast member
    let cast = []
    for(let i = 0; i < credits.cast.length; i++) {
        let member = credits.cast[i]
        cast.push({
            name: member.name,
            character: member.character,
            id: member.id,
            profileLocal: path.join(profilesDirectory, member.id + '.jpg'),
            profileWeb: path.join('/images', member.id + '.jpg')
        })
    }

    // now get the director
    let directorObj = credits.crew.find(member => member.job === 'Director')
    // also download their profile image
    tmdb.getImage({
        path: directorObj.profile_path,
        size: 'w185'
    }).then(function(image) {
        fs.writeFile(path.join(profilesDirectory, directorObj.id + '.jpg'), image, 'binary', function(err) {
            if(err) return console.log('Failed to download profile for director: ' + directorObj.id)
        })
    }).catch(function(err) {})

    let director = {
        name: directorObj.name,
        id: directorObj.id,
        profileLocal: path.join(profilesDirectory, directorObj.id + '.jpg'),
        profileWeb: path.join('/images', directorObj.id + '.jpg')
    }

    return { cast, director }
}