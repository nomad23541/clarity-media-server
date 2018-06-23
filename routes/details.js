const db = require('../lib/setup/setup-db').db()

module.exports = function(app) {
    app.use('/details', function(req, res, next) {
        db.findOne({ _id: req.query.id }, function(err, doc) {
            if(!doc) return res.status(404).send('Not Found')
            req.body.doc = doc
            next()
        })
    })

    app.get('/details', function(req, res) {
        let doc = req.body.doc
        // find movies that have the same genres
        db.find({ genres: { $in: doc.genres }}, function(err, docs) {
            res.render('details',  {
                doc: doc,
                similar: docs
            })
        })
    })
}