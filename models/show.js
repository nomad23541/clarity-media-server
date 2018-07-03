const mongoose = require('mongoose')
const Schema = mongoose.Schema

let showSchema = new Schema({
    name: String,
    location: String,
    poster: { type: String, default: '/img/unknown-poster.png' },
    backdrop: { type: String, default: '' },
    metadata: {
        overview: String,
        episodeCount: Number,
        seasonCount: Number,
    },
    seasons: Array,
    tmdbid: String
})

let Show = mongoose.model('Show', showSchema)

module.exports = Show