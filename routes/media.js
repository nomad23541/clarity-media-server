const metadata = require('../lib/handlers/metadata-handler')
const config = require('../config')
const fs = require('fs')
const db = require('../lib/setup/setup-db').db()
const transcode = require('../lib/transcoding/transcode')

const Movie = require('../models/movie')
const Show = require('../models/show')
const Episode = require('../models/episode')

module.exports = function(app) {
    app.get('/media/scanshows', function(req, res) {
        // remove whats in the collections before processing
        Show.remove({}, function(err, removed) {
            if(err) return console.log(err)
            console.log('Removed ' + removed.n + ' shows')

            Episode.remove({}, function(err, removed) {
                if(err) return console.log(err)
                console.log('Removed ' + removed.n + ' episodes')
            })
        })

        metadata.processShows()
    })

    app.get('/media/scanmovies', function(req, res) { 
        Movie.remove({}, function(err, removed) {
            if(err) return console.log(err)
            console.log('Removed ' + removed.n + ' movies')
        })

        metadata.processMovies()
    })

    app.get('/media/scannewfiles', function(req, res) {
        // compare files in media directory with files in database
        let files = fs.readdirSync(config.moviesDirectory)
        db.find({}, function(err, docs) {
            let filesInDB = []
            for(let doc in docs) {
                filesInDB.push(docs[doc].file)
            }

            // now get what files aren't in the db
            let difference = files.filter(x => !filesInDB.includes(x)).concat(filesInDB.filter(x => !files.includes(x)))
            // then scan those files only
            metadata.fetchMetadata(difference)
        })
    })

    app.use('/media', function(req, res, next) {
        Movie.findOne({ _id: req.query.id }, function(err, movie) {
            if(movie) {
                req.body.path = movie.location
                req.body.needsTranscoding = movie.needsTranscoding
                next()
            } else {
                Episode.findOne({ _id: req.query.id }, function(err, episode) {
                    req.body.path = episode.location
                    req.body.needsTranscoding = episode.needsTranscoding
                    next()
                })
            }
        })
    })

    app.get('/media', function(req, res) {
        const path = req.body.path
        const stat = fs.statSync(path)
        const fileSize = stat.size
        const range = req.headers.range
        const needsTranscoding = req.body.needsTranscoding

        if(needsTranscoding) {
            transcode.startTranscoding(req, res, fileSize)
        } else if(!needsTranscoding && range) {
            const parts = range.replace(/bytes=/, '').split('-')
            const start = parseInt(parts[0], 10)
            const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1
            const chunksize = (end - start) + 1
            const file = fs.createReadStream(path, {start, end})
            const head = {
                'Content-Range': `bytes ${start}-${end}/${fileSize}`,
                'Accept-Ranges': 'bytes',
                'Content-Length': chunksize,
                'Content-Type': 'video/mp4',
            }

            res.writeHead(206, head)
            file.pipe(res)
        } else {
            const head = {
                'Content-Length': fileSize,
                'Content-Type': 'video/mp4',
            }
            res.writeHead(200, head)
            fs.createReadStream(path).pipe(res)
        }
    })

}