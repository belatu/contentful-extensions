// eslint-disable-next-line no-unused-vars
import { h } from 'preact';

export default function Error({ children, ...props }) {
  return (
    <div class="cf-field-error" {...props}>
      {children}
    </div>
  );
}
