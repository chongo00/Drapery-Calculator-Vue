<template>
  <ion-header class="bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-800 dark:to-indigo-900">
    <ion-toolbar class="bg-transparent">
      <ion-title class="text-gray-900 dark:text-white font-bold text-xl">{{ t.results.title }}</ion-title>
      <ion-buttons slot="end">
        <ion-button @click="copyResults" class="text-gray-900 dark:text-white" fill="clear">
          <ion-icon :icon="copyOutline"></ion-icon>
        </ion-button>
        <ion-button @click="closeModal" class="text-gray-900 dark:text-white" fill="clear">
          <ion-icon :icon="closeOutline"></ion-icon>
        </ion-button>
      </ion-buttons>
    </ion-toolbar>
  </ion-header>
  <ion-content class="ion-padding bg-gray-50 dark:bg-neutral-900" :scroll-y="true">
    <div v-if="copied" class="mb-4 p-3 bg-green-100 dark:bg-green-900/30 border border-green-400 dark:border-green-700 text-green-700 dark:text-green-200 rounded-lg text-center animate-pulse">
      {{ t.results.resultsCopied }}
    </div>
    <div class="max-w-md mx-auto space-y-4 animate-fade-in pb-4">
      <div class="bg-white dark:bg-neutral-800 rounded-xl shadow-lg p-4 sm:p-6 border-l-4 border-blue-600 hover:shadow-xl transition-shadow duration-300">
        <h2 class="text-xl sm:text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4 flex items-center gap-2">
          <ion-icon :icon="cutOutline" class="text-blue-600 flex-shrink-0"></ion-icon>
          <span class="break-words">{{ t.results.requiredFabric }}</span>
        </h2>
        <div class="text-center py-4 sm:py-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg border-2 border-blue-200 dark:border-blue-700 mb-4">
          <p class="text-4xl sm:text-5xl font-extrabold text-blue-600 dark:text-blue-400 animate-scale-in break-words">{{ result.requiredFabric }}</p>
          <p class="text-lg sm:text-xl text-gray-600 dark:text-gray-300 mt-2">{{ t.results.yards }}</p>
        </div>
        <div class="space-y-2 sm:space-y-3">
          <div class="flex flex-row items-center justify-between py-2 sm:py-2.5 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-neutral-700 px-2 rounded transition-colors gap-x-2">
            <span class="text-gray-600 dark:text-gray-400 font-medium text-sm sm:text-base min-w-fit flex-shrink-0">{{ t.results.dimensions }}</span>
            <span class="text-gray-800 dark:text-gray-100 font-semibold text-sm sm:text-base text-right break-words">{{ result.width }}{{ result.widthFraction ? ' ' + result.widthFraction : '' }} {{ result.widthUnit || 'in' }} × {{ result.height }}{{ result.heightFraction ? ' ' + result.heightFraction : '' }} {{ result.heightUnit || 'in' }}</span>
          </div>
          <div class="flex flex-row items-center justify-between py-2 sm:py-2.5 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-neutral-700 px-2 rounded transition-colors gap-x-2">
            <span class="text-gray-600 dark:text-gray-400 font-medium text-sm sm:text-base min-w-fit flex-shrink-0">{{ t.results.productType }}</span>
            <span class="text-gray-800 dark:text-gray-100 font-semibold text-sm sm:text-base text-right break-words">{{ result.productType == '1' ? t.results.ripplefold : t.results.pinchPleated }}</span>
          </div>
          <div class="flex flex-row items-center justify-between py-2 sm:py-2.5 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-neutral-700 px-2 rounded transition-colors gap-x-2">
            <span class="text-gray-600 dark:text-gray-400 font-medium text-sm sm:text-base min-w-fit flex-shrink-0">{{ t.results.fullness }}</span>
            <span class="text-gray-800 dark:text-gray-100 font-semibold text-sm sm:text-base text-right break-words">{{ result.fullness }}</span>
          </div>
          <div class="flex flex-row items-center justify-between py-2 sm:py-2.5 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-neutral-700 px-2 rounded transition-colors gap-x-2">
            <span class="text-gray-600 dark:text-gray-400 font-medium text-sm sm:text-base min-w-fit flex-shrink-0">{{ t.results.fabricWidths }}</span>
            <span class="text-gray-800 dark:text-gray-100 font-semibold text-sm sm:text-base text-right break-words">{{ result.fabricWidths }}</span>
          </div>
          <div class="flex flex-row items-center justify-between py-2 sm:py-2.5 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-neutral-700 px-2 rounded transition-colors gap-x-2">
            <span class="text-gray-600 dark:text-gray-400 font-medium text-sm sm:text-base min-w-fit flex-shrink-0">{{ t.results.fabricCuts }}</span>
            <span class="text-gray-800 dark:text-gray-100 font-semibold text-sm sm:text-base text-right break-words">{{ result.fabricCuts }}</span>
          </div>
          <div class="flex flex-row items-center justify-between py-2 sm:py-2.5 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-neutral-700 px-2 rounded transition-colors gap-x-2">
            <span class="text-gray-600 dark:text-gray-400 font-medium text-sm sm:text-base min-w-fit flex-shrink-0">{{ t.results.cutLength }}</span>
            <span class="text-gray-800 dark:text-gray-100 font-semibold text-sm sm:text-base text-right break-words">{{ result.fabricCutLength }}{{ result.fabricCutsFraction ? ' ' + result.fabricCutsFraction : '' }} {{ result.cutLengthUnit || 'in' }}</span>
          </div>
          <div class="flex flex-row items-center justify-between py-2 sm:py-2.5 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-neutral-700 px-2 rounded transition-colors gap-x-2">
            <span class="text-gray-600 dark:text-gray-400 font-medium text-sm sm:text-base min-w-fit flex-shrink-0">{{ t.results.orientation }}</span>
            <span class="text-right">
              <span :class="['inline-flex items-center rounded-full px-2 sm:px-3 py-1 text-xs font-semibold uppercase tracking-wide border', orientationBadgeClass(result.fabricOrientation)]">
                {{ result.fabricOrientation === 'Railroad' ? t.results.railroad : t.results.regular }}
              </span>
            </span>
          </div>
          <div v-if="result.requiredSnaps > 0" class="flex flex-row items-center justify-between py-2 sm:py-2.5 hover:bg-gray-50 dark:hover:bg-neutral-700 px-2 rounded transition-colors gap-x-2">
            <span class="text-gray-600 dark:text-gray-400 font-medium text-sm sm:text-base min-w-fit flex-shrink-0">{{ t.results.snapsRequired }}</span>
            <span class="text-gray-800 dark:text-gray-100 font-semibold text-sm sm:text-base text-right break-words">{{ result.requiredSnaps }}</span>
          </div>
        </div>
      </div>
      <div class="flex flex-col sm:flex-row gap-2 sm:gap-3">
        <ion-button expand="block" @click="copyResults" fill="outline" class="flex-1">
          <ion-icon :icon="copyOutline" slot="start"></ion-icon>
          {{ t.common.copy }}
        </ion-button>
        <ion-button expand="block" @click="closeModal" class="flex-1">
          {{ t.common.close }}
        </ion-button>
      </div>
    </div>
  </ion-content>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonButtons, IonIcon, modalController } from '@ionic/vue';
import { closeOutline, copyOutline, cutOutline } from 'ionicons/icons';
import { useI18n } from '@/composables/useI18n';

const { t } = useI18n();

interface Props {
  result: {
    requiredFabric: number;
    fabricWidths: number;
    fabricCuts: number;
    fabricCutsFraction: string;
    fabricCutLength: number;
    requiredSnaps: number;
    productType: string;
    fabricOrientation: string;
    width: string;
    widthFraction: string;
    height: string;
    heightFraction: string;
    widthUnit?: string;
    heightUnit?: string;
    cutLengthUnit?: string;
    hemUnit?: string;
    fullness: string;
    hem: string | number;
    easeAllowance: number;
    measurementSystem?: string;
  };
}

const props = defineProps<Props>();

const copied = ref(false);

const orientationBadgeClass = (orientation: string) => {
  return orientation === 'Railroad'
    ? 'bg-emerald-500/15 text-emerald-400 border-emerald-400/40'
    : 'bg-sky-500/15 text-sky-400 border-sky-400/40';
};

const closeModal = () => {
  modalController.dismiss();
};

const copyResults = async () => {
  const text = `${t.value.results.title}\n\n` +
    `${t.value.results.requiredFabric}: ${props.result.requiredFabric} ${t.value.results.yards}\n` +
    `${t.value.results.dimensions} ${props.result.width}${props.result.widthFraction ? ' ' + props.result.widthFraction : ''} ${props.result.widthUnit || 'in'} × ${props.result.height}${props.result.heightFraction ? ' ' + props.result.heightFraction : ''} ${props.result.heightUnit || 'in'}\n` +
    `${t.value.results.productType} ${props.result.productType == '1' ? t.value.results.ripplefold : t.value.results.pinchPleated}\n` +
    `${t.value.results.fullness} ${props.result.fullness}\n` +
    `${t.value.calculator.hem}: ${props.result.hem} ${props.result.hemUnit || 'in'}\n` +
    `${t.value.settings.easeAllowance}: ${props.result.easeAllowance}\n` +
    `${t.value.results.fabricWidths} ${props.result.fabricWidths}\n` +
    `${t.value.results.fabricCuts} ${props.result.fabricCuts}\n` +
    `${t.value.results.cutLength} ${props.result.fabricCutLength}${props.result.fabricCutsFraction ? ' ' + props.result.fabricCutsFraction : ''} ${props.result.cutLengthUnit || 'in'}\n` +
    `${t.value.results.orientation} ${props.result.fabricOrientation === 'Railroad' ? t.value.results.railroad : t.value.results.regular}` +
    (props.result.requiredSnaps > 0 ? `\n${t.value.results.snapsRequired} ${props.result.requiredSnaps}` : '');

  const fallbackCopy = () => {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.setAttribute('readonly', 'true');
    textarea.style.position = 'fixed';
    textarea.style.top = '0';
    textarea.style.left = '0';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
  };

  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
    } else {
      fallbackCopy();
    }
    copied.value = true;
    setTimeout(() => {
      copied.value = false;
    }, 2000);
  } catch (err) {
    try {
      fallbackCopy();
      copied.value = true;
      setTimeout(() => {
        copied.value = false;
      }, 2000);
    } catch (fallbackError) {
      console.error('Failed to copy results', fallbackError);
    }
  }
};
</script>

<style scoped>
@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes scale-in {
  from {
    transform: scale(0.8);
  }
  to {
    transform: scale(1);
  }
}

.animate-fade-in {
  animation: fade-in 0.3s ease-out;
}

.animate-scale-in {
  animation: scale-in 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

/* Ensure modal content is scrollable and handles large font sizes */
:deep(ion-content) {
  --overflow: auto;
}

/* Prevent text overflow in result values */
.break-words {
  word-break: break-word;
  overflow-wrap: break-word;
}

/* Responsive font sizes that adapt to system font scaling */
@media (max-width: 640px) {
  .text-4xl {
    font-size: clamp(2rem, 8vw, 3rem);
  }
}

/* Ensure title is visible in both modes */
:deep(ion-header ion-title) {
  color: inherit;
}

:deep(ion-header ion-button) {
  --color: inherit;
  color: inherit;
}
</style>
