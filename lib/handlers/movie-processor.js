const tmdb = require('../tmdb.js')
const config = require('../../config')
const path = require('path')
const fs = require('fs')
const tools = require('./metadata-tools')

const API_KEY = config.tmdbApiKey

module.exports.processMetadata = function(tmdbid, movie, callback) {
    let detailsPromise = tmdb.getMovieDetails({ id: tmdbid, apiKey: API_KEY })
    let releaseDatesPromise = tmdb.getReleaseDates({ id: tmdbid, apiKey: API_KEY })
    let creditsPromise = tmdb.getCredits({ id: tmdbid, apiKey: API_KEY })

    Promise.all([detailsPromise, releaseDatesPromise, creditsPromise]).then(function(results) {
        let details = results[0]
        let releaseDates = results[1]
        let credits = results[2]

        let poster = tools.downloadImage(details.poster_path, 'w500', 'poster', details.id)
        let backdrop = tools.downloadImage(details.backdrop_path, 'original', 'backdrop', details.id)
        let creditImages = downloadCreditImages(credits)

        // find the US release and grab the MPAA rating
        // some movies won't have a US release, so don't set the rating for those
        let rated = releaseDates.results.find(release => release.iso_3166_1 === 'US')

        movie.title = details.title
        movie.year = details.release_date.split('-')[0]
        movie.poster = poster.image
        movie.backdrop = backdrop.image
        movie.tmdbid = details.id
        movie.imdbid = details.imdb_id
        
        // now metadata stuff
        movie.metadata.rating = rated ? rated.release_dates[0].certification : ''
        movie.metadata.runtime = details.runtime
        movie.metadata.releaseDate = details.release_date
        movie.metadata.overview = details.overview
        movie.metadata.tagline = details.tagline
        movie.metadata.genres = details.genres
        movie.metadata.cast = creditImages.cast
        movie.metadata.director = creditImages.director
    
        callback(movie)
    }).catch(function(err) {
        console.log('Error occurred while fetching metadata for: ' + params.title + ' (' + params.year + ') tmdbid: ' + id + ' - ' + err)
    })
}

/**
 * Loops through the credits object provided by tmdb.getCredits()
 * and downloads each cast member's profile (and director's).
 * 
 * This should be cleaned up. It's hard to read.
 */
downloadCreditImages = function(credits) {
    let profilesDirectory = path.join(config.imagesDirectory, '/profiles')
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
            profile: member.id + '.jpg'
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
        profile: directorObj.id + '.jpg'
    }

    return { cast, director }
}