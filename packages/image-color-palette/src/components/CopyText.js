// eslint-disable-next-line no-unused-vars
import { h } from 'preact';

const handleFocus = event => {
  event.target.select();
  document.execCommand('copy');
};

export default ({ value, ...rest }) => (
  <input
    type="text"
    onFocus={handleFocus}
    aria-label={`Copy "${value}" to the clipboard`}
    readonly
    {...rest}
  />
);
