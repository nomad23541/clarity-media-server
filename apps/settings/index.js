const fs = require('fs')

module.exports = function(app) {
    app.get('/settings', function(req, res) {
        res.render('settings')
    })

    app.post('/settings', function(req, res, next) {
        if(req.body) {
            fs.writeFileSync('./config.json', JSON.stringify(req.body))
            res.json({ message: 'Saved settings successfully'})
        } else {
            return next(new Error('Failed to save settings'))
        }
    })
}