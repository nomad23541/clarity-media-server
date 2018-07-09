const mongoose = require('mongoose')
const Schema = mongoose.Schema

let userSchema = new Schema({
    username: String,
    // YES I KNOW, this is temporary for development
    password: String,
    admin: Boolean
})

let User = mongoose.model('User', userSchema)

module.exports = User

