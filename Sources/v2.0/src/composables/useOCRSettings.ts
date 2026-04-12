// Composable for OCR configuration management

import { reactive, watch } from 'vue';
import type { OCRSettings, PrecisionLevel } from '@/types/ocr';

const STORAGE_KEY = 'ocrSettingsV1';

const defaultSettings: OCRSettings = {
  precision: 'medium',
  autoCalibrate: false,
  defaultReferenceType: 'card',
  approximateScaleLongerSideCm: 280,
  tolerance: {
    high: 0.125, // ±1/8" or ±2mm
    medium: 0.25, // ±1/4" or ±5mm
    low: 0.5 // ±1/2" or ±10mm
  },
  saveProcessedImages: true,
  exportFormat: 'both'
};

function loadSettings(): OCRSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...defaultSettings };
    const parsed = JSON.parse(raw);
    return {
      precision: parsed.precision || defaultSettings.precision,
      autoCalibrate: parsed.autoCalibrate ?? defaultSettings.autoCalibrate,
      defaultReferenceType: parsed.defaultReferenceType || defaultSettings.defaultReferenceType,
      approximateScaleLongerSideCm: typeof parsed.approximateScaleLongerSideCm === 'number' ? parsed.approximateScaleLongerSideCm : defaultSettings.approximateScaleLongerSideCm,
      tolerance: {
        high: parsed.tolerance?.high ?? defaultSettings.tolerance.high,
        medium: parsed.tolerance?.medium ?? defaultSettings.tolerance.medium,
        low: parsed.tolerance?.low ?? defaultSettings.tolerance.low
      },
      saveProcessedImages: parsed.saveProcessedImages ?? defaultSettings.saveProcessedImages,
      exportFormat: parsed.exportFormat || defaultSettings.exportFormat
    };
  } catch {
    return { ...defaultSettings };
  }
}

const state = reactive<OCRSettings>(loadSettings());

watch(state, (val) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(val));
  } catch (e) {
    console.warn('Failed to persist OCR settings', e);
  }
}, { deep: true });

export function useOCRSettings() {
  const setPrecision = (precision: PrecisionLevel): void => {
    state.precision = precision;
  };

  const setAutoCalibrate = (autoCalibrate: boolean): void => {
    state.autoCalibrate = autoCalibrate;
  };

  const setDefaultReferenceType = (type: 'coin' | 'card' | 'ruler' | 'custom'): void => {
    state.defaultReferenceType = type;
  };

  const setApproximateScaleLongerSideCm = (cm: number): void => {
    state.approximateScaleLongerSideCm = cm;
  };

  const setTolerance = (level: PrecisionLevel, value: number): void => {
    state.tolerance[level] = value;
  };

  const setSaveProcessedImages = (save: boolean): void => {
    state.saveProcessedImages = save;
  };

  const setExportFormat = (format: 'pdf' | 'json' | 'both'): void => {
    state.exportFormat = format;
  };

  const reset = (): void => {
    Object.assign(state, defaultSettings);
  };

  const getTolerance = (): number => {
    return state.tolerance[state.precision];
  };

  return {
    settings: state,
    setPrecision,
    setAutoCalibrate,
    setDefaultReferenceType,
    setApproximateScaleLongerSideCm,
    setTolerance,
    setSaveProcessedImages,
    setExportFormat,
    reset,
    getTolerance,
    defaultSettings: { ...defaultSettings }
  };
}
