const User = require('../../models/user')

module.exports = function(app) {
    app.get('/login', function(req, res) {
        res.render('login')
    })

    app.post('/login', function(req, res, next) {
        let username = req.body.username
        let password = req.body.password

        if(username && password) {
            User.login(username, password, function(err, user) {
                if(err || !user) return next(new AppError('Invalid login credentials', 400))
                req.session.user = user
                res.sendStatus(200)
            })
        } else {
            let err = new AppError('All fields are required', 400)
            next(err)
        }
    })

    app.post('/logout', function(req, res) {
        // very simple
        req.session.destroy()
        res.sendStatus(200)
    })
}