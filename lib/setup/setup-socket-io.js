let io

module.exports.init = function(app) {
    io = require('socket.io')(app)
}

module.exports.io = function() {
    return io
}