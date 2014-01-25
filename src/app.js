$(function() {
    $(document).bind('keydown', function(e) {
        if (e.keyCode == 8) { // Backspace
            var el = e.target;
            var tagName = el.tagName.toUpperCase();
            var elType = tagName == 'INPUT' && el.type.toUpperCase();
            var doPrevent = false;
            if (elType == 'TEXT' || elType === 'PASSWORD' || elType == 'FILE' || tagName === 'TEXTAREA') {
                doPrevent = el.readOnly || el.disabled;
            } else {
                doPrevent = true;
            }

            if (doPrevent) {
                if ($selectedElement) {
                    $selectedElement.remove();
                    selectElement(null);
                }
                e.preventDefault();
            }
        }
    });

    var $draggables = $('#create-elements .draggable');
    var $canvas = $('#section-canvas');

    $currentSelectionBorder = $('#current-selection');

    var myCodeMirror = CodeMirror($('#section-code')[0], {
        value: "function() {\n  var x = true;\n  var y = 0;\n}",
        mode: "javascript",
        lineNumbers: true
    });

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

    var $movingElement;
    var movingOffset;
    $canvas.on('mousedown', function(e) {
        var $el = $(e.target);
        if (!$el.hasClass('element')) return;
        $movingElement = $el;
        movingOffset = { x: e.offsetX, y: e.offsetY };

        e.preventDefault();
        return false;
    });

    $canvas.on('mouseup', function(e) {
        $movingElement = null;
    });

    $canvas.on('mousemove', function(e) {
        var pos = $canvas.offset();
        if ($movingElement) {
            $movingElement.css({
                left: e.pageX - pos.left - movingOffset.x,
                top: e.pageY - pos.top - movingOffset.y
            });

            if ($movingElement[0] == $selectedElement[0]) {
                updateSelectionBorder();
            }
        }
    });

    $canvas[0].addEventListener('drop', function(e) {
        if (e.stopPropagation) {
            e.stopPropagation();
        }

        var elementType = e.dataTransfer.getData('text/plain');

        if (!elementType) {
            return;
        }

        var element;

        switch(elementType) {
            case 'button':
                element = $('<button>Button</button>');
                break;
            case 'label':
                element = $('<div class="element-label">Label...</div>');
                break;
            case 'image':
                element = $('<img src="css/nothing.png" width="100" height="100">');
                break;
            case 'text':
                element = $('<input type="text">');
                break;
        }

	element.data('element-type', elementType);
        element.addClass('element');
        element.css({ top: e.offsetY, left: e.offsetX });

        $canvas.append(element);

        return false;
    });

    $canvas.on('click', function(e){
        if (!$(e.target).hasClass('element')) {
            selectElement(null);
            return true;
        }

        selectElement($(e.target));
    });


    function selectElement($el) {
        if ($selectedElement) {
            $selectedElement.removeClass('selected');
        }

        $selectedElement = $el;

        if ($selectedElement) {
            $selectedElement.addClass('selected');
            showProperties($el.data('element-type'), $el);
        } else {
            hideProperties();
        }

        updateSelectionBorder();
    }

});

var $currentSelectionBorder;
var $selectedElement;
function updateSelectionBorder() {
    if (!$selectedElement) {
        $currentSelectionBorder.hide();
        return false;
    }

    $currentSelectionBorder.show().css({
        top: $selectedElement.position().top - 2,
        left: $selectedElement.position().left - 2,
        width: $selectedElement.width() + 4,
        height: $selectedElement.height() + 4
    });
}

function rgbToHex(rgb) {
    var parts = rgb.substring(rgb.indexOf('(') + 1, rgb.length - 1).split(', ');

    if (parts.length != 3) {
        return rgb;
    }

    return '#' + _.map(parts, function(part) {
        var hex = parseInt(part).toString(16);
        return (hex.length == 1 ? '0' : '') + hex;
    }).join('');
}

var backgroundProperty = {
    'type': 'color',
    'getter': function($el) { return rgbToHex($el.css('background-color')); },
    'setter': function($el, val) { $el.css("background-color", val); }
};

var widthProperty = {
    'type': 'int',
    'getter': function($el) { return $el.css("width"); },
    'setter': function($el, val) { $el.css("width", val); }
};

var heightProperty =  {
    'type': 'int',
    'getter': function($el) { return $el.css("height"); },
    'setter': function($el, val) { $el.css("height", val); }
};

var colorProperty = {
    'type': 'color',
    'getter': function($el) { return rgbToHex($el.css('color')); },
    'setter': function($el, val) { $el.css("color", val); }
};

var elementProperties = {
	'button': {
		'background':backgroundProperty,
		'width':widthProperty,
		'height':heightProperty,
		'color':colorProperty
	},
	'label': {
		'background':backgroundProperty,
		'color': colorProperty
	},
	'image': {
		'width':widthProperty,
		'height':heightProperty
	},
	'text': {
		'width': widthProperty,
		'height': heightProperty
	}
};



function showProperties(elementType, $el) {
	var properties = elementProperties[elementType];
	var table = $("<div>");
	_.each(properties, function (value, key) {
        var inputEl = $('<input type="text">')
        .addClass('form-control')
        .val(value.getter($el))
        .on('input', function() {
			value.setter($el, $(this).val());
            updateSelectionBorder();
		});
		var key = key.charAt(0).toUpperCase() + key.substring(1);
		var tr = $("<div>" + key + "<br/><div class='input-container'></div></div>");
		$('.input-container', tr).append(inputEl);
		table.append(tr);
	});
	$("#properties-container").empty().append(table);
}

function hideProperties() {
    $('#properties-container').empty();
}
