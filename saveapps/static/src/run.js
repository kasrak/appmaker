(function() {
    var appEventTypes = ['click', 'input', 'blur', 'focus'];
    var isAppRunning = false;
    var didAttachHandlers = false;

    var intervalIDs = [];
    var timeoutIDs = [];

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

            var _setInterval = window.setInterval;
            window.setInterval = function() {
                var interval = _setInterval.apply(window, arguments);
                intervalIDs.push(interval);
                return interval;
            };

            var _setTimeout = window.setTimeout;
            window.setTimeout = function() {
                var timeout = _setTimeout.apply(window, arguments);
                timeoutIDs.push(timeout);
                return timeout;
            };
        }
    }

    function stopApp() {
        _.each(intervalIDs, function(interval) {
            clearInterval(interval);
        });
        intervalIDs.length = 0;

        _.each(timeoutIDs, function(timeout) {
            clearTimeout(timeout);
        });
        timeoutIDs.length = 0;

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
