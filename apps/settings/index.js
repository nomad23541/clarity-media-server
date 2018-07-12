const fs = require('fs')

module.exports = function(app) {
    app.get('/settings', function(req, res, next) {
        if(req.session.user.admin) {
            res.render('settings')
        } else {
            let err = new Error('You need to be admin to use this page')
            err.statusCode = 403
            next(err)
        }
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