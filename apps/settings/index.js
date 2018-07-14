const fs = require('fs')
const User = require('../../models/user')

module.exports = function(app) {
    app.get('/settings', function(req, res, next) {
        if(req.session.user.admin) {
            User.find({}, function(err, users) {
                if(err) return next(err)
                if(!users) return next(new Error('No users in collection'))

                res.render('settings', {
                    users: users
                })
            })
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