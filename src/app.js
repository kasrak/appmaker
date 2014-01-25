$(function() {
    var $draggables = $('#create-elements .draggable');
    var $canvas = $('#section-canvas');

    $draggables.forEach(function(draggable) {
        draggable.addEventListener('dragstart', function(e) {
            console.log('drag start');
        }, false);

        draggable.addEventListener('dragend', function(e) {
            console.log('drag end');
        }, false);
    });

    $canvas[0].addEventListener('dragover', function(e) {
        if (e.preventDefault) {
            e.preventDefault();
        }

        return false;
    }, false);

    $canvas[0].addEventListener('drop', function(e) {
        console.log('drop');
    });
});
