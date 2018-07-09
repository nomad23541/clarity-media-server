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
const User = require('./models/user')

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

/** If there aren't any users in the User collection,
 * redirect to /setup
**/
app.all('*', function(req, res, next) {
    // if first time setup hasn't been configured, reroute here.
    // make sure this doesn't catch /setup or it'll cause an infinite redirect
    if(req.url === '/setup') return next()
    User.count(function(err, count) {
        if(err) return console.log(err)
        if(count == 0) {
            res.redirect('setup')
            return false
        }

        next()
    })
})

// dynamically load routes
const routes = path.join(__dirname, 'routes')
fs.readdirSync(routes).forEach(function(file) {
    require(path.join(routes, file))(app)
})

// start server
http.listen(config.port, function() {
    console.log('Server listening on port ' + config.port)
})