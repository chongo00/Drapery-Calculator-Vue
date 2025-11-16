<template>
  <ion-page class="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-neutral-900 dark:to-neutral-950">
    <ion-header class="bg-white dark:bg-neutral-950 shadow-lg">
      <ion-toolbar class="bg-transparent">
        <ion-title class="text-2xl font-bold text-gray-800 dark:text-gray-100">
          <span class="title-inline">
            <img :src="appIcon" class="w-7 h-7 rounded" alt="" />
            <span>Settings</span>
          </span>
        </ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding bg-transparent">
      <div class="max-w-md md:max-w-3xl mx-auto bg-white dark:bg-neutral-900 rounded-xl shadow-lg p-6 space-y-6">
        <h2 class="text-lg font-semibold text-gray-800 dark:text-gray-100">App Preferences</h2>

        <div class="flex items-center justify-between">
          <span class="text-sm font-medium text-gray-700 dark:text-gray-200">Dark Mode</span>
          <ion-toggle v-model="darkMode" slot="end" class="text-blue-500"></ion-toggle>
        </div>

        <ion-accordion-group class="mt-4">
          <ion-accordion value="advanced">
            <ion-item slot="header" class="advanced-accordion-header rounded-lg">
              <ion-label class="font-medium">Advanced Calculation Settings</ion-label>
            </ion-item>
            <div slot="content" class="p-3 space-y-4 advanced-settings">
              <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <ion-item lines="none" class="bg-gray-50 dark:bg-neutral-800 rounded-lg align-left-input">
                  <ion-label position="stacked">Side margin per panel (in)</ion-label>
                  <ion-input :modelValue="String(settings.widthMargin)" type="number" @ionInput="onNumberInput('widthMargin', $event)"></ion-input>
                </ion-item>
                <ion-item lines="none" class="bg-gray-50 dark:bg-neutral-800 rounded-lg align-left-input">
                  <ion-label position="stacked">Ease allowance (in)</ion-label>
                  <ion-input :modelValue="String(settings.easeAllowance)" type="number" @ionInput="onNumberInput('easeAllowance', $event)"></ion-input>
                </ion-item>
                <ion-item lines="none" class="bg-gray-50 dark:bg-neutral-800 rounded-lg align-left-input">
                  <ion-label position="stacked">Snap separation (in)</ion-label>
                  <ion-input :modelValue="String(settings.rfSnapSeparation)" type="number" step="0.01" @ionInput="onNumberInput('rfSnapSeparation', $event)"></ion-input>
                  <p v-if="snapSepInvalid" class="text-xs font-semibold text-red-600 dark:text-red-400 pt-1">Must be greater than 0</p>
                </ion-item>
                <ion-item lines="none" class="bg-gray-50 dark:bg-neutral-800 rounded-lg railroad-toggle-item">
                  <ion-label position="stacked">Railroad strict</ion-label>
                  <p class="railroad-hint text-xs text-gray-500 dark:text-gray-200">Only if panel height &lt; fabric width</p>
                  <div class="railroad-toggle-shell">
                    <ion-toggle class="railroad-toggle" :checked="settings.railroadStrict" @ionChange="onBooleanChange('railroadStrict', $event)" />
                  </div>
                </ion-item>
              </div>

              <div class="space-y-2">
                <div class="text-sm font-semibold text-gray-700 dark:text-gray-200">Ripplefold fullness factors</div>
                <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <ion-item lines="none" class="bg-gray-50 dark:bg-neutral-800 rounded-lg">
                    <ion-label position="stacked" class="whitespace-nowrap text-center">60%</ion-label>
                    <ion-input :modelValue="String(settings.ripplefoldFullness['60'])" type="number" step="0.01" @ionInput="onFullnessInput('60', $event)"></ion-input>
                  </ion-item>
                  <ion-item lines="none" class="bg-gray-50 dark:bg-neutral-800 rounded-lg">
                    <ion-label position="stacked" class="whitespace-nowrap text-center">80%</ion-label>
                    <ion-input :modelValue="String(settings.ripplefoldFullness['80'])" type="number" step="0.01" @ionInput="onFullnessInput('80', $event)"></ion-input>
                  </ion-item>
                  <ion-item lines="none" class="bg-gray-50 dark:bg-neutral-800 rounded-lg">
                    <ion-label position="stacked" class="whitespace-nowrap text-center">100%</ion-label>
                    <ion-input :modelValue="String(settings.ripplefoldFullness['100'])" type="number" step="0.01" @ionInput="onFullnessInput('100', $event)"></ion-input>
                  </ion-item>
                  <ion-item lines="none" class="bg-gray-50 dark:bg-neutral-800 rounded-lg">
                    <ion-label position="stacked" class="whitespace-nowrap text-center">120%</ion-label>
                    <ion-input :modelValue="String(settings.ripplefoldFullness['120'])" type="number" step="0.01" @ionInput="onFullnessInput('120', $event)"></ion-input>
                  </ion-item>
                </div>
              </div>

              <div class="space-y-2">
                <div class="text-sm font-semibold text-gray-700 dark:text-gray-200">Fabric Width options (inches)</div>
                <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <ion-item v-for="(value, i) in fabricWidthDrafts" :key="i" lines="none" class="bg-gray-50 dark:bg-neutral-800 rounded-lg">
                    <ion-label position="stacked" class="text-center">#{{ i + 1 }}</ion-label>
                    <ion-input type="number" inputmode="numeric" :modelValue="value" @ionInput="onFabricWidthChange(i, $event)"></ion-input>
                  </ion-item>
                </div>
                <div class="flex gap-2 pt-1">
                  <ion-button size="small" fill="outline" @click="addFabricWidth">Add width</ion-button>
                  <ion-button size="small" fill="clear" color="medium" @click="clearLastFabricWidth">Clear last</ion-button>
                </div>
              </div>

              <div class="pt-2">
                <ion-button fill="outline" size="small" @click="handleReset">Restore defaults</ion-button>
              </div>
            </div>
          </ion-accordion>
        </ion-accordion-group>

        <div class="border-t pt-4">
          <h3 class="text-md font-medium text-gray-800 dark:text-gray-100 mb-2">About</h3>
          <p class="text-sm text-gray-600 dark:text-gray-300">Drapery Calculator v{{ appVersion }}</p>
          <p class="text-sm text-gray-600 dark:text-gray-300">Calculate fabric needs for curtains efficiently.</p>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, computed } from 'vue'
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonToggle, IonAccordionGroup, IonAccordion, IonItem, IonLabel, IonInput, IonButton } from '@ionic/vue'
import { useSettings, type RipplefoldFullnessMap } from '@/composables/useSettings'
import appIcon from '../../icons/icon-128.webp'
import packageInfo from '../../package.json';

// Dynamically retrieve the app version
const appVersion = packageInfo.version;

// Theme toggle (Dark Mode)
const darkMode = ref(false)
const isInitialized = ref(false)

const applyTheme = (isDark: boolean) => {
  const html = document.documentElement
  const body = document.body
  const ionApp = document.querySelector('ion-app')

  html.classList.toggle('dark', isDark)
  body.classList.toggle('ion-theme-dark', isDark)
  body.classList.toggle('dark', isDark)
  if (ionApp) {
    ionApp.classList.toggle('dark', isDark)
    ionApp.classList.toggle('ion-theme-dark', isDark)
  }

  html.style.colorScheme = isDark ? 'dark' : 'light'
  localStorage.setItem('darkMode', isDark.toString())
}

watch(darkMode, (nv) => { if (isInitialized.value) applyTheme(nv) })

onMounted(() => {
  const saved = localStorage.getItem('darkMode')
  darkMode.value = saved === 'true'
  applyTheme(darkMode.value)
  isInitialized.value = true
})

// Settings state
const { state: settings, reset } = useSettings()

// Fabric width options editing helpers
const fabricWidthDrafts = ref<string[]>(settings.fabricWidthOptions.map((n) => String(n)))
if (!fabricWidthDrafts.value.length) fabricWidthDrafts.value = ['']

const normalizeFabricWidths = () => {
  const drafts = [...fabricWidthDrafts.value]
  const seen = new Set<number>()
  const validNumbers: number[] = []

  drafts.forEach((raw, index) => {
    const trimmed = String(raw ?? '').trim()
    if (!trimmed) { drafts[index] = ''; return }
    const parsed = parseInt(trimmed, 10)
    if (Number.isInteger(parsed) && parsed > 0 && !seen.has(parsed)) { seen.add(parsed); validNumbers.push(parsed); drafts[index] = String(parsed) }
    else drafts[index] = ''
  })

  if (!drafts.length) drafts.push('')
  fabricWidthDrafts.value = drafts
  settings.fabricWidthOptions = [...validNumbers].sort((a, b) => a - b)
}

const onFabricWidthChange = (index: number, e: any) => {
  const raw = String(e?.detail?.value ?? '').trim()
  const drafts = [...fabricWidthDrafts.value]
  drafts[index] = raw
  fabricWidthDrafts.value = drafts
  normalizeFabricWidths()
}

const addFabricWidth = () => { fabricWidthDrafts.value = [...fabricWidthDrafts.value, '']; normalizeFabricWidths() }
const clearLastFabricWidth = () => {
  if (!fabricWidthDrafts.value.length) { fabricWidthDrafts.value = ['']; return }
  const drafts = [...fabricWidthDrafts.value]
  drafts[drafts.length - 1] = ''
  fabricWidthDrafts.value = drafts
  normalizeFabricWidths()
}

normalizeFabricWidths()

// Inputs / toggles
const snapSepInvalid = computed(() => Number(settings.rfSnapSeparation) <= 0)

const setNumber = (key: 'widthMargin' | 'easeAllowance' | 'rfSnapSeparation', value: any) => {
  const num = parseFloat(String(value ?? ''))
  if (!isFinite(num) || num < 0) return
  (settings as any)[key] = num
}
const setBoolean = (key: 'railroadStrict', checked: any) => { (settings as any)[key] = !!checked }
const setFullness = (k: keyof RipplefoldFullnessMap, value: any) => {
  const num = parseFloat(String(value ?? ''))
  if (!isFinite(num) || num <= 0) return
  settings.ripplefoldFullness[k] = num
}

const onNumberInput = (k: 'widthMargin' | 'easeAllowance' | 'rfSnapSeparation', e: any) => setNumber(k, e?.detail?.value)
const onBooleanChange = (k: 'railroadStrict', e: any) => setBoolean(k, e?.detail?.checked)
const onFullnessInput = (k: keyof RipplefoldFullnessMap, e: any) => setFullness(k, e?.detail?.value)
const handleReset = () => {
  reset()
  fabricWidthDrafts.value = settings.fabricWidthOptions.map((n) => String(n))
  if (!fabricWidthDrafts.value.length) fabricWidthDrafts.value = ['']
  normalizeFabricWidths()
}
</script>

<style scoped>
/* Unify background for all items inside the advanced panel */
.advanced-settings :deep(ion-item) { --background: #f9fafb; background-color: #f9fafb }
.dark .advanced-settings :deep(ion-item) { --background: #0000; background-color: #0000 }

/* Center numbers inside the editable inputs */
.advanced-settings :deep(ion-input),
.advanced-settings :deep(ion-input)::part(input) {
  text-align: center;
}

.advanced-settings :deep(ion-input)::part(native) {
  text-align: center;
}

.advanced-settings :deep(.align-left-input ion-input),
.advanced-settings :deep(.align-left-input ion-input)::part(input),
.advanced-settings :deep(.align-left-input ion-input)::part(native) {
  text-align: left;
}

/* Center the toggle */
.railroad-toggle-shell { display:flex; justify-content:center; padding-top:0.25rem; padding-bottom:0.15rem }

/* Make the item look identical to siblings and remove bottom hairline */
.railroad-toggle-item::part(native) { background:#f9fafb; box-shadow:none }
.dark .railroad-toggle-item::part(native) { background:#0000; box-shadow:none }
.railroad-toggle-item::part(inner){ border:0 !important; align-items:center }

/* Optional: safe-area top padding fallback if status bar overlays */
ion-app.force-statusbar-padding { --ion-safe-area-top: 20px }
</style>
