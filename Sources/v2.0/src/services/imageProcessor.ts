// Service for image processing

import type { Point, Rectangle } from '@/types/ocr';

/**
 * Loads an image from a URI and converts it to ImageData
 */
export async function loadImageData(imageUri: string): Promise<ImageData> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }
      ctx.drawImage(img, 0, 0);
      const imageData = ctx.getImageData(0, 0, img.width, img.height);
      resolve(imageData);
    };
    img.onerror = reject;
    img.src = imageUri;
  });
}

/**
 * Converts ImageData to base64 format
 */
export function imageDataToBase64(imageData: ImageData): string {
  const canvas = document.createElement('canvas');
  canvas.width = imageData.width;
  canvas.height = imageData.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('No se pudo obtener contexto del canvas');
  }
  ctx.putImageData(imageData, 0, 0);
  return canvas.toDataURL('image/jpeg', 0.8);
}

/**
 * Resizes an image maintaining aspect ratio
 */
export function resizeImage(
  imageData: ImageData,
  maxWidth: number,
  maxHeight: number
): ImageData {
  const { width, height } = imageData;
  let newWidth = width;
  let newHeight = height;

  if (width > maxWidth || height > maxHeight) {
    const ratio = Math.min(maxWidth / width, maxHeight / height);
    newWidth = Math.floor(width * ratio);
    newHeight = Math.floor(height * ratio);
  }

  const canvas = document.createElement('canvas');
  canvas.width = newWidth;
  canvas.height = newHeight;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('No se pudo obtener contexto del canvas');
  }

  // Crear una imagen temporal para redimensionar
  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = width;
  tempCanvas.height = height;
  const tempCtx = tempCanvas.getContext('2d');
  if (!tempCtx) {
    throw new Error('No se pudo obtener contexto del canvas temporal');
  }
  tempCtx.putImageData(imageData, 0, 0);

  ctx.drawImage(tempCanvas, 0, 0, width, height, 0, 0, newWidth, newHeight);
  return ctx.getImageData(0, 0, newWidth, newHeight);
}

/**
 * Convierte una imagen a escala de grises
 */
export function toGrayscale(imageData: ImageData): ImageData {
  const data = new Uint8ClampedArray(imageData.data);
  const newData = new Uint8ClampedArray(imageData.width * imageData.height * 4);

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const gray = Math.round(0.299 * r + 0.587 * g + 0.114 * b);
    newData[i] = gray;
    newData[i + 1] = gray;
    newData[i + 2] = gray;
    newData[i + 3] = data[i + 3];
  }

  return new ImageData(newData, imageData.width, imageData.height);
}

/**
 * Aplica filtro de contraste a una imagen
 */
export function adjustContrast(imageData: ImageData, contrast: number): ImageData {
  const data = new Uint8ClampedArray(imageData.data);
  const factor = (259 * (contrast + 255)) / (255 * (259 - contrast));

  for (let i = 0; i < data.length; i += 4) {
    data[i] = Math.max(0, Math.min(255, factor * (data[i] - 128) + 128));
    data[i + 1] = Math.max(0, Math.min(255, factor * (data[i + 1] - 128) + 128));
    data[i + 2] = Math.max(0, Math.min(255, factor * (data[i + 2] - 128) + 128));
  }

  return new ImageData(data, imageData.width, imageData.height);
}

/**
 * Aplica filtro de brillo a una imagen
 */
export function adjustBrightness(imageData: ImageData, brightness: number): ImageData {
  const data = new Uint8ClampedArray(imageData.data);

  for (let i = 0; i < data.length; i += 4) {
    data[i] = Math.max(0, Math.min(255, data[i] + brightness));
    data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + brightness));
    data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + brightness));
  }

  return new ImageData(data, imageData.width, imageData.height);
}

/**
 * Aplica un filtro Gaussiano simple para suavizar
 */
export function applyGaussianBlur(imageData: ImageData): ImageData {
  const data = new Uint8ClampedArray(imageData.data);
  const newData = new Uint8ClampedArray(data.length);
  const width = imageData.width;
  const height = imageData.height;

  // Kernel Gaussiano simple 3x3
  const kernel = [
    1, 2, 1,
    2, 4, 2,
    1, 2, 1
  ];
  const kernelSum = 16;

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      let r = 0, g = 0, b = 0;

      for (let ky = -1; ky <= 1; ky++) {
        for (let kx = -1; kx <= 1; kx++) {
          const idx = ((y + ky) * width + (x + kx)) * 4;
          const kernelIdx = (ky + 1) * 3 + (kx + 1);
          r += data[idx] * kernel[kernelIdx];
          g += data[idx + 1] * kernel[kernelIdx];
          b += data[idx + 2] * kernel[kernelIdx];
        }
      }

      const idx = (y * width + x) * 4;
      newData[idx] = r / kernelSum;
      newData[idx + 1] = g / kernelSum;
      newData[idx + 2] = b / kernelSum;
      newData[idx + 3] = data[idx + 3];
    }
  }

  return new ImageData(newData, width, height);
}

/**
 * Prepares an image for OCR processing
 */
export async function prepareImageForOCR(imageUri: string): Promise<ImageData> {
  let imageData = await loadImageData(imageUri);

  // Resize if too large (max 1024 for faster processing)
  if (imageData.width > 1024 || imageData.height > 1024) {
    imageData = resizeImage(imageData, 1024, 1024);
  }

  // Convert to grayscale
  imageData = toGrayscale(imageData);

  // Adjust contrast slightly
  imageData = adjustContrast(imageData, 20);

  return imageData;
}

/**
 * Draws a rectangle on a canvas
 */
export function drawRectangle(
  ctx: CanvasRenderingContext2D,
  rect: Rectangle,
  color: string = '#00ff00',
  lineWidth: number = 2
): void {
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.beginPath();
  ctx.moveTo(rect.topLeft.x, rect.topLeft.y);
  ctx.lineTo(rect.topRight.x, rect.topRight.y);
  ctx.lineTo(rect.bottomRight.x, rect.bottomRight.y);
  ctx.lineTo(rect.bottomLeft.x, rect.bottomLeft.y);
  ctx.closePath();
  ctx.stroke();
}

/**
 * Draws points on a canvas
 */
export function drawPoints(
  ctx: CanvasRenderingContext2D,
  points: Point[],
  color: string = '#ff0000',
  radius: number = 5
): void {
  ctx.fillStyle = color;
  points.forEach(point => {
    ctx.beginPath();
    ctx.arc(point.x, point.y, radius, 0, 2 * Math.PI);
    ctx.fill();
  });
}
