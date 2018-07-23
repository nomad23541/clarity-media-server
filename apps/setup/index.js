const User = require('../../models/user')
const fs = require('fs')
const setupDirectories = require('../../lib/setup/setup-directories')

module.exports = function(app) {
    app.get('/setup', function(req, res) {
        // read config file, and auto populate fields if there are values
        let config = JSON.parse(fs.readFileSync('config.json', 'utf8'))
        res.render('setup', {
            config: config
        })
    })

    app.post('/setup', function(req, res, next) {
        // trim all values
        for(let key in req.body) {
            req.body[key] = req.body[key].trim()
        }

        let username = req.body.username
        let password = req.body.password
        let confirmPassword = req.body.password
        let showsDirectory = req.body.showsDirectory
        let moviesDirectory = req.body.moviesDirectory
        let imagesDirectory = req.body.imagesDirectory
        let apiKey = req.body.apiKey
        let port = parseInt(req.body.port)

        if(username && password && confirmPassword && showsDirectory && moviesDirectory && imagesDirectory && apiKey && port) {
            if(password != confirmPassword) return next(new AppError('Passwords do not match', 400))
            
            let newUser = User({
                username: username,
                password: password,
                admin: true
            })

            let config = JSON.parse(fs.readFileSync('config.json', 'utf8'))
            config.showsDirectory = showsDirectory
            config.moviesDirectory = moviesDirectory
            config.imagesDirectory = imagesDirectory
            config.tmdbApiKey = apiKey
            // make sure port no bigger than 49151
            if(port > 49151) return next(new AppError('The port entered is invalid'))
            config.port = port

            // create all directories needed in app
            setupDirectories.setup(config)
    
            newUser.save(function(err) {
                if(err) return next(err)
                // write the config file w/ new values
                fs.writeFileSync('config.json', JSON.stringify(config), 'utf-8')
                res.redirect('/')
            })
        } else {
            next(new AppError('A field is missing', 400))
        }
    })
}