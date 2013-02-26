$(document).ready(function() {
  // Hide all elements and give their jQuery ident a property
  // to identify if it is showing or not.
  $('#tracklist-items, #review-text, #player-items, #comments-items').hide().data('showing', 'false');
  
  $('#tracklist-arrow').click(function() {
    toggleContent($('#tracklist-arrow'), $('#tracklist-items'));
  });

  $('#review-arrow').click(function() {
    toggleContent($('#review-arrow'), $('#review-text'));
  });

  $('#player-arrow').click(function() {
    toggleContent($('#player-arrow'), $('#player-items'));
  });

  $('#comments-arrow').click(function() {
    toggleContent($('#comments-arrow'), $('#comments-items'));
  });

  //Mouseover effect for play buttons
  $("img[id^='playtrack-']").mouseover(function() {
    $(this).attr('src', '/images/play-white.png');
  }).mouseout(function() {
    $(this).attr('src', '/images/play.png');
  }).click(function() {
    var source = 'https://everton.iriscouch.com/dischost/' + $(this).data("id") + '/track.mp3';
    $('#current-play').text($(this).data("name"));
    $('#player').attr('src', source).get(0).play();
  });


});

function toggleContent(arrow, content) {
  if(content.data('showing') == "true") {
    content.slideUp(200, function() {
      arrow.toggleClass('flip-vertical');
      content.data('showing', 'false');
    });
  }
  else {
    content.slideDown(400, function() {
      arrow.toggleClass('flip-vertical');
      content.data('showing', 'true');
    });
  }    
}