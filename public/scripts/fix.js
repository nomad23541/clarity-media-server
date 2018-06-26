$(document).ready(function() {
    var fieldQuery = $('#fieldQuery')
    var fieldYear = $('#fieldYear')
    var btnSearch = $('#btnSearch')
    var results = $('#results')

    // focus this on page load
    fieldQuery.focus()

    btnSearch.click(function() {
        search()
    })

    function search(query) {
        if(fieldQuery.val() != '') {
            $.getJSON('/api/fix?query=' + fieldQuery.val() + '&year=' + fieldYear.val(), function(data) {
                results.empty()
                console.log(data)
                data.results.forEach(obj => {
                    var content = 
                    '<div class="media-box">' +
                        '<a href="#">' +
                            '<div class="poster-wrapper">' +
                                '<img src="http://image.tmdb.org/t/p/w500/' + obj.poster_path + '">' +
                            '</div>' +
                        '</a>' +
                        '<p class="media-title">' + obj.title + '</p>' +
                        '<p class="media-year">(' + obj.release_date + ')</p>' +
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