const tmdb = require('../tmdb.js')
const config = require('../../config')
const path = require('path')
const isVideo = require('is-video')
const getVideoInfo = require('get-video-info')
const fs = require('fs')
const titleCleaner = require('../utils/title-cleaner')
const tools = require('./metadata-tools')
const Episode = require('../../models/episode')

const API_KEY = config.tmdbApiKey

module.exports.processMetadata = function(tmdbid, show, callback) {
    tmdb.getShowDetails({ id: tmdbid, apiKey: API_KEY }).then(function(details) {
        // download show backdrop and poster
        let poster = tools.downloadImage(details.poster_path, 'w500', 'poster', details.id)
        let backdrop = tools.downloadImage(details.backdrop_path, 'original', 'backdrop', details.id)

        show.poster = poster.image
        show.backdrop = backdrop.image
        show.tmdbid = details.id

        // set metadata for show
        show.metadata.overview = details.overview
        show.metadata.seasonCount = details.number_of_seasons
        show.metadata.episodeCount = details.number_of_episodes

        // this only grabs seasons from tmdb that we have on disk
        for(let detailSeason of details.seasons) {
            for(let showSeason of show.seasons) {
                if(detailSeason.season_number === showSeason.seasonNumber) {
                    let seasonPoster = tools.downloadImage(detailSeason.poster_path, 'w500', 'poster', detailSeason.id)
                    showSeason.tmdbid = detailSeason.id
                    showSeason.name = detailSeason.name
                    showSeason.overview = detailSeason.overview
                    showSeason.airDate = detailSeason.air_date
                    showSeason.poster = seasonPoster.image
                }
            }
        }
        //callback(show)
    }).then(function() {
        let seasonDirs = []
        for(let season of show.seasons) {
            seasonDirs.push(season.location)
        }

        for(let seasonDir of seasonDirs) {
            let content = fs.readdirSync(seasonDir)
            for(let file of content) {
                if(isVideo(file)) {
                    // fetch episode metadata
                    processEpisode(file, path.join(seasonDir, file), show)
                }
            }
        }

        // finally we're done with this show
        callback(show)
    }).catch(function(err) {
        console.log('Error occurred while fetching metadata for: ' + file + ' ' + err)
    })
}

processEpisode = function(file, filePath, show) {
    let cleanedTitle = titleCleaner.cleanupTitle(file)
    let season = cleanedTitle.season
    let episode = cleanedTitle.episode

    let episodeDetailsPromise = tmdb.getEpisodeDetails({ id: show.tmdbid, seasonNumber: season, episodeNumber: episode, apiKey: API_KEY })
    let videoInfoPromise = getVideoInfo(filePath)

    Promise.all([episodeDetailsPromise, videoInfoPromise]).then(function(results) {
        let details = results[0]
        let videoInfo = results[1]

        let still = tools.downloadImage(details.still_path, 'original', 'still', details.id)

        let newEpisode = Episode({
            showName: show.name,
            name: details.name, 
            seasonNumber: details.season_number,
            episodeNumber: details.episode_number,
            location: filePath,
            still: still.image,
            tmdbid: details.id,
            needsTranscoding: file.split('.').pop() != 'mp4',
            videoInfo: {
                videoCodec: videoInfo.streams[0].codec_name,
                audioCodec: videoInfo.streams[1].codec_name,
                width: videoInfo.streams[0].width,
                height: videoInfo.streams[0].height,
                duration: videoInfo.format.duration,
            },
            metadata: {
                overview: details.overview,
                airDate: details.air_date,
            }
        })

        newEpisode.save(function(err){
            if(err) console.log(err)
        })
    }).catch(function(err) {
        console.log('Error occurred while fetching metadata for: ' + file + ' ' + err)
    })
}