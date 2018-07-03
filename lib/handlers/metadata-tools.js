const tmdb = require('../tmdb')
const fs = require('fs')
const path = require('path')
const config = require('../../config')

/**
 * Downloads an image with a provided path, usually obtained from a tmdb function
 * 
 * size refers to the size of the image (sizes on are tmdb api docs)
 * 
 * type refers to which type of image this is (backdrop, poster, still) and names
 * the file occordingly
 */
module.exports.downloadImage = function(imagePath, size, type, tmdbid) {
    let outputFileName = type + '_' + tmdbid + '.jpg'
    tmdb.getImage({
        path: imagePath, 
        size: size 
    }).then(function(image) {
        // once we have obtained image through tmdb, write it to a file
        fs.writeFile(path.join(config.imagesDirectory, outputFileName), image, 'binary', function(err) {
            if(err) return console.log('Error occurred while writing file from (tmdbid ' + tmdbid + ': ' + path)
        })
    })

    return { image: outputFileName }
}