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