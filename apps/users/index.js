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
                if(err) return next(err)
                if(!user) return res.status(500).send('Invalid login credentials')

                req.session.userID = user._id
                res.send('ok')
            })
        } else {
            res.status(500).send('All fields are required')
        }
    })
}