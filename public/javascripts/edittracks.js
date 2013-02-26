$(document).ready(function() {
  
  $('#uploadbutton').click(function() {
    $('#uploadform').hide();
    $('#progbar').css('display', 'block');
    $('#uploadform').submit();
  });

});
