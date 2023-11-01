/*global $ */

$(function () {
    'use strict'; 
    $(document).ready(function() {
      var paragraph = $('.message-status');
      var acc = $(".controls .accordion");

      paragraph.show()
      setTimeout(function() {
        paragraph.hide();
      }, 5000);
    
        acc.on("click", function() {
          var panel = $(this).parent().next(".panel");
          var isActive = panel.hasClass("show");
    
          // Close all panels
          $(".panel").removeClass("show");
    
          // Toggle the clicked panel
          if (!isActive) {
            panel.addClass("show");
          }
        });
      });
});


