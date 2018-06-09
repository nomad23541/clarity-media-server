$(document).ready(function() {
    let serverPort = $('#settingsServerPort')
    let mediaDir = $('#settingsMediaDir')
    let posterDir = $('#settingsPosterDir')
    let apiKey = $('#settingsApiKey')

    // get config and fill in fields
    $.getJSON('/api/settings', function(data) {
        console.log(data)
        serverPort.find('.textfield').val(data.port)
        mediaDir.find('.textfield').val(data.mediaDirectory)
        posterDir.find('.textfield').val(data.posterDirectory)
        apiKey.find('.textfield').val(data.tmdbApiKey)
    })
})