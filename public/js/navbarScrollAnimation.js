$(document).ready(function() {
    
    $(window).scroll(function(){
        $('nav').toggleClass('scrolled', $(this).scrollTop() > 100);
    });
    $('.a1[href$="' + location.pathname + '"]').addClass('activeTopNav left');
    

    $('#nav-icon4').click(function(){
      if(!$('#nav-icon4').hasClass("open"))  
      {
        $('#rg-logo-sidebar').html('RETOS&nbsp;GAMER');
        document.getElementById("sidebar-wrapper").style.width = "50vw";
        $(this).toggleClass('open');
      }
      else {
        $('#rg-logo-sidebar').html('RG');
        document.getElementById("sidebar-wrapper").style.width = "14vw";
        $(this).toggleClass('open');
        }
    })

    if (/iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) {
        $('#rg-logo-sidebar').html('RG');
    }
});