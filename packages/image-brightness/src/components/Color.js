// eslint-disable-next-line no-unused-vars
import { h } from 'preact';

import CopyInput from './CopyInput';

export default ({ color, ...props }) => (
  <div class="cf-color" style={{ backgroundColor: color }}>
    <CopyInput class="cf-input__color" value={color} {...props} />
  </div>
);
