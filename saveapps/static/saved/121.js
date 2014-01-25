/*

Here are the two things you need to know to use App Maker:

1. To reference interface elements in your app, select the
   element by clicking on it. Then give it an identifier
   in the left sidebar. In your code, you can refer to that
   element by calling:
      
      el('foo')

2. To handle events, define a callback function on the
   `actions` global. For example:

      actions.buttonClicked = function(e) {
          alert("Hello!");
      }

   Then select the interface element and assign your
   function's name to the action you want it to handle
   in the left sidebar.

*/

var dx = 0;

actions.moveLeft = function() {
  dx = -10;
  el('currentState').text('Moving left');
};

actions.moveRight = function() {
  dx = 10;
  el('currentState').text('Moving right');
};

actions.stopMoving = function() {
  dx = 0;
  el('currentState').text('Chillin');
};

setInterval(function() {
  var curLeft = el('ghost').position().left;
  el('ghost').css('left', curLeft + dx);
}, 33);
