const db = require('../utils/setup-db').db()
const config = require('../config.js')

module.exports = function(app) {
    app.get('/api/media', function(req, res) {
        // little nifty way to sort the database
        // get the value of the query 'sort', and parse it's value
        // ex: ?sort=title+-1 -> sort by the key title and the value -1
        // if the query exists, sort by that query, otherwise, just send entire doc
        if(req.query.sort) {
            var query = req.query.sort.split(' ')
            var key = query[0]
            var value = query[1]
            db.find({}).sort({ [key]: value }).exec(function(err, docs) {
                if(err) res.send(err)
                res.json(docs)
            })
        } else {
            db.find({}, function(err, docs) {
                if(err) res.send(err)
                res.json(docs)
            })
        }
    })

    app.get('/api/media/:id', function(req, res) {
        db.findOne({ _id: req.params.id }, function(err, doc) {
            if(err) res.send(err)
            res.json(doc)
        })
    })

    app.delete('/api/media/:id', function(req, res) {
        db.remove({ _id: req.params.id }, {}, function(err, doc) {
            if(err) res.send(err)
            res.send('success')
        })
    })

    app.get('/api/search', function(req, res) {
        db.find({ title: new RegExp(req.query.title, 'i') }, function(err, docs) {
            if(err) res.send(err)
            res.json(docs)
        })
    })

    app.get('/api/settings', function(req, res) {
        res.json(config)
    })
}