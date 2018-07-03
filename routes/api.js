const config = require('../config')
const tmdb = require('../lib/tmdb')
const metadata = require('../lib/handlers/metadata-handler')
const Movie = require('../models/movie')
const Show = require('../models/show')
const Episode = require('../models/episode')

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

    app.get('/api/media/movies/:id', function(req, res) {
        Movie.findOne({ _id: req.params.id }, function(err, doc) {
            if(err) res.send(err)
            res.json(doc)
        })
    })

    app.get('/api/media/episodes/:id', function(req, res) {
        Episode.findOne({ _id: req.params.id }, function(err, doc) {
            if(err) res.send(err)
            console.log(doc)
            res.json(doc)
        })
    })

    app.get('/api/media/shows/:id', function(req, res) {
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

    app.post('/api/fix', function(req, res) {
        // time to update with new tmdbid
        metadata.fixMovie(req.body.tmdbid, req.body.docid, function(newDoc) {
            res.send(JSON.stringify({ id: newDoc._id }))
        })
    })
}