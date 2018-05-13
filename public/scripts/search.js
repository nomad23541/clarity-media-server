$(document).ready(function() {
    var searchField = $('#searchField')
    var searchBtn = $('#searchBtn')
    var results = $('#results')

    // focus this on page load
    searchField.focus()

    searchBtn.click(function() {
        search()
    })

    searchField.keypress(function(e) {
        // 13 = Enter Key
        if(e.which == 13) {
            search()
        }
    })

    searchField.on('input', function() {
        search()
    })

    function search() {
        if(searchField.val() != '') {
            $.getJSON('/api/search?title=' + searchField.val(), function(data) {
                results.empty()
                data.forEach(obj => {
                    var content = 
                    '<div class="media-box">' +
                        '<a href="/watch?id=' + obj._id + '">' +
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

                    results.append(content)
                })
            })
        } else {
            // if the field is empty and the user tries to search, empty the results
            results.empty()
        }
    }
})