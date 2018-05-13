$(document).ready(function() {
    var playBtn = $('#playBtn')
    var editBtn = $('#editBtn')

    playBtn.click(function() {
        window.location.href = '/watch?id=' + id
    })

    editBtn.click(function() {
        window.location.href = '/edit?id=' + id
    })
})