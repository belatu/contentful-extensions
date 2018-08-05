const MAX_RETRIES = 3;

export default function loadImage(url, retry = 1) {
  return new Promise((resolve, reject) => {
    const image = new Image();

    image.onload = () => {
      resolve(image);
    };

    image.onerror = () => {
      if (retry < MAX_RETRIES) {
        resolve(loadImage(url, retry + 1));
      }
      reject(
        new Error('The image failed to load. Reload the page to try again.')
      );
    };

    image.crossOrigin = 'Anonymous';

    image.src = url;
  });
}
