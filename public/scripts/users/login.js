$(document).ready(function() {
    let btnLogin = $('#btnLogin')

    // press enter to log in
    $('#password').keypress(function(event) {
        if(event.keyCode == 13) btnLogin.click()
    })

    btnLogin.click(function() {
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