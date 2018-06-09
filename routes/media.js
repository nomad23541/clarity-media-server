const metadata = require('../handlers/metadata')
const config = require('../config')
const fs = require('fs')
const db = require('../utils/setup-db').db()
const path = require('path')

module.exports = function(app) {
    app.get('/media/scanlibrary', function(req, res) { 
        // create media directory if it doesn't exist
        if(!fs.existsSync(config.mediaDirectory)) {
            fs.mkdirSync(config.mediaDirectory)
        }

        db.remove({}, { multi: true })
        metadata.fetchMetadata()
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