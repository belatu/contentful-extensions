// eslint-disable-next-line no-unused-vars
import { h, Component } from 'preact';

import extractFirstFrame from '../lib/extract-first-frame';

export default class App extends Component {
  constructor(props) {
    super(props);
    this.locale = props.field.locale;

    // FIXME: Figure out, why `parameters` is undefined.
    // this.config = props.parameters.instance;
    this.config = {
      videoFieldId: 'mp4'
    };
    this.state = {
      src: '',
      caption: '',
      hint: '',
      error: ''
    };
  }

  componentDidMount() {
    const { field, entry } = this.props;
    const videoField = entry.fields[this.config.videoFieldId];

    if (!videoField) {
      this.setState({
        // eslint-disable-next-line max-len
        error: `The extension could not be initialized because a field with id '${
          this.config.videoFieldId
        }' does not exist.'`
      });
      return;
    }

    // Callback for changes of the field value.
    this.detachValueChangeHandler = field.onValueChanged(
      this.valueChangeHandler
    );

    // Callback for changes of the image field value.
    this.detachVideoValueChangeHandler = videoField.onValueChanged(
      this.locale,
      this.videoChangeHandler
    );

    // Manually update the first frame if it is missing on page load (e.g.
    // because the last attempt failed).
    const videoValue = videoField.getValue(this.locale);
    if (videoValue && !field.getValue()) {
      this.videoChangeHandler(videoValue);
    }
  }

  componentWillUnmount() {
    this.detachValueChangeHandler();
    this.detachVideoValueChangeHandler();
  }

  /**
   * Handler for external field value changes (e.g. when multiple authors are
   * working on the same entry).
   */
  valueChangeHandler = value => {
    if (!value) {
      this.setState({ src: '', caption: '' });
      return;
    }
    this.props.space.getAsset(value.sys.id).then(asset => {
      const { url, fileName } = asset.fields.file[this.locale];
      this.setState({ src: url, caption: fileName, hint: '', error: '' });
    });
  };

  /**
   * Handler for changes to the video field value. Get the first video frame,
   * create a new image asset, and save the reference to the field.
   */
  videoChangeHandler = value => {
    if (!value || !value.sys.id) {
      this.resetField();
      return;
    }

    this.props.space.getAsset(value.sys.id).then(videoAsset => {
      const videoFile = videoAsset.fields.file[this.locale];
      const { url, title, fileName: videoFileName = '' } = videoFile;
      const fileName = videoFileName.replace('mp4', 'jpg');

      if (!url) {
        this.resetField();
        return;
      }

      this.updateHint('Extracting first frame from video...');

      extractFirstFrame(url)
        .then(firstFrame => this.uploadAsset(firstFrame, title, fileName))
        .then(this.updateField)
        .catch(error => {
          this.setState({ error });
        });
    });
  };

  /**
   * Upload, process and publish the image.
   */
  // FIXME: space.createUpload() is not supported because the Contentful
  // Management API is woefully out of date.
  uploadAsset = (firstFrame, title, fileName) => {
    this.updateHint('Uploading image...');
    return this.props.space
      .createUpload({
        file: firstFrame
      })
      .then(upload => {
        this.updateHint('Creating image entry...');
        return this.props.space.createAsset({
          fields: {
            title: {
              'en-US': title
            },
            file: {
              'en-US': {
                contentType: 'image/jpeg',
                fileName,
                uploadFrom: {
                  sys: {
                    type: 'Link',
                    linkType: 'Upload',
                    id: upload.sys.id
                  }
                }
              }
            }
          }
        });
      })
      .then(asset => {
        this.updateHint('Processing image...');
        return asset.processForLocale('en-US', { processingCheckWait: 2000 });
      })
      .then(asset => {
        this.updateHint('Publishing image...');
        return asset.publish();
      });
  };

  /**
   * Render a status message while working.
   */
  updateHint = hint => {
    this.setState(prevState => ({ ...prevState, hint }));
  };

  /**
   * Save reference to field and render image.
   */
  updateField = asset => {
    try {
      const { url, fileName } = asset.fields.file[this.locale];
      const value = {
        sys: {
          type: 'Link',
          linkType: 'Asset',
          id: asset.sys.id
        }
      };
      this.field.setValue(value);
      this.setState({ src: url, caption: fileName, hint: '', error: '' });
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
      const error = e.message ? e.message : 'An error occured';
      this.setState({ error });
    }
  };

  /**
   * Remove reference and hide image.
   */
  resetField = () => {
    try {
      this.props.field.removeValue();
      this.setState({ src: '', caption: '' });
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
      const error = e.message ? e.message : 'An error occured';
      this.setState({ error });
    }
  };

  // eslint-disable-next-line class-methods-use-this
  render(props, { src, caption, hint, error }) {
    return (
      <div>
        <figure class="asset-card">
          {src && (
            <div class="cf-thumbnail">
              <img src={src} class="thumbnail" />
            </div>
          )}
          {caption && (
            <figcaption class="asset-card__title">{caption}</figcaption>
          )}
        </figure>

        {hint && <div class="cf-form-hint">{hint}</div>}
        {error && <div class="cf-field-error">{error}</div>}
      </div>
    );
  }
}
