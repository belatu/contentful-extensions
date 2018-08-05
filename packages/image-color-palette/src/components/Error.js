// eslint-disable-next-line no-unused-vars
import { h } from 'preact';

export default ({ children, ...props }) => (
  <div class="cf-field-error" {...props}>
    {children}
  </div>
);
