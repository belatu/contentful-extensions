// eslint-disable-next-line no-unused-vars
import { h, Component } from 'preact';

import calculateImageBrightness from '../lib/calculate-image-brightness';
import RadioButton from './RadioButton';
import Error from './Error';

const LIGHT = 'light';
const DARK = 'dark';

const getBrightnessEnum = value => {
  if (typeof value === 'undefined') {
    return '';
  }
  return value ? DARK : LIGHT;
};

export default class App extends Component {
  constructor(props) {
    super(props);

    const { field } = props;

    this.locale = field.locale;

    // FIXME: Figure out, why `parameters` is undefined.
    // this.config = props.parameters.instance;
    this.config = {
      imageFieldId: 'desktop'
    };

    const fieldValue = field.getValue();

    this.state = {
      value: getBrightnessEnum(fieldValue),
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
  handleValueChange = (fieldValue = undefined) => {
    const value = getBrightnessEnum(fieldValue);
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

      calculateImageBrightness(url, this.config.areaOfInterest)
        .then(this.updateField)
        .catch(error => {
          this.setState({ error });
        });
    });
  };

  /**
   * Update field and check radio button.
   */
  updateField = brightness => {
    try {
      const value = brightness > 0 ? LIGHT : DARK;
      this.props.field.setValue(value === DARK);
      this.setState({ value, error: '' });
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
      const error = e.message ? e.message : 'An error occured';
      this.setState({ error });
    }
  };

  /**
   * Remove value and uncheck radio buttons.
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

  /**
   * Handler for changes of the input value
   */
  handleClick = event => {
    const { value } = event.target;
    this.setState({ value });
    this.props.field.setValue(value === DARK);
  };

  // eslint-disable-next-line class-methods-use-this
  render(props, { value, error }) {
    return (
      <div>
        <div class="cf-form-horizontal">
          <RadioButton
            onClick={this.handleClick}
            checked={value === DARK}
            label="Dark"
            value={DARK}
            id={DARK}
            name="brightness"
          />
          <RadioButton
            onClick={this.handleClick}
            checked={value === LIGHT}
            label="Light"
            value={LIGHT}
            id={LIGHT}
            name="brightness"
          />
        </div>
        {error && <Error>{error}</Error>}
      </div>
    );
  }
}
