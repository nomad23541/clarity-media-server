module.exports = function(app) {
    app.get('/', function(req, res) {
        res.redirect('/library')
    })

    app.get('/library', function(req, res) {
        res.render('library')
    })

    app.get('/library/search', function(req, res) {
        res.render('search')
    })
}