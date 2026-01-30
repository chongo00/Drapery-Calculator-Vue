// Service for window frame detection using image processing

import type { Point, Rectangle, WindowFrame } from '@/types/ocr';
import { toGrayscale, adjustContrast, applyGaussianBlur } from './imageProcessor';
import { calculateDistance } from '@/utils/measurementUtils';

/**
 * Detects edges using simplified Canny (low thresholds = more edges for real/live images)
 */
function detectEdges(imageData: ImageData, lowThreshold: number = 10, highThreshold: number = 45): number[] {
  const width = imageData.width;
  const height = imageData.height;
  const data = imageData.data;
  const edges = new Array(width * height).fill(0);

  // Sobel kernels
  const sobelX = [-1, 0, 1, -2, 0, 2, -1, 0, 1];
  const sobelY = [-1, -2, -1, 0, 0, 0, 1, 2, 1];

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      let gx = 0, gy = 0;

      for (let ky = -1; ky <= 1; ky++) {
        for (let kx = -1; kx <= 1; kx++) {
          const idx = ((y + ky) * width + (x + kx)) * 4;
          const gray = data[idx];
          const kernelIdx = (ky + 1) * 3 + (kx + 1);
          gx += gray * sobelX[kernelIdx];
          gy += gray * sobelY[kernelIdx];
        }
      }

      const magnitude = Math.sqrt(gx * gx + gy * gy);
      const idx = y * width + x;

      if (magnitude > highThreshold) {
        edges[idx] = 2; // Strong edge
      } else if (magnitude > lowThreshold) {
        edges[idx] = 1; // Weak edge
      }
    }
  }

  return edges;
}

function findLines(
  edges: number[],
  width: number,
  height: number,
  relaxedMinVotes: boolean = false
): Array<{ rho: number; theta: number; votes: number }> {
  const lines: Array<{ rho: number; theta: number; votes: number }> = [];
  const rhoStep = 1;
  const pixels = width * height;
  const isFastMode = pixels < 200000; // live/small frames
  const thetaStep = isFastMode ? Math.PI / 90 : Math.PI / 180; // 2° vs 1°
  const step = isFastMode ? 2 : 1; // sample every 2nd pixel in fast mode

  const accumulator: Map<string, number> = new Map();

  for (let y = 0; y < height; y += step) {
    for (let x = 0; x < width; x += step) {
      const idx = y * width + x;
      if (edges[idx] > 0) {
        for (let theta = 0; theta < Math.PI; theta += thetaStep) {
          const rho = x * Math.cos(theta) + y * Math.sin(theta);
          const rhoKey = Math.round(rho / rhoStep);
          const key = `${rhoKey}_${Math.round(theta / thetaStep)}`;
          accumulator.set(key, (accumulator.get(key) || 0) + 1);
        }
      }
    }
  }

  // Lower minVotes when relaxed so weak window edges still form lines
  let minVotes: number;
  if (pixels < 200000) {
    minVotes = relaxedMinVotes ? Math.max(2, Math.floor(pixels / 60000)) : Math.max(3, Math.floor(pixels / 40000));
  } else {
    const normal = Math.max(8, Math.min(28, Math.floor(pixels / 15000)));
    minVotes = relaxedMinVotes ? Math.max(4, Math.floor(normal * 0.5)) : normal;
  }
  accumulator.forEach((votes, key) => {
    if (votes >= minVotes) {
      const [rhoKey, thetaKey] = key.split('_').map(Number);
      lines.push({
        rho: rhoKey * rhoStep,
        theta: thetaKey * thetaStep,
        votes
      });
    }
  });

  // Sort by votes and take the best (more lines = more rectangle candidates)
  return lines.sort((a, b) => b.votes - a.votes).slice(0, 60);
}

/** Margin (fraction of dimension) to allow intersection points outside image (window at edge) */
const INTERSECTION_MARGIN = 0.15;

/**
 * Finds line intersections to form rectangles
 */
function findRectangles(
  lines: Array<{ rho: number; theta: number; votes: number }>,
  width: number,
  height: number,
  allowMargin: boolean = true
): Rectangle[] {
  const rectangles: Rectangle[] = [];
  const angleTolerance = Math.PI / 10; // 18 degrees (more tolerant for real photos / tilted windows)

  // Group lines by angle (horizontal/vertical)
  const horizontal: Array<{ rho: number; theta: number }> = [];
  const vertical: Array<{ rho: number; theta: number }> = [];

  lines.forEach(line => {
    const angle = line.theta % Math.PI;
    if (angle < angleTolerance || angle > Math.PI - angleTolerance) {
      horizontal.push(line);
    } else if (Math.abs(angle - Math.PI / 2) < angleTolerance) {
      vertical.push(line);
    }
  });

  // Find intersections; use more line pairs and smaller min dist to get more candidates
  const minLineDist = width + height < 800 ? 8 : 12;
  const hCount = Math.min(8, horizontal.length);
  const vCount = Math.min(8, vertical.length);
  for (const h1 of horizontal.slice(0, hCount)) {
    for (const h2 of horizontal.slice(0, hCount)) {
      if (Math.abs(h1.rho - h2.rho) < minLineDist) continue;

      for (const v1 of vertical.slice(0, vCount)) {
        for (const v2 of vertical.slice(0, vCount)) {
          if (Math.abs(v1.rho - v2.rho) < minLineDist) continue;

          const topLeft = intersectLines(h1, v1, width, height, allowMargin);
          const topRight = intersectLines(h1, v2, width, height, allowMargin);
          const bottomLeft = intersectLines(h2, v1, width, height, allowMargin);
          const bottomRight = intersectLines(h2, v2, width, height, allowMargin);

          if (topLeft && topRight && bottomLeft && bottomRight) {
            const rect = clampRectangleToImage(
              { topLeft, topRight, bottomLeft, bottomRight, width: 0, height: 0 },
              width,
              height
            );
            rect.width = calculateDistance(rect.topLeft, rect.topRight);
            rect.height = calculateDistance(rect.topLeft, rect.bottomLeft);

            if (isValidRectangle(rect, width, height)) {
              rectangles.push(rect);
            }
          }
        }
      }
    }
  }

  return rectangles;
}

/**
 * Calculates the intersection of two lines.
 * If allowMargin is true, accept points slightly outside the image (window at edge).
 */
function intersectLines(
  line1: { rho: number; theta: number },
  line2: { rho: number; theta: number },
  width: number,
  height: number,
  allowMargin: boolean = false
): Point | null {
  const cos1 = Math.cos(line1.theta);
  const sin1 = Math.sin(line1.theta);
  const cos2 = Math.cos(line2.theta);
  const sin2 = Math.sin(line2.theta);

  const det = cos1 * sin2 - sin1 * cos2;
  if (Math.abs(det) < 0.0001) return null; // Parallel lines

  const x = (line1.rho * sin2 - line2.rho * sin1) / det;
  const y = (line2.rho * cos1 - line1.rho * cos2) / det;

  const margin = allowMargin ? INTERSECTION_MARGIN : 0;
  const minX = -width * margin;
  const maxX = width * (1 + margin);
  const minY = -height * margin;
  const maxY = height * (1 + margin);
  if (x >= minX && x <= maxX && y >= minY && y <= maxY) {
    return { x, y };
  }
  return null;
}

/** Clamp rectangle corners to image bounds (after allowing margin in intersections). */
function clampRectangleToImage(rect: Rectangle, width: number, height: number): Rectangle {
  const clamp = (p: Point) => ({
    x: Math.max(0, Math.min(width - 1, p.x)),
    y: Math.max(0, Math.min(height - 1, p.y))
  });
  return {
    topLeft: clamp(rect.topLeft),
    topRight: clamp(rect.topRight),
    bottomLeft: clamp(rect.bottomLeft),
    bottomRight: clamp(rect.bottomRight),
    width: rect.width,
    height: rect.height
  };
}

/**
 * Validates that a rectangle is reasonable (relaxed for real window photos and live frames)
 */
function isValidRectangle(rect: Rectangle, imageWidth: number, imageHeight: number): boolean {
  const area = imageWidth * imageHeight;
  const minSize = area < 200000 ? 20 : 30; // Smaller min so large windows are accepted
  const maxSize = Math.max(imageWidth, imageHeight) * (1 + INTERSECTION_MARGIN);

  if (rect.width < minSize || rect.height < minSize) return false;
  if (rect.width > maxSize || rect.height > maxSize) return false;

  // Verify angles are approximately right angles (allow up to ~50° skew for real photos)
  const topAngle = Math.abs(
    Math.atan2(rect.topRight.y - rect.topLeft.y, rect.topRight.x - rect.topLeft.x) -
    Math.atan2(rect.bottomLeft.y - rect.topLeft.y, rect.bottomLeft.x - rect.topLeft.x)
  );
  const expectedAngle = Math.PI / 2;
  const angleTolerance = (50 * Math.PI) / 180; // 50 degrees for real-world photos

  if (Math.abs(topAngle - expectedAngle) > angleTolerance) return false;

  return true;
}

/**
 * Internal: run detection pipeline with given preprocessing and options.
 */
function runDetection(
  imageData: ImageData,
  contrast: number,
  edgeLow: number,
  edgeHigh: number,
  relaxedLines: boolean
): WindowFrame[] {
  let processed = toGrayscale(imageData);
  processed = applyGaussianBlur(processed);
  processed = adjustContrast(processed, contrast);
  const edges = detectEdges(processed, edgeLow, edgeHigh);
  const lines = findLines(edges, processed.width, processed.height, relaxedLines);
  const rectangles = findRectangles(lines, processed.width, processed.height, true);
  const imageArea = processed.width * processed.height;
  return rectangles.map((rect) => {
    const area = rect.width * rect.height;
    const areaRatio = area / imageArea;
    let confidence = 0.5;
    if (areaRatio > 0.15 && areaRatio < 0.7) confidence = 0.8;
    else if (areaRatio > 0.08 && areaRatio < 0.85) confidence = 0.6;
    return { rectangle: rect, confidence, detectedAt: new Date() };
  }).sort((a, b) => b.confidence - a.confidence);
}

/**
 * Detects window frames in an image
 */
export async function detectWindowFrame(imageData: ImageData): Promise<WindowFrame[]> {
  return runDetection(imageData, 40, 10, 45, false);
}

/**
 * Detects the most likely frame (largest and centered).
 * Tries multiple passes with stronger contrast and more relaxed params if no frame is found.
 */
export async function detectPrimaryWindowFrame(imageData: ImageData): Promise<WindowFrame | null> {
  let frames = await detectWindowFrame(imageData);

  // Second attempt: stronger contrast + more sensitive edges + relaxed line votes
  if (frames.length === 0) {
    frames = runDetection(imageData, 55, 8, 38, true);
  }

  // Third attempt: even lower edge thresholds (very low-contrast / difficult photos)
  if (frames.length === 0) {
    frames = runDetection(imageData, 60, 6, 28, true);
  }

  // Fourth attempt: maximum sensitivity (shutters, dim light, textured walls)
  if (frames.length === 0) {
    frames = runDetection(imageData, 65, 5, 22, true);
  }

  if (frames.length === 0) {
    const w = imageData.width;
    const h = imageData.height;
    const fullRect: Rectangle = {
      topLeft: { x: 0, y: 0 },
      topRight: { x: w, y: 0 },
      bottomLeft: { x: 0, y: h },
      bottomRight: { x: w, y: h },
      width: w,
      height: h
    };
    return {
      rectangle: fullRect,
      confidence: 0.2,
      detectedAt: new Date()
    };
  }

  // If there's only one, return it
  if (frames.length === 1) return frames[0];

  // Find the largest and centered one
  const imageCenterX = imageData.width / 2;
  const imageCenterY = imageData.height / 2;

  let bestFrame = frames[0];
  let bestScore = 0;

  frames.forEach(frame => {
    const rect = frame.rectangle;
    const centerX = (rect.topLeft.x + rect.topRight.x + rect.bottomLeft.x + rect.bottomRight.x) / 4;
    const centerY = (rect.topLeft.y + rect.topRight.y + rect.bottomLeft.y + rect.bottomRight.y) / 4;

    const distanceFromCenter = Math.sqrt(
      Math.pow(centerX - imageCenterX, 2) + Math.pow(centerY - imageCenterY, 2)
    );
    const maxDistance = Math.sqrt(imageCenterX * imageCenterX + imageCenterY * imageCenterY);
    const centerScore = 1 - (distanceFromCenter / maxDistance);

    const area = rect.width * rect.height;
    const imageArea = imageData.width * imageData.height;
    const sizeScore = area / imageArea;

    const score = centerScore * 0.4 + sizeScore * 0.4 + frame.confidence * 0.2;

    if (score > bestScore) {
      bestScore = score;
      bestFrame = frame;
    }
  });

  return bestFrame;
}
