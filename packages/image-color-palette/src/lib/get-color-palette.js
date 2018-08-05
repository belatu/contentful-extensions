import quantize from 'quantize';
import rgbToHex from './rgb-to-hex';

export default (imageData, paletteCount = 6, quality = 10) => {
  // Store the RGB values in an array format suitable for quantize function
  const pixels = [];
  for (
    let x = 0, r, g, b, a, len = imageData.length;
    x < len;
    x += 4 * quality
  ) {
    r = imageData[x + 0];
    g = imageData[x + 1];
    b = imageData[x + 2];
    a = imageData[x + 3];

    // If pixel is mostly opaque and not white
    if (a >= 125) {
      if (!(r > 250 && g > 250 && b > 250)) {
        pixels.push([r, g, b]);
      }
    }
  }

  const pixelMap = quantize(pixels, paletteCount);
  return pixelMap.palette().map(([r, g, b]) => rgbToHex(r, g, b));
};
