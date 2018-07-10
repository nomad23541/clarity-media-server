const Show = require('../../models/show')
const Episode = require('../../models/episode')

module.exports = function(app) {
    app.get('/library/shows', function(req, res, next) {
        Show.find({}, function(err, docs) {
            if(err) return next(err)
            if(!docs) return next(new Error('No shows were found'))

            res.render('shows', {
                size: docs.length
            })
        })
    })

    app.get('/library/shows/show', function(req, res, next) {
        Show.findOne({ _id: req.query.id }, function(err, doc) {
            if(err) return next(err)
            if(!doc) return next(new Error('Could not find this show'))

            res.render('show', {
                doc: doc
            })
        })
    })

    app.get('/library/shows/show/:id/season/:season', function(req, res, next) {
        Show.findOne({ _id: req.params.id }, function(err, doc) {
            if(err) return next(err)
            if(!doc) return next(new Error('Could not find this show'))

            let season = doc.seasons.find(season => season.seasonNumber == req.params.season)
            Episode.find({ showName: doc.name, 'seasonNumber': parseInt(req.params.season) }).sort({ 'episodeNumber': 1 }).exec(function(err, episodes) {
                if(err) return next(err)
                if(!episodes) return next('No episodes were found for this season')

                res.render('season', {
                    doc: doc,
                    season: season,
                    episodes: episodes
                })
            })        
        })
    })

}