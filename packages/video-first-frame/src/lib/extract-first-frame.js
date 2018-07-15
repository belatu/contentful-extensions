// Extract the first frame of a video.
export default function extractFirstFrame(url) {
  return new Promise((resolve, reject) => {
    // Create a video element.
    const video = document.createElement('video');

    video.autoplay = false;
    video.loop = false;
    video.crossOrigin = 'Anonymous';

    video.onloadeddata = () => {
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      canvas.getContext('2d').drawImage(video, 0, 0);
      const dataUri = canvas.toDataURL('image/jpeg');
      const binaryData = dataUri.replace(
        /^data:image\/[^;]/,
        'data:application/octet-stream'
      );
      resolve(binaryData);
    };

    video.onerror = () => {
      reject(
        new Error('The image failed to load. Reload the page to try again.')
      );
    };

    const source = document.createElement('source');
    source.type = 'video/mp4';
    source.src = url;

    video.appendChild(source);
  });
}
