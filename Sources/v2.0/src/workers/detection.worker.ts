/**
 * Web Worker: runs window frame detection off the main thread
 * so the UI stays responsive (Cancel/Capture respond immediately).
 */
/// <reference lib="webworker" />
import { detectPrimaryWindowFrame } from '../services/windowFrameDetector';

export type DetectionWorkerRequest = {
  data: ArrayBuffer;
  width: number;
  height: number;
  jobId: number;
};

export type DetectionWorkerResponse = {
  frame: import('../types/ocr').WindowFrame | null;
  jobId: number;
};

self.onmessage = async (e: MessageEvent<DetectionWorkerRequest>) => {
  try {
    const { data, width, height, jobId } = e.data;
    const imageData = new ImageData(new Uint8ClampedArray(data), width, height);
    const frame = await detectPrimaryWindowFrame(imageData);
    postMessage({ frame, jobId } as DetectionWorkerResponse);
  } catch {
    postMessage({ frame: null, jobId: e.data.jobId } as DetectionWorkerResponse);
  }
};
