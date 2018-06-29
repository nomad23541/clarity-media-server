const tmdb = require('../tmdb.js')
const config = require('../../config')
const path = require('path')
const isVideo = require('is-video')
const getVideoInfo = require('get-video-info')
const fs = require('fs')
const titleCleaner = require('../utils/title-cleaner')
const db = require('../setup/setup-db').db()
const io = require('../setup/setup-socket-io').io()

const API_KEY = config.tmdbApiKey

// params = showDir
// --Show.Name
//  --Season.Number
//      --Episode Files []
module.exports.fetchShowMetadata = function(params, callback) {
    // start with Show.Name folder
    // first of all, get metadata for Show.Name and insert as it's own doc in db
    let showName = titleCleaner.cleanupTitle(params.showDir).title
    console.log('SEARCHING: ' + showName)
    // search tmdb
    tmdb.searchShows({
        title: showName,
        apiKey: API_KEY
    }).then(function(results) {
        // get show tmdbid
        let id = results.results[0].id
        console.log('FOUND: ' + showName + ' id: ' + id)

        tmdb.getShowDetails({ id: id, apiKey: API_KEY }).then(function(details) {
            // download show backdrop and poster
            let backdrop = downloadBackdrop(details.backdrop_path, details.id)
            let poster = downloadPoster(details.poster_path, details.id)

            // store seasons in this array
            let seasons = []

            // for each season, download it's poster and get it's overview
            for(let i = 0; i < details.seasons.length; i++) {
                let season = details.seasons[i]

                let seasonPoster = downloadPoster(season.poster_path, season.id)
                let seasonObj = {
                    name: season.name,
                    overview: season.overview,
                    images: {
                        posterWeb: seasonPoster.imageWeb,
                        posterLocal: seasonPoster.imageLocal
                    },
                    tmdbid: season.id,
                    seasonNumber: season.season_number,
                    numberOfEpisodes: season.episode_count,
                    airDate: season.air_date
                }

                seasons.push(seasonObj)
            }

            let showDoc = {
                name: details.name,
                overview: details.overview,
                numberOfEpisodes: details.number_of_episodes,
                numberOfSeasons: details.number_of_seasons,
                images: {
                    backdropLocal: backdrop.imageLocal,
                    backdropWeb: backdrop.imageWeb,
                    posterLocal: poster.imageLocal,
                    posterWeb: poster.imageWeb
                },
                seasons,
                tmdbid: details.id,
                type: 'show'
            }

            // finally insert this show into the db
            db.insert(showDoc, function(err, newDoc) {
                console.log('FINISHED SHOW DETAILS ' + showName + ' id: ' + id)
            })
        }).catch(function(err) {
            console.log(err)
        })

        // get all sub directories in show directory
        let seasonDirectories = fs.readdirSync(path.join(config.showsDirectory, params.showDir))
        // now scan and make sure those folder names contain season and #
        for(let i = 0; i < seasonDirectories.length; i++) {
            let seasonDir = fs.readdirSync(path.join(config.showsDirectory, params.showDir, seasonDirectories[i]))
            // now scan seasonDir's episode files
            for(let j = 0; j < seasonDir.length; j++) {
                let file = seasonDir[j]
                // make sure the file is a video file
                if(isVideo(file)) {
                    let cleanedFile = titleCleaner.cleanupTitle(file)
                    let title = cleanedFile.title
                    let season = cleanedFile.season
                    let episode = cleanedFile.episode

                    let directory = path.join(config.showsDirectory, params.showDir, seasonDirectories[i])

                    let episodeDetailsPromise = tmdb.getEpisodeDetails({ id: id, seasonNumber: season, episodeNumber: episode, apiKey: API_KEY })
                    let videoInfoPromise = getVideoInfo(path.join(directory, file))

                    Promise.all([episodeDetailsPromise, videoInfoPromise]).then(function(results) {
                        let details = results[0]
                        let videoInfo = results[1]

                        let needsTranscoding = false
                        if(file.split('.').pop() != 'mp4') {
                            needsTranscoding = true
                        }

                        let still = downloadStill(details.still_path, details.id)
                        let episodeDoc = {
                            showName: showName,
                            name: details.name,
                            overview: details.overview,
                            tmdbid: details.id,
                            episodeNumber: details.episode_number,
                            seasonNumber: details.season_number,
                            images: {
                                stillWeb: still.imageWeb,
                                stillLocal: still.imageLocal
                            },
                            airDate: details.air_date,
                            file: file,
                            location: path.join(directory, file),
                            videoInfo: {
                                videoCodec: videoInfo.streams[0].codec_name,
                                audioCodec: videoInfo.streams[1].codec_name,
                                width: videoInfo.streams[0].width,
                                height: videoInfo.streams[0].height,
                                duration: videoInfo.format.duration,
                            },
                            needsTranscoding,
                            type: 'episode'
                        }

                        db.insert(episodeDoc, function(err, newDoc) {
                            console.log('FINISHED DETAILS FOR: ' + title + ' Season ' + season + ' Episode ' + episode)
                        })
                    }).catch(function(err) {
                        console.log(err)
                    })
                }
            }
        }
    })
}

downloadBackdrop = function(backdropPath, id) {
    let outputFileName = 'backdrop_' + id + '.jpg'

    tmdb.getImage({
        path: backdropPath,
        size: 'original'
    }).then(function(image) {
        // write image to file
        fs.writeFile(path.join(config.posterDirectory, outputFileName), image, 'binary', function(err) {
            if(err) return console.log('Failed to download image: ' + id)
        })
    }).catch(function(err) {
        console.log(err)
    })

    return {
        imageLocal: path.join(config.posterDirectory, outputFileName),
        imageWeb: path.join('/posters', outputFileName)
    }
}

downloadPoster = function(posterPath, id) {
    let outputFileName = 'poster_' + id + '.jpg'

    tmdb.getImage({
        path: posterPath,
        size: 'w500'
    }).then(function(image) {
        // write image to file
        fs.writeFile(path.join(config.posterDirectory, outputFileName), image, 'binary', function(err) {
            if(err) return console.log('Failed to download image: ' + id)
        })
    }).catch(function(err) {
        console.log(err)
    })

    return {
        imageLocal: path.join(config.posterDirectory, outputFileName),
        imageWeb: path.join('/posters', outputFileName)
    }
}

downloadStill = function(stillPath, id) {
    let outputFileName = 'still_' + id + '.jpg'

    tmdb.getImage({
        path: stillPath,
        size: 'w500'
    }).then(function(image) {
        // write image to file
        fs.writeFile(path.join(config.posterDirectory, outputFileName), image, 'binary', function(err) {
            if(err) return console.log('Failed to download image: ' + id)
        })
    }).catch(function(err) {
        console.log(err)
    })

    return {
        imageLocal: path.join(config.posterDirectory, outputFileName),
        imageWeb: path.join('/posters', outputFileName)
    }
}

    /*
    tmdb.searchShows({
        title: params.title,
        apiKey: API_KEY
    }).then(function(results) {
        const id = results.results[0].id
        let showDetailsPromise = tmdb.getShowDetails({ tvid: id, apiKey: API_KEY })
        let seasonDetailsPromise = tmdb.getSeasonDetails({ tvid: id, seasonNumber: params.season, apiKey: API_KEY })
        let episodeDetailsPromise = tmdb.getEpisodeDetails({ tvid: id, seasonNumber: params.season, episodeNumber: params.episode, apiKey: API_KEY })
        let videoInfo = getVideoInfo(path.join(params.directory, params.file))

        Promise.all([showDetailsPromise, seasonDetailsPromise, episodeDetailsPromise, videoInfo]).then(function(results) {
            let showDetails = results[0]
            let seasonDetails = results[1]
            let episodeDetails = results[2]
            let videoInfo = results[3]

            // determine if this file will need to be transcoded.
            // must check for file extension instead of codec, browser won't playback
            // if codec is h264 but the file container is .mkv
            let needsTranscoding = false
            if(params.file.split('.').pop() != 'mp4') {
                needsTranscoding = true
            }

            // object to be inserted into db
            let doc = {
                showName: showDetails.name,
                episodeName: episodeDetails.name,
                showAirDate: showDetails.first_air_date,
                seasonAirDate: seasonDetails.air_date,
                episodeAirDate: episodeDetails.air_date,
                showOverview: showDetails.overview,
                seasonOverview: seasonDetails.overview,
                episodeOverview: episodeDetails.overview,
                seasonNumber: seasonDetails.season_number,
                episodeNumber: episodeDetails.episode_number,
                genres: showDetails.genres,
                tmdbid: showDetails.id,
                //imdbid: details.imdb_id,
                file: params.file,
                location: path.join(params.directory, params.file),
                videoInfo: {
                    videoCodec: videoInfo.streams[0].codec_name,
                    audioCodec: videoInfo.streams[1].codec_name,
                    width: videoInfo.streams[0].width,
                    height: videoInfo.streams[0].height,
                    duration: videoInfo.format.duration,
                },
                needsTranscoding,
                type: 'show'
            }
        
            callback(doc)
        }).catch(function(err) {
            console.log('Error occurred while fetching metadata for: ' + params.title + ' (S' + params.season + 'E' + params.episode + ') tmdbid: ' + id + ' - ' + err)
            console.log(err.stack)
        })
    }).catch(function(err) {
        console.warn('Failed to search for: ' + params.title + ' (S' + params.season + 'E' + params.episode + ')')
        console.log(err)
    })*/