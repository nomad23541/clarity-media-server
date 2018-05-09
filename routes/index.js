const db = require('../db/db').db()

module.exports = function(app) {
    app.get('/', function(req, res) {
        res.render('index')
    })
    
    app.get('/watch', function(req, res) {
        db.findOne({ _id: req.query.id }, function(err, doc) {
            if(!doc) return res.status(404).send('Not Found')
            res.render('watch', {
                doc: doc
            })
        })
    })

    app.get('/search', function(req, res) {
        res.render('search')
    })

    app.get('/settings', function(req, res) {
        res.render('settings')
    })

    app.get('/edit', function(req, res) {
        db.findOne({ _id: req.query.id }, function(err, doc) {
            if(!doc) return res.status(404).send('Not Found')
            res.render('edit', {
                doc: doc
            })
        })
    })

    app.get('/details', function(req, res) {
        db.findOne({ _id: req.query.id }, function(err, doc) {
            if(!doc) return res.status(404).send('Not Found')
            res.render('details',  {
                doc: doc
            })
        })
    })
}