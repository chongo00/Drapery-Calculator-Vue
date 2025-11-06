<template>
  <ion-page class="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-neutral-900 dark:to-neutral-950">
    <ion-header class="bg-white dark:bg-neutral-950 shadow-lg">
      <ion-toolbar class="bg-transparent">
        <ion-title class="text-2xl font-bold text-gray-800 dark:text-gray-100"><span class="title-inline"><img :src="appIcon" class="w-7 h-7 rounded" alt="" /><span>Calculation History</span></span></ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding" :fullscreen="true" :force-overscroll="false">
      <ion-header collapse="condense" class="bg-white dark:bg-neutral-950">
        <ion-toolbar class="bg-transparent">
          <ion-title size="large" class="text-xl font-semibold text-gray-700 dark:text-gray-200"><span class="title-inline"><img :src="appIcon" class="w-7 h-7 rounded" alt="" /><span>History</span></span></ion-title>
        </ion-toolbar>
      </ion-header>

      <div v-if="history.length === 0" class="text-center py-8">
        <p class="text-gray-500 dark:text-gray-400">No calculations yet. Start calculating to see history.</p>
      </div>

      <ion-list v-else>
        <ion-item-group v-for="(calc, index) in history" :key="index" class="mb-4">
          <ion-item-divider class="bg-gray-100 dark:bg-neutral-800">
            <ion-label class="text-sm font-medium text-gray-800 dark:text-gray-100">
              {{ new Date(calc.timestamp).toLocaleString() }}
            </ion-label>
          </ion-item-divider>
          <ion-item class="bg-white dark:bg-neutral-900 rounded-lg shadow-sm">
            <ion-label>
              <h2 class="font-semibold text-gray-800 dark:text-gray-100">Fabric: {{ calc.requiredFabric }} yards</h2>
              <p class="text-gray-600 dark:text-gray-300">Width: {{ calc.width }} {{ calc.widthFraction }} | Height: {{ calc.height }} {{ calc.heightFraction }}</p>
              <p class="text-gray-600 dark:text-gray-300">Product: {{ calc.productType == '1' ? 'Ripplefold' : 'Pinch Pleated' }} | Fullness: {{ calc.fullness }}</p>
              <p v-if="(typeof calc.hem === 'number' && calc.hem > 0) || (typeof calc.easeAllowance === 'number' && calc.easeAllowance > 0)" class="text-gray-600 dark:text-gray-300">
                <template v-if="typeof calc.hem === 'number' && calc.hem > 0">Hem: {{ calc.hem }}</template>
                <template v-if="(typeof calc.hem === 'number' && calc.hem > 0) && (typeof calc.easeAllowance === 'number' && calc.easeAllowance > 0)"> | </template>
                <template v-if="typeof calc.easeAllowance === 'number' && calc.easeAllowance > 0">Ease: {{ calc.easeAllowance }}</template>
              </p>
              <p class="text-gray-600 dark:text-gray-300 flex items-center gap-2">
                Orientation:
                <span :class="['inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide border', orientationBadgeClass(calc.fabricOrientation)]">
                  {{ calc.fabricOrientation }}
                </span>
              </p>
              <p class="text-gray-600 dark:text-gray-300">Cuts: {{ calc.fabricCuts }} x {{ calc.fabricCutLength }} {{ calc.fabricCutsFraction }}</p>
              <p v-if="calc.requiredSnaps > 0" class="text-gray-600 dark:text-gray-300">Snaps: {{ calc.requiredSnaps }}</p>
            </ion-label>
            <div slot="end" class="flex items-center gap-1">
              <ion-button fill="clear" color="medium" @click="copyItem(calc)" aria-label="Copy calculation">
                <ion-icon :icon="copyOutline" />
              </ion-button>
              <ion-button fill="clear" color="danger" @click="deleteItem(index)" aria-label="Delete calculation">
                <ion-icon :icon="trash" />
              </ion-button>
            </div>
          </ion-item>
        </ion-item-group>
      </ion-list>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem, IonItemDivider, IonItemGroup, IonLabel, IonIcon, IonButton, onIonViewWillEnter } from '@ionic/vue';
import { trash, copyOutline } from 'ionicons/icons';
import appIcon from '../../icons/icon-128.webp';

// Storage helper function
const getStorageItem = (key: string) => {
  return localStorage.getItem(key);
};

interface Calculation {
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
  timestamp: string;
}

const history = ref<Calculation[]>([]);

const orientationBadgeClass = (orientation: string) => {
  return orientation === 'Railroad'
    ? 'bg-emerald-500/15 text-emerald-400 border-emerald-400/40'
    : 'bg-sky-500/15 text-sky-400 border-sky-400/40';
};

const loadHistory = () => {
  try {
    const value = getStorageItem('calculationHistory');
    if (value) {
      history.value = JSON.parse(value);
    }
  } catch (error) {
    console.warn('Storage not available:', error);
  }
};

const saveHistory = () => {
  try {
    localStorage.setItem('calculationHistory', JSON.stringify(history.value));
  } catch (error) {
    console.warn('Failed to save history:', error);
  }
};

const deleteItem = (index: number) => {
  history.value.splice(index, 1);
  saveHistory();
};

const copyItem = async (calc: Calculation) => {
  const text = `Drapery Calculation Results\n\n` +
    `Required Fabric: ${calc.requiredFabric} yards\n` +
    `Dimensions: ${calc.width} ${calc.widthFraction} × ${calc.height} ${calc.heightFraction}\n` +
    `Product Type: ${calc.productType == '1' ? 'Ripplefold' : 'Pinch Pleated'}\n` +
    `Fullness: ${calc.fullness}\n` +
    `Hem: ${calc.hem} in\n` +
    `Ease Allowance: ${calc.easeAllowance} in\n` +
    `Fabric Widths: ${calc.fabricWidths}\n` +
    `Fabric Cuts: ${calc.fabricCuts}\n` +
    `Cut Length: ${calc.fabricCutLength} ${calc.fabricCutsFraction}\n` +
    `Orientation: ${calc.fabricOrientation}` +
    (calc.requiredSnaps > 0 ? `\nSnaps Required: ${calc.requiredSnaps}` : '');

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
  } catch (error) {
    console.error('Failed to copy calculation:', error);
  }
};

onMounted(() => {
  loadHistory();
});

// Reload history every time the view is entered
onIonViewWillEnter(() => {
  loadHistory();
  console.log('History view entered, reloading data');
});
</script>

<style scoped>
:deep(ion-content::part(scroll)) {
  overscroll-behavior-y: contain;
}
</style>
