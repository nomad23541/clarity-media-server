const config = require('../../config')
const ffmpeg = require('fluent-ffmpeg')

module.exports.transcode = function(res, time, path, fileSize) {
    // get transcoding settings from config
    let crf = config.transcoding.crf
    let preset = config.transcoding.preset
    let normalizeAudio = config.transcoding.normalizeAudio
    let args = [ 
        '-movflags frag_keyframe+empty_moov',
        '-crf ' + crf,
        '-preset ' + preset,
    ]

    if(normalizeAudio) {
        // this still needs more work
        args.push('-af dynaudnorm=p=0.71:m=100:s=12:g=15')
    }

    res.writeHead(200, {
        'Content-Length': fileSize,
        'Content-Type': 'video/mp4'
    })

    new ffmpeg(path)
        .seekInput(time)
        .format('mp4')
        .outputOptions(args)
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
}