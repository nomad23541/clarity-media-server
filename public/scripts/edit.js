$(document).ready(function() {
    var deleteBtn = $('#deleteBtn')

    deleteBtn.click(function() {
        if(confirm('Are you sure you want to delete this media?\n(This only removes it from the database, not on the disk)')) {
            $.ajax({
                url: '/api/media/' + $.urlParam('id'),
                type: 'DELETE',
                success: function() {
                    window.location.replace('/')
                }
            })
        }
    })
})

$.urlParam = function (name) {
    var results = new RegExp('[\?&]' + name + '=([^&#]*)').exec(window.location.href);
    return results[1] || 0;
}