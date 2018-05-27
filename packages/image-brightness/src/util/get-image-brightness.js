/**
 * Get the average brightness of (a section of) an image.
 * Adapted from https://stackoverflow.com/a/13766539/4620154
 */

// Get the maximum value of the RGB channels.
const getPixelBrightness = (r, g, b) => Math.max(Math.max(r, g), b);

const getImageBrightness = (imageSrc, areaOfInterest = {}) =>
  new Promise((resolve, reject) => {
    try {
      // Load image
      const img = document.createElement('img');
      img.src = imageSrc;
      img.style.display = 'none';
      document.body.appendChild(img);

      img.onload = () => {
        // Create canvas and draw image
        const canvas = document.createElement('canvas');
        canvas.width = this.width;
        canvas.height = this.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(this, 0, 0);

        // Area of interest is the section of the image for which we want to
        // calculate the brightness
        const defaultAreaOfInterest = { top: 0, right: 0, width: 1, height: 1 };
        const { top, right, width, height } = {
          ...defaultAreaOfInterest,
          ...areaOfInterest
        };

        // Get pixels
        const imageData = ctx.getImageData(
          canvas.height * top,
          canvas.width * right,
          canvas.width * width,
          canvas.height * height
        );
        const { data } = imageData;

        // Sum up brightness for all pixels
        let totalBrightness = 0;

        for (let x = 0, len = data.length; x < len; x += 4) {
          const pixelBrightness = getPixelBrightness(
            data[x],
            data[x + 1],
            data[x + 2]
          );
          totalBrightness += pixelBrightness;
        }

        // Calculate average brightness
        const numberOfPixels = this.width * this.height;
        const averageBrightness = totalBrightness / numberOfPixels;
        resolve(averageBrightness);
      };
    } catch (e) {
      reject(e);
    }
  });

export default getImageBrightness;
