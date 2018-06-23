const db = require('../lib/setup/setup-db').db()
const fs = require('fs')

module.exports = function(app) {
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
}