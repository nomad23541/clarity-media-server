$(document).ready(function() {
    var video = videojs('player')
    video.src({ type: 'video/mp4', src: '/media?id=' + id })

    /* Handle overlay */
    video.on('pause', function() {
        $('.player-overlay').css('opacity', '1')
        console.log('paused')
    })

    video.on('playing', function() {
        $('.player-overlay').css('opacity', '0')
        console.log('playing')
    })

    video.on('useractive', function() {
        $('.player-overlay').css('opacity', '1')
        console.log('useractive')
    })

    video.on('userinactive', function() {
        $('.player-overlay').css('opacity', '0')
        console.log('userinactive')
    })

    // deal with back arrow
    $(document).on('click', '#backArrow', function() {
        window.history.go(-1)
        console.log('test')
        return false
    })

    // this will work for all media, transcoding or not, will need to change that.
    // graciously taken from https://stackoverflow.com/questions/3639604/html5-audio-video-and-live-transcoding-with-ffmpeg
    // duration hack
    video.duration = function() { return video.theDuration }
    video.start = 0
    video.oldCurrentTime = video.currentTime
    video.currentTime = function(time) {
        if(time === undefined) {
            return video.oldCurrentTime() + video.start
        }
        console.log(time)
        video.start = time
        video.oldCurrentTime(0)
        video.src({ type: 'video/mp4', src: '/media?id=' + id + '&ss=' + time })
        video.play()
        return this
    }

    $.getJSON('/api/media/' + id, function(data) {
        video.theDuration = data.videoInfo.duration
    })
})