export default (image, areaOfInterest = {}) =>
  new Promise((resolve, reject) => {
    try {
      const defaultAreaOfInterest = { top: 0, right: 0, width: 1, height: 1 };
      const { top, right, width, height } = {
        ...defaultAreaOfInterest,
        ...areaOfInterest
      };

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
      resolve(data);
    } catch (e) {
      reject(e);
    }
  });
