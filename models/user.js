const bcrypt = require('bcrypt')
const mongoose = require('mongoose')
const Schema = mongoose.Schema

let userSchema = new Schema({
    username: {
        type: String,
        unique: true,
        required: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    }
})

// hash the password
userSchema.pre('save', function(next) {
    let user = this
    bcrypt.hash(user.password, 10, function(err, hash) {
        if(err) return next(err)
        user.password = hash
        next()
    })
})

userSchema.statics.login = function(username, password, callback) {
    User.findOne({ username: username }).exec(function(err, user) {
        if(err) {
            return callback(err)
        } else if(!user) {
            let err = new Error('User not found')
            err.status = 401
            return callback(err)
        }

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

