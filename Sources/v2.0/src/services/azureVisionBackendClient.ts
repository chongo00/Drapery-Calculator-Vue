import type { WindowFrame, Rectangle } from '@/types/ocr';

type DetectResponse = {
  success: boolean;
  objects: Array<{
    label: string;
    confidence: number;
    boundingBox: { x: number; y: number; width: number; height: number };
  }>;
  message?: string;
};

function getBaseUrl(): string | undefined {
  const url = import.meta.env?.VITE_VISION_BACKEND_URL?.trim();
  return url || undefined;
}

function bboxToRectangle(b: { x: number; y: number; width: number; height: number }): Rectangle {
  return {
    topLeft: { x: b.x, y: b.y },
    topRight: { x: b.x + b.width, y: b.y },
    bottomLeft: { x: b.x, y: b.y + b.height },
    bottomRight: { x: b.x + b.width, y: b.y + b.height },
    width: b.width,
    height: b.height,
  };
}

/**
 * Detect a window frame using the Azure Vision backend.
 * Returns null if backend URL is not configured or no window object is detected.
 */
export async function detectWindowFrameWithAzureBackend(
  imageDataUrl: string,
  imageWidth: number,
  imageHeight: number,
  allowedLabels: string[] = ['window']
): Promise<WindowFrame | null> {
  const baseUrl = getBaseUrl();
  if (!baseUrl) return null;

  const url = `${baseUrl.replace(/\/+$/, '')}/api/vision/detect`;
  const body = {
    imageBase64: imageDataUrl,
    allowedLabels,
  };

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!res.ok) return null;
    const data = (await res.json()) as DetectResponse;
    if (!data?.success || !Array.isArray(data.objects) || data.objects.length === 0) return null;

    const best = data.objects
      .filter(o => typeof o.confidence === 'number' && o.boundingBox)
      .sort((a, b) => b.confidence - a.confidence)[0];
    if (!best) return null;

    // Clamp bbox to image bounds
    const x = Math.max(0, Math.min(imageWidth - 1, best.boundingBox.x));
    const y = Math.max(0, Math.min(imageHeight - 1, best.boundingBox.y));
    const w = Math.max(1, Math.min(imageWidth - x, best.boundingBox.width));
    const h = Math.max(1, Math.min(imageHeight - y, best.boundingBox.height));

    const rect = bboxToRectangle({ x, y, width: w, height: h });
    return {
      rectangle: rect,
      confidence: Math.max(0, Math.min(1, best.confidence)),
      detectedAt: new Date(),
    };
  } catch {
    return null;
  }
}

