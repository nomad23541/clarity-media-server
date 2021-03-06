$(document).ready(function() {
    // help with page jumping around, this is temporary
    $('body').css('overflow-y', 'scroll')

    // all media in the db is populated in #media
    const tempMedia = $('#tempMedia')
    const media = $('#media')
    const btnSort = $('#btnSort')
    const noMediaFound = $('#noMediaFound')
    noMediaFound.hide()

    // sort when clicked
    btnSort.click(function() {
        sort(selectType.val() + selectOrder.val()) 
    })

    // for testing purposes, only show 10 per page
    let limit = 25
    let skip = 0
    const btnPreviousPage = $('.btnPreviousPage')
    const btnNextPage = $('.btnNextPage')

    // sort based on what has been already selected on load
    let selectType = $('#selectType')
    let selectOrder = $('#selectOrder')
    sort(selectType.val() + selectOrder.val())

    // handle previous and next icon buttons
    btnPreviousPage.click(function() {
        if(skip != 0) {
            skip -= limit
            sort(selectType.val() + selectOrder.val())
        }
    })

    btnNextPage.click(function() {
        if((skip + limit) < size) {
            skip += limit
            sort(selectType.val() + selectOrder.val())
        }
    })

    function sort(query) {
        $.getJSON('/api/media/shows?sort=' + query + '&skip=' + skip + '&limit=' + limit, function(data) {
            data.forEach(obj => {
                let content = 
                    '<div class="media-box">' +
                        '<a href="/library/shows/show?id=' + obj._id + '">' +
                            '<div class="poster-wrapper">' +
                                '<img src="/images/' + obj.poster + '">' +
                                '<div class="poster-overlay">' +
                                '</div>' +
                            '</div>' +
                        '</a>' +
                        '<p class="media-title">' + obj.name + '</p>' +
                        '<p class="media-year">' + obj.seasons.length + ' Seasons</p>' +
                    '</div>'
                tempMedia.append(content)
            })

            // this helps with the jumping when emptying the media
            // although doesn't fully work, will update
            media.html(tempMedia.html())
            tempMedia.empty()

            // remove disabled class on every sort
            btnPreviousPage.removeClass('btn-icon-disabled')
            btnNextPage.removeClass('btn-icon-disabled')

            // determine listing values
            let amountStarting = skip + 1
            let amountInPage = skip + limit
            if(amountInPage > size) {
                amountInPage = size
            }
            // then set that into the listing <p>
            $('.listing').text(amountStarting + ' - ' + amountInPage + ' of ' + size)

            // handle add the disable class to the icon buttons when needed
            if(amountStarting == 1) {
                btnPreviousPage.addClass('btn-icon-disabled')
            }

            if(amountInPage == size) {
                btnNextPage.addClass('btn-icon-disabled')
            }

            // show if there aren't any movies in the db
            if(data.length == 0) {
                noMediaFound.show()
            }
        })
    }
})