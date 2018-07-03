const mongoose = require('mongoose')
const Schema = mongoose.Schema

let movieSchema = new Schema({
    title: String,
    year: Number,
    location: String,
    poster: { type: String, default: '/img/poster-unknown.png' },
    backdrop: { type: String, default: '' },
    needsTranscoding: Boolean,
    videoInfo: {
        videoCodec: String,
        audioCodec: String,
        width: Number,
        height: Number,
        duration: Number
    },
    metadata: {
        rating: String,
        runtime: String,
        releaseDate: Date,
        overview: String,
        tagline: String,
        genres: Array,
        cast: Array,
        director: Object,
    },
    tmdbid: String,
    imdbid: String
})

let Movie = mongoose.model('Movie', movieSchema)

module.exports = Movie

