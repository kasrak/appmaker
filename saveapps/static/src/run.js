function runApp() {
    $('#current-selection').hide();

    window.actions = {};

    window.element = window.el = function(identifier) {
        return $('*[data-element-id="' + identifier.replace(/"/g, '\\"') + '"]');
    };

    function trigger(eventType) {
        return function(e) {
            var action = $(e.target).data('action-' + eventType);
            if (action && window.actions[action]) {
                window.actions[action].call($(e.target), e);
            }
        };
    }

    // Event handlers
    $('.app').on('click', trigger('click'));
    $('.app').on('input', trigger('input'));
    $('.app').on('blur', trigger('blur'));
    $('.app').on('focus', trigger('focus'));
}

function stopApp() {
    $('body.app-container').off('click');
}
