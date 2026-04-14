import { analyzeImageObjects } from '../clients/azureVisionClient';
import { getAllowedLabels } from '../config/env';
import type { DetectedObject } from '../types/vision';

export async function detectObjectsFromImage(
  imageBytes: Buffer,
  allowedLabels?: string[]
): Promise<DetectedObject[]> {
  const labels = (allowedLabels?.length ? allowedLabels : getAllowedLabels())
    .map(s => s.trim().toLowerCase())
    .filter(Boolean);

  const azureObjects = await analyzeImageObjects(imageBytes);

  const filtered = azureObjects.filter(o => {
    const name = (o.name || '').toLowerCase();
    return labels.length === 0 ? true : labels.includes(name);
  });

  return filtered.map((o) => ({
    label: o.name,
    confidence: o.confidence,
    boundingBox: {
      x: o.boundingBox.x,
      y: o.boundingBox.y,
      width: o.boundingBox.w,
      height: o.boundingBox.h,
    },
    estimatedSize: null, // sizes are computed on-device using AR distance
  }));
}

