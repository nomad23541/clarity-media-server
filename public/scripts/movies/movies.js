$(document).ready(function() {
    // all media in the db is populated in #media
    const media = $('#media')
    const btnSort = $('#btnSort')
    const noMediaFound = $('#noMediaFound')
    noMediaFound.hide()

    // sort based on what has been already selected on load
    let selectType = $('#selectType')
    let selectOrder = $('#selectOrder')
    sort(selectType.val() + selectOrder.val())  

    // sort when clicked
    btnSort.click(function() {
        sort(selectType.val() + selectOrder.val()) 
    })

    function sort(query) {
        media.empty()
        $.getJSON('/api/media?sort=' + query, function(data) {
            data.forEach(obj => {
                let content = 
                    '<div class="media-box">' +
                        '<a href="/library/movies/movie?id=' + obj._id + '">' +
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
                noMediaFound.show()
            }
        })
    }
})