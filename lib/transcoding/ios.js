const config = require('../../config')
const ffmpeg = require('fluent-ffmpeg')

module.exports.transcode = function(res, time, path, fileSize) {
    let args = [
        '-pix_fmt yuv420p',
        '-s qvga',
        '-segment_list_type m3u8',
        '-map 0:v',
        '-map 0:a:0',
        '-ar 44100',
        '-hls_time 10',
        '-hls_list_size 6',
        '-hls_wrap 18',
        '-start_number 1',
        '-deinterlace',
        '-threads 0',
        '-ac 2',
        '-b:a 160000'
    ]

    res.writeHead(200, {
        'Content-Length': fileSize,
        'Content-Type': 'application/x-mpegURL'
    })

    new ffmpeg(path)
        .seekInput(time)
        .format('hls')
        .outputOptions(args)
        .audioCodec('libmp3lame')
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