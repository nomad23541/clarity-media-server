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
const expressSession = require('express-session')
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
app.use(expressSession({
    secret: 'random secret ha',
    resave: true,
    saveUninitialized: false
}))
app.use(express.static(path.join(__dirname, 'public')))
app.use('/images', express.static(config.imagesDirectory))
app.use('/profiles', express.static(path.join(config.imagesDirectory, '/profiles')))
// use scripts in the node_modules in a view
app.use('/scripts_server', express.static(path.join(__dirname, 'node_modules')))
// set favicon
app.use('/favicon.ico', express.static(path.join(__dirname, 'public', 'img', 'favicon.ico')))

isAuthenticated = function(req, res, next) {
    return req.session.user
}

/**
 * This route handles first-time setup if the Users collection is empty
 * and handles requiring authentication for all pages
 */
app.all('*', function(req, res, next) {
    // if first time setup hasn't been configured, reroute here.
    // make sure this doesn't catch /setup or it'll cause an infinite redirect
    if(req.url === '/setup') return next()
    User.count(function(err, count) {
        if(err) return next(err)
        if(count == 0) {
            return res.redirect('/setup')
        }

        // now make sure user is logged in
        if(req.url === '/login') return next()
        if(!isAuthenticated(req)) {
            return res.redirect('/login')
        }

        next()
    })
})

app.use(function(req, res, next) {
    res.locals.user = req.session.user
    next()
})

// dynamically load routes
const routes = path.join(__dirname, 'routes')
fs.readdirSync(routes).forEach(function(file) {
    require(path.join(routes, file))(app)
})

// get all routes in apps/ folder
// also register every view folder
let viewDirs = [ path.join(__dirname, 'views') ]
const appRoutes = path.join(__dirname, 'apps')
fs.readdirSync(appRoutes).forEach(function(appDir) {
    fs.readdirSync(path.join(appRoutes, appDir)).forEach(function(file) {
        if(file === 'index.js') {
            require(path.join(appRoutes, appDir, file))(app)
        }

        if(file === 'views') {
            viewDirs.push(path.join(appRoutes, appDir, file))
        }
    })
})

app.set('views', viewDirs)

// error middleware
app.use(function(err, req, res, next) {
    let status = 500 || err.statusCode
    res.render('error', {
        statusCode: status,
        error: err.message
    })
})

// start server
http.listen(config.port, function() {
    console.log('Server listening on port ' + config.port)
})