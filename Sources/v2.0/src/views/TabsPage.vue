<template>
  <ion-page>
    <ion-tabs>
      <ion-router-outlet swipe-gesture="false"></ion-router-outlet>
      <ion-tab-bar slot="bottom">
  <ion-tab-button tab="tab1" href="/tabs/tab1" routerDirection="root">
          <ion-icon aria-hidden="true" :icon="calculator" />
          <ion-label>Calculator</ion-label>
        </ion-tab-button>

  <ion-tab-button tab="tab2" href="/tabs/tab2" routerDirection="root">
          <ion-icon aria-hidden="true" :icon="list" />
          <ion-label>History</ion-label>
        </ion-tab-button>

  <ion-tab-button tab="settings" href="/tabs/settings" routerDirection="root">
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

// Tab order for swipe navigation (route.path is base-less even with BASE configured)
const TAB_ORDER = ['/tabs/tab1', '/tabs/tab2', '/tabs/settings'];

let isPointerActive = false;
let startX = 0;
let startY = 0;
let startTime = 0;
let lastMoveX = 0;
let lastMoveY = 0;

const normalizePath = (path: string) => TAB_ORDER.find(p => path.startsWith(p)) ?? TAB_ORDER[0];
const goToIndex = (i: number) => { const t = TAB_ORDER[i]; if (t) router.push(t); };

// Ignore pointer events that originate from the tab bar/buttons
const ignore = (target: EventTarget | null) => {
  const el = target as Element | null;
  if (!el) return true;
  // Only ignore the bottom tab bar so icon taps are not blocked
  return !!el.closest('ion-tab-button, ion-tab-bar');
};

const onDown = (e: PointerEvent) => {
  // Allow touch/pen and mouse (for devtools testing)
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
  // If a clear horizontal intent is detected, prevent browser back/forward gesture
  if (ax > ay && ax > 8) {
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
  // Mobile-friendly thresholds: allow slightly more vertical slop and lower swipe effort
  if (ay > 80 || ax <= ay) return;
  const distanceOK = ax >= 20;  // lower distance for easier swipe
  const velocityOK = v >= 0.20; // lower flick speed threshold
  if (!distanceOK && !velocityOK) return;
  // Prevent browser back/forward overlay
  if (typeof e.preventDefault === 'function') {
    e.preventDefault();
    e.stopPropagation();
  }
  const idx = TAB_ORDER.indexOf(normalizePath(route.path));
  if (idx < 0) return;
  if (dx < 0) goToIndex(idx + 1); else goToIndex(idx - 1);
};
const onCancel = () => { isPointerActive = false; };

// Touch fallback for environments where Pointer Events may not fire reliably
const onTouchStart = (e: TouchEvent) => {
  if (isPointerActive) return;
  if (ignore(e.target)) return;
  const t = e.touches[0];
  if (!t) return;
  isPointerActive = true;
  startX = t.clientX; startY = t.clientY; startTime = performance.now();
  lastMoveX = 0; lastMoveY = 0;
};
const onTouchMove = (e: TouchEvent) => {
  if (!isPointerActive) return;
  const t = e.touches[0];
  if (!t) return;
  const dx = t.clientX - startX; const dy = t.clientY - startY;
  const ax = Math.abs(dx); const ay = Math.abs(dy);
  if (ax > ay && ax > 10) {
    if (typeof e.preventDefault === 'function') {
      e.preventDefault();
      e.stopPropagation();
    }
  }
  lastMoveX = dx; lastMoveY = dy;
};
const onTouchEnd = (e: TouchEvent) => {
  if (!isPointerActive) return; isPointerActive = false;
  const dx = lastMoveX; const dy = lastMoveY;
  const ax = Math.abs(dx); const ay = Math.abs(dy);
  const dt = Math.max(1, performance.now() - startTime);
  const v = ax / dt;
  if (ay > 80 || ax <= ay) return;
  const distanceOK = ax >= 20;  const velocityOK = v >= 0.20;
  if (!distanceOK && !velocityOK) return;
  if (typeof e.preventDefault === 'function') {
    e.preventDefault();
    e.stopPropagation();
  }
  const idx = TAB_ORDER.indexOf(normalizePath(route.path));
  if (idx < 0) return;
  if (dx < 0) goToIndex(idx + 1); else goToIndex(idx - 1);
};
const onTouchCancel = () => { isPointerActive = false; };

//const onTab = (path: string) => {
//  router.push(path);
//};

onMounted(() => {
  window.addEventListener('pointerdown', onDown, { passive: false, capture: true });
  window.addEventListener('pointermove', onMove, { passive: false, capture: true });
  window.addEventListener('pointerup', onUp, { passive: false, capture: true });
  window.addEventListener('pointercancel', onCancel, { passive: false, capture: true });
  window.addEventListener('pointerleave', onCancel, { passive: false, capture: true });
  window.addEventListener('touchstart', onTouchStart, { passive: false, capture: true });
  window.addEventListener('touchmove', onTouchMove, { passive: false, capture: true });
  window.addEventListener('touchend', onTouchEnd, { passive: false, capture: true });
  window.addEventListener('touchcancel', onTouchCancel, { passive: false, capture: true });
});
onBeforeUnmount(() => {
  window.removeEventListener('pointerdown', onDown);
  window.removeEventListener('pointermove', onMove);
  window.removeEventListener('pointerup', onUp);
  window.removeEventListener('pointercancel', onCancel);
  window.removeEventListener('pointerleave', onCancel);
  window.removeEventListener('touchstart', onTouchStart);
  window.removeEventListener('touchmove', onTouchMove);
  window.removeEventListener('touchend', onTouchEnd);
  window.removeEventListener('touchcancel', onTouchCancel);
});
</script>

<style scoped>
:deep(ion-tabs) {
  touch-action: pan-y; /* allow vertical scroll, block browser horizontal nav */
  overscroll-behavior-x: contain; /* contain back/forward gesture */
}
</style>
