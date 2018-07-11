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
        if(!isValid(currentTab)) return false
    
        $(tabs[currentTab]).css('display', 'none')
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
        $(tabs[n]).css('display', 'block')
    
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
        // remove any previous error messages
        txtError.text('')
        // remove all input-error classes
        $(tabs[currentTab]).find('input').removeClass('input-error')

        let emptyInputs = $(tabs[currentTab]).find('input').filter(function() {
            return !this.value
        }).addClass('input-error')
    
        if(emptyInputs.length > 0) {
            txtError.append('All fields must be filled out').slideDown('fast')
            return false
        } else {
            // if on first page, check if both passwords match
            if(currentTab == 0) {
                if($('#password').val() != $('#confirmPassword').val()) {
                    $('#password').addClass('input-error')
                    $('#confirmPassword').addClass('input-error')
                    txtError.append('Passwords must match!').slideDown('fast');
                    return false
                }
            }
        }
    
        return true
    }
    
    function submit() {
        console.log('submit')
        let user = {
            username: $('#username').val(),
            password: $('#password').val(),
            admin: true,
        }

        $.ajax({
            url: '/setup',
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(user),
            success: function(data) {
                window.location.href = '/'
            }
        })
    }
})