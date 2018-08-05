// eslint-disable-next-line no-unused-vars
import { h } from 'preact';

import CopyText from './CopyText';

export default ({ color, ...props }) => (
  <div class="cf-color" style={{ backgroundColor: color }}>
    <CopyText class="cf-copytext" value={color} {...props} />
  </div>
);
