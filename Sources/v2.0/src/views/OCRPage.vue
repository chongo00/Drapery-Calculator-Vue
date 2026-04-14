<template>
  <ion-page
    class="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-neutral-900 dark:to-neutral-950"
  >
    <ion-header class="bg-white dark:bg-neutral-950 shadow-lg">
      <ion-toolbar class="bg-transparent">
        <ion-title class="text-2xl font-bold text-gray-800 dark:text-gray-100">
          <span class="title-inline">
            <img :src="appIcon" class="w-7 h-7 rounded" alt="" />
            <span>{{ t.ocr.title }}</span>
          </span>
        </ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding bg-transparent">
      <ion-header collapse="condense" class="bg-white dark:bg-neutral-950">
        <ion-toolbar class="bg-transparent">
          <ion-title
            size="large"
            class="text-xl font-semibold text-gray-700 dark:text-gray-100"
          >
            <span class="title-inline">
              <img :src="appIcon" class="w-7 h-7 rounded" alt="" />
              <span>{{ t.ocr.title }}</span>
            </span>
          </ion-title>
        </ion-toolbar>
      </ion-header>
      <div class="max-w-md mx-auto space-y-4">
        <!-- Error Message -->
        <ion-alert
          v-if="error"
          :is-open="!!error"
          :message="error"
          :buttons="['OK']"
          @didDismiss="error = null"
        ></ion-alert>

        <!-- Loading State (including right after tapping Capture) -->
        <div v-if="isProcessing || isCapturing" class="text-center py-8">
          <ion-spinner></ion-spinner>
          <p class="mt-4 text-gray-600 dark:text-gray-400">
            {{
              processingStep === 'blindsbook'
                ? t.ocr.processingWithBlindsBook
                : processingStep === 'gemini'
                  ? t.ocr.processingWithGemini
                  : processingStep === 'local'
                    ? t.ocr.processingLocal
                    : t.ocr.processing
            }}
          </p>
        </div>

        <!-- No Image State -->
        <div
          v-else-if="!currentImage && !showLiveCamera"
          class="text-center py-8 space-y-4"
        >
          <ion-icon :icon="camera" class="text-6xl text-gray-400"></ion-icon>
          <h2 class="text-xl font-semibold text-gray-700 dark:text-gray-300">
            {{ t.ocr.captureImage }}
          </h2>
          <div class="flex flex-col space-y-3">
            <ion-button expand="block" @click="handleStartLiveCamera">
              <ion-icon :icon="camera"></ion-icon>
              {{ t.ocr.takePhoto }}
            </ion-button>
            <ion-button
              expand="block"
              fill="outline"
              @click="handleSelectFromGallery"
            >
              <ion-icon :icon="images"></ion-icon>
              {{ t.ocr.selectFromGallery }}
            </ion-button>
          </div>
        </div>

        <!-- Live Camera View with Real-time Detection (green frame = detected, red = not) -->
        <div v-else-if="showLiveCamera && !currentImage" class="space-y-4">
          <div
            class="bg-white dark:bg-neutral-800 rounded-lg shadow-lg overflow-hidden relative"
          >
            <video
              ref="liveVideo"
              autoplay
              playsinline
              class="w-full h-auto"
              style="max-height: 60vh; object-fit: contain"
            ></video>
            <canvas
              ref="liveOverlayCanvas"
              class="absolute top-0 left-0 w-full h-auto pointer-events-none"
              style="z-index: 10; max-height: 60vh; object-fit: contain"
            ></canvas>
          </div>

          <!-- Live Detection Status -->
          <ion-card
            v-if="isLiveFrameStable && liveDetectionFrame"
            class="bg-green-50 dark:bg-green-900/20"
          >
            <ion-card-header>
              <ion-card-title class="text-sm">
                {{ t.ocr.frameDetected }}
              </ion-card-title>
            </ion-card-header>
          </ion-card>
          <ion-card
            v-else-if="liveDetectionFrame"
            class="bg-yellow-50 dark:bg-yellow-900/20"
          >
            <ion-card-header>
              <ion-card-title class="text-sm">
                {{ t.ocr.stabilizing }}... ({{ stableFrameCount }}/4)
              </ion-card-title>
            </ion-card-header>
          </ion-card>
          <ion-card
            v-else-if="isLiveMode"
            class="bg-red-50 dark:bg-red-900/20"
          >
            <ion-card-header>
              <ion-card-title class="text-sm">
                {{ t.ocr.noFrameDetected }}
              </ion-card-title>
            </ion-card-header>
          </ion-card>

          <!-- Live Mode Controls -->
          <div class="flex flex-col space-y-2">
            <ion-button
              expand="block"
              color="success"
              :disabled="!isLiveFrameStable || isCapturing"
              @click="handleCaptureFromLive"
            >
              <ion-icon :icon="camera"></ion-icon>
              {{ t.ocr.capture }}
            </ion-button>
            <ion-button
              expand="block"
              fill="outline"
              color="danger"
              @click="handleStopLive"
            >
              {{ t.ocr.cancel }}
            </ion-button>
          </div>
        </div>

        <!-- Image Preview and Results -->
        <div v-else-if="currentImage" class="space-y-4">
          <!-- Image Preview -->
          <div
            class="bg-white dark:bg-neutral-800 rounded-lg shadow-lg overflow-hidden"
          >
            <div class="relative">
              <img
                :src="currentImage.originalUri"
                alt="Captured image"
                class="w-full h-auto"
              />
              <canvas
                ref="overlayCanvas"
                class="absolute top-0 left-0 w-full h-auto pointer-events-none"
                style="z-index: 10"
              ></canvas>
            </div>
          </div>

          <ion-card
            v-if="!currentCalibration && !measurements"
            class="bg-yellow-50 dark:bg-yellow-900/20"
          >
            <ion-card-header>
              <ion-card-title class="text-sm">{{
                t.ocr.calibrationRequired
              }}</ion-card-title>
            </ion-card-header>
            <ion-card-content>
              <ion-button expand="block" @click="showCalibrationModal = true">
                {{ t.ocr.calibrate }}
              </ion-button>
            </ion-card-content>
          </ion-card>

          <!-- Frame Detection Results -->
          <ion-card
            v-if="detectedFrame"
            class="bg-green-50 dark:bg-green-900/20"
          >
            <ion-card-header>
              <ion-card-title class="text-sm">{{
                t.ocr.frameDetected
              }}</ion-card-title>
              <ion-card-subtitle>
                {{ t.ocr.confidence }}:
                {{ Math.round(detectedFrame.confidence * 100) }}%
              </ion-card-subtitle>
            </ion-card-header>
          </ion-card>

         
          <ion-card v-if="measurements" class="bg-blue-50 dark:bg-blue-900/20">
            <ion-card-header>
              <ion-card-title class="text-sm">{{
                measurements.approximate
                  ? t.ocr.approximateMeasurement
                  : t.ocr.measurements
              }}</ion-card-title>
            </ion-card-header>
            <ion-card-content class="space-y-3">
              <div class="flex justify-between">
                <span class="font-medium">{{ t.ocr.width }}:</span>
                <span>{{
                  formatMeasurement(measurements.width, measurements.widthUnit)
                }}</span>
              </div>
              <div class="flex justify-between">
                <span class="font-medium">{{ t.ocr.height }}:</span>
                <span>{{
                  formatMeasurement(
                    measurements.height,
                    measurements.heightUnit
                  )
                }}</span>
              </div>
              <template v-if="measurements.approximate">
                <ion-button
                  expand="block"
                  @click="showCalibrationModal = true"
                  class="mt-4"
                >
                  {{ t.ocr.calibrateForRealMeasurements }}
                </ion-button>
              </template>
              <template v-else>
                <ion-button
                  expand="block"
                  @click="handleUseMeasurements"
                  class="mt-4"
                >
                  {{ t.ocr.useMeasurements }}
                </ion-button>
                <ion-button
                  expand="block"
                  fill="outline"
                  @click="showEditModal = true"
                >
                  {{ t.ocr.editMeasurements }}
                </ion-button>
              </template>
            </ion-card-content>
          </ion-card>

          <!-- Action Buttons -->
          <div class="flex flex-col space-y-2">
            <ion-button expand="block" fill="outline" @click="handleRetake">
              <ion-icon :icon="refresh"></ion-icon>
              {{ t.ocr.retake }}
            </ion-button>
            <ion-button expand="block" fill="outline" @click="handleClear">
              <ion-icon :icon="trash"></ion-icon>
              {{ t.ocr.clear }}
            </ion-button>
            <ion-button
              expand="block"
              fill="outline"
              @click="handleExport"
              v-if="measurements && !measurements.approximate"
            >
              <ion-icon :icon="download"></ion-icon>
              {{ t.ocr.exportResults }}
            </ion-button>
          </div>
        </div>
      </div>

      <!-- Calibration Modal -->
      <ion-modal
        :is-open="showCalibrationModal"
        @didDismiss="showCalibrationModal = false"
      >
        <ion-header>
          <ion-toolbar>
            <ion-title>{{ t.ocr.calibrate }}</ion-title>
            <ion-buttons slot="end">
              <ion-button @click="showCalibrationModal = false">{{
                t.common.close
              }}</ion-button>
            </ion-buttons>
          </ion-toolbar>
        </ion-header>
        <ion-content class="ion-padding">
          <div class="space-y-4">
            <ion-item>
              <ion-label position="stacked">{{
                t.ocr.selectReference
              }}</ion-label>
              <ion-select v-model="selectedReference" interface="action-sheet">
                <ion-select-option
                  v-for="ref in referenceObjects"
                  :key="ref.name"
                  :value="ref"
                >
                  {{ ref.name }} ({{ ref.knownSize }} {{ ref.unit }})
                </ion-select-option>
              </ion-select>
            </ion-item>
            <ion-item v-if="selectedReference">
              <ion-label position="stacked">{{
                t.ocr.markReference
              }}</ion-label>
              <ion-input
                v-model="referencePixelSize"
                type="number"
                placeholder="Size in pixels"
              ></ion-input>
            </ion-item>
            <ion-button
              expand="block"
              :disabled="!selectedReference || !referencePixelSize"
              @click="handleCalibrate"
            >
              {{ t.ocr.calibrate }}
            </ion-button>
          </div>
        </ion-content>
      </ion-modal>

      <!-- Edit Measurements Modal -->
      <ion-modal :is-open="showEditModal" @didDismiss="showEditModal = false">
        <ion-header>
          <ion-toolbar>
            <ion-title>{{ t.ocr.editMeasurements }}</ion-title>
            <ion-buttons slot="end">
              <ion-button @click="showEditModal = false">{{
                t.common.close
              }}</ion-button>
            </ion-buttons>
          </ion-toolbar>
        </ion-header>
        <ion-content class="ion-padding">
          <div class="space-y-4" v-if="measurements">
            <ion-item>
              <ion-label position="stacked"
                >{{ t.ocr.width }} ({{ measurements.widthUnit }})</ion-label
              >
              <ion-input v-model.number="editedWidth" type="number"></ion-input>
            </ion-item>
            <ion-item v-if="measurementSystem.isImperial">
              <ion-label position="stacked">{{
                t.calculator.widthFraction
              }}</ion-label>
              <ion-input
                v-model.number="editedWidthFraction"
                type="number"
                step="0.125"
              ></ion-input>
            </ion-item>
            <ion-item>
              <ion-label position="stacked"
                >{{ t.ocr.height }} ({{ measurements.heightUnit }})</ion-label
              >
              <ion-input
                v-model.number="editedHeight"
                type="number"
              ></ion-input>
            </ion-item>
            <ion-item v-if="measurementSystem.isImperial">
              <ion-label position="stacked">{{
                t.calculator.heightFraction
              }}</ion-label>
              <ion-input
                v-model.number="editedHeightFraction"
                type="number"
                step="0.125"
              ></ion-input>
            </ion-item>
            <ion-button expand="block" @click="handleSaveEdit">
              {{ t.common.close }}
            </ion-button>
          </div>
        </ion-content>
      </ion-modal>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch, nextTick } from "vue";
import { useRouter } from "vue-router";
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonIcon,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonCardContent,
  IonSpinner,
  IonModal,
  IonButtons,
  IonItem,
  IonLabel,
  IonInput,
  IonSelect,
  IonSelectOption,
  IonAlert,
} from "@ionic/vue";
import { camera, images, refresh, trash, download } from "ionicons/icons";
import appIcon from "../../icons/icon-128.webp";
import { useOCR } from "@/composables/useOCR";
import { useI18n } from "@/composables/useI18n";
import { useMeasurementSystem } from "@/composables/useMeasurementSystem";
import { useCalibration } from "@/composables/useCalibration";
import { drawRectangle } from "@/services/imageProcessor";
import { shareResults } from "@/services/exportService";
import { formatMeasurement as formatMeasurementUtil } from "@/utils/measurementUtils";
import type { CalibrationReference } from "@/types/ocr";

const router = useRouter();
const { t } = useI18n();
const measurementSystem = useMeasurementSystem();
const { createCalibration } = useCalibration();

const {
  currentImage,
  detectedFrame,
  measurements,
  isProcessing,
  processingStep,
  error,
  currentCalibration,
  referenceObjects,
  isLiveMode,
  liveDetectionFrame,
  isLiveFrameStable,
  stableFrameCount,
  lastStableFrame,
  liveDetectionImageSize,
  selectFromGallery,
  processImage,
  setCalibration,
  updateMeasurements,
  clear: clearOCR,
  getFormData,
  requestCameraPermission,
  startLiveDetection,
  stopLiveDetection,
  captureFromLiveStream,
  applyLiveCapture,
  cleanup,
} = useOCR();

const overlayCanvas = ref<HTMLCanvasElement | null>(null);
const liveVideo = ref<HTMLVideoElement | null>(null);
const liveOverlayCanvas = ref<HTMLCanvasElement | null>(null);
const showLiveCamera = ref(false);
const isCapturing = ref(false);
const showCalibrationModal = ref(false);
const showEditModal = ref(false);
const selectedReference = ref<CalibrationReference | null>(null);
const referencePixelSize = ref<number | null>(null);
const editedWidth = ref<number>(0);
const editedWidthFraction = ref<number>(0);
const editedHeight = ref<number>(0);
const editedHeightFraction = ref<number>(0);

const handleStartLiveCamera = async () => {
  const allowed = await requestCameraPermission();
  if (!allowed) {
    return; // error set by useOCR
  }
  showLiveCamera.value = true;
};

const handleStopLive = () => {
  stopLiveDetection();
  showLiveCamera.value = false;
};

const handleCaptureFromLive = async () => {
  if (!liveVideo.value) return;
  if (!isLiveFrameStable.value || !lastStableFrame.value) return;
  isCapturing.value = true;
  try {
    const vw = liveVideo.value.videoWidth;
    const vh = liveVideo.value.videoHeight;
    const dataUrl = await captureFromLiveStream(liveVideo.value);
    showLiveCamera.value = false;
    await nextTick();
    if (dataUrl) {
      // Apply using the already detected live frame + AR (no re-detection)
      await applyLiveCapture(dataUrl, lastStableFrame.value, vw, vh);
    }
  } finally {
    isCapturing.value = false;
  }
};

const handleSelectFromGallery = async () => {
  await selectFromGallery();
};

const handleCalibrate = () => {
  if (!selectedReference.value || !referencePixelSize.value) return;

  const calibration = createCalibration(
    selectedReference.value,
    referencePixelSize.value
  );
  setCalibration(calibration);
  showCalibrationModal.value = false;

  // If there's an image, reprocess with the new calibration
  if (currentImage.value) {
    processImage(currentImage.value.originalUri);
  }
};

const handleRetake = () => {
  clearOCR();
};

const handleClear = () => {
  clearOCR();
};

const handleUseMeasurements = () => {
  const formData = getFormData();
  if (!formData) return;

 
  router.push({
    path: "/tabs/tab1",
    query: {
      width: formData.width,
      widthFraction: formData.widthFraction,
      height: formData.height,
      heightFraction: formData.heightFraction,
    },
  });
};

const handleSaveEdit = () => {
  if (!measurements.value) return;

  const updated: typeof measurements.value = {
    ...measurements.value,
    width: editedWidth.value,
    height: editedHeight.value,
    widthFraction: measurementSystem.isImperial.value
      ? editedWidthFraction.value
      : undefined,
    heightFraction: measurementSystem.isImperial.value
      ? editedHeightFraction.value
      : undefined,
    source: "manual",
  };

  updateMeasurements(updated);
  showEditModal.value = false;
};

const handleExport = async () => {
  if (!currentImage.value || !measurements.value) return;

  try {
    await shareResults(currentImage.value.originalUri, measurements.value);
  } catch (error) {
    console.error("Export error", error);
  }
};

const formatMeasurement = (value: number, unit: string): string => {
  if (unit === 'px') return `${Math.round(value)} px`;
  return formatMeasurementUtil(value, unit as 'inches' | 'cm', unit === 'inches');
};

// Watch to update edited values when measurements change
watch(
  measurements,
  (newMeasurements) => {
    if (newMeasurements) {
      editedWidth.value = newMeasurements.width;
      editedHeight.value = newMeasurements.height;
      editedWidthFraction.value = newMeasurements.widthFraction || 0;
      editedHeightFraction.value = newMeasurements.heightFraction || 0;
    }
  },
  { immediate: true }
);

// Watch to draw overlay when a frame is detected
watch([detectedFrame, currentImage], async () => {
  if (detectedFrame.value && currentImage.value && overlayCanvas.value) {
    await nextTick();
    const canvas = overlayCanvas.value;
    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      if (ctx && detectedFrame.value) {
        drawRectangle(ctx, detectedFrame.value.rectangle, "#00ff00", 3);
      }
    };
    img.src = currentImage.value.originalUri;
  }
});

// When user opens live camera, start the stream once the video element is in the DOM
watch(showLiveCamera, async (val) => {
  if (!val) return;
  await nextTick();
  if (liveVideo.value) {
    await startLiveDetection(liveVideo.value);
  }
});

// Watch to draw overlay on live video: green frame scaled to video (Face ID style), red when not
watch(
  [liveDetectionFrame, liveDetectionImageSize, liveVideo, liveOverlayCanvas],
  async () => {
    if (
      !liveOverlayCanvas.value ||
      !liveVideo.value ||
      !liveVideo.value.videoWidth
    ) {
      return;
    }
    await nextTick();
    const canvas = liveOverlayCanvas.value;
    const video = liveVideo.value;
    const vw = video.videoWidth;
    const vh = video.videoHeight;
    canvas.width = vw;
    canvas.height = vh;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const frame = liveDetectionFrame.value;
    const detSize = liveDetectionImageSize.value;

    if (frame && detSize && detSize.width > 0 && detSize.height > 0) {
      const scaleX = vw / detSize.width;
      const scaleY = vh / detSize.height;
      const r = frame.rectangle;
      const scaled = {
        topLeft: { x: r.topLeft.x * scaleX, y: r.topLeft.y * scaleY },
        topRight: { x: r.topRight.x * scaleX, y: r.topRight.y * scaleY },
        bottomLeft: { x: r.bottomLeft.x * scaleX, y: r.bottomLeft.y * scaleY },
        bottomRight: {
          x: r.bottomRight.x * scaleX,
          y: r.bottomRight.y * scaleY,
        },
        width: r.width * scaleX,
        height: r.height * scaleY,
      };
      drawRectangle(ctx, scaled, "#00ff00", 3);
    } else {
      const pad = 0.12;
      const x = canvas.width * pad;
      const y = canvas.height * pad;
      const w = canvas.width * (1 - 2 * pad);
      const h = canvas.height * (1 - 2 * pad);
      ctx.strokeStyle = "rgba(200, 200, 200, 0.7)";
      ctx.lineWidth = 2;
      ctx.setLineDash([8, 6]);
      ctx.strokeRect(x, y, w, h);
      ctx.setLineDash([]);
    }
   
  }
);

onMounted(() => {
  // Initialization if needed
});

onBeforeUnmount(() => {
  stopLiveDetection();
  cleanup();
});
</script>

<style scoped>
canvas {
  image-rendering: pixelated;
}
</style>
