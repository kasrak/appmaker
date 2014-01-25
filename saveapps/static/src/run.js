(function() {
    var appEventTypes = ['click', 'input', 'blur', 'focus'];
    var isAppRunning = false;
    var didAttachHandlers = false;

    function runApp() {
        isAppRunning = true;
        $('#current-selection').hide();

        window.actions = {};

        window.element = window.el = function(identifier) {
            return $('*[data-element-id="' + identifier.replace(/"/g, '\\"') + '"]');
        };

        function trigger(eventType) {
            return function(e) {
                if (!isAppRunning) {
                    return true;
                }
                var action = $(e.target).data('action-' + eventType);
                if (action && window.actions[action]) {
                    return window.actions[action].call($(e.target), e);
                }
            };
        }

        // Event handlers
        if (!didAttachHandlers) {
            didAttachHandlers = true;
            _.each(appEventTypes, function(eventType) {
                $('.app').on(eventType, trigger(eventType));
            });
        }
    }

    function stopApp() {
        isAppRunning = false;
    }

    window.runner = {
        runApp: runApp,
        stopApp: stopApp,
        isAppRunning: function() {
            return isAppRunning;
        }
    };
})();
