// Utility functions for image processing (crop, augment, etc.)

export function cropImage(image, roi) {
  // TODO: Crop image to the region of interest (roi)
}

export function flipImage(image, direction = 'horizontal') {
  // Flip image horizontally or vertically using Canvas
  return new Promise((resolve) => {
    const img = new window.Image();
    img.onload = function () {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (direction === 'horizontal') {
        ctx.translate(img.width, 0);
        ctx.scale(-1, 1);
      } else {
        ctx.translate(0, img.height);
        ctx.scale(1, -1);
      }
      ctx.drawImage(img, 0, 0);
      resolve(canvas.toDataURL('image/jpeg'));
    };
    img.src = image;
  });
}

export function rotateImage(image, angle) {
  // Rotate image by angle degrees using Canvas
  return new Promise((resolve) => {
    const img = new window.Image();
    img.onload = function () {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      // Set canvas size to fit rotated image
      if (angle % 180 === 0) {
        canvas.width = img.width;
        canvas.height = img.height;
      } else {
        canvas.width = img.height;
        canvas.height = img.width;
      }
      ctx.save();
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate((angle * Math.PI) / 180);
      ctx.drawImage(img, -img.width / 2, -img.height / 2);
      ctx.restore();
      resolve(canvas.toDataURL('image/jpeg'));
    };
    img.src = image;
  });
}

export function adjustContrast(image, value) {
  // Adjust image contrast using Canvas
  return new Promise((resolve) => {
    const img = new window.Image();
    img.onload = function () {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      // Contrast formula
      const factor = (259 * (value + 255)) / (255 * (259 - value));
      for (let i = 0; i < data.length; i += 4) {
        data[i] = factor * (data[i] - 128) + 128; // R
        data[i + 1] = factor * (data[i + 1] - 128) + 128; // G
        data[i + 2] = factor * (data[i + 2] - 128) + 128; // B
      }
      ctx.putImageData(imageData, 0, 0);
      resolve(canvas.toDataURL('image/jpeg'));
    };
    img.src = image;
  });
}

// Enhanced ML augmentation functions

export function adjustBrightness(image, factor) {
  // Adjust brightness: factor > 1 increases brightness, < 1 decreases
  return new Promise((resolve) => {
    const img = new window.Image();
    img.onload = function () {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      
      for (let i = 0; i < data.length; i += 4) {
        data[i] = Math.min(255, Math.max(0, data[i] * factor)); // R
        data[i + 1] = Math.min(255, Math.max(0, data[i + 1] * factor)); // G
        data[i + 2] = Math.min(255, Math.max(0, data[i + 2] * factor)); // B
      }
      ctx.putImageData(imageData, 0, 0);
      resolve(canvas.toDataURL('image/jpeg'));
    };
    img.src = image;
  });
}

export function adjustSaturation(image, factor) {
  // Adjust saturation: factor > 1 increases saturation, < 1 decreases
  return new Promise((resolve) => {
    const img = new window.Image();
    img.onload = function () {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        
        // Convert to HSL, adjust saturation, convert back
        const gray = 0.299 * r + 0.587 * g + 0.114 * b;
        data[i] = Math.min(255, Math.max(0, gray + factor * (r - gray))); // R
        data[i + 1] = Math.min(255, Math.max(0, gray + factor * (g - gray))); // G
        data[i + 2] = Math.min(255, Math.max(0, gray + factor * (b - gray))); // B
      }
      ctx.putImageData(imageData, 0, 0);
      resolve(canvas.toDataURL('image/jpeg'));
    };
    img.src = image;
  });
}

export function addGaussianNoise(image, intensity = 0.1) {
  // Add Gaussian noise to image
  return new Promise((resolve) => {
    const img = new window.Image();
    img.onload = function () {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      
      for (let i = 0; i < data.length; i += 4) {
        const noise = (Math.random() - 0.5) * 2 * intensity * 255;
        data[i] = Math.min(255, Math.max(0, data[i] + noise)); // R
        data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + noise)); // G
        data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + noise)); // B
      }
      ctx.putImageData(imageData, 0, 0);
      resolve(canvas.toDataURL('image/jpeg'));
    };
    img.src = image;
  });
}

export function applyBlur(image, radius = 2) {
  // Apply Gaussian blur to image
  return new Promise((resolve) => {
    const img = new window.Image();
    img.onload = function () {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      const width = canvas.width;
      const height = canvas.height;
      
      // Simple box blur implementation
      const kernelSize = radius * 2 + 1;
      const kernel = new Array(kernelSize).fill(1 / kernelSize);
      
      // Horizontal blur
      const tempData = new Uint8ClampedArray(data);
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          let r = 0, g = 0, b = 0, a = 0;
          for (let k = 0; k < kernelSize; k++) {
            const px = Math.max(0, Math.min(width - 1, x + k - radius));
            const idx = (y * width + px) * 4;
            r += data[idx] * kernel[k];
            g += data[idx + 1] * kernel[k];
            b += data[idx + 2] * kernel[k];
            a += data[idx + 3] * kernel[k];
          }
          const idx = (y * width + x) * 4;
          tempData[idx] = r;
          tempData[idx + 1] = g;
          tempData[idx + 2] = b;
          tempData[idx + 3] = a;
        }
      }
      
      // Vertical blur
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          let r = 0, g = 0, b = 0, a = 0;
          for (let k = 0; k < kernelSize; k++) {
            const py = Math.max(0, Math.min(height - 1, y + k - radius));
            const idx = (py * width + x) * 4;
            r += tempData[idx] * kernel[k];
            g += tempData[idx + 1] * kernel[k];
            b += tempData[idx + 2] * kernel[k];
            a += tempData[idx + 3] * kernel[k];
          }
          const idx = (y * width + x) * 4;
          data[idx] = r;
          data[idx + 1] = g;
          data[idx + 2] = b;
          data[idx + 3] = a;
        }
      }
      
      ctx.putImageData(imageData, 0, 0);
      resolve(canvas.toDataURL('image/jpeg'));
    };
    img.src = image;
  });
}

export function adjustHue(image, shift) {
  // Adjust hue: shift in degrees (-180 to 180)
  return new Promise((resolve) => {
    const img = new window.Image();
    img.onload = function () {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      
      const shiftRad = (shift * Math.PI) / 180;
      const cosShift = Math.cos(shiftRad);
      const sinShift = Math.sin(shiftRad);
      
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i] / 255;
        const g = data[i + 1] / 255;
        const b = data[i + 2] / 255;
        
        // Convert RGB to YUV
        const y = 0.299 * r + 0.587 * g + 0.114 * b;
        const u = -0.147 * r - 0.289 * g + 0.436 * b;
        const v = 0.615 * r - 0.515 * g - 0.100 * b;
        
        // Rotate UV
        const uNew = u * cosShift - v * sinShift;
        const vNew = u * sinShift + v * cosShift;
        
        // Convert back to RGB
        data[i] = Math.min(255, Math.max(0, (y + 1.140 * vNew) * 255)); // R
        data[i + 1] = Math.min(255, Math.max(0, (y - 0.395 * uNew - 0.581 * vNew) * 255)); // G
        data[i + 2] = Math.min(255, Math.max(0, (y + 2.032 * uNew) * 255)); // B
      }
      ctx.putImageData(imageData, 0, 0);
      resolve(canvas.toDataURL('image/jpeg'));
    };
    img.src = image;
  });
}

export function applySharpen(image, intensity = 0.5) {
  // Apply sharpening filter
  return new Promise((resolve) => {
    const img = new window.Image();
    img.onload = function () {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      const width = canvas.width;
      const height = canvas.height;
      
      const kernel = [
        [0, -intensity, 0],
        [-intensity, 1 + 4 * intensity, -intensity],
        [0, -intensity, 0]
      ];
      
      const tempData = new Uint8ClampedArray(data);
      for (let y = 1; y < height - 1; y++) {
        for (let x = 1; x < width - 1; x++) {
          let r = 0, g = 0, b = 0;
          for (let ky = -1; ky <= 1; ky++) {
            for (let kx = -1; kx <= 1; kx++) {
              const idx = ((y + ky) * width + (x + kx)) * 4;
              const weight = kernel[ky + 1][kx + 1];
              r += tempData[idx] * weight;
              g += tempData[idx + 1] * weight;
              b += tempData[idx + 2] * weight;
            }
          }
          const idx = (y * width + x) * 4;
          data[idx] = Math.min(255, Math.max(0, r));
          data[idx + 1] = Math.min(255, Math.max(0, g));
          data[idx + 2] = Math.min(255, Math.max(0, b));
        }
      }
      
      ctx.putImageData(imageData, 0, 0);
      resolve(canvas.toDataURL('image/jpeg'));
    };
    img.src = image;
  });
}

export function randomAugmentation(image) {
  // Apply random combination of augmentations
  const augmentations = [
    () => flipImage(image, Math.random() > 0.5 ? 'horizontal' : 'vertical'),
    () => rotateImage(image, Math.random() * 360),
    () => adjustBrightness(image, 0.8 + Math.random() * 0.4),
    () => adjustContrast(image, (Math.random() - 0.5) * 100),
    () => adjustSaturation(image, 0.5 + Math.random() * 1.0),
    () => addGaussianNoise(image, Math.random() * 0.2),
    () => applyBlur(image, Math.random() * 3),
    () => adjustHue(image, (Math.random() - 0.5) * 60),
    () => applySharpen(image, Math.random() * 0.5)
  ];
  
  // Apply 2-4 random augmentations
  const numAugmentations = 2 + Math.floor(Math.random() * 3);
  const selectedAugmentations = [];
  
  for (let i = 0; i < numAugmentations; i++) {
    const randomIndex = Math.floor(Math.random() * augmentations.length);
    selectedAugmentations.push(augmentations[randomIndex]);
  }
  
  // Apply augmentations sequentially
  return selectedAugmentations.reduce((promise, augmentation) => {
    return promise.then(result => augmentation(result));
  }, Promise.resolve(image));
}