const db = require('../lib/setup/setup-db').db()
const fs = require('fs')

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

    app.post('/settings', function(req, res) {
        try {
            fs.writeFileSync('./config.json', JSON.stringify(req.body))
            res.send(JSON.stringify({ message: 'success'}))
        } catch(err) {
            res.status(500)
            res.send(JSON.stringify({ message: err }))
        }
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
        // ugly pyramid going on here, maybe not too bad, we'll see...
        db.findOne({ _id: req.query.id }, function(err, doc) {
            if(!doc) return res.status(404).send('Not Found')

            // find movies that have the same genres
            db.find({ genres: { $in: doc.genres }}, function(err, docs) {
                res.render('details',  {
                    doc: doc,
                    similar: docs
                })
            })
        })
    })
}