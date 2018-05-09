const Datastore = require('nedb')
let db

module.exports.init = function(file) {
    db = new Datastore({
        filename: file,
        autoload: true
    })
}

module.exports.db = function() {
    return db
}