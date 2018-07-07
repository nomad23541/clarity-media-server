const Movie = require('../models/movie')
const Show = require('../models/show')
const Episode = require('../models/episode')

module.exports = function(app) {
    app.get('/', function(req, res) {
        res.redirect('/library')
    })

    app.get('/library', function(req, res) {
        res.render('library')
    })

    app.get('/library/shows', function(req, res) {
        Show.find({}, function(err, docs) {
            res.render('shows/shows', {
                size: docs.length
            })
        })
    })

    app.get('/library/shows/show/:id/season/:season', function(req, res) {
        Show.findOne({ _id: req.params.id }, function(err, doc) {
            if(err || !doc) return res.status(404).send('Not Found ')
            // find season to use
            let season = doc.seasons.find(season => season.seasonNumber == req.params.season)
            Episode.find({ showName: doc.name, 'seasonNumber': parseInt(req.params.season) }).sort({ 'episodeNumber': 1 }).exec(function(err, episodes) {
                res.render('shows/season', {
                    doc: doc,
                    season: season,
                    episodes: episodes
                })
            })
        })
    })

    app.get('/library/shows/show', function(req, res) {
        Show.findOne({ _id: req.query.id }, function(err, doc) {
            res.render('shows/show', {
                doc: doc
            })
        })
    })

    app.get('/library/movies', function(req, res) {
        Movie.find({}, function(err, docs) {
            res.render('movies/movies', {
                size: docs.length
            })
        })
    })

    app.use('/library/movies/movie', function(req, res, next) {
        Movie.findOne({ _id: req.query.id }, function(err, doc) {
            if(!doc) return res.status(404).send('Not Found')
            req.body.doc = doc
            next()
        })
    })

    app.get('/library/movies/movie', function(req, res) {
        let doc = req.body.doc
        // find movies that have the same genres
        Movie.find({ 'metadata.genres': { $in: doc.metadata.genres }}, function(err, docs) {
            res.render('movies/movie',  {
                doc: doc,
                similar: docs.slice(0, 8) // only send 8 similar movies
            })
        })
    })

    app.get('/library/movies/similar', function(req, res, next) {
        Movie.findOne({ _id: req.query.id }, function(err, doc) {
            if(!doc) return res.status(404).send('Not Found')
            req.body.doc = doc
            next()
        })
    })

    app.get('/library/movies/similar', function(req, res) {
        let doc = req.body.doc
        // find movies that have the same genres
        Movie.find({ 'metadata.genres': { $in: doc.metadata.genres }}, function(err, docs) {
            res.render('movies/similar',  {
                doc: doc,
                similar: docs
            })
        })
    })
}