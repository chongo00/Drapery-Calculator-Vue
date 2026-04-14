// Main composable for OCR functionality

import { ref, computed, nextTick } from 'vue';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
// Tesseract.js is loaded dynamically to avoid loading issues
let Tesseract: any = null;
import type { ProcessedImage, MeasurementResult, WindowFrame, CalibrationData } from '@/types/ocr';
import { useCalibration } from './useCalibration';
import { useOCRSettings } from './useOCRSettings';
import { useMeasurementSystem } from './useMeasurementSystem';
import { detectPrimaryWindowFrame } from '@/services/windowFrameDetector';
import { detectWindowFrameWithBlindsBook } from '@/services/blindsbookWindowDetector';
import { detectWindowFrameWithGemini } from '@/services/geminiWindowDetector';
import { detectWindowFrameWithAzureBackend } from '@/services/azureVisionBackendClient';
import { loadImageData, resizeImage, imageDataToBase64, prepareImageForOCR } from '@/services/imageProcessor';
import { pixelsToUnits, validateMeasurement, inchesToFraction, calculateRectangleDimensions } from '@/utils/measurementUtils';
import { saveProcessedImage as saveImageToStorage } from '@/services/imageStorageService';
import { ARMeasure } from '@blindsbook/ar-measure';

type BBox = { x: number; y: number; width: number; height: number };

function rectToBBox(frame: WindowFrame): BBox {
  const r = frame.rectangle;
  const x = Math.min(r.topLeft.x, r.bottomLeft.x, r.topRight.x, r.bottomRight.x);
  const y = Math.min(r.topLeft.y, r.topRight.y, r.bottomLeft.y, r.bottomRight.y);
  const maxX = Math.max(r.topLeft.x, r.bottomLeft.x, r.topRight.x, r.bottomRight.x);
  const maxY = Math.max(r.topLeft.y, r.topRight.y, r.bottomLeft.y, r.bottomRight.y);
  return { x, y, width: Math.max(1, maxX - x), height: Math.max(1, maxY - y) };
}

function iou(a: BBox, b: BBox): number {
  const x1 = Math.max(a.x, b.x);
  const y1 = Math.max(a.y, b.y);
  const x2 = Math.min(a.x + a.width, b.x + b.width);
  const y2 = Math.min(a.y + a.height, b.y + b.height);
  const interW = Math.max(0, x2 - x1);
  const interH = Math.max(0, y2 - y1);
  const inter = interW * interH;
  const union = a.width * a.height + b.width * b.height - inter;
  return union <= 0 ? 0 : inter / union;
}

function estimateSizeFromAR(
  bboxPx: { width: number; height: number },
  ar: { distanceMeters: number; fx: number; fy: number }
): { widthCm: number; heightCm: number } {
  // Pinhole approximation: sizeMeters ~= pixels * distance / focalLengthPx
  const widthM = (bboxPx.width * ar.distanceMeters) / ar.fx;
  const heightM = (bboxPx.height * ar.distanceMeters) / ar.fy;
  return {
    widthCm: Math.round(widthM * 1000) / 10, // 0.1 cm
    heightCm: Math.round(heightM * 1000) / 10,
  };
}

export function useOCR() {
  const { currentCalibration, setCurrentCalibration, referenceObjects } = useCalibration();
  const { settings } = useOCRSettings();
  const measurementSystem = useMeasurementSystem();

  const currentImage = ref<ProcessedImage | null>(null);
  const detectedFrame = ref<WindowFrame | null>(null);
  const measurements = ref<MeasurementResult | null>(null);
  const isProcessing = ref(false);
  /** Current detection step for loading message: 'blindsbook' | 'gemini' | 'local' | null */
  const processingStep = ref<'blindsbook' | 'gemini' | 'local' | null>(null);
  const error = ref<string | null>(null);
  const ocrWorker = ref<any>(null);
  const liveStream = ref<MediaStream | null>(null);
  const isLiveMode = ref(false);
  const liveDetectionFrame = ref<WindowFrame | null>(null);
  /** Size of the image detection ran on (for scaling overlay to video) */
  const liveDetectionImageSize = ref<{ width: number; height: number } | null>(null);

  // Stability: enable Capture only when bbox is stable for N consecutive detections
  const isLiveFrameStable = ref(false);
  const stableFrameCount = ref(0);
  const lastStableFrame = ref<WindowFrame | null>(null);
  const lastStableBBox = ref<BBox | null>(null);

  const STABLE_MIN_FRAMES = 4; // ~ 4 * 400ms = 1.6s default
  const STABLE_IOU_THRESHOLD = 0.85;

  /**
   * Initializes Tesseract worker for OCR
   */
  const initializeOCR = async (): Promise<void> => {
    if (ocrWorker.value) return;

    try {
      // Load Tesseract dynamically
      if (!Tesseract) {
        Tesseract = await import('tesseract.js');
      }

      const worker = await Tesseract.createWorker('eng', 1, {
        logger: (m: any) => {
          if (m.status === 'recognizing text') {
            // Optional: show progress
          }
        }
      });
      ocrWorker.value = worker;
    } catch (err) {
      console.error('Failed to initialize OCR worker', err);
      // Don't throw error, just continue without OCR
      ocrWorker.value = null;
    }
  };

  /**
   * Captures an image from the camera (native camera with OS permission prompt)
   */
  const captureFromCamera = async (): Promise<void> => {
    try {
      error.value = null;

      // Request camera permission so the OS shows the permission dialog on Android/iOS
      const status = await Camera.requestPermissions({ permissions: ['camera'] });
      if (status.camera !== 'granted' && status.camera !== 'limited') {
        error.value = 'Se requiere permiso de cámara para tomar fotos.';
        return;
      }

      const photo = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.Uri,
        source: CameraSource.Camera
      });

      if (photo.webPath) {
        await processImage(photo.webPath);
      }
    } catch (err: any) {
      error.value = err.message || 'Error capturing image';
      console.error('Camera error', err);
    }
  };

  /**
   * Selects an image from the gallery
   */
  const selectFromGallery = async (): Promise<void> => {
    try {
      error.value = null;
      const photo = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.Uri,
        source: CameraSource.Photos
      });

      if (photo.webPath) {
        await processImage(photo.webPath);
      }
    } catch (err: any) {
      error.value = err.message || 'Error selecting image';
      console.error('Gallery error', err);
    }
  };

  /**
   * Processes an image: detects frame and extracts measurements
   */
  const processImage = async (imageUri: string): Promise<void> => {
    isProcessing.value = true;
    error.value = null;

    try {
      
      const loaded = await loadImageData(imageUri);
      const imageData = resizeImage(loaded, 1024, 1024);

     
      const colorDataUrl = imageDataToBase64(imageData);
      let frame: WindowFrame | null = null;

      processingStep.value = 'blindsbook';
      await nextTick();
      frame = await detectWindowFrameWithBlindsBook(colorDataUrl, imageData.width, imageData.height);

      if (!frame) {
        processingStep.value = 'gemini';
        await nextTick();
        frame = await detectWindowFrameWithGemini(colorDataUrl, imageData.width, imageData.height);
      }
      if (!frame) {
        processingStep.value = 'local';
        await nextTick();
        frame = await detectPrimaryWindowFrame(imageData);
      }
      processingStep.value = null;

      if (!frame) {
        error.value = 'No window frame detected in the image';
        isProcessing.value = false;
        return;
      }

      detectedFrame.value = frame;

      // Calculate measurements: with calibration = real units; without = approximate (pixels)
      let calculatedMeasurements: MeasurementResult | null = null;
      const rect = frame.rectangle;
      const { width: widthPixels, height: heightPixels } = calculateRectangleDimensions(rect);

      if (currentCalibration.value) {
        const unit = measurementSystem.isImperial.value ? 'inches' : 'cm';
        const width = pixelsToUnits(widthPixels, currentCalibration.value, unit);
        const height = pixelsToUnits(heightPixels, currentCalibration.value, unit);

        // Validate measurements
        const validation = validateMeasurement(width, height, unit);
        if (!validation.valid) {
          error.value = validation.errors.join(', ');
        }

        // Convert to format according to system
        if (measurementSystem.isImperial.value) {
          const widthParts = inchesToFraction(width);
          const heightParts = inchesToFraction(height);
          calculatedMeasurements = {
            width: widthParts.whole,
            height: heightParts.whole,
            widthUnit: 'inches',
            heightUnit: 'inches',
            widthFraction: widthParts.fraction,
            heightFraction: heightParts.fraction,
            confidence: frame.confidence,
            source: 'detection',
            calibrationId: currentCalibration.value.reference.type
          };
        } else {
          calculatedMeasurements = {
            width,
            height,
            widthUnit: 'cm',
            heightUnit: 'cm',
            confidence: frame.confidence,
            source: 'detection',
            calibrationId: currentCalibration.value.reference.type
          };
        }
      } else {
        // Medición aproximada: se asume que el lado largo del rectángulo = longerSideCm (p. ej. 280 cm).
        // Ajustable en Configuración > OCR > "Asumir lado largo (medida aprox.)". Para medidas reales, calibrar.
        const longerSideCm = settings.approximateScaleLongerSideCm ?? 280;
        const longerSidePx = Math.max(widthPixels, heightPixels);
        const scaleCmPerPx = longerSidePx > 0 ? longerSideCm / longerSidePx : 0;
        const widthCm = widthPixels * scaleCmPerPx;
        const heightCm = heightPixels * scaleCmPerPx;

        if (measurementSystem.isImperial.value) {
          const widthInches = widthCm / 2.54;
          const heightInches = heightCm / 2.54;
          const widthParts = inchesToFraction(widthInches);
          const heightParts = inchesToFraction(heightInches);
          calculatedMeasurements = {
            width: widthParts.whole,
            height: heightParts.whole,
            widthUnit: 'inches',
            heightUnit: 'inches',
            widthFraction: widthParts.fraction,
            heightFraction: heightParts.fraction,
            confidence: frame.confidence,
            source: 'detection',
            approximate: true
          };
        } else {
          calculatedMeasurements = {
            width: Math.round(widthCm * 10) / 10,
            height: Math.round(heightCm * 10) / 10,
            widthUnit: 'cm',
            heightUnit: 'cm',
            confidence: frame.confidence,
            source: 'detection',
            approximate: true
          };
        }
      }

      // Mostrar resultado de marco y mediciones de inmediato (evita esperar ~2 min por Tesseract OCR)
      const processedImage: ProcessedImage = {
        id: `img_${Date.now()}`,
        originalUri: colorDataUrl,
        windowFrame: frame,
        measurements: calculatedMeasurements || undefined,
        calibration: currentCalibration.value || undefined,
        ocrResults: undefined,
        metadata: {
          capturedAt: new Date(),
          processedAt: new Date(),
          width: imageData.width,
          height: imageData.height,
          fileSize: 0
        }
      };

      currentImage.value = processedImage;
      measurements.value = calculatedMeasurements;

      if (calculatedMeasurements) {
        try {
          const HISTORY_KEY = 'calculationHistory';
          const MAX_HISTORY = 50;
          const m = calculatedMeasurements;
          const raw = typeof localStorage !== 'undefined' ? localStorage.getItem(HISTORY_KEY) : null;
          const history = raw ? JSON.parse(raw) : [];
          const cameraEntry = {
            source: 'camera' as const,
            approximate: !!m.approximate,
            width: m.width.toString(),
            widthFraction: (m.widthUnit === 'inches' ? m.widthFraction?.toString() : undefined) ?? '0',
            height: m.height.toString(),
            heightFraction: (m.heightUnit === 'inches' ? m.heightFraction?.toString() : undefined) ?? '0',
            widthUnit: m.widthUnit,
            heightUnit: m.heightUnit,
            timestamp: new Date().toISOString(),
            requiredFabric: 0,
            fabricWidths: 0,
            fabricCuts: 0,
            fabricCutsFraction: '',
            fabricCutLength: 0,
            requiredSnaps: 0,
            productType: '',
            fabricOrientation: 'Regular',
            fullness: '',
            hem: 0,
            easeAllowance: 0
          };
          history.unshift(cameraEntry);
          if (typeof localStorage !== 'undefined') {
            localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, MAX_HISTORY)));
          }
        } catch (e) {
          console.warn('Failed to save camera measurement to history', e);
        }
      }

      if (settings.saveProcessedImages) {
        saveImageToStorage(processedImage);
      }

      // OCR (Tesseract) en segundo plano: puede tardar 1–2 min; no bloquea la UI
      initializeOCR().then(() => {
        if (!ocrWorker.value) return;
        ocrWorker.value.recognize(colorDataUrl).then(({ data }: { data: { text?: string; confidence?: number } }) => {
          if (data?.text && currentImage.value?.id === processedImage.id) {
            currentImage.value = {
              ...currentImage.value,
              ocrResults: [{ text: data.text, confidence: data.confidence || 0 }]
            };
          }
        }).catch((ocrErr: unknown) => {
          console.warn('OCR failed', ocrErr);
        });
      });

    } catch (err: any) {
      error.value = err.message || 'Error processing image';
      console.error('Processing error', err);
    } finally {
      isProcessing.value = false;
      processingStep.value = null;
    }
  };

  /**
   * Sets a manual calibration
   */
  const setCalibration = (calibration: CalibrationData): void => {
    setCurrentCalibration(calibration);
  };

  /**
   * Updates measurements manually
   */
  const updateMeasurements = (newMeasurements: MeasurementResult): void => {
    measurements.value = newMeasurements;
    if (currentImage.value) {
      currentImage.value.measurements = newMeasurements;
    }
  };

  /**
   * Updates the detected frame manually
   */
  const updateFrame = (frame: WindowFrame): void => {
    detectedFrame.value = frame;
    if (currentImage.value) {
      currentImage.value.windowFrame = frame;
    }
  };

  /**
   * Clears the current state
   */
  const clear = (): void => {
    currentImage.value = null;
    detectedFrame.value = null;
    measurements.value = null;
    error.value = null;
  };

  /**
   * Saves the processed image
   */
  const saveProcessedImage = async (): Promise<string | null> => {
    if (!currentImage.value || !settings.saveProcessedImages) {
      return null;
    }

    try {
      // In a real implementation, you would save the image to the file system
      // For now, we return the original URI
      return currentImage.value.originalUri;
    } catch (err) {
      console.error('Failed to save image', err);
      return null;
    }
  };

  /**
   * Gets data to pre-fill the form
   */
  const getFormData = (): { width: string; widthFraction: string; height: string; heightFraction: string } | null => {
    if (!measurements.value || measurements.value.approximate) return null;

    const width = measurements.value.width.toString();
    const height = measurements.value.height.toString();
    const widthFraction = measurements.value.widthFraction?.toString() || '0';
    const heightFraction = measurements.value.heightFraction?.toString() || '0';

    return {
      width,
      widthFraction,
      height,
      heightFraction
    };
  };

  /**
   * Request camera permission (for live view or native camera). Call before starting live stream on device.
   */
  const requestCameraPermission = async (): Promise<boolean> => {
    const status = await Camera.requestPermissions({ permissions: ['camera'] });
    return status.camera === 'granted' || status.camera === 'limited';
  };

  /**
   * Starts live camera stream with real-time frame detection (shows green/red overlay before capture)
   */
  const startLiveDetection = async (videoElement: HTMLVideoElement): Promise<void> => {
    try {
      error.value = null;

      const allowed = await requestCameraPermission();
      if (!allowed) {
        error.value = 'Se requiere permiso de cámara para la vista en vivo.';
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment', // Use back camera on mobile
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });

      liveStream.value = stream;
      videoElement.srcObject = stream;
      isLiveMode.value = true;

      // Start AR (best-effort). If unavailable, we still show boxes but measurements may be approximate.
      try { await ARMeasure.start(); } catch { /* ignore */ }

      // Backend detection (Azure Vision) on interval; each cycle updates overlay (green when window detected).
      const LIVE_DETECT_MAX = 320; // smaller = faster, UI stays responsive
      const DETECT_INTERVAL_MS = 400;

      const detectLoop = () => {
        if (!isLiveMode.value || !videoElement.videoWidth) return;

        const vw = videoElement.videoWidth;
        const vh = videoElement.videoHeight;
        let dw = vw;
        let dh = vh;
        if (vw > LIVE_DETECT_MAX || vh > LIVE_DETECT_MAX) {
          if (vw >= vh) {
            dw = LIVE_DETECT_MAX;
            dh = Math.round((vh * LIVE_DETECT_MAX) / vw);
          } else {
            dh = LIVE_DETECT_MAX;
            dw = Math.round((vw * LIVE_DETECT_MAX) / vh);
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = dw;
        canvas.height = dh;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          if (isLiveMode.value) setTimeout(detectLoop, DETECT_INTERVAL_MS);
          return;
        }

        ctx.drawImage(videoElement, 0, 0, vw, vh, 0, 0, dw, dh);
        const imageDataUrl = canvas.toDataURL('image/jpeg', 0.75);

        // Yield so UI can process taps; then call backend and update overlay
        setTimeout(async () => {
          if (!isLiveMode.value) return;
          try {
            // Azure Vision backend (preferred). Fallback to BlindsBook/Gemini/local if backend not configured.
            let frame: WindowFrame | null = await detectWindowFrameWithAzureBackend(imageDataUrl, dw, dh, ['window']);
            if (!frame) frame = await detectWindowFrameWithBlindsBook(imageDataUrl, dw, dh);
            if (!frame) frame = await detectWindowFrameWithGemini(imageDataUrl, dw, dh);
            if (!frame) {
              const processed = await prepareImageForOCR(imageDataUrl);
              frame = await detectPrimaryWindowFrame(processed);
              if (!isLiveMode.value) return;
              liveDetectionImageSize.value = { width: processed.width, height: processed.height };
            } else {
              liveDetectionImageSize.value = { width: dw, height: dh };
            }
            if (!isLiveMode.value) return;
            liveDetectionFrame.value = frame; // verde si detectado, rojo si null

            // Update stability tracker
            if (frame) {
              const bb = rectToBBox(frame);
              if (lastStableBBox.value && iou(bb, lastStableBBox.value) >= STABLE_IOU_THRESHOLD) {
                stableFrameCount.value += 1;
              } else {
                stableFrameCount.value = 1;
              }
              lastStableBBox.value = bb;
              lastStableFrame.value = frame;
              isLiveFrameStable.value = stableFrameCount.value >= STABLE_MIN_FRAMES;
            } else {
              stableFrameCount.value = 0;
              lastStableBBox.value = null;
              lastStableFrame.value = null;
              isLiveFrameStable.value = false;
            }
          } catch (err) {
            console.error('Detection error', err);
          }
          if (isLiveMode.value) setTimeout(detectLoop, DETECT_INTERVAL_MS);
        }, 0);
      };

      videoElement.onloadedmetadata = () => {
        detectLoop();
      };
    } catch (err: any) {
      error.value = err.message || 'Error accessing camera';
      console.error('Camera access error', err);
      isLiveMode.value = false;
    }
  };

  /**
   * Stops live camera stream
   */
  const stopLiveDetection = (): void => {
    isLiveMode.value = false;
    if (liveStream.value) {
      liveStream.value.getTracks().forEach(track => track.stop());
      liveStream.value = null;
    }
    liveDetectionFrame.value = null;
    liveDetectionImageSize.value = null;
    stableFrameCount.value = 0;
    lastStableBBox.value = null;
    lastStableFrame.value = null;
    isLiveFrameStable.value = false;
    // Stop AR session
    try { ARMeasure.stop(); } catch { /* ignore */ }
  };

  /**
   * Captures current frame from live stream and stops the stream.
   * Returns the image data URL so the UI can close the live view first, then process.
   */
  const captureFromLiveStream = async (videoElement: HTMLVideoElement): Promise<string | null> => {
    try {
      if (!videoElement.videoWidth) {
        error.value = 'Video not ready';
        return null;
      }

      const canvas = document.createElement('canvas');
      canvas.width = videoElement.videoWidth;
      canvas.height = videoElement.videoHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) return null;

      ctx.drawImage(videoElement, 0, 0);
      const imageDataUrl = canvas.toDataURL('image/jpeg', 0.9);

      stopLiveDetection();
      return imageDataUrl;
    } catch (err: any) {
      error.value = err.message || 'Error capturing frame';
      console.error('Capture error', err);
      return null;
    }
  };

  /**
   * Applies a live capture result using the already detected live frame + AR distance.
   * This avoids re-detecting the frame again after capture.
   */
  const applyLiveCapture = async (
    imageDataUrl: string,
    frame: WindowFrame,
    imageWidth: number,
    imageHeight: number
  ): Promise<void> => {
    detectedFrame.value = frame;

    const rect = frame.rectangle;
    const { width: widthPx, height: heightPx } = calculateRectangleDimensions(rect);

    let calculatedMeasurements: MeasurementResult | null = null;

    // Prefer AR measurement (real) when tracking + intrinsics are available
    try {
      const ar = await ARMeasure.getCenterRaycastDistance();
      if (
        ar.trackingState === 'tracking' &&
        typeof ar.distanceMeters === 'number' &&
        typeof ar.fx === 'number' &&
        typeof ar.fy === 'number' &&
        ar.distanceMeters > 0 &&
        ar.fx > 0 &&
        ar.fy > 0
      ) {
        const size = estimateSizeFromAR(
          { width: widthPx, height: heightPx },
          { distanceMeters: ar.distanceMeters, fx: ar.fx, fy: ar.fy }
        );

        if (measurementSystem.isImperial.value) {
          const widthInches = size.widthCm / 2.54;
          const heightInches = size.heightCm / 2.54;
          const widthParts = inchesToFraction(widthInches);
          const heightParts = inchesToFraction(heightInches);
          calculatedMeasurements = {
            width: widthParts.whole,
            height: heightParts.whole,
            widthUnit: 'inches',
            heightUnit: 'inches',
            widthFraction: widthParts.fraction,
            heightFraction: heightParts.fraction,
            confidence: frame.confidence,
            source: 'detection',
          };
        } else {
          calculatedMeasurements = {
            width: size.widthCm,
            height: size.heightCm,
            widthUnit: 'cm',
            heightUnit: 'cm',
            confidence: frame.confidence,
            source: 'detection',
          };
        }
      }
    } catch {
      // ignore; fall back below
    }

    // Fallback: approximate using configured "longer side" scaling
    if (!calculatedMeasurements) {
      const longerSideCm = settings.approximateScaleLongerSideCm ?? 280;
      const longerSidePx = Math.max(widthPx, heightPx);
      const scaleCmPerPx = longerSidePx > 0 ? longerSideCm / longerSidePx : 0;
      const widthCm = widthPx * scaleCmPerPx;
      const heightCm = heightPx * scaleCmPerPx;

      if (measurementSystem.isImperial.value) {
        const widthInches = widthCm / 2.54;
        const heightInches = heightCm / 2.54;
        const widthParts = inchesToFraction(widthInches);
        const heightParts = inchesToFraction(heightInches);
        calculatedMeasurements = {
          width: widthParts.whole,
          height: heightParts.whole,
          widthUnit: 'inches',
          heightUnit: 'inches',
          widthFraction: widthParts.fraction,
          heightFraction: heightParts.fraction,
          confidence: frame.confidence,
          source: 'detection',
          approximate: true,
        };
      } else {
        calculatedMeasurements = {
          width: Math.round(widthCm * 10) / 10,
          height: Math.round(heightCm * 10) / 10,
          widthUnit: 'cm',
          heightUnit: 'cm',
          confidence: frame.confidence,
          source: 'detection',
          approximate: true,
        };
      }
    }

    const processedImage: ProcessedImage = {
      id: `img_${Date.now()}`,
      originalUri: imageDataUrl,
      windowFrame: frame,
      measurements: calculatedMeasurements || undefined,
      calibration: currentCalibration.value || undefined,
      ocrResults: undefined,
      metadata: {
        capturedAt: new Date(),
        processedAt: new Date(),
        width: imageWidth,
        height: imageHeight,
        fileSize: 0,
      },
    };

    currentImage.value = processedImage;
    measurements.value = calculatedMeasurements;

    // Save to history (same shape used elsewhere)
    if (calculatedMeasurements) {
      try {
        const HISTORY_KEY = 'calculationHistory';
        const MAX_HISTORY = 50;
        const m = calculatedMeasurements;
        const raw = typeof localStorage !== 'undefined' ? localStorage.getItem(HISTORY_KEY) : null;
        const history = raw ? JSON.parse(raw) : [];
        const cameraEntry = {
          source: 'camera' as const,
          approximate: !!m.approximate,
          width: m.width.toString(),
          widthFraction: (m.widthUnit === 'inches' ? m.widthFraction?.toString() : undefined) ?? '0',
          height: m.height.toString(),
          heightFraction: (m.heightUnit === 'inches' ? m.heightFraction?.toString() : undefined) ?? '0',
          widthUnit: m.widthUnit,
          heightUnit: m.heightUnit,
          timestamp: new Date().toISOString(),
          requiredFabric: 0,
          fabricWidths: 0,
          fabricCuts: 0,
          fabricCutsFraction: '',
          fabricCutLength: 0,
          requiredSnaps: 0,
          productType: '',
          fabricOrientation: 'Regular',
          fullness: '',
          hem: 0,
          easeAllowance: 0,
        };
        history.unshift(cameraEntry);
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, MAX_HISTORY)));
        }
      } catch { /* ignore */ }
    }
  };

  /**
   * Cleans up the OCR worker and live stream
   */
  const cleanup = async (): Promise<void> => {
    stopLiveDetection();
    if (ocrWorker.value) {
      await ocrWorker.value.terminate();
      ocrWorker.value = null;
    }
  };

  return {
    currentImage: computed(() => currentImage.value),
    detectedFrame: computed(() => detectedFrame.value),
    measurements: computed(() => measurements.value),
    isProcessing: computed(() => isProcessing.value),
    processingStep: computed(() => processingStep.value),
    error: computed(() => error.value),
    currentCalibration: computed(() => currentCalibration.value),
    referenceObjects,
    liveStream: computed(() => liveStream.value),
    isLiveMode: computed(() => isLiveMode.value),
    liveDetectionFrame: computed(() => liveDetectionFrame.value),
    liveDetectionImageSize: computed(() => liveDetectionImageSize.value),
    isLiveFrameStable: computed(() => isLiveFrameStable.value),
    stableFrameCount: computed(() => stableFrameCount.value),
    lastStableFrame: computed(() => lastStableFrame.value),
    captureFromCamera,
    selectFromGallery,
    processImage,
    setCalibration,
    updateMeasurements,
    updateFrame,
    clear,
    saveProcessedImage,
    getFormData,
    requestCameraPermission,
    startLiveDetection,
    stopLiveDetection,
    captureFromLiveStream,
    applyLiveCapture,
    cleanup
  };
}
