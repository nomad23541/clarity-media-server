const fs = require('fs')
const User = require('../../models/user')

module.exports = function(app) {
    app.get('/settings', function(req, res, next) {
        if(req.session.user.admin) {
            User.find({}, function(err, users) {
                if(err) return next(err)
                // now read config file
                let config = JSON.parse(fs.readFileSync('config.json', 'utf8'))
                res.render('settings', {
                    users: users,
                    config: config
                })
            })
        } else {
            let err = new Error('You need to be admin to use this page')
            err.statusCode = 403
            next(err)
        }
    })

    app.put('/settings', function(req, res, next) {
        let config = JSON.parse(fs.readFileSync('config.json', 'utf8'))
        // update em'
        updateConfigKeys(req.body, config)
        // now write the file
        fs.writeFileSync('config.json', JSON.stringify(config), 'utf-8')
        res.sendStatus(200) 
    })

    /**
     * Compares keys from body and config, if they equal, set config's key value to
     * body's.
     * 
     * If there aren't any equal keys found, try seeing if there are any inner objects
     * in config, if there are, then do some recursive action
     */
    updateConfigKeys = function(body, config) {
        for(let key in body) {
            for(let configKey in config) {
                if(key == configKey) {
                    config[configKey] = body[key].trim()
                } else {
                    if(typeof config[configKey] === 'object') {
                        for(let innerKey in config[configKey]) {
                            if(key == innerKey) {
                                updateConfigKeys(body, config[configKey])
                            }
                        }
                    }
                }
            }
        }
    }
}