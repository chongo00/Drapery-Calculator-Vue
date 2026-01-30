// Service for OCR results export

import type { MeasurementResult, ExportData } from '@/types/ocr';
// Share is imported dynamically if available

/**
 * Exports results to JSON
 */
export async function exportToJSON(data: ExportData): Promise<string> {
  const jsonData = {
    imageId: data.image.id,
    measurements: data.measurements,
    calibration: data.calibration,
    exportDate: data.exportDate.toISOString(),
    metadata: data.image.metadata
  };

  const jsonString = JSON.stringify(jsonData, null, 2);
  return jsonString;
}

/**
 * Exports results as annotated image
 */
export async function exportToImage(
  imageUri: string,
  measurements: MeasurementResult,
  frame?: any
): Promise<string> {
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

      // Draw original image
      ctx.drawImage(img, 0, 0);

      // Draw frame if exists
      if (frame) {
        ctx.strokeStyle = '#00ff00';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(frame.rectangle.topLeft.x, frame.rectangle.topLeft.y);
        ctx.lineTo(frame.rectangle.topRight.x, frame.rectangle.topRight.y);
        ctx.lineTo(frame.rectangle.bottomRight.x, frame.rectangle.bottomRight.y);
        ctx.lineTo(frame.rectangle.bottomLeft.x, frame.rectangle.bottomLeft.y);
        ctx.closePath();
        ctx.stroke();
      }

      // Add text with measurements
      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 2;
      ctx.font = 'bold 24px Arial';
      const text = `Width: ${measurements.width} ${measurements.widthUnit}\nHeight: ${measurements.height} ${measurements.heightUnit}`;
      const lines = text.split('\n');
      let y = 40;
      lines.forEach(line => {
        ctx.strokeText(line, 20, y);
        ctx.fillText(line, 20, y);
        y += 30;
      });

      // Convert to base64
      const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
      resolve(dataUrl);
    };
    img.onerror = reject;
    img.src = imageUri;
  });
}

/**
 * Shares the results
 */
export async function shareResults(
  imageUri: string,
  measurements: MeasurementResult
): Promise<void> {
  try {
    // Export annotated image
    const annotatedImage = await exportToImage(imageUri, measurements);

    // In a real implementation, you would save the file and then share it
    // For now, we use the Share API if available
    try {
      const { Share } = await import('@capacitor/share');
      await Share.share({
        title: 'Window Frame Measurements',
        text: `Width: ${measurements.width} ${measurements.widthUnit}, Height: ${measurements.height} ${measurements.heightUnit}`,
        url: annotatedImage,
        dialogTitle: 'Share results'
      });
    } catch (shareError) {
      // If Share is not available, copy to clipboard or show message
      console.warn('Share not available', shareError);
      // Fallback: copy text to clipboard
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(
          `Width: ${measurements.width} ${measurements.widthUnit}, Height: ${measurements.height} ${measurements.heightUnit}`
        );
      }
    }
  } catch (error) {
    console.error('Error sharing results', error);
    throw error;
  }
}
