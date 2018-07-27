import { clamp } from 'lodash';

/**
 * Get the average brightness of (a section of) an image.
 * Adapted from https://stackoverflow.com/a/13766539/4620154
 */

const MAX_RETRIES = 3;

// Get the average value of the RGB channels.
const calculatePixelBrightness = (r, g, b) => Math.floor((r + g + b) / 3);

const calculateImageBrightness = (
  url,
  areaOfInterest = {},
  customThreshold,
  retry = 1
) => {
  // Area of interest is the section of the image for which we want to
  // calculate the brightness
  const defaultAreaOfInterest = { top: 0, right: 0, width: 1, height: 1 };
  const { top, right, width, height } = {
    ...defaultAreaOfInterest,
    ...areaOfInterest
  };
  const threshold = clamp(customThreshold, 0, 255);

  return new Promise((resolve, reject) => {
    const image = new Image();

    image.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = image.naturalWidth;
      canvas.height = image.naturalHeight;
      const ctx = canvas.getContext('2d');

      ctx.drawImage(image, 0, 0);

      // Get pixels
      const { data } = ctx.getImageData(
        canvas.height * top,
        canvas.width * right,
        canvas.width * width,
        canvas.height * height
      );

      // Count pixel brightness
      let lightPixels = 0;
      let darkPixels = 0;

      for (let x = 0, len = data.length; x < len; x += 4) {
        const pixelBrightness = calculatePixelBrightness(
          data[x],
          data[x + 1],
          data[x + 2]
        );
        if (pixelBrightness > threshold) {
          lightPixels += 1;
        } else {
          darkPixels += 1;
        }
      }

      // Calculate average brightness
      const averageBrightness =
        (lightPixels - darkPixels) / (lightPixels + darkPixels);
      resolve(Math.round(averageBrightness * 1000) / 1000);
    };

    image.onerror = () => {
      if (retry < MAX_RETRIES) {
        resolve(
          calculateImageBrightness(url, areaOfInterest, threshold, retry + 1)
        );
      }
      reject(
        new Error('The image failed to load. Reload the page to try again.')
      );
    };

    image.crossOrigin = 'Anonymous';

    image.src = url;
  });
};

export default calculateImageBrightness;
