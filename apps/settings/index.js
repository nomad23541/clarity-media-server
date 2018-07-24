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
        // get all recieved keys from body and compare to config's keys
        // if they match, set config's to req.body's
        for(let key in req.body) {
            for(let configKey in config) {
                if(key == configKey) {
                    config[configKey] = req.body[key].trim()
                }
            }
        }

        // now write the file
        fs.writeFileSync('config.json', JSON.stringify(config), 'utf-8')
        res.sendStatus(200) 
    })
}