const fs = require('fs')
const path = require('path')

/**
 * Create any directories that don't exist for use in the app
 */
module.exports.setup = function(config) {
    let imagesDir = path.join(config.imagesDirectory)
    let profilesDir = path.join(config.imagesDirectory, '/profiles')
    let moviesDir = path.join(config.moviesDirectory)
    let showsDir = path.join(config.showsDirectory)

    let dirs = [imagesDir, profilesDir, moviesDir, showsDir]

    for(let i = 0; i < dirs.length; i++) {
        let dir = dirs[i]
        if(!fs.existsSync(dir)) {
            fs.mkdirSync(dir)
            console.log('Created Directory: ' + dir)
        }
    }
}