/**
 * Contains functions for searching TMDb api
 */
const url = require('url')
const limit = require('simple-rate-limiter')
// 4 request per second
const RATE = 4
const LIMIT = 1000
const request = limit(require('request')).to(RATE).per(LIMIT)
const baseURL = 'http://api.themoviedb.org/'
const imageURL = 'http://image.tmdb.org/'

/**
 * Searches using TMDb api's /search/movie
 * 
 * @param {Object} params Must contain: title, year, and TMDb api key
 */
module.exports.search = function(params) {
    return new Promise(function(resolve, reject) {
        request({
            url: url.resolve(baseURL, '/3/search/movie?query=' + params.title + '&year=' + params.year + '&api_key=' + params.apiKey),
            method: 'GET'
        }, function(err, res, body) {
            if(err) return reject(err)
            resolve(JSON.parse(body))
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
        request({
            url: url.resolve(baseURL, '/3/movie/' + params.id + '?api_key=' + params.apiKey),
            method: 'GET'
        }, function(err, res, body) {
            if(err) return reject(err)
            resolve(JSON.parse(body))
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
        request({
            url: url.resolve(baseURL, '/3/movie/' + params.id + '/release_dates?api_key=' + params.apiKey),
            method: 'GET'
        }, function(err, res, body) {
            if(err) return reject(err)
            resolve(JSON.parse(body))
        })
    })
}

/**
 * Retrieves credits for a specified media
 * @param {Object} data Must contain TMDb id and api key
 */
module.exports.getCredits = function(data) {
    return new Promise(function(resolve, reject) {
        request({
            url: url.resolve(baseURL, '/3/movie/' + data.id + '/credits?api_key=' + data.apiKey),
            method: 'GET'
        }, function(err, res, body) {
            if(err) return reject(err)
            resolve(JSON.parse(body))
        })
    })
}

/**
 * Retrieves images for a specified media
 * @param {Object} data Details fetched from getMovieDetails() 
 */
module.exports.getImages = function(data) {
    return new Promise(function(resolve, reject) {
        // get the poster
        request({
            url: url.resolve(imageURL, '/t/p/w500/' + data.poster_path),
            encoding: 'binary'
        }, function(err, res, poster) {
            if(err) return reject(err)
            // now get the backdrop
            request({
                url: url.resolve(imageURL, '/t/p/original/' + data.backdrop_path),
                encoding: 'binary'
            }, function(err, res, backdrop) {
                if(err) return reject(err)
                resolve({ poster, backdrop })
            })
        })
    })
}

/**
 * Grabs an image from TMDb
 * @param {string} path TMDb path to image
 */
module.exports.getImage = function(path, size) {
    return new Promise(function(resolve, reject) {
        request({
            url: url.resolve(imageURL, '/t/p/' + size + '/' + path),
            encoding: 'binary'
        }, function(err, res, body) {
            if(err) return reject(err)
            resolve(body)
        })
    })
}