$(document).ready(function() {
    // all media in the db is populated in #media
    const media = $('#media')
    const noDocsFound = $('#noDocsFound')
    const sortDialog = $('#sortDialog')
    const scanLibraryDialog = $('#scanLibraryDialog')
    const openSortDialogBtn = $('#openSortDialogBtn')
    const sortBtn = $('#sortBtn')

    // initially hide these
    noDocsFound.hide()
    // dialogs need to be hidden on DOM load, display: hidden in css
    // causes strange placement when show() is called
    sortDialog.hide()
    scanLibraryDialog.hide()

    // handle dialog functions
    // if dialog contains .dialog-closable, user can click outside to close
    $('.dialog-container.dialog-closable').mouseup(function(e) {
        let dialog = $('.dialog')
        if(e.target.id != dialog.attr('id') && !dialog.has(e.target).length) {
            $(this).hide()
        }
    })

    let sortType = $('input[name=sortType]:checked', '#sortType')
    let orderType = $('input[name=sortOrder]:checked', '#sortOrder')

    // if these radio buttons haven't been selected yet (first time on page)
    // default to sorting by title + ascending
    if(!sortType.is(':checked') || !orderType.is(':checked')) {
        let newSort = $('input[name=sortType][value="title"]').prop('checked', true)
        let newOrder = $('input[name=sortOrder][value="+1"]').prop('checked', true)
        sort(newSort.val() + newOrder.val())
    } else {
        // otherwise, sort by the last selected value 
        sort(sortType.val() + orderType.val())
    }

    openSortDialogBtn.click(function() {
        sortDialog.show()
    })

    sortBtn.click(function() {
        // get selected radio buttons
        let sortType = $('input[name=sortType]:checked', '#sortType').val()
        let orderType = $('input[name=sortOrder]:checked', '#sortOrder').val()
        // then sort by those values
        sort(sortType + orderType)
        sortDialog.hide()
    })

    $('#scanLibrary').click(function() {
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
    })

    function sort(query) {
        media.empty()
        $.getJSON('/api/media?sort=' + query, function(data) {
            data.forEach(obj => {
                let content = 
                    '<div class="media-box">' +
                        '<a href="/details?id=' + obj._id + '">' +
                            '<div class="poster-wrapper">' +
                                '<img src="' + obj.images.posterWeb + '">' +
                                '<div class="poster-overlay">' +
                                    '<a class="media-edit" href="/edit?id=' + obj._id + '"><i class="fas fa-edit"></i></a>' +
                                    '<a class="media-play" href="/watch?id=' + obj._id + '"><i class="fas fa-play"></i></a>' +
                                '</div>' +
                            '</div>' +
                        '</a>' +
                        '<p class="media-title">' + obj.title + '</p>' +
                        '<p class="media-year">(' + obj.year + ')</p>' +
                    '</div>' 
                media.append(content)
            })
    
            if(data.length == 0) {
                noDocsFound.show()
            }
        })
    }
})