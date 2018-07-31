$(document).ready(function() {
    let searchParams = new URLSearchParams(window.location.search)

    // show tab based on query when loading page
    if(window.location.search.indexOf('?tab=') > -1) {
        let tabQuery = searchParams.get('tab')
        showTab($('[tab="' + tabQuery + '"]'), tabQuery)
    }

    $('.tabs .tab-link').click(function() {
        let tabID = $(this).attr('tab')
        searchParams.set('tab', tabID)
        // actually change the url to show this update to the query
        window.history.replaceState({}, '', window.location.pathname + '?' + searchParams)
        showTab($(this), tabID)
    })

    function showTab(tabLink, tabID) {
        $('.tabs .tab-link').removeClass('active')
        $('.tab-content').removeClass('active')
        
        $(tabLink).addClass('active')
        $('#' + tabID).addClass('active')
    }

    $('#submitServer').click(function(e) {
        e.preventDefault()
        // gather data from inputs
        let data = {
            moviesDirectory: $('#moviesDirectory').val(),
            imagesDirectory: $('#imagesDirectory').val(),
            showsDirectory: $('#showsDirectory').val(),
            port: $('#port').val()
        }

        $.ajax({
            url: '/settings',
            method: 'PUT',
            data: JSON.stringify(data),
            contentType: 'application/json',
            success: function() {
                location.reload()
            },
            error: function(err) {
                $('#serverError').text(err.responseText).slideDown()
            }
        })
    })

    const socket = io()
    let btnScanMovies = $('#btnScanMovies')
    let btnScanShows = $('#btnScanShows')
    let scanProgress = $('#scanProgress')

    socket.on('scanProgress', function(data) {
        btnScanMovies.prop('disabled', true)
        btnScanShows.prop('disabled', true)
        scanProgress.text('Scan Progress: ' + data.msg + '%')

        if(data.msg == 100) {
            location.reload()  
        }

        if(data.msg == 'NOMEDIA') {
            scanProgress.text('There is no media to scan')
        }
    })

    btnScanMovies.click(function() {
        scanProgress.text('Starting movie scan...').slideDown()
        $.ajax({
            url: '/media/scanmovies',
            method: 'GET'
        })
    })

    btnScanShows.click(function() {
        scanProgress.text('Starting shows scan...').slideDown()
        $.ajax({
            url: '/media/scanshows',
            method: 'GET'
        })
    })

    $('#submitMetadata').click(function(e) {
        e.preventDefault()
        let data = {
            tmdbApiKey: $('#tmdbApiKey').val()
        }

        $.ajax({
            url: '/settings',
            method: 'PUT',
            data: JSON.stringify(data),
            contentType: 'application/json',
            success: function() {
                location.reload()
            },
            error: function(err) {
                $('#metadataError').text(err.responseText).slideDown()
            }
        })
    })

    $('#submitPlayback').click(function(e) {
        e.preventDefault()
        let data = {
            preset: $('#preset option:selected').val(),
            crf: $('#crf').val(),
            normalizeAudio: $('#normalizeAudio option:selected').val()
        }

        $.ajax({
            url: '/settings',
            method: 'PUT',
            data: JSON.stringify(data),
            contentType: 'application/json',
            success: function() {
                location.reload()
            },
            error: function(err) {
                $('#playbackError').text(err.responseText).slideDown()
            }
        })
    })

    $('.btnDelete').click(function() {
        let userID = $(this).parent().parent().attr('user-id')
        if(confirm('Are you sure you want to delete this user?')) {
            $.ajax({
                url: '/api/users/' + userID,
                method: 'DELETE',
                success: function() {
                    location.reload()
                }
            })
        }
    })

    $('.btnEdit').click(function() {
        let parent = $(this).parent().parent()
        let userID = $(this).parent().parent().attr('user-id')
        let editUserTile = $('#tileEditUser')
        let username = parent.find('.username').text()
        let admin = parent.find('.admin').text()

        // set input values of newUserTile from the selected user-tile
        $('#editUsername').text(username)
        if(admin == 'true') $('#editAdmin').prop('checked', true)

        parent.hide()
        // so the edit tile shows in place of the parent's
        parent.after(editUserTile.detach())
        editUserTile.show()

        $('#btnSaveEdit').click(function() {
            let password = $('#editPassword').val()
            let passwordConfirm = $('#editPasswordConfirm').val()
            let admin = $('#editAdmin').is(':checked')

            let data = {
                password,
                passwordConfirm,
                admin
            }

            $.ajax({
                url: '/api/users/' + userID,
                method: 'PUT',
                contentType: 'application/json',
                data: JSON.stringify(data),
                error: function(err) {
                    $('#txtEditUserError').text(err.responseText).slideDown()
                },
                success: function() {
                    location.reload()
                }
            })
        })
    
        $('#btnCancelEdit').click(function() {
            editUserTile.find('input').val('')
            editUserTile.hide()
            parent.show()
        })
    })

    let btnCreateUser = $('#btnCreateUser')
    btnCreateUser.click(function() {
        let newUserTile = $('#tileNewUser')
        
        btnCreateUser.hide()
        newUserTile.show()

        $('#btnSaveNew').click(function() {
            let username = $('#newUsername').val()
            let password = $('#newPassword').val()
            let passwordConfirm = $('#newPasswordConfirm').val()
            let admin = $('#newAdmin').is(':checked')

            let data = {
                username,
                password,
                passwordConfirm,
                admin
            }

            $.ajax({
                url: '/api/users/',
                method: 'POST',
                contentType: 'application/json',
                data: JSON.stringify(data),
                error: function(err) {
                    $('#txtNewUserError').text(err.responseText).slideDown()
                },
                success: function() {
                    location.reload()
                }
            })
        })

        $('#btnCancelNew').click(function() {
            newUserTile.find('input').val('')
            newUserTile.hide()
            btnCreateUser.show()
        })
    })
})

/*
$(document).ready(function() {
    let btnSave = $('#btnSave')
    let btnScanNewFiles = $('#btnScanNewFiles')
    let btnScanMovies = $('#btnScanMovies')
    let btnScanShows = $('#btnScanShows')
    let scanShowsDialog = $('#scanShowsDialog') 
    let scanMoviesDialog = $('#scanMoviesDialog')
    let scanNewFilesDialog = $('#scanNewFilesDialog')

    // hide on load
    scanShowsDialog.hide()
    scanMoviesDialog.hide()
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
    btnScanMovies.click(function() {
        scanMoviesDialog.show()
        $.ajax({
            url: '/media/scanmovies',
            method: 'GET'
        })
    })

    // scan shows debug test
    btnScanShows.click(function() {
        scanShowsDialog.show()
        $.ajax({
            url: '/media/scanshows',
            method: 'GET'
        })
    })

    // listen for library scan progress and update the client
    const socket = io()
    socket.on('scanProgress', function(data) {
        $('#scanProgressShows').text(data.msg + '%')
        $('#scanProgressNewFiles').text(data.msg + '%')
        $('#scanProgressMovies').text(data.msg + '%')
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
*/