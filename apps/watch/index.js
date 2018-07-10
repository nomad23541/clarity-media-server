const Movie = require('../../models/movie')
const Episode = require('../../models/episode')

module.exports = function(app) {
    app.get('/watch', function(req, res, next) {
        Movie.findOne({ _id: req.query.id }, function(err, movie) {
            Episode.findOne({ _id: req.query.id }, function(err1, episode) {
                if(err || err1) return next(err || err1)
                
                if(movie) {
                    res.render('watch-movie', {
                        doc: movie
                    })
                }
                
                if(episode) {
                    res.render('watch-episode', {
                        doc: episode
                    })
                }
            })
        })
    })
}