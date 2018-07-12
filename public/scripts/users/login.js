$(document).ready(function() {
    // press enter to log in
    $('#password').keypress(function(e) {
        if(e.keyCode == 13) $('form').submit()
    })

    $('form').submit(function(e) {
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

        e.preventDefault()
    })
})