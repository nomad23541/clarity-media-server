const express = require('express')
const app = express()
const http = require('http').Server(app)
const config = require('./config')
const fs = require('fs')
const path = require('path')
const setupDirectories = require('./lib/setup/setup-directories')
const db = require('./lib/setup/setup-db')
const socketIO = require('./lib/setup/setup-socket-io')
const bodyParser = require('body-parser')
const expressDevice = require('express-device')

// create all directories needed in app
setupDirectories.init()
// setup socket io
socketIO.init(http)
// intialize database
db.init()

app.set('view engine', 'ejs')
app.use(bodyParser.json())
app.use(expressDevice.capture())    
app.use(express.static(path.join(__dirname, 'public')))
app.use('/images', express.static(config.imagesDirectory))
app.use('/profiles', express.static(path.join(config.imagesDirectory, '/profiles')))
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