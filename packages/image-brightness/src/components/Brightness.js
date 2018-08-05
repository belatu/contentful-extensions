// eslint-disable-next-line no-unused-vars
import { h } from 'preact';

import CopyText from './CopyText';

export default ({ brightness, ...props }) => (
  <div
    class="cf-brightness"
    style={{ backgroundColor: `hsla(0, 0%, ${(brightness + 1) * 50}%, 1)` }}
  >
    <CopyText
      class="cf-copytext"
      style={{ color: brightness < 0 ? 'white' : 'black' }}
      value={brightness}
      {...props}
    />
  </div>
);
