// Composable for calibration management

import { ref, computed } from 'vue';
import type { CalibrationData, CalibrationReference, CalibrationHistory } from '@/types/ocr';

const STORAGE_KEY = 'ocrCalibrationHistory';

// Predefined reference objects
export const REFERENCE_OBJECTS: CalibrationReference[] = [
  {
    type: 'coin',
    name: 'Coin (Quarter US)',
    knownSize: 0.955, // 0.955 inches diameter
    unit: 'inches'
  },
  {
    type: 'coin',
    name: 'Coin (Dollar US)',
    knownSize: 1.043, // 1.043 inches diameter
    unit: 'inches'
  },
  {
    type: 'card',
    name: 'Credit Card',
    knownSize: 3.375, // 3.375 inches width (85.6 mm)
    unit: 'inches'
  },
  {
    type: 'ruler',
    name: 'Ruler (1 inch)',
    knownSize: 1.0,
    unit: 'inches'
  },
  {
    type: 'ruler',
    name: 'Ruler (1 cm)',
    knownSize: 1.0,
    unit: 'cm'
  }
];

function loadCalibrationHistory(): CalibrationHistory {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { calibrations: [] };
    return JSON.parse(raw);
  } catch {
    return { calibrations: [] };
  }
}

function saveCalibrationHistory(history: CalibrationHistory): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  } catch (e) {
    console.warn('Failed to save calibration history', e);
  }
}

export function useCalibration() {
  const currentCalibration = ref<CalibrationData | null>(null);
  const calibrationHistory = ref<CalibrationHistory>(loadCalibrationHistory());

  /**
   * Creates a new calibration based on a reference object
   */
  const createCalibration = (
    reference: CalibrationReference,
    pixelSize: number,
    imageId?: string
  ): CalibrationData => {
    const scale = reference.knownSize / pixelSize;

    const calibration: CalibrationData = {
      reference,
      pixelSize,
      scale,
      calibratedAt: new Date(),
      imageId
    };

    return calibration;
  };

  /**
   * Saves a calibration to history
   */
  const saveCalibration = (calibration: CalibrationData): void => {
    const history = calibrationHistory.value;

    // Add to beginning of array
    history.calibrations.unshift(calibration);

    // Limit to last 20 calibrations
    if (history.calibrations.length > 20) {
      history.calibrations = history.calibrations.slice(0, 20);
    }

    history.lastUsed = calibration.reference.type;
    saveCalibrationHistory(history);
  };

  /**
   * Sets the current calibration
   */
  const setCurrentCalibration = (calibration: CalibrationData | null): void => {
    currentCalibration.value = calibration;
    if (calibration) {
      saveCalibration(calibration);
    }
  };

  /**
   * Gets the last used calibration of the same type
   */
  const getLastCalibration = (referenceType?: CalibrationReference['type']): CalibrationData | null => {
    const history = calibrationHistory.value;
    if (history.calibrations.length === 0) return null;

    if (referenceType) {
      const lastOfType = history.calibrations.find(c => c.reference.type === referenceType);
      return lastOfType || null;
    }

    return history.calibrations[0] || null;
  };

  /**
   * Calculates the scale based on two manually marked points
   */
  const calculateScaleFromPoints = (
    reference: CalibrationReference,
    point1: { x: number; y: number },
    point2: { x: number; y: number }
  ): CalibrationData => {
    const dx = point2.x - point1.x;
    const dy = point2.y - point1.y;
    const pixelSize = Math.sqrt(dx * dx + dy * dy);

    return createCalibration(reference, pixelSize);
  };

  /**
   * Validates that a calibration is accurate
   */
  const validateCalibration = (calibration: CalibrationData): { valid: boolean; error?: string } => {
    if (calibration.scale <= 0) {
      return { valid: false, error: 'Scale must be greater than 0' };
    }

    if (calibration.pixelSize <= 0) {
      return { valid: false, error: 'Pixel size must be greater than 0' };
    }

    // Validate that scale is reasonable (between 0.001 and 1 units per pixel)
    if (calibration.scale < 0.001 || calibration.scale > 1) {
      return { valid: false, error: 'Calculated scale is out of reasonable range' };
    }

    return { valid: true };
  };

  /**
   * Clears the calibration history
   */
  const clearHistory = (): void => {
    calibrationHistory.value = { calibrations: [] };
    saveCalibrationHistory(calibrationHistory.value);
  };

  return {
    currentCalibration: computed(() => currentCalibration.value),
    calibrationHistory: computed(() => calibrationHistory.value),
    createCalibration,
    saveCalibration,
    setCurrentCalibration,
    getLastCalibration,
    calculateScaleFromPoints,
    validateCalibration,
    clearHistory,
    referenceObjects: REFERENCE_OBJECTS
  };
}
