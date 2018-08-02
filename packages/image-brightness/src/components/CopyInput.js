// eslint-disable-next-line no-unused-vars
import { h } from 'preact';

const handleFocus = event => {
  event.target.select();
  document.execCommand('copy');
};

export default props => (
  <input type="text" onFocus={handleFocus} readonly {...props} />
);
