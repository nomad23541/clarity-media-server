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
            $.getJSON('/api/search?query=' + searchField.val(), function(data) {
                results.empty()
                data.forEach(obj => {
                    var content = 
                    '<div class="media-box">' +
                        (obj.title ? '<a href="/library/movies/movie?id=' + obj._id + '">' : '<a href="/library/shows/show?id=' + obj._id + '">') +
                            '<div class="poster-wrapper">' +
                                '<img src="/images/' + obj.poster + '">' +
                                '<div class="poster-overlay">' +
                                    '<a class="media-play" href="/watch?id=' + obj._id + '"><i class="fas fa-play"></i></a>' +
                                '</div>' +
                            '</div>' +
                        '</a>' +
                        '<p class="media-title">' + (obj.title || obj.name) + '</p>' +
                        '<p class="media-year">' + (obj.year || obj.seasons.length + ' Seasons') + '</p>' +
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