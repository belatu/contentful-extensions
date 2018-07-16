// eslint-disable-next-line no-unused-vars
import { h } from 'preact';

export default function RadioButton({ label, id, ...props }) {
  return (
    <div className="cf-form-option">
      <input type="radio" id={id} {...props} />
      <label for={id}>{label}</label>
    </div>
  );
}
