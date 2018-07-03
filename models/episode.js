const mongoose = require('mongoose')
const Schema = mongoose.Schema

let episodeSchema = new Schema({
    showName: String,
    name: String,
    seasonNumber: Number,
    episodeNumber: Number,
    location: String,
    still: { type: String, default: '' },
    needsTranscoding: Boolean,
    videoInfo: {
        videoCodec: String,
        audioCodec: String,
        width: Number,
        height: Number,
        duration: Number
    },
    metadata: {
        overview: String,
        airDate: Date
    },
    tmdbid: String,
})

let Episode = mongoose.model('Episode', episodeSchema)

module.exports = Episode

