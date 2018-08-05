// eslint-disable-next-line no-unused-vars
import { h, Component } from 'preact';
import { get, isEmpty } from 'lodash';

import loadImage from '../lib/load-image';
import getImageData from '../lib/get-image-data';
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
      assetFieldId: get(props, 'parameters.instance.assetFieldId', 'desktop'),
      numberOfColors: get(props, 'parameters.instance.numberOfColors', 150)
    };

    this.state = {
      value: field.getValue().split(','),
      error: '',
      retries: 0
    };
  }

  componentDidMount() {
    const { field, entry } = this.props;
    const assetField = entry.fields[this.config.assetFieldId];

    if (!assetField) {
      this.setState({
        // eslint-disable-next-line max-len
        error: `The extension could not be initialized because a field with id '${
          this.config.assetFieldId
        }' does not exist.'`
      });
      return;
    }

    // Callback for changes of the field value.
    this.detachValueChangeHandler = field.onValueChanged(
      this.handleValueChange
    );

    // Callback for changes of the image field value.
    this.detachImageValueChangeHandler = assetField.onValueChanged(
      this.locale,
      this.handleImageValueChange
    );

    // Manually update the field value if it is not set on page load (e.g.
    // because the last attempt failed).
    const imageValue = assetField.getValue(this.locale);

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
    this.setState({ value: value.split(','), error: '' });
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
          const colorPalette = getColorPalette(
            imageData,
            this.config.numberOfColors
          );
          this.updateField(colorPalette);
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
      this.props.field.setValue(value.join(','));
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
      this.setState({ value: [] });
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

    return (
      <div>
        {value.map(color => (
          <Color key={color} color={color} aria-labelledby="color-palette" />
        ))}
        {error && <Error>{error}</Error>}
      </div>
    );
  }
}
