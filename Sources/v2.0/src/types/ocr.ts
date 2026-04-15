// TypeScript types for OCR functionality

export interface Point {
  x: number;
  y: number;
}

export interface Rectangle {
  topLeft: Point;
  topRight: Point;
  bottomLeft: Point;
  bottomRight: Point;
  width: number;
  height: number;
}

export interface WindowFrame {
  rectangle: Rectangle;
  confidence: number;
  detectedAt: Date;
}

export interface CalibrationReference {
  type: 'coin' | 'card' | 'ruler' | 'custom';
  name: string;
  knownSize: number; // Known size in units (inches or cm)
  unit: 'inches' | 'cm';
}

export interface CalibrationData {
  reference: CalibrationReference;
  pixelSize: number; // Size in pixels of the reference object
  scale: number; // Scale: units per pixel
  calibratedAt: Date;
  imageId?: string; // ID of the image where it was calibrated
}

export interface OCRResult {
  text: string;
  confidence: number;
  boundingBox?: Rectangle;
}

export interface MeasurementResult {
  width: number;
  height: number;
  widthUnit: 'inches' | 'cm' | 'px';
  heightUnit: 'inches' | 'cm' | 'px';
  widthFraction?: number; // For imperial system
  heightFraction?: number; // For imperial system
  confidence: number;
  source: 'detection' | 'ocr' | 'manual';
  /** Provider used to detect the window frame (for UX decisions like calibration visibility) */
  detectionProvider?: 'azure' | 'gemini' | 'local';
  calibrationId?: string;
  /** When true, dimensions are in pixels (no calibration); "Use in calculator" requires calibration */
  approximate?: boolean;
}

export interface ProcessedImage {
  id: string;
  originalUri: string;
  processedUri?: string;
  thumbnailUri?: string;
  windowFrame?: WindowFrame;
  measurements?: MeasurementResult;
  calibration?: CalibrationData;
  ocrResults?: OCRResult[];
  metadata: {
    capturedAt: Date;
    processedAt: Date;
    width: number;
    height: number;
    fileSize: number;
  };
}

export type PrecisionLevel = 'high' | 'medium' | 'low';


export const APPROXIMATE_SCALE_PRESETS_CM = [150, 180, 200, 250, 280, 300] as const;

export interface OCRSettings {
  precision: PrecisionLevel;
  autoCalibrate: boolean;
  defaultReferenceType: CalibrationReference['type'];

  approximateScaleLongerSideCm: number;
  tolerance: {
    high: number; // ±1/8" or ±2mm
    medium: number; // ±1/4" or ±5mm
    low: number; // ±1/2" or ±10mm
  };
  saveProcessedImages: boolean;
  exportFormat: 'pdf' | 'json' | 'both';
}

export interface CalibrationHistory {
  calibrations: CalibrationData[];
  lastUsed?: string; // ID of the last used calibration
}

export interface ExportData {
  image: ProcessedImage;
  measurements: MeasurementResult;
  calibration?: CalibrationData;
  exportDate: Date;
  format: 'pdf' | 'json' | 'image';
}
