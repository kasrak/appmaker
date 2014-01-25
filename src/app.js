$(function() {
    var $draggables = $('#create-elements .draggable');
    var $canvas = $('#section-canvas');

    var myCodeMirror = CodeMirror($('#section-code')[0], {
				value: "function() {\n  var x = true;\n  var y = 0;\n}",
				mode: "javascript",
				lineNumbers: true});

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
		return true;
	}

	// Select e.target
	var $el = $(e.target);
	var elementType = $el.data('element-type');
	showProperties(elementType, $el);
    });
});

var backgroundProperty = {
			'type': 'color',
			'getter': function($el) { 
				var rgbcolor = $el.css("background-color");
				var length = rgbcolor.length;
				var rgb = rgbcolor.substring(4, length-1).split(", ");
				var red = parseInt(rgb[0]);
				var green = parseInt(rgb[1]);
				var blue = parseInt(rgb[2]);
				return "#"+red.toString(16) + green.toString(16) + blue.toString(16);
			},
			'setter': function($el, val) {$el.css("background-color", val);}
		};

var widthProperty = {
			'type': 'int',
			'getter': function($el) { 
				return $el.css("width");
			},
			'setter': function($el, val) {
				$el.css("width", val);
			}
		};

var heightProperty =  {
			'type': 'int',
			'getter': function($el) { 
				return $el.css("height");
			},
			'setter': function($el, val) {
				$el.css("height", val);
			}
		};

var colorProperty = {
			'type': 'color',
			'getter': function($el) { 
				var rgbcolor = $el.css("color");
				var length = rgbcolor.length;
				var rgb = rgbcolor.substring(4, length-1).split(", ");
				var red = parseInt(rgb[0]);
				var green = parseInt(rgb[1]);
				var blue = parseInt(rgb[2]);
				return "#"+red.toString(16) + green.toString(16) + blue.toString(16);
			},
			'setter': function($el, val) {$el.css("color", val);}
		};

var elementProperties = {
	'button': {
		'background': backgroundProperty,
		'width': widthProperty,
		'height': heightProperty,
		'color': colorProperty
	},
	'label': {
		'color': colorProperty
	}
		
};


function showProperties(elementType, $el) {
	var properties = elementProperties[elementType];
	var table = $("<div>");
	_.each(properties, function (value, key) {
		var inputEl = $('<input class="form-control" type="text">').val(value.getter($el)).on('input', function() {
			value.setter($el, $(this).val());		
		});
		var key = key.charAt(0).toUpperCase() + key.substring(1);
		var tr = $("<div>" + key + "<br/><div class='input-container'></div></div>");
		$('.input-container', tr).append(inputEl);
		table.append(tr);
	});
	$("#properties-container").empty().append(table);	
};

