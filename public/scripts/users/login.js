$(document).ready(function() {
    $('#btnLogin').click(function() {
        $.ajax({
            url: '/login',
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
                username: $('#username').val(),
                password: $('#password').val()
            }),
            error: function(err) {
                $('#txtError').text(err.responseText).slideDown()
            },
            success: function() {
                window.location.href = '/'
            }
        })
    })
})