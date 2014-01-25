function runApp() {
    $('#current-selection').hide();

    window.actions = {};

    window.element = function(identifier) {
        return $('*[data-element-id="' + identifier.replace(/"/g, '\\"') + '"]');
    };

    $('.app').on('click', function(e) {
        console.log('HANDLE CLICK');
    });
}

function stopApp() {
    $('body.app-container').off('click');
}
