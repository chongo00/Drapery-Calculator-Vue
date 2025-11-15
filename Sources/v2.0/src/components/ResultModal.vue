<template>
  <ion-header class="bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-800 dark:to-indigo-900">
    <ion-toolbar class="bg-transparent">
      <ion-title class="text-white font-bold text-xl">✨ Calculation Results</ion-title>
      <ion-buttons slot="end">
        <ion-button @click="copyResults" class="text-white" fill="clear">
          <ion-icon :icon="copyOutline"></ion-icon>
        </ion-button>
        <ion-button @click="closeModal" class="text-white" fill="clear">
          <ion-icon :icon="closeOutline"></ion-icon>
        </ion-button>
      </ion-buttons>
    </ion-toolbar>
  </ion-header>
  <ion-content class="ion-padding bg-gray-50 dark:bg-neutral-900">
    <div v-if="copied" class="mb-4 p-3 bg-green-100 dark:bg-green-900/30 border border-green-400 dark:border-green-700 text-green-700 dark:text-green-200 rounded-lg text-center animate-pulse">
      ✅ Results copied to clipboard!
    </div>
    <div class="max-w-md mx-auto space-y-4 animate-fade-in">
      <div class="bg-white dark:bg-neutral-800 rounded-xl shadow-lg p-6 border-l-4 border-blue-600 hover:shadow-xl transition-shadow duration-300">
        <h2 class="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4 flex items-center gap-2">
          <ion-icon :icon="cutOutline" class="text-blue-600"></ion-icon>
          Required Fabric
        </h2>
        <div class="text-center py-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg border-2 border-blue-200 dark:border-blue-700 mb-4">
          <p class="text-5xl font-extrabold text-blue-600 dark:text-blue-400 animate-scale-in">{{ result.requiredFabric }}</p>
          <p class="text-xl text-gray-600 dark:text-gray-300 mt-2">yards</p>
        </div>
        <div class="space-y-3">
          <div class="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-neutral-700 px-2 rounded transition-colors">
            <span class="text-gray-600 dark:text-gray-400 font-medium">📏 Dimensions:</span>
            <span class="text-gray-800 dark:text-gray-100 font-semibold">{{ result.width }} {{ result.widthFraction }} × {{ result.height }} {{ result.heightFraction }}</span>
          </div>
          <div class="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-neutral-700 px-2 rounded transition-colors">
            <span class="text-gray-600 dark:text-gray-400 font-medium">📦 Product Type:</span>
            <span class="text-gray-800 dark:text-gray-100 font-semibold">{{ result.productType == '1' ? 'Ripplefold' : 'Pinch Pleated' }}</span>
          </div>
          <div class="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-neutral-700 px-2 rounded transition-colors">
            <span class="text-gray-600 dark:text-gray-400 font-medium">📊 Fullness:</span>
            <span class="text-gray-800 dark:text-gray-100 font-semibold">{{ result.fullness }}</span>
          </div>
          <div class="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-neutral-700 px-2 rounded transition-colors">
            <span class="text-gray-600 dark:text-gray-400 font-medium">↔️ Fabric Widths:</span>
            <span class="text-gray-800 dark:text-gray-100 font-semibold">{{ result.fabricWidths }}</span>
          </div>
          <div class="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-neutral-700 px-2 rounded transition-colors">
            <span class="text-gray-600 dark:text-gray-400 font-medium">✂️ Fabric Cuts:</span>
            <span class="text-gray-800 dark:text-gray-100 font-semibold">{{ result.fabricCuts }}</span>
          </div>
          <div class="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-neutral-700 px-2 rounded transition-colors">
            <span class="text-gray-600 dark:text-gray-400 font-medium">📐 Cut Length:</span>
            <span class="text-gray-800 dark:text-gray-100 font-semibold">{{ result.fabricCutLength }} {{ result.fabricCutsFraction }}</span>
          </div>
          <div class="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-neutral-700 px-2 rounded transition-colors">
            <span class="text-gray-600 dark:text-gray-400 font-medium">🔄 Orientation:</span>
            <span :class="['inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide border', orientationBadgeClass(result.fabricOrientation)]">
              {{ result.fabricOrientation }}
            </span>
          </div>
          <div v-if="result.requiredSnaps > 0" class="flex justify-between items-center py-2 hover:bg-gray-50 dark:hover:bg-neutral-700 px-2 rounded transition-colors">
            <span class="text-gray-600 dark:text-gray-400 font-medium">📍 Snaps Required:</span>
            <span class="text-gray-800 dark:text-gray-100 font-semibold">{{ result.requiredSnaps }}</span>
          </div>
        </div>
      </div>
      <div class="flex gap-3">
        <ion-button expand="block" @click="copyResults" fill="outline" class="flex-1">
          <ion-icon :icon="copyOutline" slot="start"></ion-icon>
          Copy
        </ion-button>
        <ion-button expand="block" @click="closeModal" class="flex-1">
          Close
        </ion-button>
      </div>
    </div>
  </ion-content>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonButtons, IonIcon, modalController } from '@ionic/vue';
import { closeOutline, copyOutline, cutOutline } from 'ionicons/icons';

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
    fullness: string;
    hem: number;
    easeAllowance: number;
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
  const text = `Drapery Calculation Results\n\n` +
    `Required Fabric: ${props.result.requiredFabric} yards\n` +
    `Dimensions: ${props.result.width} ${props.result.widthFraction} × ${props.result.height} ${props.result.heightFraction}\n` +
    `Product Type: ${props.result.productType == '1' ? 'Ripplefold' : 'Pinch Pleated'}\n` +
    `Fullness: ${props.result.fullness}\n` +
    `Hem: ${props.result.hem}\n` +
    `Ease Allowance: ${props.result.easeAllowance}\n` +
    `Fabric Widths: ${props.result.fabricWidths}\n` +
    `Fabric Cuts: ${props.result.fabricCuts}\n` +
    `Cut Length: ${props.result.fabricCutLength} ${props.result.fabricCutsFraction}\n` +
    `Orientation: ${props.result.fabricOrientation}` +
    (props.result.requiredSnaps > 0 ? `\nSnaps Required: ${props.result.requiredSnaps}` : '');

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
</style>
