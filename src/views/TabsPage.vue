<template>
  <ion-page>
    <ion-tabs>
      <ion-router-outlet swipe-gesture="false"></ion-router-outlet>
      <ion-tab-bar slot="bottom">
        <ion-tab-button tab="tab1" href="/tabs/tab1" routerDirection="root" @click.prevent="onTab('/tabs/tab1')">
          <ion-icon aria-hidden="true" :icon="calculator" />
          <ion-label>Calculator</ion-label>
        </ion-tab-button>

        <ion-tab-button tab="tab2" href="/tabs/tab2" routerDirection="root" @click.prevent="onTab('/tabs/tab2')">
          <ion-icon aria-hidden="true" :icon="list" />
          <ion-label>History</ion-label>
        </ion-tab-button>

        <ion-tab-button tab="settings" href="/tabs/settings" routerDirection="root" @click.prevent="onTab('/tabs/settings')">
          <ion-icon aria-hidden="true" :icon="settings" />
          <ion-label>Settings</ion-label>
        </ion-tab-button>
      </ion-tab-bar>
    </ion-tabs>
  </ion-page>
  
</template>

<script setup lang="ts">
import { onMounted, onBeforeUnmount } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { IonTabBar, IonTabButton, IonTabs, IonLabel, IonIcon, IonPage, IonRouterOutlet } from '@ionic/vue';
import { calculator, list, settings } from 'ionicons/icons';

const router = useRouter();
const route = useRoute();

// Orden de las pestañas para navegación por gesto
const TAB_ORDER = ['/tabs/tab1', '/tabs/tab2', '/tabs/settings'];

let isPointerActive = false;
let startX = 0;
let startY = 0;
let startTime = 0;
let lastMoveX = 0;
let lastMoveY = 0;

const normalizePath = (path: string) => TAB_ORDER.find(p => path.startsWith(p)) ?? TAB_ORDER[0];
const goToIndex = (i: number) => { const t = TAB_ORDER[i]; if (t) router.push(t); };

const ignore = (target: EventTarget | null) => {
  const el = target as Element | null;
  if (!el) return true;
  // Solo ignorar la barra de tabs inferior para no interferir con los clics en iconos
  return !!el.closest('ion-tab-button, ion-tab-bar');
};

const onDown = (e: PointerEvent) => {
  // Permitir touch/pen y también mouse (para pruebas en devtools)
  if (e.pointerType === 'mouse' && e.buttons !== 1) return;
  if (ignore(e.target)) return;
  isPointerActive = true;
  startX = e.clientX; startY = e.clientY; startTime = performance.now();
  lastMoveX = 0; lastMoveY = 0;
};
const onMove = (e: PointerEvent) => {
  if (!isPointerActive) return;
  const dx = e.clientX - startX; const dy = e.clientY - startY;
  const ax = Math.abs(dx); const ay = Math.abs(dy);
  // Si detectamos intención horizontal clara, anulamos el comportamiento del navegador
  if (ax > ay && ax > 10) {
    if (typeof e.preventDefault === 'function') {
      e.preventDefault();
      e.stopPropagation();
    }
  }
  lastMoveX = dx; lastMoveY = dy;
};
const onUp = (e: PointerEvent) => {
  if (!isPointerActive) return; isPointerActive = false;
  if (e.pointerType === 'mouse' && e.button !== 0) return;
  const dx = e.clientX - startX; const dy = e.clientY - startY;
  const ax = Math.abs(dx); const ay = Math.abs(dy);
  const dt = Math.max(1, performance.now() - startTime);
  const v = ax / dt; // px/ms
  // Sensibilidad estándar móvil (ajustada)
  if (ay > 40 || ax <= ay) return; // descartar gestos más verticales
  const distanceOK = ax >= 35;  // distancia moderada para apps móviles
  const velocityOK = v >= 0.35; // velocidad moderada para flick
  if (!distanceOK && !velocityOK) return;
  // Evita overlay de back/forward del navegador
  if (typeof e.preventDefault === 'function') {
    e.preventDefault();
    e.stopPropagation();
  }
  const idx = TAB_ORDER.indexOf(normalizePath(route.path));
  if (idx < 0) return;
  if (dx < 0) goToIndex(idx + 1); else goToIndex(idx - 1);
};
const onCancel = () => { isPointerActive = false; };

const onTab = (path: string) => {
  router.push(path);
};

onMounted(() => {
  window.addEventListener('pointerdown', onDown, { passive: false });
  window.addEventListener('pointermove', onMove, { passive: false });
  window.addEventListener('pointerup', onUp, { passive: false });
  window.addEventListener('pointercancel', onCancel, { passive: false });
  window.addEventListener('pointerleave', onCancel, { passive: false });
});
onBeforeUnmount(() => {
  window.removeEventListener('pointerdown', onDown);
  window.removeEventListener('pointermove', onMove);
  window.removeEventListener('pointerup', onUp);
  window.removeEventListener('pointercancel', onCancel);
  window.removeEventListener('pointerleave', onCancel);
});
</script>

<style scoped>
:deep(ion-tabs) {
  touch-action: pan-x pan-y; /* permitir gestos horizontales y verticales */
  overscroll-behavior-x: contain; /* evitar gesto de back/forward del navegador */
}
</style>
