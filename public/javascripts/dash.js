$(document).ready(function() {
  // Hide all elements and give their jQuery ident a property
  // to identify if it is showing or not.
  $('#your-collection, #your-comments').hide().data('showing', 'false');
  
  $('#your-col-arrow').click(function() {
    toggleContent($('#your-col-arrow'), $('#your-collection'));
  });

  $('#your-com-arrow').click(function() {
    toggleContent($('#your-com-arrow'), $('#your-comments'));
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