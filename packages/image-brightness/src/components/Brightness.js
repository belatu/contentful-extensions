// eslint-disable-next-line no-unused-vars
import { h } from 'preact';

import CopyInput from './CopyInput';

export default ({ brightness, ...props }) => (
  <div
    class="cf-brightness"
    style={{ backgroundColor: `hsla(0, 0%, ${(brightness + 1) * 50}%, 1)` }}
  >
    <CopyInput class="cf-input__brightness" value={brightness} {...props} />
  </div>
);
