// eslint-disable-next-line no-unused-vars
import { h, render } from 'preact';

import App from './components/App';

// When UI Extensions SDK is loaded the callback will be executed.
window.contentfulExtension.init(initExtension);

function initExtension(extension) {
  // "extension" is providing an interface documented here:
  // https://github.com/contentful/ui-extensions-sdk/blob/master/docs/ui-extensions-sdk-frontend.md

  // Automatically adjust UI Extension size in the Web App.
  extension.window.updateHeight();
  extension.window.startAutoResizer();

  render(<App {...extension} />, document.getElementById('root'));
}
