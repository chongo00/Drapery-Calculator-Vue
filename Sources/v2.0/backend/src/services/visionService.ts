import { analyzeImageObjects } from '../clients/azureVisionClient';
import { getAllowedLabels } from '../config/env';
import type { DetectedObject } from '../types/vision';

type DetectOptions = {
  allowedLabels?: string[];
  imageWidth?: number;
  imageHeight?: number;
  topN?: number;
};

function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}

function computeWindowScore(
  obj: DetectedObject,
  imageWidth?: number,
  imageHeight?: number
): number {
  const bb = obj.boundingBox;
  const area = Math.max(1, bb.width * bb.height);
  const imgArea = imageWidth && imageHeight ? imageWidth * imageHeight : null;
  const areaNorm = imgArea ? clamp(area / imgArea, 0, 1) : clamp(area / (800 * 800), 0, 1);

  const ar = bb.width / Math.max(1, bb.height);
  const arCloseness = 1 - clamp(Math.abs(ar - 1.3) / 1.3, 0, 1); // prefer moderately rectangular

  let centerScore = 0.5;
  if (imageWidth && imageHeight) {
    const cx = bb.x + bb.width / 2;
    const cy = bb.y + bb.height / 2;
    const dx = Math.abs(cx - imageWidth / 2) / (imageWidth / 2);
    const dy = Math.abs(cy - imageHeight / 2) / (imageHeight / 2);
    centerScore = 1 - clamp((dx + dy) / 2, 0, 1);
  }

  const label = (obj.label || '').toLowerCase();
  const labelBonus =
    label.includes('window') ? 0.25 :
    label.includes('frame') ? 0.15 :
    label.includes('glass') ? 0.10 :
    label.includes('door') ? 0.05 :
    0;

  // Heuristic weights: prefer big + plausible rectangle + some confidence.
  return (
    obj.confidence * 0.25 +
    areaNorm * 0.50 +
    arCloseness * 0.15 +
    centerScore * 0.10 +
    labelBonus
  );
}

export async function detectObjectsFromImage(
  imageBytes: Buffer,
  options?: DetectOptions
): Promise<{ objects: DetectedObject[]; best: DetectedObject | null }> {
  const topN = options?.topN ?? 10;
  const labels = (options?.allowedLabels !== undefined ? options.allowedLabels : getAllowedLabels())
    .map(s => s.trim().toLowerCase())
    .filter(Boolean);

  const azureObjects = await analyzeImageObjects(imageBytes);

  const getName = (o: any): string => {
    const direct = typeof o?.name === 'string' ? o.name : '';
    const tag0 = typeof o?.tags?.[0]?.name === 'string' ? o.tags[0].name : '';
    return (direct || tag0 || '').toLowerCase();
  };

  const all: DetectedObject[] = azureObjects.map((o: any) => ({
    label: o?.name ?? o?.tags?.[0]?.name ?? 'object',
    confidence: o?.confidence ?? o?.tags?.[0]?.confidence ?? 0,
    boundingBox: {
      x: o?.boundingBox?.x ?? 0,
      y: o?.boundingBox?.y ?? 0,
      width: o?.boundingBox?.w ?? o?.boundingBox?.width ?? 0,
      height: o?.boundingBox?.h ?? o?.boundingBox?.height ?? 0,
    },
    estimatedSize: null,
  })).filter(o => o.boundingBox.width > 1 && o.boundingBox.height > 1);

  const exact = all.filter((o: any) => {
    const name = getName(o);
    return labels.length === 0 ? true : labels.includes(name);
  });

  // Azure labels don't always match exactly (e.g. "window frame", "windowpane").
  const fuzzy = exact.length
    ? exact
    : all.filter(o => {
        const name = (o.label || '').toLowerCase();
        return labels.some(lbl => name.includes(lbl));
      });

  const candidates = (labels.length === 0 ? all : (fuzzy.length ? fuzzy : all));
  const scored = candidates
    .map(o => ({ ...o, score: computeWindowScore(o, options?.imageWidth, options?.imageHeight) }))
    .sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
    .slice(0, topN);

  return { objects: scored, best: scored[0] ?? null };
}

