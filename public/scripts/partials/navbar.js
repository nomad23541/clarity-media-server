$(document).ready(function() {
    let back = $('#back')
    back.click(function() {
        window.history.back()
    })

    if(window.location.pathname == '/library') {
        back.hide()
    }

    let navbar = $('.navbar')
    let prevScroll = 0
    let offset = navbar.height() * 2

    // set padding of top to offset of navbar
    $('body').css('padding-top', offset)

    // touchmove to work on mobile
    $(document.body).on('touchmove', onScroll)
    $(window).on('scroll', onScroll)

    function onScroll() {
        let currentScroll = $(this).scrollTop()
        if(currentScroll > offset) {
            if(currentScroll > prevScroll) {
                // up
                navbar.css('top', -offset).removeClass('navbar-background')
            } else {
                // down
                navbar.css('top', 0).addClass('navbar-background')
            }
        } else {
            // down
            navbar.css('top', 0).removeClass('navbar-background')
        }

        prevScroll = currentScroll
    }
})