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
        window.location.href = '/fix?id=' + id
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
        $.getJSON('/api/media/' + id, function(data) {
            // if amount isn't specified, get entire cast
            if(!amount) {
                amount = data.cast.length
            }

            for(let i = 0; i < amount; i++) {
                let content = 
                    '<div class="profile-box">' +
                        '<a href="#">' +
                            '<img src="' + data.cast[i].profileWeb + '" onerror="this.onerror=null;this.src=\'/img/poster-unknown.png\';">' +
                            '<p class="profile-name">' + data.cast[i].name + '</p>' +
                            '<p class="profile-role">as ' + data.cast[i].character + '</p>' +
                        '</a>' +
                    '</div>'
                actors.append(content)
            }
        })
    }
})