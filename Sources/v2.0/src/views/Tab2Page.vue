<template>
  <ion-page class="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-neutral-900 dark:to-neutral-950">
    <ion-header class="bg-white dark:bg-neutral-950 shadow-lg">
      <ion-toolbar class="bg-transparent">
        <ion-title class="text-2xl font-bold text-gray-800 dark:text-gray-100"><span class="title-inline"><img :src="appIcon" class="w-7 h-7 rounded" alt="" /><span>{{ t.history.title }}</span></span></ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding" :fullscreen="true" :force-overscroll="false">
      <ion-header collapse="condense" class="bg-white dark:bg-neutral-950">
        <ion-toolbar class="bg-transparent">
          <ion-title size="large" class="text-xl font-semibold text-gray-700 dark:text-gray-200"><span class="title-inline"><img :src="appIcon" class="w-7 h-7 rounded" alt="" /><span>{{ t.history.title }}</span></span></ion-title>
        </ion-toolbar>
      </ion-header>

      <div v-if="history.length === 0" class="text-center py-8">
        <p class="text-gray-500 dark:text-gray-400">{{ t.history.noCalculationsYet }}</p>
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
              <h2 class="font-semibold text-gray-800 dark:text-gray-100">{{ t.history.fabric }}: {{ calc.requiredFabric }} {{ t.results.yards }}</h2>
              <p class="text-gray-600 dark:text-gray-300">{{ t.history.width }}: {{ calc.width }} {{ calc.widthFraction || '' }} {{ calc.widthUnit || 'in' }} | {{ t.history.height }}: {{ calc.height }} {{ calc.heightFraction || '' }} {{ calc.heightUnit || 'in' }}</p>
              <p class="text-gray-600 dark:text-gray-300">{{ t.history.product }}: {{ calc.productType == '1' ? t.results.ripplefold : t.results.pinchPleated }} | {{ t.results.fullness }}: {{ calc.fullness }}</p>
              <p v-if="(typeof calc.hem === 'number' && calc.hem > 0) || (typeof calc.hem === 'string' && parseFloat(calc.hem) > 0) || (typeof calc.easeAllowance === 'number' && calc.easeAllowance > 0)" class="text-gray-600 dark:text-gray-300">
                <template v-if="(typeof calc.hem === 'number' && calc.hem > 0) || (typeof calc.hem === 'string' && parseFloat(calc.hem) > 0)">{{ t.calculator.hem }}: {{ calc.hem }} {{ calc.hemUnit || 'in' }}</template>
                <template v-if="((typeof calc.hem === 'number' && calc.hem > 0) || (typeof calc.hem === 'string' && parseFloat(calc.hem) > 0)) && (typeof calc.easeAllowance === 'number' && calc.easeAllowance > 0)"> | </template>
                <template v-if="typeof calc.easeAllowance === 'number' && calc.easeAllowance > 0">{{ t.settings.easeAllowance }}: {{ calc.easeAllowance }}</template>
              </p>
              <p class="text-gray-600 dark:text-gray-300 flex items-center gap-2">
                {{ t.results.orientation }}:
                <span :class="['inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide border', orientationBadgeClass(calc.fabricOrientation)]">
                  {{ calc.fabricOrientation === 'Railroad' ? t.results.railroad : t.results.regular }}
                </span>
              </p>
              <p class="text-gray-600 dark:text-gray-300">{{ t.history.cuts }}: {{ calc.fabricCuts }} x {{ calc.fabricCutLength }} {{ calc.fabricCutsFraction || '' }} {{ calc.cutLengthUnit || 'in' }}</p>
              <p v-if="calc.requiredSnaps > 0" class="text-gray-600 dark:text-gray-300">{{ t.history.snaps }}: {{ calc.requiredSnaps }}</p>
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
import { useI18n } from '@/composables/useI18n';

const { t } = useI18n();

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
  widthUnit?: string;
  heightUnit?: string;
  cutLengthUnit?: string;
  hemUnit?: string;
  fullness: string;
  hem: number | string;
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
  const text = `${t.value.results.title}\n\n` +
    `${t.value.results.requiredFabric}: ${calc.requiredFabric} ${t.value.results.yards}\n` +
    `${t.value.results.dimensions} ${calc.width}${calc.widthFraction ? ' ' + calc.widthFraction : ''} ${calc.widthUnit || 'in'} × ${calc.height}${calc.heightFraction ? ' ' + calc.heightFraction : ''} ${calc.heightUnit || 'in'}\n` +
    `${t.value.results.productType} ${calc.productType == '1' ? t.value.results.ripplefold : t.value.results.pinchPleated}\n` +
    `${t.value.results.fullness} ${calc.fullness}\n` +
    `${t.value.calculator.hem}: ${calc.hem} ${calc.hemUnit || 'in'}\n` +
    `${t.value.settings.easeAllowance}: ${calc.easeAllowance}\n` +
    `${t.value.results.fabricWidths} ${calc.fabricWidths}\n` +
    `${t.value.results.fabricCuts} ${calc.fabricCuts}\n` +
    `${t.value.results.cutLength} ${calc.fabricCutLength}${calc.fabricCutsFraction ? ' ' + calc.fabricCutsFraction : ''} ${calc.cutLengthUnit || 'in'}\n` +
    `${t.value.results.orientation} ${calc.fabricOrientation === 'Railroad' ? t.value.results.railroad : t.value.results.regular}` +
    (calc.requiredSnaps > 0 ? `\n${t.value.results.snapsRequired} ${calc.requiredSnaps}` : '');

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
