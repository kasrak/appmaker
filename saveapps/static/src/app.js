$(function() {
    var $draggables = $('#create-elements .draggable');
    var $canvas = $('#section-canvas');
    var $toolbarRunButton = $('#section-toolbar button.run');
    var $toolbarStopButton = $('#section-toolbar button.stop');
    var $toolbarPublishButton = $('#section-toolbar button.publish');
    var $toolbarNewButton = $('#section-toolbar button.new');

    var codeEditor = CodeMirror($('#section-code')[0], {
        value: $('#app-js-code').val(),
        mode: "javascript",
        lineNumbers: true
    });

    var widgets = [];
    function updateHints() {
        codeEditor.operation(function(){
            for (var i = 0; i < widgets.length; ++i)
            codeEditor.removeLineWidget(widgets[i]);
            widgets.length = 0;

            JSHINT(codeEditor.getValue());
            for (var i = 0; i < JSHINT.errors.length; ++i) {
                var err = JSHINT.errors[i];
                if (!err) continue;
                var msg = document.createElement("div");
                msg.appendChild(document.createTextNode(err.reason));
                msg.className = "lint-error";
                widgets.push(codeEditor.addLineWidget(err.line - 1, msg, {coverGutter: false, noHScroll: true}));
            }
        });
        var info = codeEditor.getScrollInfo();
        var after = codeEditor.charCoords({line: codeEditor.getCursor().line + 1, ch: 0}, "local").top;
        if (info.top + info.clientHeight < after)
            codeEditor.scrollTo(null, after - info.clientHeight + 3);
    }

    var waiting;
    codeEditor.on("change", function() {
        clearTimeout(waiting);
        waiting = setTimeout(updateHints, 1000);
    });

    setTimeout(updateHints, 100);

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

    var savedHTMLCode;
    function saveApp(callback) {
        var jsCode = codeEditor.getValue();
        var htmlCode = savedHTMLCode = $canvas.html();

        $.ajax({
            'type': 'POST',
            'url': '/save',
            'data': {
                'html': htmlCode,
                'js': jsCode
            },
            'dataType': 'json',
            'success': function(response) {
                history.pushState({file_num: response.file_num},"",'edit/' + response.file_num);
                callback(response);
            },
            'error': function() {
                alert('Saving failed! Please try again.');
            }
        });
    }

    var scriptId = 'running-app-code';
    function setRunningUI(isRunning) {
        selectElement(null);

        $toolbarRunButton.prop('disabled', isRunning);
        $toolbarStopButton.prop('disabled', !isRunning);
    }

    $toolbarRunButton.on('click', function () {
        saveApp(function(response) {
            setRunningUI(true);
            runner.runApp();

            // Load the js
            var script = $('<script>').attr({
                'src': '/' + response.js,
                'id': scriptId
            });

            $('body').append(script);
        });
    });

    $toolbarStopButton.on('click', function() {
        runner.stopApp();
        $('#' + scriptId).remove();
        setRunningUI(false);
        $canvas.html(savedHTMLCode);
    });

    $toolbarPublishButton.on('click', function() {
        saveApp(function(response) {
            window.location = window.location.origin + '/' + response['file_num'];
        });
    });

    $toolbarNewButton.on('click', function() {
        window.location = window.location.origin + '/app';
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
        if (!$el.hasClass('element') || runner.isAppRunning()) return;
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

            if ($selectedElement && $movingElement[0] == $selectedElement[0]) {
                updateSelectionBorder();
            }
        }
    });

    $canvas[0].addEventListener('drop', function(e) {
        if (e.stopPropagation) {
            e.stopPropagation();
        }

        var elementType = e.dataTransfer.getData('text/plain');

        if (!elementType || runner.isAppRunning()) {
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
                element = $('<img src="static/css/nothing.png" width="100" height="100">');
            break;
            case 'text':
                element = $('<input type="text">');
            break;
        }

        element.data('element-type', elementType);
        element.data('element-id', '');
        element.addClass('element');
        element.css({ top: e.offsetY, left: e.offsetX });

        $canvas.append(element);

        selectElement(element);

        return false;
    });

    $canvas.on('click', function(e){
        if (runner.isAppRunning()) {
            return true;
        }

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
            showProperties($el);
        } else {
            hideProperties();
        }

        updateSelectionBorder();
    }

});

var $selectedElement;
function updateSelectionBorder() {
    var $currentSelectionBorder = $('#current-selection');
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

var textProperty = {
    'type': 'text',
    'getter': function($el) { return $el.text();},
    'setter': function($el, val) { $el.text(val);}
};

var placeholderProperty = {
    'type' : 'text',
    'getter': function ($el) { return $el.attr('placeholder');},
    'setter': function ($el, val) { $el.attr('placeholder', val);}
};


var elementProperties = {
    'button': {
        'text': textProperty,
        'background': backgroundProperty,
        'width': widthProperty,
        'height': heightProperty,
        'color': colorProperty
    },
    'label': {
        'text': textProperty,
        'background': backgroundProperty,
        'color': colorProperty,
        'width': widthProperty,
        'height': heightProperty,
    },
    'image': {
        'width': widthProperty,
        'height': heightProperty,
        'source':{
            'type': 'text',
            'getter': function($el) {
                var src = $el.attr('src');
                return (src == "static/css/nothing.png") ? "" : src;
            },
            'setter': function($el, val) {
                $el.attr('src', val);
                $el.css('background', 'transparent');
            }
        },
        'file':{
            'type': 'file',
            'getter': function($el) {},
            'setter': function($el, val) {}
        }
    },
    'text': {
        'width': widthProperty,
        'height': heightProperty,
        'placeholder': placeholderProperty,
        'background': backgroundProperty
    }

};

var elementActions = {
    'button': ['click'],
    'label': ['click'],
    'image': ['click'],
    'text': ['click', 'focus', 'blur', 'input']
};

function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.substring(1);
}

function showProperties($el) {
    $('#view-properties').show();

    var elementType = $el.data('element-type');

    // Identifier
    $('#view-id').off('input').val($el.data('element-id')).on('input', function() {
        $el.data('element-id', $(this).val());
    });

    // Properties
    var properties = elementProperties[elementType];
    var table = $("<div>");
    _.each(properties, function (value, key) {
        var inputEl;
        if (value.type == 'file') {
            inputEl = $('<input type="file">')
            .addClass('form-control')
            .on('change', function() {
                var formData = new FormData();
                var $input = $(this);
                var file = this.files[0];
                formData.append('file', file);

                $input.prop('disabled', true);

                var xhr = new XMLHttpRequest();
                xhr.open('POST', '/upload', true);
                xhr.onload = function(e) {
                    $input.prop('disabled', false);
                    var response = e.srcElement;
                    if (response.status == 200) {
                        $el.attr('src', '/' + response.response);
                        $el.css('background', 'transparent');
                    } else {
                        alert('Uploading failed! Please try again.');
                        console.log(response);
                    }
                };
                xhr.send(formData);
            });
        } else {
            inputEl = $('<input type="text">')
            .addClass('form-control')
            .val(value.getter($el))
            .on('input', function() {
                value.setter($el, $(this).val());
                updateSelectionBorder();
            });
        }

        var tr = $("<div>" + capitalize(key) + "<br><div class='input-container'></div></div>");
        $('.input-container', tr).append(inputEl);
        table.append(tr);
    });
    $("#properties-container").empty().append(table);

    // Actions
    var actions = elementActions[elementType];
    var actionsEl = $("<div>");
    _.each(actions, function(key) {
        var inputEl = $('<input type="text">')
        .addClass('form-control')
        .val($el.data('action-' + key) || '')
        .on('input', function() {
		$el.data('action-' + key, $(this).val());
	});
        var el = $('<div>' + capitalize(key) + '<br><div class="input-container"></div></div>');
        $('.input-container', el).append(inputEl);
        actionsEl.append(el);
    });
    $("#actions-container").empty().append(actionsEl);
}

function hideProperties() {
    $('#view-properties').hide();
}
