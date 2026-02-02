/**
 * Window frame detection using BlindsBook-IA (local / self-hosted).
 * Same contract as Gemini: image data URL + dimensions → WindowFrame or null.
 * Configure VITE_BLINDSBOOK_IA_URL (e.g. http://localhost:8000) in .env.
 */

import type { Rectangle, WindowFrame } from '@/types/ocr';

function getBaseUrl(): string | undefined {
  const url = import.meta.env?.VITE_BLINDSBOOK_IA_URL?.trim()
    || import.meta.env?.VITE_CHETOS_IA_URL?.trim();
  return url || undefined;
}

/**
 * Detect window frame using BlindsBook-IA POST /ocr/window-frame.
 * Returns null if URL not set, request fails, or response has error "no_window".
 */
export async function detectWindowFrameWithBlindsBook(
  imageDataUrl: string,
  imageWidth: number,
  imageHeight: number
): Promise<WindowFrame | null> {
  const baseUrl = getBaseUrl();
  if (!baseUrl) return null;

  const url = `${baseUrl.replace(/\/$/, '')}/ocr/window-frame`;
  const body = {
    image: imageDataUrl,
    width: imageWidth,
    height: imageHeight
  };

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    if (!res.ok) return null;

    const data = await res.json();
    if (data?.error === 'no_window' || !data?.rectangle) return null;

    const rect = data.rectangle as Rectangle;
    if (
      !rect.topLeft || typeof rect.topLeft.x !== 'number' || typeof rect.topLeft.y !== 'number' ||
      !rect.topRight || typeof rect.topRight.x !== 'number' || typeof rect.topRight.y !== 'number' ||
      !rect.bottomLeft || typeof rect.bottomLeft.x !== 'number' || typeof rect.bottomLeft.y !== 'number' ||
      !rect.bottomRight || typeof rect.bottomRight.x !== 'number' || typeof rect.bottomRight.y !== 'number' ||
      typeof rect.width !== 'number' || typeof rect.height !== 'number'
    ) {
      return null;
    }

    const rectangle: Rectangle = {
      topLeft: { x: Number(rect.topLeft.x), y: Number(rect.topLeft.y) },
      topRight: { x: Number(rect.topRight.x), y: Number(rect.topRight.y) },
      bottomLeft: { x: Number(rect.bottomLeft.x), y: Number(rect.bottomLeft.y) },
      bottomRight: { x: Number(rect.bottomRight.x), y: Number(rect.bottomRight.y) },
      width: Number(rect.width),
      height: Number(rect.height)
    };

    const confidence = typeof data.confidence === 'number'
      ? Math.max(0, Math.min(1, data.confidence))
      : 0.9;

    return {
      rectangle,
      confidence,
      detectedAt: new Date()
    };
  } catch {
    return null;
  }
}
