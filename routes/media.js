const metadata = require('../lib/handlers/metadata-handler')
const config = require('../config')
const fs = require('fs')
const db = require('../lib/setup/setup-db').db()
const path = require('path')
const process = require('child_process')
const ffmpeg = require('fluent-ffmpeg')
const transcode = require('../lib/transcoding/transcode')

module.exports = function(app) {
    app.get('/media/scannewfiles', function(req, res) {
        // create media directory if it doesn't exist
        if(!fs.existsSync(config.moviesDirectory)) {
            fs.mkdirSync(config.moviesDirectory)
        }

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

    app.get('/media/scanlibrary', function(req, res) { 
        // create media directory if it doesn't exist
        if(!fs.existsSync(config.moviesDirectory)) {
            fs.mkdirSync(config.moviesDirectory)
        }

        db.remove({}, { multi: true })
        metadata.fetchMetadata(fs.readdirSync(config.moviesDirectory))
    })

    app.use('/media', function(req, res, next) {
        db.findOne({ _id: req.query.id }, function(err, doc) {
            req.body.path = doc.location
            req.body.needsTranscoding = doc.needsTranscoding
            next()
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