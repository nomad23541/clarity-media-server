const db = require('../lib/setup/setup-db').db()
const config = require('../config')
const tmdb = require('../lib/tmdb')
const metadata = require('../lib/handlers/metadata-handler')

module.exports = function(app) {
    app.get('/api/media', function(req, res) {
        // little nifty way to sort the database
        // get the value of the query 'sort', and parse it's value
        // ex: ?sort=title+-1 -> sort by the key title and the value -1
        // if the query exists, sort by that query, otherwise, just send entire doc
        let skip = req.query.skip
        let limit = req.query.limit
        if(!skip) skip = 0
        if(!limit) limit = 0
        
        if(req.query.sort) {
            var query = req.query.sort.split(' ')
            var key = query[0]
            var value = query[1]
            db.find({}).sort({ [key]: value }).skip(parseInt(skip)).limit(parseInt(limit)).exec(function(err, docs) {
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

    app.get('/api/fix', function(req, res) {
        // search tmdb api and send results back to client
        tmdb.search({
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
        metadata.fixMetadata(req.body.tmdbid, req.body.docid, function(newDoc) {
            res.send(JSON.stringify({ id: newDoc._id }))
        })
    })
}