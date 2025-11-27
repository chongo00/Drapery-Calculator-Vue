<template>
  <ion-page class="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-neutral-900 dark:to-neutral-950">
    <ion-header class="bg-white dark:bg-neutral-950 shadow-lg">
      <ion-toolbar class="bg-transparent">
        <ion-title class="text-2xl font-bold text-gray-800 dark:text-gray-100"><span class="title-inline"><img :src="appIcon" class="w-7 h-7 rounded" alt="" /><span>{{ t.calculator.title }}</span></span></ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding bg-transparent">
      <ion-header collapse="condense" class="bg-white dark:bg-neutral-950">
        <ion-toolbar class="bg-transparent">
          <ion-title size="large" class="text-xl font-semibold text-gray-700 dark:text-gray-100"><span class="title-inline"><img :src="appIcon" class="w-7 h-7 rounded" alt="" /><span>{{ t.calculator.title }}</span></span></ion-title>
        </ion-toolbar>
      </ion-header>

      <div class="max-w-md mx-auto bg-white dark:bg-neutral-900/60 dark:border dark:border-white/10 rounded-xl shadow-lg p-6">
        <h2 class="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">{{ t.calculator.calculateFabricNeeds }}</h2>
        <form @submit.prevent="handleSubmit" class="space-y-4 form-anchor">
          <div class="space-y-4">
            <ion-item lines="none" class="bg-gray-50 dark:bg-transparent dark:text-gray-100 rounded-lg dark:border dark:border-white/10">
              <ion-label position="stacked" class="text-sm font-medium text-gray-700 dark:text-gray-200">{{ t.calculator.width }} ({{ measurementSystem.getUnitLabel() }})</ion-label>
              <ion-input v-model="form.width" type="number" :step="measurementSystem.isMetric ? '0.1' : '1'" class="text-gray-700 dark:text-gray-100" @ionBlur="handleTouched('width')" @ionInput="handleTouched('width')"></ion-input>
            </ion-item>
            <ion-item v-if="measurementSystem.isImperial" lines="none" class="bg-gray-50 dark:bg-transparent dark:text-gray-100 rounded-lg dark:border dark:border-white/10">
              <ion-label position="stacked" class="text-sm font-medium text-gray-700 dark:text-gray-200">{{ t.calculator.widthFraction }}</ion-label>
              <ion-select v-model="form.widthFraction" :placeholder="t.calculator.select" interface="action-sheet" class="text-gray-700 dark:text-gray-100" @ionChange="handleTouched('widthFraction')">
                <ion-select-option value="0">0</ion-select-option>
                <ion-select-option value="0.125">1/8</ion-select-option>
                <ion-select-option value="0.25">1/4</ion-select-option>
                <ion-select-option value="0.375">3/8</ion-select-option>
                <ion-select-option value="0.5">1/2</ion-select-option>
                <ion-select-option value="0.625">5/8</ion-select-option>
                <ion-select-option value="0.75">3/4</ion-select-option>
                <ion-select-option value="0.875">7/8</ion-select-option>
              </ion-select>
            </ion-item>
            <ion-item lines="none" class="bg-gray-50 dark:bg-transparent dark:text-gray-100 rounded-lg dark:border dark:border-white/10">
              <ion-label position="stacked" class="text-sm font-medium text-gray-700 dark:text-gray-200">{{ t.calculator.height }} ({{ measurementSystem.getUnitLabel() }})</ion-label>
              <ion-input v-model="form.height" type="number" :step="measurementSystem.isMetric ? '0.1' : '1'" class="text-gray-700 dark:text-gray-100" @ionBlur="handleTouched('height')" @ionInput="handleTouched('height')"></ion-input>
            </ion-item>
            <ion-item v-if="measurementSystem.isImperial" lines="none" class="bg-gray-50 dark:bg-transparent dark:text-gray-100 rounded-lg dark:border dark:border-white/10">
              <ion-label position="stacked" class="text-sm font-medium text-gray-700 dark:text-gray-200">{{ t.calculator.heightFraction }}</ion-label>
              <ion-select v-model="form.heightFraction" :placeholder="t.calculator.select" interface="action-sheet" class="text-gray-700 dark:text-gray-100" @ionChange="handleTouched('heightFraction')">
                <ion-select-option value="0">0</ion-select-option>
                <ion-select-option value="0.125">1/8</ion-select-option>
                <ion-select-option value="0.25">1/4</ion-select-option>
                <ion-select-option value="0.375">3/8</ion-select-option>
                <ion-select-option value="0.5">1/2</ion-select-option>
                <ion-select-option value="0.625">5/8</ion-select-option>
                <ion-select-option value="0.75">3/4</ion-select-option>
                <ion-select-option value="0.875">7/8</ion-select-option>
              </ion-select>
            </ion-item>
          </div>
          <p v-if="shouldShowError('width') && v$.width.required.$invalid" class="validation-error">{{ t.calculator.widthRequired }}</p>
          <p v-else-if="shouldShowError('width') && v$.width.minValue.$invalid" class="validation-error">{{ t.calculator.widthGreaterThanZero }}</p>
          <p v-else-if="shouldShowError('width') && (v$.width.integer as any)?.$invalid" class="validation-error">{{ t.calculator.widthMustBeInteger }}</p>
          <p v-if="shouldShowError('height') && v$.height.required.$invalid" class="validation-error">{{ t.calculator.heightRequired }}</p>
          <p v-else-if="shouldShowError('height') && v$.height.minValue.$invalid" class="validation-error">{{ t.calculator.heightGreaterThanZero }}</p>
          <p v-else-if="shouldShowError('height') && (v$.height.integer as any)?.$invalid" class="validation-error">{{ t.calculator.heightMustBeInteger }}</p>

          <div class="section-card space-y-3">
            <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wide">{{ t.calculator.productType }}</h3>
            <ion-radio-group v-model="form.productType" class="flex flex-col space-y-3" @ionChange="handleTouched('productType')">
              <ion-item button :detail="false" lines="none" class="bg-transparent dark:bg-transparent rounded-lg cursor-pointer" @click="form.productType = '1'; handleTouched('productType')">
                <ion-label class="text-sm text-gray-700 dark:text-gray-100">{{ t.calculator.ripplefoldCurtain }}</ion-label>
                <ion-radio slot="start" value="1" class="text-blue-500"></ion-radio>
              </ion-item>
              <ion-item button :detail="false" lines="none" class="bg-transparent dark:bg-transparent rounded-lg cursor-pointer" @click="form.productType = '2'; handleTouched('productType')">
                <ion-label class="text-sm text-gray-700 dark:text-gray-100">{{ t.calculator.pinchPleatedCurtain }}</ion-label>
                <ion-radio slot="start" value="2" class="text-blue-500"></ion-radio>
              </ion-item>
            </ion-radio-group>
          </div>
          <p v-if="shouldShowError('productType') && v$.productType.required.$invalid" class="validation-error">{{ t.calculator.productRequired }}</p>

          <div class="space-y-4">
            <ion-item lines="none" class="bg-gray-50 dark:bg-transparent dark:text-gray-100 rounded-lg dark:border dark:border-white/10">
              <ion-label position="stacked" class="text-sm font-medium text-gray-700 dark:text-gray-200">{{ t.calculator.fabricWidth }} ({{ measurementSystem.getUnitLabel() }})</ion-label>
              <ion-select v-model="form.fabricWidth" :placeholder="t.calculator.select" interface="action-sheet" class="text-gray-700 dark:text-gray-100" @ionChange="handleTouched('fabricWidth')">
                <ion-select-option v-for="opt in fabricWidthOptionsDisplay" :key="opt.value" :value="opt.value">{{ opt.label }}</ion-select-option>
              </ion-select>
            </ion-item>
            <ion-item lines="none" class="bg-gray-50 dark:bg-transparent dark:text-gray-100 rounded-lg dark:border dark:border-white/10">
              <ion-label position="stacked" class="text-sm font-medium text-gray-700 dark:text-gray-200">{{ t.calculator.verticalRepeat }} ({{ measurementSystem.getUnitLabel() }})</ion-label>
              <ion-input v-model="form.verticalRepeat" type="number" :step="measurementSystem.isMetric ? '0.1' : '1'" class="text-gray-700 dark:text-gray-100" @ionBlur="handleTouched('verticalRepeat')"></ion-input>
            </ion-item>
          </div>
          <p v-if="shouldShowError('fabricWidth') && v$.fabricWidth.required.$invalid" class="validation-error">{{ t.calculator.fabricWidthRequired }}</p>
          <p v-if="shouldShowError('verticalRepeat') && v$.verticalRepeat.minValue.$invalid" class="validation-error">{{ t.calculator.verticalRepeatGreaterThanOrEqualZero }}</p>

          <div v-if="form.productType === '1'" class="section-card space-y-3">
            <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wide">{{ t.calculator.ripplefoldFullness }}</h3>
            <ion-select v-model="form.RFFullness" :placeholder="t.calculator.select" interface="action-sheet" class="text-gray-700 dark:text-gray-100" @ionChange="handleTouched('RFFullness')">
              <ion-select-option value="60">60%</ion-select-option>
              <ion-select-option value="80">80%</ion-select-option>
              <ion-select-option value="100">100%</ion-select-option>
              <ion-select-option value="120">120%</ion-select-option>
            </ion-select>
            <p v-if="shouldShowError('RFFullness') && v$.RFFullness.required.$invalid" class="validation-error">{{ t.calculator.ripplefoldFullnessRequired }}</p>
          </div>

          <div v-if="form.productType === '2'" class="section-card space-y-3">
            <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wide">{{ t.calculator.pinchPleatFullness }}</h3>
            <ion-select v-model="form.PPFullness" :placeholder="t.calculator.select" interface="action-sheet" class="text-gray-700 dark:text-gray-100" @ionChange="handleTouched('PPFullness')">
              <ion-select-option value="2">2</ion-select-option>
              <ion-select-option value="2.5">2.5</ion-select-option>
              <ion-select-option value="3">3</ion-select-option>
              <ion-select-option value="3.5">3.5</ion-select-option>
            </ion-select>
            <p v-if="shouldShowError('PPFullness') && v$.PPFullness.required.$invalid" class="validation-error">{{ t.calculator.pinchPleatFullnessRequired }}</p>
          </div>

          <div class="space-y-4">
            <ion-item lines="none" class="bg-gray-50 dark:bg-transparent dark:text-gray-100 rounded-lg dark:border dark:border-white/10">
              <ion-label position="stacked" class="text-sm font-medium text-gray-700 dark:text-gray-200">{{ t.calculator.return }} ({{ measurementSystem.getUnitLabel() }})</ion-label>
              <ion-input v-model="form.return" type="number" :step="measurementSystem.isMetric ? '0.1' : '1'" class="text-gray-700 dark:text-gray-100" @ionBlur="handleTouched('return')"></ion-input>
            </ion-item>
            <ion-item lines="none" class="bg-gray-50 dark:bg-transparent dark:text-gray-100 rounded-lg dark:border dark:border-white/10">
              <ion-label position="stacked" class="text-sm font-medium text-gray-700 dark:text-gray-200">{{ t.calculator.hem }} ({{ measurementSystem.getUnitLabel() }})</ion-label>
              <ion-input v-model="form.hem" type="number" :step="measurementSystem.isMetric ? '0.1' : '1'" class="text-gray-700 dark:text-gray-100" @ionBlur="handleTouched('hem')"></ion-input>
            </ion-item>
          </div>
          <p v-if="shouldShowError('return') && v$.return.required.$invalid" class="validation-error">{{ t.calculator.returnRequired }}</p>
          <p v-else-if="shouldShowError('return') && v$.return.minValue.$invalid" class="validation-error">{{ t.calculator.returnGreaterThanOrEqualZero }}</p>
          <p v-if="shouldShowError('hem') && v$.hem.required.$invalid" class="validation-error">{{ t.calculator.hemRequired }}</p>
          <p v-else-if="shouldShowError('hem') && v$.hem.minValue.$invalid" class="validation-error">{{ t.calculator.hemGreaterThanOrEqualZero }}</p>

          <div class="section-card space-y-3">
            <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wide">{{ t.calculator.opening }}</h3>
            <ion-radio-group v-model="form.opening" class="flex flex-col space-y-3 text-gray-700 dark:text-gray-100" @ionChange="handleTouched('opening')">
              <ion-item button :detail="false" lines="none" class="bg-transparent dark:bg-transparent rounded-lg cursor-pointer" @click="form.opening = '1'; handleTouched('opening')">
                <ion-label class="text-sm">{{ t.calculator.onWay }}</ion-label>
                <ion-radio slot="start" value="1" class="text-blue-500"></ion-radio>
              </ion-item>
              <ion-item button :detail="false" lines="none" class="bg-transparent dark:bg-transparent rounded-lg cursor-pointer" @click="form.opening = '2'; handleTouched('opening')">
                <ion-label class="text-sm">{{ t.calculator.centerOpen }}</ion-label>
                <ion-radio slot="start" value="2" class="text-blue-500"></ion-radio>
              </ion-item>
            </ion-radio-group>
          </div>
          <p v-if="shouldShowError('opening') && v$.opening.required.$invalid" class="validation-error">{{ t.calculator.openingRequired }}</p>

          <div class="section-card space-y-3">
            <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wide">{{ t.calculator.allowRailroad }}</h3>
            <ion-radio-group v-model="form.railroad" class="flex flex-col space-y-3 text-gray-700 dark:text-gray-100" @ionChange="handleTouched('railroad')">
              <ion-item button :detail="false" lines="none" class="bg-transparent dark:bg-transparent rounded-lg cursor-pointer" @click="form.railroad = '1'; handleTouched('railroad')">
                <ion-label class="text-sm">{{ t.common.yes }}</ion-label>
                <ion-radio slot="start" value="1" class="text-blue-500"></ion-radio>
              </ion-item>
              <ion-item button :detail="false" lines="none" class="bg-transparent dark:bg-transparent rounded-lg cursor-pointer" @click="form.railroad = '0'; handleTouched('railroad')">
                <ion-label class="text-sm">{{ t.common.no }}</ion-label>
                <ion-radio slot="start" value="0" class="text-blue-500"></ion-radio>
              </ion-item>
            </ion-radio-group>
          </div>
          <p v-if="shouldShowError('railroad') && v$.railroad.required.$invalid" class="validation-error">{{ t.calculator.pleaseSelectOption }}</p>

          <div v-if="showErrorBanner" class="bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-200 px-4 py-3 rounded-lg" role="alert">
            <strong class="font-semibold">{{ t.calculator.oops }}</strong>
            <span class="ml-1">{{ t.calculator.thereAreErrors }}</span>
          </div>

          <ion-button expand="block" type="submit" class="calculate-btn">{{ t.calculator.calculateFabricNeeds }}</ion-button>
        </form>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { reactive, ref, computed, watch } from 'vue';
import { 
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonItem, IonLabel, IonInput, IonSelect, IonSelectOption, IonRadioGroup, IonRadio, IonButton
} from '@ionic/vue';
import { modalController } from '@ionic/vue';
import ResultModal from '@/components/ResultModal.vue';
import useVuelidate from '@vuelidate/core';
import { required, minValue, helpers } from '@vuelidate/validators';
import appIcon from '../../icons/icon-128.webp';
import { useSettings } from '@/composables/useSettings';
import { useI18n } from '@/composables/useI18n';
import { useMeasurementSystem } from '@/composables/useMeasurementSystem';

const { t } = useI18n();
const measurementSystem = useMeasurementSystem();

// Storage helpers (localStorage for compatibility)
const getStorageItem = (key: string) => {
  return localStorage.getItem(key);
};

const setStorageItem = (key: string, value: string) => {
  localStorage.setItem(key, value);
};

const form = reactive({
  width: '',
  height: '',
  widthFraction: '0',
  heightFraction: '0',
  productType: '1',
  fabricWidth: '54',
  verticalRepeat: '0',
  RFFullness: '100',
  PPFullness: '2.5',
  return: '0',
  hem: '0',
  opening: '1',
  railroad: '0'
});

type FormField = keyof typeof form;

const rules = computed(() => ({
  width: {
    required,
    minValue: minValue(0.1),
    ...(measurementSystem.isImperial.value ? {
      integer: helpers.withParams({ type: 'integer' }, (value: string) => {
        if (!value) return true;
        return Number.isInteger(Number(value));
      })
    } : {})
  },
  height: {
    required,
    minValue: minValue(0.1),
    ...(measurementSystem.isImperial.value ? {
      integer: helpers.withParams({ type: 'integer' }, (value: string) => {
        if (!value) return true;
        return Number.isInteger(Number(value));
      })
    } : {})
  },
  RFFullness: { required },
  PPFullness: { required },
  return: { required, minValue: minValue(0) },
  hem: { required, minValue: minValue(0) },
  opening: { required },
  railroad: { required },
  verticalRepeat: { minValue: minValue(0) },
  fabricWidth: { required }
}));

const v$ = useVuelidate(rules, form);
const submitted = ref(false);
const showErrorBanner = ref(false);

const handleTouched = (field: FormField) => {
  showErrorBanner.value = false;
  const control = v$.value[field];
  if (control) {
    control.$touch();
  }
};

const shouldShowError = (field: FormField) => {
  const control = v$.value[field];
  if (!control) return false;
  return (submitted.value || control.$dirty) && control.$invalid;
};

// Settings
const { state: appSettings } = useSettings();

// Fabric width options converted to current measurement system
const fabricWidthOptionsDisplay = computed(() => {
  return appSettings.fabricWidthOptions.map(width => {
    const converted = measurementSystem.fromInches(width);
    return {
      value: String(width), // Store original inches value for calculations
      label: `${converted.value.toFixed(1)} ${converted.unit}`
    };
  });
});

// Watch measurement system changes and reset fractions if switching to metric
watch(() => measurementSystem.system.value, (newSystem) => {
  if (newSystem === 'metric') {
    form.widthFraction = '0';
    form.heightFraction = '0';
  }
});

const runCalculation = async () => {
  const _panels = parseInt(form.opening);
  
  let _fullness = parseFloat(form.PPFullness);
  if (form.productType === '1') {
    const map = appSettings.ripplefoldFullness as any;
    _fullness = map[form.RFFullness] ?? map['100'];
  }

  // Convert input values from current system to inches for calculations
  const widthInches = measurementSystem.toInches(parseFloat(form.width) || 0, measurementSystem.getUnitLabel()) + 
                      (measurementSystem.isImperial ? parseFloat(form.widthFraction) : 0);
  const heightInches = measurementSystem.toInches(parseFloat(form.height) || 0, measurementSystem.getUnitLabel()) + 
                       (measurementSystem.isImperial ? parseFloat(form.heightFraction) : 0);
  const hemInches = measurementSystem.toInches(parseFloat(form.hem) || 0, measurementSystem.getUnitLabel());
  const returnInches = measurementSystem.toInches(parseFloat(form.return) || 0, measurementSystem.getUnitLabel());
  const verticalRepeatInches = measurementSystem.toInches(parseFloat(form.verticalRepeat) || 0, measurementSystem.getUnitLabel());

  const drop = heightInches;
  const panelHeight = drop + hemInches + appSettings.easeAllowance;
  const _totalWidth = (widthInches * _fullness) + (_panels * (returnInches + appSettings.widthMargin));

  let _requiredWidths: number;
  let _requiredFabric: number;
  let _requiredCutLength: number;
  let _requiredCuts: number;
  let _fabricOrientation: string;

  const fabricW = parseFloat(form.fabricWidth);
  const allowRailroad = (form.railroad === '1') && (appSettings.railroadStrict ? (panelHeight < fabricW) : (panelHeight <= fabricW));
  if (allowRailroad) {
    _fabricOrientation = "Railroad";
    _requiredWidths = 1;
    _requiredCuts = _panels;
    _requiredCutLength = _totalWidth / _panels;
    _requiredFabric = _totalWidth;
  } else {
    _fabricOrientation = "Regular";
    _requiredWidths = Math.ceil(_totalWidth / parseFloat(form.fabricWidth));
    _requiredCuts = _requiredWidths;
    _requiredCutLength = panelHeight + parseFloat(form.verticalRepeat);
    _requiredFabric = _requiredWidths * _requiredCutLength;
  }
  
  let _requiredSnaps = 0;
  if (form.productType === '1') {
    const sep = appSettings.rfSnapSeparation;
    _requiredSnaps = _panels * Math.ceil(((parseFloat(form.width) + parseFloat(form.widthFraction)) * _fullness / _panels) / sep);
  }

  // Format dimensions for display in current system
  const widthDisplay = measurementSystem.fromInches(widthInches);
  const heightDisplay = measurementSystem.fromInches(heightInches);
  const hemDisplay = measurementSystem.fromInches(hemInches);
  const cutLengthDisplay = measurementSystem.fromInches(_requiredCutLength);

  const result = {
    requiredFabric: Math.ceil(_requiredFabric / 36),
    fabricWidths: _requiredWidths,
    fabricCuts: _requiredCuts,
    fabricCutsFraction: measurementSystem.isImperial 
      ? (parseDecimalToFraction(_requiredCutLength) === "1" ? "" : parseDecimalToFraction(_requiredCutLength))
      : "",
    fabricCutLength: measurementSystem.isImperial
      ? (parseDecimalToFraction(_requiredCutLength) === "1" ? Math.floor(_requiredCutLength + 1) : Math.floor(_requiredCutLength))
      : Math.round(cutLengthDisplay.value * 10) / 10,
    requiredSnaps: _requiredSnaps,
    productType: form.productType,
    fabricOrientation: _fabricOrientation,
    width: widthDisplay.value.toFixed(measurementSystem.isMetric ? 1 : 0),
    widthFraction: measurementSystem.isImperial ? parseStringToFraction(form.widthFraction) : "",
    height: heightDisplay.value.toFixed(measurementSystem.isMetric ? 1 : 0),
    heightFraction: measurementSystem.isImperial ? parseStringToFraction(form.heightFraction) : "",
    widthUnit: widthDisplay.unit,
    heightUnit: heightDisplay.unit,
    cutLengthUnit: cutLengthDisplay.unit,
    fullness: form.productType === '2' ? form.PPFullness : form.RFFullness + "%",
    hem: hemDisplay.value.toFixed(measurementSystem.isMetric ? 1 : 0),
    hemUnit: hemDisplay.unit,
    easeAllowance: appSettings.easeAllowance,
    measurementSystem: measurementSystem.system.value
  };

  // Store in history BEFORE showing the modal
  try {
    const value = getStorageItem('calculationHistory');
    const history = value ? JSON.parse(value) : [];
    const newEntry = { ...result, timestamp: new Date().toISOString() };
    history.unshift(newEntry);
    const updatedHistory = history.slice(0, 50);
    setStorageItem('calculationHistory', JSON.stringify(updatedHistory));
    console.log('✓ Calculation saved to history:', newEntry);
  } catch (error) {
    console.error('✗ Failed to save calculation to history:', error);
  }

  const modal = await modalController.create({
    component: ResultModal,
    componentProps: {
      result
    }
  });
  await modal.present();
};

const handleSubmit = async () => {
  submitted.value = true;
  showErrorBanner.value = false;
  const isValid = await v$.value.$validate();
  if (!isValid) {
    showErrorBanner.value = true;
    return;
  }
  await runCalculation();
};

const parseDecimalToFraction = (number: number): string => {
  const integerValue = Math.floor(number);
  const fractionValue = number - integerValue;
  let fraction = "";
  if (fractionValue >= 0 && fractionValue <= 0.0625) {
    fraction = "";
  } else if (fractionValue > 0.0625 && fractionValue <= 0.1875) {
    fraction = "1/8";
  } else if (fractionValue > 0.1875 && fractionValue <= 0.3125) {
    fraction = "1/4";
  } else if (fractionValue > 0.3125 && fractionValue <= 0.4375) {
    fraction = "3/8";
  } else if (fractionValue > 0.4375 && fractionValue <= 0.5625) {
    fraction = "1/2";
  } else if (fractionValue > 0.5625 && fractionValue <= 0.6875) {
    fraction = "5/8";
  } else if (fractionValue > 0.6875 && fractionValue <= 0.8125) {
    fraction = "3/4";
  } else if (fractionValue > 0.8125 && fractionValue <= 0.9375) {
    fraction = "7/8";
  } else { 
    fraction = "1";
  }
  return fraction;
};

const parseStringToFraction = (value: string): string => {
  switch(value) {
    case "0.125": return "1/8";
    case "0.25": return "1/4";
    case "0.375": return "3/8";
    case "0.5": return "1/2";
    case "0.625": return "5/8";
    case "0.75": return "3/4";
    case "0.875": return "7/8";
  }
  return "";
};
</script>

<style scoped>
:deep(ion-title .title-inline) {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}
:deep(ion-title .title-inline img) {
  display: inline-block;
  vertical-align: middle;
}

:deep(ion-content::part(scroll)) {
  overscroll-behavior-y: contain;
  padding-bottom: 16px;
}

.form-anchor {
  overflow-anchor: none; /* avoid scroll jump when validation text mounts/unmounts */
}

.validation-error {
  margin-top: 0.25rem;
  padding-left: 0.25rem;
  font-size: 0.75rem;
  font-weight: 600;
  color: #dc2626; /* red-600 */
}

.dark .validation-error {
  color: #f87171; /* lighter red for dark mode */
}

.dark .validation-error {
  color: #f87171; /* lighter red for dark mode */
}

/* Nicer primary action button without double-background look */
.calculate-btn {
  --background: #2563eb; /* blue-600 */
  --background-hover: #1d4ed8; /* blue-700 */
  --background-activated: #1e40af; /* blue-800 */
  --color: #ffffff;
  --border-radius: 0.75rem; /* rounded-lg */
  --padding-top: 0.875rem; /* py-3.5 approx */
  --padding-bottom: 0.875rem;
  --box-shadow: 0 6px 14px rgba(37, 99, 235, 0.35);
  font-weight: 600;
}

/* Reusable section container for groups (modern, subtle) */
.section-card {
  background: #f9fafb; /* gray-50 */
  border: 1px solid rgba(0, 0, 0, 0.05);
  border-radius: 0.75rem;
  padding: 1rem;
}
.dark .section-card {
  background: rgba(17, 24, 39, 0.6); /* neutral-900 with transparency */
  border: 1px solid rgba(255, 255, 255, 0.1);
}
</style>
