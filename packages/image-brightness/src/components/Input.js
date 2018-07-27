// eslint-disable-next-line no-unused-vars
import { h } from 'preact';

export default function Input({ label, id, ...props }) {
  return (
    <div>
      <input type="text" class="cf-form-input" id={id} {...props} />
      {label && (
        <label class="cf-form-label" for={id}>
          {label}
        </label>
      )}
    </div>
  );
}
