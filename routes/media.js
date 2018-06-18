const metadata = require('../handlers/metadata')
const config = require('../config')
const fs = require('fs')
const db = require('../utils/setup-db').db()
const path = require('path')
const process = require('child_process')
const ffmpeg = require('fluent-ffmpeg')

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
        // if there is no timestamp query, set the value to zero
        let ss = req.query.ss
        if(!ss) {
            ss = 0
        }

        if(range) {
            const parts = range.replace(/bytes=/, '').split('-')
            const start = parseInt(parts[0], 10)
            const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1
            const chunksize = (end - start) + 1
            const file = fs.createReadStream(path, {start, end})
            const head = {
                'Content-Range': `bytes $f{start}-${end}/${fileSize}`,
                'Accept-Ranges': 'bytes',
                'Content-Length': chunksize,
                'Content-Type': 'video/mp4',
            }

            res.writeHead(206, head);

            if(needsTranscoding) {
                // NOTE TO SELF: -crf (50 is worse, 0 is best)
                // get transcoding settings from config
                let crf = config.transcoding.crf

                const command = new ffmpeg(path)
                    .seekInput(ss)
                    .format('mp4')
                    .outputOptions([ '-movflags frag_keyframe+empty_moov', '-crf ' + crf ])
                    .audioCodec('aac')
                    .videoCodec('libx264')
                    .output(res, { end: true })
                    .on('start', function(args) {
                        console.log('Start - Spawned ffmpeg with arguments: ' + args)
                    })
                    .on('progress', function(progress) {
                        console.log('Progress - ' + 'frames: ' + progress.frames + ' percent: ' + progress.percent + ' time: ' + progress.timemark)
                    })
                    .on('error', function(err, stdout, stderr) {
                        console.log('Error - ' + err)
                    })
                    .run()
            } else {
                file.pipe(res);
            }
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