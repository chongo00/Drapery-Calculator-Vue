/**
 * Window frame detection using Google Gemini Vision API.
 * More accurate than Hough for real-world photos (lighting, shutters, adjacent objects).
 * API key must be in .env as VITE_GEMINI_API_KEY (never commit the key).
 */

import type { Rectangle, WindowFrame } from '@/types/ocr';

const GEMINI_PROMPT = `Find the MAIN WINDOW in this image. The window can have glass, wooden shutters, or a frame. It is usually on a wall. Do NOT select doors, yellow or bright panels that are doors, or furniture. Pick the rectangular window frame only.
Reply with ONLY this JSON, nothing else:
{"xmin":0.2,"ymin":0.1,"xmax":0.8,"ymax":0.9}
Use numbers between 0 and 1: xmin,ymin = top-left corner, xmax,ymax = bottom-right corner (as fraction of image width and height).
If there is no window visible, reply exactly: {"error":"no_window"}`;

function getApiKey(): string | undefined {
  return import.meta.env?.VITE_GEMINI_API_KEY?.trim() || undefined;
}

/**
 * Extract base64 data and mime from a data URL
 */
function parseDataUrl(dataUrl: string): { base64: string; mime: string } {
  const match = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
  if (!match) throw new Error('Invalid data URL');
  return { mime: match[1], base64: match[2] };
}

/**
 * Parse Gemini response to get normalized bbox. Handles JSON in code blocks or raw.
 */
function parseBboxFromResponse(text: string): { xmin: number; ymin: number; xmax: number; ymax: number } | null {
  const trimmed = text.trim();
  let jsonStr = trimmed;
  const codeBlock = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (codeBlock) jsonStr = codeBlock[1].trim();
  const firstBrace = jsonStr.indexOf('{');
  const lastBrace = jsonStr.lastIndexOf('}');
  if (firstBrace === -1 || lastBrace <= firstBrace) return null;
  jsonStr = jsonStr.slice(firstBrace, lastBrace + 1);
  try {
    const obj = JSON.parse(jsonStr);
    if (obj.error === 'no_window' || obj.error) return null;
    const xmin = Number(obj.xmin);
    const ymin = Number(obj.ymin);
    const xmax = Number(obj.xmax);
    const ymax = Number(obj.ymax);
    if (!Number.isFinite(xmin) || !Number.isFinite(ymin) || !Number.isFinite(xmax) || !Number.isFinite(ymax)) return null;
    if (xmin >= xmax || ymin >= ymax) return null;
    return {
      xmin: Math.max(0, Math.min(1, xmin)),
      ymin: Math.max(0, Math.min(1, ymin)),
      xmax: Math.max(0, Math.min(1, xmax)),
      ymax: Math.max(0, Math.min(1, ymax))
    };
  } catch {
    return null;
  }
}

/**
 * Convert normalized bbox (0-1) to Rectangle in pixel coordinates.
 */
function bboxToRectangle(
  bbox: { xmin: number; ymin: number; xmax: number; ymax: number },
  width: number,
  height: number
): Rectangle {
  const xmin = Math.max(0, Math.min(1, bbox.xmin)) * width;
  const ymin = Math.max(0, Math.min(1, bbox.ymin)) * height;
  const xmax = Math.max(0, Math.min(1, bbox.xmax)) * width;
  const ymax = Math.max(0, Math.min(1, bbox.ymax)) * height;
  return {
    topLeft: { x: xmin, y: ymin },
    topRight: { x: xmax, y: ymin },
    bottomLeft: { x: xmin, y: ymax },
    bottomRight: { x: xmax, y: ymax },
    width: xmax - xmin,
    height: ymax - ymin
  };
}

/**
 * Detect window frame using Gemini Vision. Returns null if API key missing, request fails, or no window found.
 */
export async function detectWindowFrameWithGemini(
  imageDataUrl: string,
  imageWidth: number,
  imageHeight: number
): Promise<WindowFrame | null> {
  const apiKey = getApiKey();
  if (!apiKey) return null;

  let base64: string;
  let mime = 'image/jpeg';
  try {
    const parsed = parseDataUrl(imageDataUrl);
    base64 = parsed.base64;
    mime = parsed.mime;
  } catch {
    return null;
  }

  const imagePart = {
    inlineData: {
      mimeType: (mime === 'image/png' ? 'image/png' : 'image/jpeg') as 'image/jpeg' | 'image/png',
      data: base64
    }
  };

  const modelIds = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-pro-vision'];

  for (const modelId of modelIds) {
    try {
      const { GoogleGenerativeAI } = await import('@google/generative-ai');
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: modelId });

      const result = await model.generateContent([GEMINI_PROMPT, imagePart]);
      const response = result.response;
      if (!response) continue;
      const text = response.text();
      if (!text) continue;

      const bbox = parseBboxFromResponse(text);
      if (!bbox) continue;

      const rectangle = bboxToRectangle(bbox, imageWidth, imageHeight);
      return {
        rectangle,
        confidence: 0.9,
        detectedAt: new Date()
      };
    } catch (_) {
      continue;
    }
  }

  console.info('Gemini: ningún modelo disponible (404). Se usa detección local.');
  return null;
}
