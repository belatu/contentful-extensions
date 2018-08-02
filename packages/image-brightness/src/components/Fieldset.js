// eslint-disable-next-line no-unused-vars
import { h } from 'preact';

export default ({ children, label, id, ...props }) => (
  <fieldset class="cf-fieldset" {...props}>
    {children}
    <legend class="cf-form-label" id={id}>
      {label}
    </legend>
  </fieldset>
);
