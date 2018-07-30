$(document).ready(function() {
    let fieldTitle = $('#fieldTitle')
    let fieldYear = $('#fieldYear')
    let btnSearch = $('#btnSearch')
    let results = $('#results')

    // focus this on page load
    fieldTitle.focus()
    btnSearch.click(function() {
        search()
    })

    function search(query) {
        if(fieldTitle.val() != '') {
            $.getJSON('/api/fix?query=' + fieldTitle.val() + '&year=' + fieldYear.val(), function(data) {
                results.empty()
                console.log(data)
                data.results.forEach(obj => {
                    let content = 
                    '<div class="media-box fix" name="' + obj.id + '">' +
                        '<a href="#">' +
                            '<div class="poster-wrapper">' +
                                '<img src="http://image.tmdb.org/t/p/w500/' + obj.poster_path + '">' +
                                '<div class="poster-overlay">' +
                                    '<button class="btn btn-primary btnSetMetadata">Use This</button>' +
                                '</div>' +
                            '</div>' +
                        '</a>' +
                        '<p class="media-title">' + obj.title + '</p>' +
                        '<p class="media-year">(' + obj.release_date + ')</p>' +
                    '</div>'

                    results.append(content)
                })

                $('.media-box a').click(function() {
                    console.log('selected')
                })

                $('.btnSetMetadata').click(function() {
                    // get parent div and get name which contains tmdbid
                    // yeah this is a lil funky
                    let tmdbid = $(this).parent().parent().parent().parent().attr('name')
                    let docid = $.urlParam('id')
                    $.ajax({
                        url: '/api/fix',
                        method: 'PUT',
                        contentType: 'application/json',
                        data: JSON.stringify({ tmdbid, docid }),
                        success: function(newID) {
                            let id = JSON.parse(newID)
                            window.location.href = '/library/movies/movie?id=' + id.id
                        }
                    })
                })
            })
        } else {
            // if the field is empty and the user tries to search, empty the results
            results.empty()
        }
    }
})

$.urlParam = function (name) {
    let results = new RegExp('[\?&]' + name + '=([^&#]*)').exec(window.location.href);
    return results[1] || 0;
}