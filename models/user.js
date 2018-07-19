const bcrypt = require('bcrypt')
const mongoose = require('mongoose')
const Schema = mongoose.Schema

let userSchema = new Schema({
    username: {
        type: String,
        required: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    },
    admin: Boolean
})

userSchema.pre('save', function(next) {
    let user = this

    // make sure this username hasn't already been taken
    if(user.isModified('username')) {
        User.find({ username: user.username }, function(err, user) {
            if(user.length != 0) return next(new Error('This username is taken'))
        })
    }

    if(!user.isModified('password')) return next()
    // hash password
    bcrypt.hash(user.password, 10, function(err, hash) {
        if(err) return next(err)
        user.password = hash
        next()
    })
})

userSchema.statics.edit = function(id, updates, callback) {
    User.findOne({ _id: id }, function(err, user) {
        if(err) return callback(err)
        if(!user) return callback(new Error('No user found'))

        if(updates.password) user.password = updates.password
        user.admin = updates.admin

        user.save(function(err1) {
            if(err1) callback(err1)
            callback(null, user)
        })
    })
}

userSchema.statics.new = function(username, password, admin, callback) {
    let newUser = User({
        username,
        password,
        admin
    })

    newUser.save(function(err) {
        if(err) return callback(err)
        callback()
    })
}

userSchema.statics.login = function(username, password, callback) {
    User.findOne({ username: username }).exec(function(err, user) {
        if(err) return callback(err)
        if(!user) return callback(new Error('No user found'))

        bcrypt.compare(password, user.password, function(err, result) {
            if(result === true) {
                return callback(null, user)
            } else {
                return callback()
            }
        })
    })
}

let User = mongoose.model('User', userSchema)
module.exports = User

