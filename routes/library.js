const db = require('../lib/setup/setup-db').db()

module.exports = function(app) {
    app.get('/', function(req, res) {
        res.redirect('/library')
    })

    app.get('/library', function(req, res) {
        res.render('library')
    })

    app.get('/library/movies', function(req, res) {
        res.render('movies/movies')
    })
    
    app.use('/library/movies/movie', function(req, res, next) {
        db.findOne({ _id: req.query.id }, function(err, doc) {
            if(!doc) return res.status(404).send('Not Found')
            req.body.doc = doc
            next()
        })
    })

    app.get('/library/movies/movie', function(req, res) {
        let doc = req.body.doc
        // find movies that have the same genres
        db.find({ genres: { $in: doc.genres }}, function(err, docs) {
            res.render('movies/movie',  {
                doc: doc,
                similar: docs
            })
        })
    })
}