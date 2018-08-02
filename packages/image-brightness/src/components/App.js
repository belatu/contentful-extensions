// eslint-disable-next-line no-unused-vars
import { h, Component } from 'preact';
import { get, isEmpty } from 'lodash';

import loadImage from '../lib/load-image';
import getImageData from '../lib/get-image-data';
import getImageBrightness from '../lib/get-image-brightness';
import getColorPalette from '../lib/get-color-palette';

import Fieldset from './Fieldset';
import Color from './Color';
import Brightness from './Brightness';
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
      error: '',
      retries: 0
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
  handleImageValueChange = imageValue => {
    if (!imageValue || !imageValue.sys.id) {
      this.resetField();
      return;
    }

    this.props.space.getAsset(imageValue.sys.id).then(asset => {
      const { url } = asset.fields.file[this.locale];

      if (!url) {
        this.resetField();
        return;
      }

      loadImage(url)
        .then(getImageData)
        .then(imageData => {
          const brightness = getImageBrightness(imageData, 150);
          const colorPalette = getColorPalette(imageData, 6);
          const [dominant, ...palette] = colorPalette;
          const value = { brightness, dominant, palette };
          this.setState({ value });
          this.updateField(value);
        })
        .catch(e => {
          // eslint-disable-next-line no-console
          console.error(e);
          const error = e.message
            ? e.message
            : 'Failed to extract colors from the image.';
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
    if (isEmpty(value)) {
      return (
        <div>
          <p>No value</p>
          {error && <Error>{error}</Error>}
        </div>
      );
    }

    const { dominant, palette, brightness } = value;
    return (
      <div>
        <Fieldset label="Dominant color" id="dominant-color">
          <Color color={dominant} aria-labelledby="dominant-color" />
        </Fieldset>
        <Fieldset label="Color palette" id="color-palette">
          {palette.map(color => (
            <Color key={color} color={color} aria-labelledby="color-palette" />
          ))}
        </Fieldset>
        <Fieldset label="Brightness" id="brightness">
          <Brightness brightness={brightness} aria-labelledby="brightness" />
        </Fieldset>
        {error && <Error>{error}</Error>}
      </div>
    );
  }
}
