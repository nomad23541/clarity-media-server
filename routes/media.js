const metadata = require('../handlers/metadata')
const config = require('../config')
const fs = require('fs')
const isVideo = require('is-video')
const db = require('../db/db').db()
const path = require('path')
const getVideoInfo = require('get-video-info')

module.exports = function(app) {
    app.get('/media/scanlibrary', function(req, res) { 
        db.remove({}, { multi: true })
        metadata.fetchMetadata()
        /*
        var files = fs.readdirSync(config.mediaDirectory)
        // remove documents in the database that don't exist on the disk anymore
        db.find({}, function(err, docs) {
            // add file values in all documents to an array
            var docFiles = []
            for(var doc in docs) {
                docFiles.push(docs[doc].file)
            }
            // find the difference between files and docFiles
            var difference = docFiles.filter(x => !files.includes(x)).concat(files.filter(x => !docFiles.includes(x)))
            // now remove all the differences in the database
            for(var dif in difference) {
                db.remove({ file: difference[dif] })
            }
        })

        // now fetch the metadata for each file
        files.forEach(file => {
            // avoid duplicating, check the database to see if it already exists
            db.findOne({ file: file }, function(err, doc) {
                if(!doc) {
                    // skip iteration if the file isn't a video
                    if(!isVideo(file)) {
                        return
                    }
                    // finally fetch the data
                    metadata.fetchMetadata(file)
                }
            })
        })
        */
    })

    app.use('/media', function(req, res, next) {
        db.findOne({ _id: req.query.id }, function(err, doc) {
            req.body.path = config.mediaDirectory + '/' + doc.file
            next()
        })
    })

    app.get('/media', function(req, res) {
        const path = req.body.path
        const stat = fs.statSync(path)
        const fileSize = stat.size
        const range = req.headers.range

        if (range) {
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

            res.writeHead(206, head);
            file.pipe(res);
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