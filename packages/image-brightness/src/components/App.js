// eslint-disable-next-line no-unused-vars
import { h, Component } from 'preact';
import { get } from 'lodash';

import calculateImageBrightness from '../lib/calculate-image-brightness';
import Input from './Input';
import Error from './Error';

export default class App extends Component {
  constructor(props) {
    super(props);

    const { field } = props;

    this.locale = field.locale;

    // FIXME: Figure out, why `parameters` is undefined.
    this.config = {
      imageFieldId: get(props, 'parameters.instance.imageFieldId', 'desktop'),
      threshold: get(props, 'parameters.instance.threshold', 150)
    };

    const fieldValue = field.getValue();

    this.state = {
      value: fieldValue,
      error: ''
    };
  }

  componentDidMount() {
    const { field, entry } = this.props;
    const imageField = entry.fields[this.config.imageFieldId];

    if (!imageField) {
      this.setState({
        // eslint-disable-next-line max-len
        error: `The extension could not be initialized because a field with id '${
          this.config.imageFieldId
        }' does not exist.'`
      });
      return;
    }

    // Callback for changes of the field value.
    this.detachValueChangeHandler = field.onValueChanged(
      this.handleValueChange
    );

    // Callback for changes of the image field value.
    this.detachImageValueChangeHandler = imageField.onValueChanged(
      this.locale,
      this.handleImageValueChange
    );

    // Manually update the field value if it is not set on page load (e.g.
    // because the last attempt failed).
    const imageValue = imageField.getValue(this.locale);

    if (imageValue && typeof field.getValue() === 'undefined') {
      this.handleImageValueChange(imageValue);
    }

    // Callback for changes of the field value.
    this.detachValueChangeHandler = field.onValueChanged(
      this.handleValueChange
    );
  }

  componentWillUnmount() {
    this.detachValueChangeHandler();
    this.detachImageValueChangeHandler();
  }

  /**
   * Handler for external field value changes (e.g. when multiple authors are
   * working on the same entry).
   */
  handleValueChange = value => {
    this.setState({ value, error: '' });
  };

  /**
   * Handler for changes to the image field value. Get the first image frame,
   * create a new image asset, and save the reference to the field.
   */
  handleImageValueChange = value => {
    if (!value || !value.sys.id) {
      this.resetField();
      return;
    }

    this.props.space.getAsset(value.sys.id).then(asset => {
      const { url } = asset.fields.file[this.locale];

      if (!url) {
        this.resetField();
        return;
      }

      calculateImageBrightness(
        url,
        this.config.areaOfInterest,
        this.config.threshold
      )
        .then(this.updateField)
        .catch(error => {
          this.setState({ error });
        });
    });
  };

  /**
   * Update field and input.
   */
  updateField = value => {
    try {
      this.props.field.setValue(value);
      this.setState({ value, error: '' });
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
      const error = e.message ? e.message : 'An error occured';
      this.setState({ error });
    }
  };

  /**
   * Remove value and clear input.
   */
  resetField = () => {
    try {
      this.props.field.removeValue();
      this.setState({ value: '' });
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
      const error = e.message ? e.message : 'An error occured';
      this.setState({ error });
    }
  };

  // eslint-disable-next-line class-methods-use-this
  render(props, { value, error }) {
    const label =
      value &&
      `It was automatically calculated that the image is (mostly) ${
        value > 0 ? 'light' : 'dark'
      }.`;
    return (
      <div>
        <Input value={value} label={label} id="brightness" readonly />
        {error && <Error>{error}</Error>}
      </div>
    );
  }
}
