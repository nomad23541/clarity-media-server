const Movie = require('../models/movie')
const Episode = require('../models/episode')

module.exports = function(app) {
    app.get('/watch', function(req, res) {
        Movie.findOne({ _id: req.query.id }, function(err, movie) {
            Episode.findOne({ _id: req.query.id }, function(err1, episode) {
                if(err || err1) return console.log(err || err1)
                
                if(movie) {
                    res.render('watch/watch-movie', {
                        doc: movie
                    })
                }
                
                if(episode) {
                    res.render('watch/watch-episode', {
                        doc: episode
                    })
                }
            })
        })
    })

    app.get('/search', function(req, res) {
        res.render('search')
    })

    app.get('/fix', function(req, res) {
        Movie.findOne({ _id: req.query.id }, function(err, doc) {
            if(!doc) return res.status(404).send('Not Found')
            res.render('fix', {
                doc: doc
            })
        })
    })
}