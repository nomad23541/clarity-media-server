$(document).ready(function() {
    let btnPrev = $('#btnPrev')
    let btnNext = $('#btnNext')
    let tabs = $('.tab')
    let txtError = $('#txtError')

    let currentTab = 0
    // by default, show the first tab
    showTab(currentTab)

    btnPrev.click(function() {
        nextPrev(-1)
    })

    btnNext.click(function() {
        nextPrev(1)
    })

    function nextPrev(n) {
        // don't continue if anything is invalid in the form
        if(n > 0 && !isValid(currentTab)) return false
    
        $(tabs[currentTab]).removeClass('active')
        currentTab = currentTab + n
    
        // if at end of form, submit
        if(currentTab >= tabs.length) {
            // don't continue on
            return false
        }
        // hide the error text
        txtError.hide()
        // show next tab
        showTab(currentTab)
    }
    
    function showTab(n) {
        $(tabs[n]).addClass('active')
    
        if(n == 0) {
            btnPrev.css('display', 'none')
        } else {
            btnPrev.css('display', 'inline')
        }
    
        if(n == (tabs.length - 2)) {
            btnNext.text('Finish')
        } else {
            btnNext.text('Next')
        }

        if(n == (tabs.length - 1)) {
            submit()
            btnNext.hide()
            btnPrev.hide()
        }
    }
    
    function isValid(currentTab) {
        // remove all input-error classes
        $(tabs[currentTab]).find('input').removeClass('input-error')

        let emptyInputs = $(tabs[currentTab]).find('input').filter(function() {
            return !this.value
        }).addClass('input-error')
    
        if(emptyInputs.length > 0) {
            txtError.text('All fields must be filled out').slideDown()
            return false
        } else {
            // if on first page, check if both passwords match
            if(currentTab == 0) {
                if($('#password').val() != $('#confirmPassword').val()) {
                    $('#password').addClass('input-error')
                    $('#confirmPassword').addClass('input-error')
                    txtError.text('Passwords must match').slideDown();
                    return false
                }
            }
        }
    
        return true
    }
    
    function submit() {
        let data = {
            username: $('#username').val(),
            password: $('#password').val(),
            confirmPassword: $('#confirmPassword').val(),
            moviesDirectory: $('#moviesDirectory').val(),
            showsDirectory: $('#showsDirectory').val(),
            imagesDirectory: $('#imagesDirectory').val(),
            port: $('#port').val(),
            apiKey: $('#apiKey').val()
        }

        $.ajax({
            url: '/setup',
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(data),
            success: function() {
                window.location.href = '/'
            },
            err: function(err) {
                txtError.text(err.responseText).slideDown() 
            }
        })
    }
})