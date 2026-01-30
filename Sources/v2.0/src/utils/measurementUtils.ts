// Utilities for measurement conversion and calculation

import type { Point, Rectangle, MeasurementResult } from '@/types/ocr';
import type { CalibrationData } from '@/types/ocr';

/**
 * Calculates the distance between two points in pixels
 */
export function calculateDistance(p1: Point, p2: Point): number {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Calculates the width and height of a rectangle in pixels
 */
export function calculateRectangleDimensions(rect: Rectangle): { width: number; height: number } {
  const width = calculateDistance(rect.topLeft, rect.topRight);
  const height = calculateDistance(rect.topLeft, rect.bottomLeft);
  return { width, height };
}

/**
 * Converts pixels to real units using calibration
 */
export function pixelsToUnits(
  pixels: number,
  calibration: CalibrationData,
  targetUnit: 'inches' | 'cm'
): number {
  // Convert calibration scale to target unit
  let scaleInTargetUnit = calibration.scale;

  // If calibration is in a different unit, convert
  if (calibration.reference.unit !== targetUnit) {
    if (targetUnit === 'inches') {
      // From cm to inches
      scaleInTargetUnit = calibration.scale * 0.393701;
    } else {
      // From inches to cm
      scaleInTargetUnit = calibration.scale * 2.54;
    }
  }

  return pixels * scaleInTargetUnit;
}

/**
 * Converts real units to pixels using calibration
 */
export function unitsToPixels(
  units: number,
  calibration: CalibrationData,
  sourceUnit: 'inches' | 'cm'
): number {
  let scaleInSourceUnit = calibration.scale;

  // If calibration is in a different unit, convert
  if (calibration.reference.unit !== sourceUnit) {
    if (sourceUnit === 'inches') {
      scaleInSourceUnit = calibration.scale * 0.393701;
    } else {
      scaleInSourceUnit = calibration.scale * 2.54;
    }
  }

  return units / scaleInSourceUnit;
}

/**
 * Converts an inch value to fraction (1/8, 1/4, etc.)
 */
export function inchesToFraction(inches: number): { whole: number; fraction: number } {
  const whole = Math.floor(inches);
  const decimal = inches - whole;

  // Convert decimal to nearest fraction (1/8)
  const fraction = Math.round(decimal * 8) / 8;

  return { whole, fraction };
}

/**
 * Converts fraction to decimal
 */
export function fractionToDecimal(whole: number, fraction: number): number {
  return whole + fraction;
}

/**
 * Validates that a measurement is within reasonable ranges
 */
export function validateMeasurement(
  width: number,
  height: number,
  unit: 'inches' | 'cm'
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  const minWidth = unit === 'inches' ? 6 : 15; // 6 inches or 15 cm minimum
  const maxWidth = unit === 'inches' ? 300 : 762; // 300 inches or 762 cm maximum
  const minHeight = unit === 'inches' ? 12 : 30; // 12 inches or 30 cm minimum
  const maxHeight = unit === 'inches' ? 144 : 366; // 144 inches or 366 cm maximum

  if (width < minWidth || width > maxWidth) {
    errors.push(`Width must be between ${minWidth} and ${maxWidth} ${unit === 'inches' ? 'inches' : 'cm'}`);
  }

  if (height < minHeight || height > maxHeight) {
    errors.push(`Height must be between ${minHeight} and ${maxHeight} ${unit === 'inches' ? 'inches' : 'cm'}`);
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Formats a measurement for display according to the unit system
 */
export function formatMeasurement(
  value: number,
  unit: 'inches' | 'cm',
  useFraction: boolean = false
): string {
  if (useFraction && unit === 'inches') {
    const { whole, fraction } = inchesToFraction(value);
    if (fraction === 0) {
      return `${whole}"`;
    }
    const fractionStr = fraction === 0.125 ? '1/8' :
      fraction === 0.25 ? '1/4' :
        fraction === 0.375 ? '3/8' :
          fraction === 0.5 ? '1/2' :
            fraction === 0.625 ? '5/8' :
              fraction === 0.75 ? '3/4' :
                fraction === 0.875 ? '7/8' : '';
    return fractionStr ? `${whole} ${fractionStr}"` : `${value.toFixed(2)}"`;
  }

  return unit === 'inches' ? `${value.toFixed(2)}"` : `${value.toFixed(2)} cm`;
}

/**
 * Calculates the precision of a measurement based on configured tolerance
 */
export function calculatePrecision(
  measurement: MeasurementResult,
  tolerance: number
): number {
  // Precision is inversely proportional to tolerance
  // Higher tolerance = lower precision
  return Math.max(0, Math.min(100, 100 - (tolerance * 10)));
}
