<template>
  <ion-page class="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-neutral-900 dark:to-neutral-950">
    <ion-header class="bg-white dark:bg-neutral-950 shadow-lg">
      <ion-toolbar class="bg-transparent">
        <ion-title class="text-2xl font-bold text-gray-800 dark:text-gray-100">Calculation History</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding" :fullscreen="true" :force-overscroll="false">
      <ion-header collapse="condense" class="bg-white dark:bg-neutral-950">
        <ion-toolbar class="bg-transparent">
          <ion-title size="large" class="text-xl font-semibold text-gray-700 dark:text-gray-200">History</ion-title>
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
              <p class="text-gray-600 dark:text-gray-300">Cuts: {{ calc.fabricCuts }} x {{ calc.fabricCutLength }} {{ calc.fabricCutsFraction }}</p>
              <p v-if="calc.requiredSnaps > 0" class="text-gray-600 dark:text-gray-300">Snaps: {{ calc.requiredSnaps }}</p>
            </ion-label>
            <ion-button slot="end" fill="clear" color="danger" @click="deleteItem(index)" aria-label="Delete calculation">
              <ion-icon :icon="trash" />
            </ion-button>
          </ion-item>
        </ion-item-group>
      </ion-list>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem, IonItemDivider, IonItemGroup, IonLabel, IonIcon, IonButton, onIonViewWillEnter } from '@ionic/vue';
import { trash } from 'ionicons/icons';

// Función helper para storage
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
  timestamp: string;
}

const history = ref<Calculation[]>([]);

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

onMounted(() => {
  loadHistory();
});

// Recargar historial cada vez que se entra a la vista
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
