$(document).ready(function() {
    var sortBtn = $('#sortBtn')
    var sortSelect = $('#sortSelect')
    var noDocsFound = $('#noDocsFound')
    var media = $('#media')

    noDocsFound.hide()
    // by default, sort by the last selected value 
    sort(sortSelect.val())

    sortBtn.click(function() {
        sort(sortSelect.val())
    })

    function sort(query) {
        media.empty()
        $.getJSON('/api/media?sort=' + query, function(data) {
            data.forEach(obj => {
                var content = 
                    '<div class="media-box">' +
                        '<a href="/watch?id=' + obj._id + '">' +
                            '<div class="poster-wrapper">' +
                                '<img src="' + obj.images.posterWeb + '">' +
                                '<div class="poster-overlay">' +
                                    '<a class="media-info" href="/details?id=' + obj._id + '"><i class="fas fa-info-circle"></i></a>' +
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

    $('#scanLibrary').click(function() {
        $('#scanLibraryDialog').show()
        $.ajax({
            url: '/media/scanlibrary',
            method: 'GET'
        })
    })

    var socket = io()

    socket.on('scanProgress', function(data) {
        $('#scanProgress').text(data.msg + '%')

        if(data.msg == 100) {
            location.reload()
        }
    })
   
})