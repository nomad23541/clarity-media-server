/**
 * Contains functions for searching TMDb api
 */
const url = require('url')
const limit = require('simple-rate-limiter')
const request = require('request')

// 4 request per second
const RATE = 4
const LIMIT = 1000
// urls to grab from
const baseURL = 'http://api.themoviedb.org/'
const imageURL = 'http://image.tmdb.org/'

const requestLimit = limit(function(api, callback) {
    request({
        url: url.resolve(baseURL, api),
        method: 'GET'
    }, callback)
}).to(RATE).per(LIMIT)


/**
 * Searches using TMDb api's /search/movie
 * 
 * @param {Object} params Must contain: title or/and year, TMDb api key
 */
module.exports.searchMovies = function(params) {
    return new Promise(function(resolve, reject) {
        let url = '/3/search/movie?query=' + params.title + '&api_key=' + params.apiKey
        // make year optional
        if(params.year) url += '&year=' + params.year
        requestLimit(url, function(err, res, body) {
            if(!err && res.statusCode == 200) {
                resolve(JSON.parse(body))
            } else {
                reject('Failed to search for: ' + params.title  + '(' + params.year + ')' + ' code: ' + res.statusCode)
            }
        })
    })
}

module.exports.searchShows = function(params) {
    return new Promise(function(resolve, reject) {
        let url = '/3/search/tv?query=' + params.title + '&api_key=' + params.apiKey
        requestLimit(url, function(err, res, body) {
            if(!err && res.statusCode == 200) {
                resolve(JSON.parse(body))
            } else {
                reject('Failed to search for: ' + params.title + ' code: ' + res.statusCode)
            }
        })
    })
}

// params = id, api key
module.exports.getShowDetails = function(params) {
    return new Promise(function(resolve, reject) {
        let url = '/3/tv/' + params.id + '?api_key=' + params.apiKey
        requestLimit(url, function(err, res, body) {
            if(!err && res.statusCode == 200) {
                resolve(JSON.parse(body))
            } else {
                reject('Failed to get show details: ' + params.id + ' code: ' + res.statusCode)
            }
        })
    })
}

// params = id, season number, and api key
module.exports.getSeasonDetails = function(params) {
    return new Promise(function(resolve, reject) {
        let url = '/3/tv/' + params.id + '/season/' + params.seasonNumber + '?api_key=' + params.apiKey
        requestLimit(url, function(err, res, body) {
            if(!err && res.statusCode == 200) {
                resolve(JSON.parse(body))
            } else {
                reject('Failed to get season details: ' + params.id + ' code: ' + res.statusCode)
            }
        })
    })
}

// params = id, season number, episode number, and api key
module.exports.getEpisodeDetails = function(params) {
    return new Promise(function(resolve, reject) {
        let url = '/3/tv/' + params.id + '/season/' + params.seasonNumber + '/episode/' + params.episodeNumber + '?api_key=' + params.apiKey
        requestLimit(url, function(err, res, body) {
            if(!err && res.statusCode == 200) {
                resolve(JSON.parse(body))
            } else {
                reject('Failed to get episode details: ' + params.id + ' code: ' + res.statusCode)
            }
        })
    })
}

/**
 * Get the details of a specific movie by it's ID
 * 
 * @param {Object} params Must contain: ID and TMDb api key
 */
module.exports.getMovieDetails = function(params) {
    return new Promise(function(resolve, reject) {
        requestLimit('/3/movie/' + params.id + '?api_key=' + params.apiKey, function(err, res, body) {
            if(!err && res.statusCode == 200) {
                resolve(JSON.parse(body))
            } else {
                reject('Failed to get movie details: ' + params.id + ' code: ' + res.statusCode)
            }
        })
    })
}

/**
 * Get the details of when a media was released (certification, release date)
 *
 * @param {Object} params Must contain: ID and TMDb api key
 */
module.exports.getReleaseDates = function(params) {
    return new Promise(function(resolve, reject) {
        requestLimit('/3/movie/' + params.id + '/release_dates?api_key=' + params.apiKey, function(err, res, body) {
            if(!err && res.statusCode == 200) {
                resolve(JSON.parse(body))
            } else {
                reject('Failed to get release details: ' + params.id + ' code: ' + res.statusCode)
            }
        })
    })
}

/**
 * Retrieves credits for a specified media
 * @param {Object} data Must contain TMDb id and api key
 */
module.exports.getCredits = function(data) {
    return new Promise(function(resolve, reject) {
        requestLimit('/3/movie/' + data.id + '/credits?api_key=' + data.apiKey, function(err, res, body) {
            if(!err && res.statusCode == 200) {
                resolve(JSON.parse(body))
            } else {
                reject('Failed to get credits for: ' + params.id + ' code: ' + res.statusCode)
            }
        })
    })
}

// params = size, path
module.exports.getImage = function(params) {
    return new Promise(function(resolve, reject) {
        request({
            url: url.resolve(imageURL, '/t/p/' + params.size + '/' + params.path),
            encoding: 'binary'
        }, function(err, res, image) {
            if(!err && res.statusCode == 200) {
                resolve(image)   
            } else {
                reject('Failed to get image: ' + params.path + ' code: ' + res.statusCode)
            }
        })
    })
}