$(function () {
    'use strict';
  
    $('.links .menu').click(function () {
      $('.links .all-links').toggle('block');
    });
  
    $('.all-links li').click(function (event) {
      event.stopPropagation(); // Prevent click event from bubbling up
  
      const clickedE = $(this).get(0);
      $(this).find('ul').toggle('block').siblings('li').find('ul').toggle('none');
    });
  
    $('.links .all-links').click(function (event) {
      event.stopPropagation(); // Prevent click event from bubbling up
    });
  
    // Hide navbar when clicking outside of it or on a link
    $(document).click(function (event) {
      if (!$(event.target).closest('.links').length) {
        $('.links .all-links').hide('block');
      }
    });
  });