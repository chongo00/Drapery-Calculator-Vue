<template>
  <ion-page class="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-neutral-900 dark:to-neutral-950">
    <ion-header class="bg-white dark:bg-neutral-950 shadow-lg">
      <ion-toolbar class="bg-transparent">
        <ion-title class="text-2xl font-bold text-gray-800 dark:text-gray-100">Settings</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding bg-transparent">
      <div class="max-w-md mx-auto bg-white dark:bg-neutral-900 rounded-xl shadow-lg p-6 space-y-6">
        <h2 class="text-lg font-semibold text-gray-800 dark:text-gray-100">App Preferences</h2>

        <div class="flex items-center justify-between">
          <span class="text-sm font-medium text-gray-700 dark:text-gray-200">Dark Mode</span>
          <ion-toggle v-model="darkMode" slot="end" class="text-blue-500"></ion-toggle>
        </div>

        <div class="border-t pt-4">
          <h3 class="text-md font-medium text-gray-800 dark:text-gray-100 mb-2">About</h3>
          <p class="text-sm text-gray-600 dark:text-gray-300">Drapery Calculator v1.1.0.2</p>
          <p class="text-sm text-gray-600 dark:text-gray-300">Calculate fabric needs for curtains efficiently.</p>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonToggle } from '@ionic/vue';

const darkMode = ref(false);
const isInitialized = ref(false);

const applyTheme = (isDark: boolean) => {
  const html = document.documentElement;
  const body = document.body;
  const ionApp = document.querySelector('ion-app');

  html.classList.toggle('dark', isDark);
  body.classList.toggle('ion-theme-dark', isDark);
  body.classList.toggle('dark', isDark);
  if (ionApp) {
    ionApp.classList.toggle('dark', isDark);
    ionApp.classList.toggle('ion-theme-dark', isDark);
  }

  html.style.colorScheme = isDark ? 'dark' : 'light';

  localStorage.setItem('darkMode', isDark.toString());
  console.log('Theme applied:', isDark ? 'dark' : 'light');
};

// Watch for toggle changes after initialization
watch(darkMode, (newValue) => {
  if (!isInitialized.value) return;
  applyTheme(newValue);
});

onMounted(() => {
  const saved = localStorage.getItem('darkMode');
  // Respect only the saved preference; if it doesn't exist, start in light mode
  darkMode.value = saved === 'true';
  applyTheme(darkMode.value);
  isInitialized.value = true;
});
</script>
