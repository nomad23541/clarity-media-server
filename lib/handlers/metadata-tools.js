const tmdb = require('../tmdb')
const fs = require('fs')
const path = require('path')

downloadBackdrop = function(backdropPath, id) {
    let outputFileName = 'backdrop_' + id + '.jpg'

    tmdb.getImage({
        path: backdropPath,
        size: 'original'
    }).then(function(image) {
        fs.writeFile(path.join(config.posterDirectory, outputFileName), image, 'binary', function(err) {
            if(err) return console.log('Failed to download image: ' + id)
        })
    }).catch(function(err) {
        console.log(err)
    })

    return {
        imageLocal: path.join(config.posterDirectory, outputFileName),
        imageWeb: path.join('/images', outputFileName)
    }
}

downloadPoster = function(posterPath, id) {
    let outputFileName = 'poster_' + id + '.jpg'

    tmdb.getImage({
        path: posterPath,
        size: 'w500'
    }).then(function(image) {
        fs.writeFile(path.join(config.posterDirectory, outputFileName), image, 'binary', function(err) {
            if(err) return console.log('Failed to download image: ' + id)
        })
    }).catch(function(err) {
        console.log(err)
    })

    return {
        imageLocal: path.join(config.posterDirectory, outputFileName),
        imageWeb: path.join('/images', outputFileName)
    }
}

downloadStill = function(stillPath, id) {
    let outputFileName = 'still_' + id + '.jpg'

    tmdb.getImage({
        path: stillPath,
        size: 'w500'
    }).then(function(image) {
        fs.writeFile(path.join(config.posterDirectory, outputFileName), image, 'binary', function(err) {
            if(err) return console.log('Failed to download image: ' + id)
        })
    }).catch(function(err) {
        console.log(err)
    })

    return {
        imageLocal: path.join(config.posterDirectory, outputFileName),
        imageWeb: path.join('/images', outputFileName)
    }
}