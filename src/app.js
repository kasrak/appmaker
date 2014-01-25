$(function() {
    var $draggables = $('#create-elements .draggable');
    var $canvas = $('#section-canvas');

    $draggables.forEach(function(draggable) {
        draggable.addEventListener('dragstart', function(e) {
            e.dataTransfer.setData('text/plain', $(e.target).data('element-type'));
        }, false);

        draggable.addEventListener('dragend', function(e) {
        }, false);
    });

    $canvas[0].addEventListener('dragover', function(e) {
        if (e.preventDefault) {
            e.preventDefault();
        }

        return false;
    }, false);

    $canvas[0].addEventListener('drop', function(e) {
        if (e.stopPropagation) {
            e.stopPropagation();
        }

        var elementType = e.dataTransfer.getData('text/plain');
        var element;

        switch(elementType) {
            case 'button':
                element = $('<button>Button</button>');
                break;
            case 'label':
                element = $('<div class="element-label">Label...</div>');
                break;
            case 'image':
                element = $('<img width="100" height="100">');
                break;
            case 'text':
                element = $('<input type="text">');
                break;
        }

        element.addClass('element');
        element.css({ top: e.offsetY, left: e.offsetX });

        $canvas.append(element);

        return false;
    });
});
