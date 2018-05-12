const express = require('express')
const app = express()
const http = require('http').Server(app)
const config = require('./config')
const fs = require('fs')
const path = require('path')
const db = require('./utils/setup-db')
const bodyParser = require('body-parser')
const socketio = require('./utils/setup-socketio')

// setup socket io
socketio.init(http)
// intialize database
db.init('./database/media.db')

app.set('view engine', 'ejs')
app.use(bodyParser.json())
app.use(express.static(path.join(__dirname, 'public')))
app.use('/posters', express.static(config.posterDirectory))
app.use('/profiles', express.static(path.join(config.posterDirectory, '/profiles')))
// use scripts in the node_modules in a view
app.use('/scripts_server', express.static(path.join(__dirname, 'node_modules')))
// set favicon
app.use('/favicon.ico', express.static(path.join(__dirname, 'public', 'img', 'favicon.ico')))

// dynamically load routes
const routes = path.join(__dirname, 'routes')
fs.readdirSync(routes).forEach(function(file) {
    require(path.join(routes, file))(app)
})

// start server
http.listen(config.port, function() {
    console.log('Server listening on port ' + config.port)
})