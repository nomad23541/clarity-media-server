const Movie = require('../../models/movie')

module.exports = function(app) {
    app.get('/library/movies', function(req, res, next) {
        Movie.find({}, function(err, docs) {
            if(err) return next(err)
            if(!docs) return next(new Error('No movies were found'))

            res.render('movies', {
                size: docs.length
            })
        })
    })

    app.get('/library/movies/movie', function(req, res, next) {
        Movie.findOne({ _id: req.query.id }, function(err, doc) {
            if(err) return next(err)
            if(!doc) return next(new Error('Could not find this movie'))

            // now get similar movies
            Movie.find({ 'metadata.genres': { $in: doc.metadata.genres }}, function(err, similar) {
                if(err) return next(err)

                res.render('movie', {
                    doc: doc,
                    similar: similar.slice(0, 8) // only send 8 similar movies
                })
            })
        })
    })

    app.get('/library/movies/similar', function(req, res, next) {
        Movie.findOne({ _id: req.query.id }, function(err, doc) {
            if(err) return next(err)
            if(!doc) return next(new Error('Could not find this movie'))

            // now get similar movies
            Movie.find({ 'metadata.genres': { $in: doc.metadata.genres }}, function(err, similar) {
                if(err) return next(err)

                res.render('similar', {
                    doc: doc,
                    similar: similar
                })
            })
        })
    })

    app.get('/library/movies/fix', function(req, res, next) {
        if(req.session.user.admin) {
            Movie.findOne({ _id: req.query.id }, function(err, doc) {
                if(err) return next(err)
                if(!doc) return next(new Error('Could not find this movie'))
    
                res.render('fix', {
                    doc: doc
                })
            })
        } else {
            next(new Error('User is not admin'))
        }
    })
}