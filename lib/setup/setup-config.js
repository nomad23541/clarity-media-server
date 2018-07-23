const fs = require('fs')
const os = require('os')
const path = require('path')

/**
 * Create's a default config on app start up
 */
module.exports.setup = function() {
    // don't continue if the config already exists
    if(fs.existsSync('config.json')) return

    let defaults = {
        showsDirectory: '',
        moviesDirectory: '',
        port: 3000,
        tmdbApiKey: '',
        transcoding: {
            crf: 20,
            preset: 'veryfast',
            normalizeAudio: true
        }
    }

    defaults.imagesDirectory = path.join(os.homedir(), 'clarity/images')
    fs.writeFileSync('config.json', JSON.stringify(defaults), 'utf-8')
}

    