// Service for processed image storage

import type { ProcessedImage } from '@/types/ocr';

const STORAGE_KEY = 'ocrProcessedImages';
const MAX_STORED_IMAGES = 50;

/**
 * Saves a processed image to history
 */
export function saveProcessedImage(image: ProcessedImage): void {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    const images: ProcessedImage[] = stored ? JSON.parse(stored) : [];

    // Add to beginning
    images.unshift(image);

    // Limit quantity
    if (images.length > MAX_STORED_IMAGES) {
      images.splice(MAX_STORED_IMAGES);
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(images));
  } catch (error) {
    console.error('Failed to save processed image', error);
  }
}

/**
 * Gets all processed images
 */
export function getProcessedImages(): ProcessedImage[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Failed to load processed images', error);
    return [];
  }
}

/**
 * Deletes a processed image
 */
export function deleteProcessedImage(imageId: string): void {
  try {
    const images = getProcessedImages();
    const filtered = images.filter(img => img.id !== imageId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error('Failed to delete processed image', error);
  }
}

/**
 * Clears all processed images
 */
export function clearProcessedImages(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear processed images', error);
  }
}
