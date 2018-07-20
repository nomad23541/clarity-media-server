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
                if(err || !user) return res.status(500).send('Invalid login credentials')
                req.session.user = user
                res.json({ status: 'success' })
            })
        } else {
            res.status(500).send('All fields are required')
        }
    })

    app.post('/logout', function(req, res) {
        // very simple
        req.session.destroy()
        res.json({ status: 'success' })
    })
}