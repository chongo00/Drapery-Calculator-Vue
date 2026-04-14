export type BoundingBox = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type DetectedObject = {
  label: string;
  confidence: number;
  boundingBox: BoundingBox;
  estimatedSize: { widthCm: number; heightCm: number } | null;
};

export type DetectResponse = {
  success: boolean;
  objects: DetectedObject[];
  message?: string;
};

