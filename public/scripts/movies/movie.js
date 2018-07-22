$(document).ready(function() {
    let btnPlay = $('#btnPlay')
    let btnEdit = $('#btnEdit')
    let btnFixMetadata = $('#btnFixMetadata')
    let btnShowMore = $('#btnShowMore')
    let btnSeeMore = $('#btnSeeMore')
    let actors = $('#actors')

    btnPlay.click(function() {
        window.location.href = '/watch?id=' + id
    })

    btnEdit.click(function() {
        window.location.href = '/edit?id=' + id
    })

    btnFixMetadata.click(function() {
        window.location.href = '/library/movies/fix?id=' + id
    })

    btnShowMore.click(function() {
        getActors()
        btnShowMore.hide()
    })

    btnSeeMore.click(function() {
        window.location.href = '/library/movies/similar?id=' + id 
    })

    // by default load 8 actors
    getActors(8)

    function getActors(amount) {
        actors.empty()
        $.getJSON('/api/media/movies/' + id, function(data) {
            // if amount isn't specified, get entire cast
            if(!amount) {
                amount = data.metadata.cast.length
            }

            for(let i = 0; i < amount; i++) {
                let content = 
                    '<div class="profile-box">' +
                        '<a href="#">' +
                            '<img src="/profiles/' + data.metadata.cast[i].profile + '" onerror="this.onerror=null;this.src=\'/img/poster-unknown.png\';">' +
                            '<p class="profile-name">' + data.metadata.cast[i].name + '</p>' +
                            '<p class="profile-role">as ' + data.metadata.cast[i].character + '</p>' +
                        '</a>' +
                    '</div>'
                actors.append(content)
            }
        })
    }
})