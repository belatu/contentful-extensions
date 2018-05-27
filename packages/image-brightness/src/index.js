// When UI Extensions SDK is loaded the callback will be executed.
window.contentfulExtension.init(initExtension);

// Config: field name, area of interest, threshold, disable?

// Update value when image changes.
// Update value when field changes.
// Update field when value changes.

// Display brightness value in percent.

function initExtension(extension) {
  // "extension" is providing an interface documented here:
  // https://github.com/contentful/ui-extensions-sdk/blob/master/docs/ui-extensions-sdk-frontend.md

  // Automatically adjust UI Extension size in the Web App.
  extension.window.updateHeight();
  extension.window.startAutoResizer();

  const inputEl = document.getElementById('extension-input');

  //  The field this UI Extension is assigned to.
  const { field } = extension;

  // Callback for changes of the field value.
  const detachValueChangeHandler = field.onValueChanged(valueChangeHandler);
  // Handle keyboard input.
  inputEl.addEventListener('input', keyboardInputHandler);
  // Handle DOM "onbeforeunload" event.
  window.addEventListener('onbeforeunload', unloadHandler);

  // Handler for external field value changes (e.g. when multiple authors are working on the same entry).
  function valueChangeHandler(value) {
    inputEl.value = value || '';
  }

  // Event handler for keyboard input.
  function keyboardInputHandler() {
    const { value } = inputEl;
    if (typeof value !== 'string' || value === '') {
      field.removeValue();
    } else {
      field.setValue(value);
    }
  }

  // Event handler for window unload.
  function unloadHandler() {
    window.removeEventListener('onbeforeunload', unloadHandler);
    inputEl.removeEventListener('input', keyboardInputHandler);
    detachValueChangeHandler();
  }
}
