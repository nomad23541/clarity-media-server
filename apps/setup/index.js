const User = require('../../models/user')

module.exports = function(app) {
    app.get('/setup', function(req, res) {
        res.render('setup')
    })

    app.post('/setup', function(req, res, next) {
        let username = req.body.username
        let password = req.body.password

        if(username && password) {
            let newUser = User({
                username: req.body.username,
                password: req.bdoy.password,
                admin: true
            })
    
            newUser.save(function(err) {
                if(err) return next(err)
                res.redirect('/')
            })
        } else {
            // TODO: send error to client
        }
    })
}