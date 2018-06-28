$(document).ready(function() {
    let btnSave = $('#btnSave')
    let btnScanNewFiles = $('#btnScanNewFiles')
    let btnScanEntireLibrary = $('#btnScanEntireLibrary')
    let scanLibraryDialog = $('#scanLibraryDialog')
    let scanNewFilesDialog = $('#scanNewFilesDialog')

    // hide on load
    scanLibraryDialog.hide()
    scanNewFilesDialog.hide()


    // load settings from config
    $.getJSON('/api/settings', function(obj) {
        let keys = keyify(obj)
        for(let key in keys) {
            if(keys[key].indexOf('.') > -1) {
                let split = keys[key].split('.')
                let value = keys[key].split('.').reduce((a, b) => a[b], obj)
                $('#' + split[0] + '\\.' + split[1]).val(value.toString())
            } else {
                $('#' + keys[key]).val(obj[keys[key]])
            }
        }
    })

    // save new settings to config
    btnSave.click(function() {
        // object that all of our setting values are put into
        let obj = {}
        // loop through all elements with .setting
        $('.setting').each(function(i) {
            let id = $(this).attr('id')
            let value = $(this).val()
            
            // convert string booleans to a literal boolean
            if(value == 'true' || value == 'false') {
                value = (value === 'true')
            }
            // same with numbers
            if(/^-{0,1}\d+$/.test(value)) {
                value = parseInt(value)
            }

            obj[id] = value
        })

        // now we fix any dot-notated keys
        obj = deepen(obj)

        // finally save the file
        $.ajax({
            url: '/settings',
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(obj),
            success: function(data) {
                console.log('Saved Settings')
            },
            error: function(data) {
                console.log('Error occurred while saving')
                console.err(data.message)
            }
        })
    })

    // only scan new files to the library
    btnScanNewFiles.click(function() {
        scanNewFilesDialog.show()
        $.ajax({
            url: '/media/scannewfiles',
            method: 'GET'
        })
    })

    // scan entire library on btn click
    btnScanEntireLibrary.click(function() {
        scanLibraryDialog.show()
        $.ajax({
            url: '/media/scanlibrary',
            method: 'GET'
        })
    })

    // listen for library scan progress and update the client
    const socket = io()
    socket.on('scanProgress', function(data) {
        $('#scanProgressNewFiles').text(data.msg + '%')
        $('#scanProgressLibrary').text(data.msg + '%')
        if(data.msg == 100) {
            location.reload()
        }

        if(data.msg == 'NOMEDIA') {
            $('#scanLibraryTxt').text('Movies directory is empty!')
        }
    })
})

function deepen(o) {
    var oo = {}, t, parts, part;
    for (var k in o) {
        t = oo;
        parts = k.split('.');
        var key = parts.pop();
        while (parts.length) {
            part = parts.shift();
            t = t[part] = t[part] || {};
        }
        t[key] = o[k]
    }
    return oo;
}

function keyify(obj, prefix = '') {
    return Object.keys(obj).reduce(function (res, el) {
        if (Array.isArray(obj[el])) {
            return res;
        } else if (obj[el] !== null && typeof (obj[el]) === 'object') {
            return [...res, ...keyify(obj[el], prefix + el + '.')];
        } else {
            return [...res, prefix + el];
        }
    }, []);
}