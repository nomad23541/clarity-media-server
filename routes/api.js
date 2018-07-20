const config = require('../config')
const tmdb = require('../lib/tmdb')
const metadata = require('../lib/handlers/metadata-handler')
const Movie = require('../models/movie')
const Show = require('../models/show')
const Episode = require('../models/episode')
const User = require('../models/user')

module.exports = function(app) {
    app.get('/api/media/movies', function(req, res) {
        let skip = req.query.skip ? req.query.skip : 0
        let limit = req.query.limit ? req.query.limit : 0

        if(req.query.sort) {
            let query = req.query.sort.split(' ')
            let key = query[0]
            let value = query[1]

            Movie.find({}).sort({ [key]: value }).skip(parseInt(skip)).limit(parseInt(limit)).exec(function(err, docs) {
                if(err) res.send(err)
                res.json(docs)
            })
        } else {
            Movie.find({}, function(err, docs) {
                if(err) res.send(err)
                res.json(docs)
            })
        }
    })

    app.get('/api/media/movie/:id', function(req, res) {
        Movie.findOne({ _id: req.params.id }, function(err, doc) {
            if(err) res.send(err)
            res.json(doc)
        })
    })

    app.get('/api/media/episode/:id', function(req, res) {
        Episode.findOne({ _id: req.params.id }, function(err, doc) {
            if(err) res.send(err)
            console.log(doc)
            res.json(doc)
        })
    })

    app.get('/api/media/show/:id', function(req, res) {
        Show.findOne({ _id: req.params.id }, function(err, doc) {
            if(err) res.send(err)
            res.json(doc)
        })
    })

    app.get('/api/media/shows', function(req, res) {
        let skip = req.query.skip ? req.query.skip : 0
        let limit = req.query.limit ? req.query.limit : 0

        if(req.query.sort) {
            let query = req.query.sort.split(' ')
            let key = query[0]
            let value = query[1]

            Show.find({}).sort({ [key]: value }).skip(parseInt(skip)).limit(parseInt(limit)).exec(function(err, docs) {
                if(err) res.send(err)
                res.json(docs)
            })
        } else {
            Show.find({}, function(err, docs) {
                if(err) res.send(err)
                res.json(docs)
            })
        }
    })

    app.get('/api/search', function(req, res) {
        let query = req.query.query
        Movie.find({ title: new RegExp(query, 'i') }, function(err, movies) {
            Show.find({ name: new RegExp(query, 'i') }, function(err1, shows) {
                let results = movies.concat(shows)
                if(err || err1) res.send(err || err1)
                res.json(results)
            })
        })
    })

    app.get('/api/settings', function(req, res) {
        res.json(config)
    })

    app.get('/api/fix', function(req, res) {
        // search tmdb api and send results back to client
        tmdb.searchMovies({
            title: req.query.query,
            year: req.query.year,
            apiKey: config.tmdbApiKey
        }).then(function(results) {
            res.json(results)
        }).catch(function(err) {
            console.log(err)
            res.err(err)
        })
    })

    app.put('/api/fix', function(req, res) {
        // time to update with new tmdbid
        metadata.fixMovie(req.body.tmdbid, req.body.docid, function(newDoc) {
            res.send(JSON.stringify({ id: newDoc._id }))
        })
    })

    app.get('/api/users', function(req, res, next) {
        User.find({}, function(err, users) {
            if(err) return next(err)
            res.json(users)
        })
    })

    app.get('/api/user/:id', function(req, res, next) {
        User.findOne({ _id: req.params.id }, function(err, user) {
            if(err) return next(err)
            if(!user) return next(new Error('User does not exist'))

            res.json(user)
        })
    })

    app.put('/api/user/:id', function(req, res) {
        let password = req.body.password
        let passwordConfirm = req.body.passwordConfirm
        let admin = req.body.admin

        if(password || passwordConfirm) {
            if(password && passwordConfirm) {
                if(password != passwordConfirm) {
                    return res.status(500).send('Passwords do not match')
                }
            } else {
                return res.status(500).send('Both fields are required to change the password')
            }
        }

        // determine values that will be updated
        let updatedValues = {}
        if(password) updatedValues.password = password
        updatedValues.admin = admin

        User.edit(req.params.id, updatedValues, function(err, user) {
            if(err) return res.status(500).send(err.message)
            // if this user is editing their own self, destroy their session
            if(user._id == req.session.user._id) req.session.destroy()
            res.json({ status: 'success' })
        })
    })

    app.post('/api/user/', function(req, res) {
        let username = req.body.username
        let password = req.body.password
        let passwordConfirm = req.body.passwordConfirm
        let admin = req.body.admin

        if(username && password && passwordConfirm) {
            if(password != passwordConfirm) return res.status(500).send('Passwords do not match')
            User.new(username, password, admin, function(err) {   
                if(err) return res.status(500).send(err.message)
                res.json({ status: 'success' })
            })
        } else {
            return res.status(500).send('All fields are required')
        }
    })

    app.delete('/api/user/:id', function(req, res, next) {
        User.findByIdAndRemove({ _id: req.params.id }, function(err) {
            if(err) next(new Error('Error removing ' + req.params.id + ' from db'))
            res.json({ status: 'success' })
        })
    })
}