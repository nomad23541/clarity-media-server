$(document).ready(function() {
    let serverPort = $('#settingsServerPort')
    let mediaDir = $('#settingsMediaDir')
    let posterDir = $('#settingsPosterDir')
    let apiKey = $('#settingsApiKey')

    let btnSaveSettings = $('#btnSaveSettings')
    let btnScanLibrary = $('#btnScanLibrary')

    let scanLibraryDialog = $('#scanLibraryDialog')
    // hide on load
    scanLibraryDialog.hide()

    // get config and fill in fields
    $.getJSON('/api/settings', function(data) {
        console.log(data)
        serverPort.find('.textfield').val(data.port)
        mediaDir.find('.textfield').val(data.mediaDirectory)
        posterDir.find('.textfield').val(data.posterDirectory)
        apiKey.find('.textfield').val(data.tmdbApiKey)
    })

    // scan library stuff
    btnScanLibrary.click(function() {
        scanLibraryDialog.show()
        $.ajax({
            url: '/media/scanlibrary',
            method: 'GET'
        })
    })

    // save settings to config.json
    btnSaveSettings.click(function() {
        // gather all values in fields and put into obj
        let settings = {
            port: serverPort.find('.textfield').val(),
            posterDirectory: posterDir.find('.textfield').val(),
            mediaDirectory: mediaDir.find('.textfield').val(),
            tmdbApiKey: apiKey.find('.textfield').val()
        }

        $.ajax({
            url: '/settings',
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(settings),
            success: function(data) {
                console.log('Saved Settings')
            },
            error: function(data) {
                console.log('Error occurred while saving')
                console.err(data.message)
            }
        })
    })

    // listen for library scan progress and update the client
    const socket = io()
    socket.on('scanProgress', function(data) {
        $('#scanProgress').text(data.msg + '%')
        if(data.msg == 100) {
            location.reload()
        }

        if(data.msg == 'NOMEDIA') {
            $('#scanLibraryTxt').text('Media directory is empty!')
        }
    })
})