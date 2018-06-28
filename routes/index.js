const db = require('../lib/setup/setup-db').db()

module.exports = function(app) {
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

    app.get('/fix', function(req, res) {
        db.findOne({ _id: req.query.id }, function(err, doc) {
            if(!doc) return res.status(404).send('Not Found')
            res.render('fix', {
                doc: doc
            })
        })
    })
}