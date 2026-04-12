import { reactive, computed } from 'vue';

export type MeasurementSystem = 'imperial' | 'metric';

const STORAGE_KEY = 'measurementSystem';

function loadMeasurementSystem(): MeasurementSystem {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'imperial' || saved === 'metric') {
      return saved as MeasurementSystem;
    }
  } catch {
    // Ignore
  }
  // Default to imperial
  return 'imperial';
}

const state = reactive({
  system: loadMeasurementSystem(),
});

// Conversion constants
const INCHES_TO_CM = 2.54;
const CM_TO_INCHES = 1 / INCHES_TO_CM;
const INCHES_TO_MM = 25.4;
const MM_TO_INCHES = 1 / INCHES_TO_MM;

export function useMeasurementSystem() {
  const setSystem = (system: MeasurementSystem) => {
    state.system = system;
    try {
      localStorage.setItem(STORAGE_KEY, system);
    } catch (e) {
      console.warn('Failed to persist measurement system', e);
    }
  };

  // Convert from inches to the current system
  const fromInches = (inches: number): { value: number; unit: string } => {
    if (state.system === 'metric') {
      // Use cm for values >= 1, mm for smaller values
      const cm = inches * INCHES_TO_CM;
      if (cm >= 1) {
        return { value: Math.round(cm * 100) / 100, unit: 'cm' };
      } else {
        return { value: Math.round(inches * INCHES_TO_MM * 10) / 10, unit: 'mm' };
      }
    }
    return { value: Math.round(inches * 100) / 100, unit: 'in' };
  };

  // Convert to inches from the current system
  const toInches = (value: number, unit: string): number => {
    if (state.system === 'metric') {
      if (unit === 'cm') {
        return value * CM_TO_INCHES;
      } else if (unit === 'mm') {
        return value * MM_TO_INCHES;
      }
    }
    // Already in inches
    return value;
  };

  // Get the unit label for display
  const getUnitLabel = (): string => {
    return state.system === 'metric' ? 'cm' : 'in';
  };

  // Get the unit label for small measurements (mm for metric, in for imperial)
  const getSmallUnitLabel = (): string => {
    return state.system === 'metric' ? 'mm' : 'in';
  };

  // Format a value with its unit
  const formatValue = (inches: number, precision: number = 2): string => {
    const converted = fromInches(inches);
    return `${converted.value.toFixed(precision)} ${converted.unit}`;
  };

  // Parse a value from the current system to inches
  const parseValue = (value: string): number => {
    const num = parseFloat(value);
    if (isNaN(num)) return 0;
    return toInches(num, getUnitLabel());
  };

  return {
    system: computed(() => state.system),
    setSystem,
    fromInches,
    toInches,
    getUnitLabel,
    getSmallUnitLabel,
    formatValue,
    parseValue,
    isImperial: computed(() => state.system === 'imperial'),
    isMetric: computed(() => state.system === 'metric'),
  };
}

