const mongoose = require('mongoose')
const url = 'mongodb://127.0.0.1/media'
let db

module.exports.init = function() {
    mongoose.connect(url)
    db = mongoose.connection
    // temporary
    db.on('error', console.error.bind(console, 'MongoDB connection error: '))
}

module.exports.db = function() {
    return db
}