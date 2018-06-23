const ios = require('./ios')
const android = require('./android')
const desktop = require('./desktop')

module.exports.startTranscoding = function(req, res, fileSize) {
    let device = req.device.type
    let path = req.body.path
    let time = req.query.ss
    // if there is no timestamp query, set the value to zero
    if(!time) {
        time = 0
    }
    
    if(device == 'desktop') {
        console.log('Started new transcoding job as Desktop')
        desktop.transcode(res, time, path, fileSize)
    }

    // for now this only works with ios devices, I don't have an
    // android device to test on
    // although this is still pretty wonky
    if(device == 'phone') {
        console.log('Started new transcoding job as Phone')
        ios.transcode(res, time, path, fileSize)
    }
}