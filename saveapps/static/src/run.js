$('#current-selection').hide();

window.actions = {};

function element(identifier) {
    return $('*[data-element-id="' + identifier.replace(/"/g, '\\"') + '"]');
}
