$(document).ready(function() {
    
  // If user selected, apply stytle to relevant image, 
  // take style from irrelevant and change form action
  $('#user-img').click(function() {
    $(this).addClass('search-img-border');
    $('#music-img').removeClass('search-img-border');
    $('#search-form').attr('action', '/search/user');
  });

  $('#music-img').click(function() {
    $(this).addClass('search-img-border');
    $('#user-img').removeClass('search-img-border');
    $('#search-form').attr('action', '/search/music');
  });
});