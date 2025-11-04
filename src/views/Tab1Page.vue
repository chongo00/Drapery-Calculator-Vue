<template>
  <ion-page class="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-neutral-900 dark:to-neutral-950">
    <ion-header class="bg-white dark:bg-neutral-950 shadow-lg">
      <ion-toolbar class="bg-transparent">
        <ion-title class="text-2xl font-bold text-gray-800 dark:text-gray-100">Drapery Calculator</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding bg-transparent">
      <ion-header collapse="condense" class="bg-white dark:bg-neutral-950">
        <ion-toolbar class="bg-transparent">
          <ion-title size="large" class="text-xl font-semibold text-gray-700 dark:text-gray-100">Drapery Calculator</ion-title>
        </ion-toolbar>
      </ion-header>

      <div class="max-w-md mx-auto bg-white dark:bg-neutral-900/60 dark:border dark:border-white/10 rounded-xl shadow-lg p-6">
        <h2 class="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">Calculate Your Fabric Needs</h2>
        <form @submit.prevent="handleSubmit" class="space-y-4 form-anchor">
          <div class="grid grid-cols-1 gap-4">
            <ion-item lines="none" class="bg-gray-50 dark:bg-transparent dark:text-gray-100 rounded-lg dark:border dark:border-white/10">
              <ion-label position="stacked" class="text-sm font-medium text-gray-700 dark:text-gray-200">Width (inches)</ion-label>
              <ion-input v-model="form.width" type="number" class="text-gray-700 dark:text-gray-100" @ionBlur="handleTouched('width')" @ionInput="handleTouched('width')"></ion-input>
            </ion-item>
            <p v-if="shouldShowError('width') && v$.width.required.$invalid" class="validation-error">Width is required</p>
            <p v-else-if="shouldShowError('width') && v$.width.minValue.$invalid" class="validation-error">Width has to be greater than 0</p>
            <p v-else-if="shouldShowError('width') && v$.width.integer.$invalid" class="validation-error">Width must be an integer value</p>
            <ion-item lines="none" class="bg-gray-50 dark:bg-transparent dark:text-gray-100 rounded-lg dark:border dark:border-white/10">
              <ion-label position="stacked" class="text-sm font-medium text-gray-700 dark:text-gray-200">Width Fraction</ion-label>
              <ion-select v-model="form.widthFraction" placeholder="Select" interface="action-sheet" class="text-gray-700 dark:text-gray-100" @ionChange="handleTouched('widthFraction')">
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
              <ion-label position="stacked" class="text-sm font-medium text-gray-700 dark:text-gray-200">Height (inches)</ion-label>
              <ion-input v-model="form.height" type="number" class="text-gray-700 dark:text-gray-100" @ionBlur="handleTouched('height')" @ionInput="handleTouched('height')"></ion-input>
            </ion-item>
            <p v-if="shouldShowError('height') && v$.height.required.$invalid" class="validation-error">Height is required</p>
            <p v-else-if="shouldShowError('height') && v$.height.minValue.$invalid" class="validation-error">Height has to be greater than 0</p>
            <p v-else-if="shouldShowError('height') && v$.height.integer.$invalid" class="validation-error">Height must be an integer value</p>
            <ion-item lines="none" class="bg-gray-50 dark:bg-transparent dark:text-gray-100 rounded-lg dark:border dark:border-white/10">
              <ion-label position="stacked" class="text-sm font-medium text-gray-700 dark:text-gray-200">Height Fraction</ion-label>
              <ion-select v-model="form.heightFraction" placeholder="Select" interface="action-sheet" class="text-gray-700 dark:text-gray-100" @ionChange="handleTouched('heightFraction')">
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

          <div class="section-card space-y-3">
            <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wide">Product Type</h3>
            <ion-radio-group v-model="form.productType" class="flex flex-col space-y-3" @ionChange="handleTouched('productType')">
              <ion-item button :detail="false" lines="none" class="bg-transparent dark:bg-transparent rounded-lg">
                <ion-label class="text-sm text-gray-700 dark:text-gray-100">Ripplefold curtain</ion-label>
                <ion-radio slot="start" value="1" class="text-blue-500"></ion-radio>
              </ion-item>
              <ion-item button :detail="false" lines="none" class="bg-transparent dark:bg-transparent rounded-lg">
                <ion-label class="text-sm text-gray-700 dark:text-gray-100">Pinch Pleated curtain</ion-label>
                <ion-radio slot="start" value="2" class="text-blue-500"></ion-radio>
              </ion-item>
            </ion-radio-group>
          </div>
          <p v-if="shouldShowError('productType') && v$.productType.required.$invalid" class="validation-error">Product is required</p>

          <ion-item lines="none" class="bg-gray-50 dark:bg-transparent dark:text-gray-100 rounded-lg dark:border dark:border-white/10">
            <ion-label position="stacked" class="text-sm font-medium text-gray-700 dark:text-gray-200">Fabric Width (inches)</ion-label>
            <ion-select v-model="form.fabricWidth" placeholder="Select" interface="action-sheet" class="text-gray-700 dark:text-gray-100" @ionChange="handleTouched('fabricWidth')">
              <ion-select-option value="54">54</ion-select-option>
              <ion-select-option value="108">108</ion-select-option>
              <ion-select-option value="110">110</ion-select-option>
              <ion-select-option value="118">118</ion-select-option>
            </ion-select>
          </ion-item>
          <p v-if="shouldShowError('fabricWidth') && v$.fabricWidth.required.$invalid" class="validation-error">Fabric width is required</p>

          <ion-item lines="none" class="bg-gray-50 dark:bg-transparent dark:text-gray-100 rounded-lg dark:border dark:border-white/10">
            <ion-label position="stacked" class="text-sm font-medium text-gray-700 dark:text-gray-200">Vertical Repeat (inches)</ion-label>
            <ion-input v-model="form.verticalRepeat" type="number" class="text-gray-700 dark:text-gray-100" @ionBlur="handleTouched('verticalRepeat')"></ion-input>
          </ion-item>
          <p v-if="shouldShowError('verticalRepeat') && v$.verticalRepeat.required.$invalid" class="validation-error">Vertical repeat is required</p>
          <p v-else-if="shouldShowError('verticalRepeat') && v$.verticalRepeat.minValue.$invalid" class="validation-error">Vertical repeat has to be greater than or equal to 0</p>

          <div v-if="form.productType === '1'" class="section-card space-y-3">
            <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wide">Ripplefold Fullness</h3>
            <ion-select v-model="form.RFFullness" placeholder="Select fullness" interface="action-sheet" class="text-gray-700 dark:text-gray-100" @ionChange="handleTouched('RFFullness')">
              <ion-select-option value="60">60%</ion-select-option>
              <ion-select-option value="80">80%</ion-select-option>
              <ion-select-option value="100">100%</ion-select-option>
              <ion-select-option value="120">120%</ion-select-option>
            </ion-select>
            <p v-if="shouldShowError('RFFullness') && v$.RFFullness.required.$invalid" class="validation-error">Ripplefold fullness is required</p>
          </div>

          <div v-if="form.productType === '2'" class="section-card space-y-3">
            <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wide">Pinch Pleat Fullness</h3>
            <ion-select v-model="form.PPFullness" placeholder="Select fullness" interface="action-sheet" class="text-gray-700 dark:text-gray-100" @ionChange="handleTouched('PPFullness')">
              <ion-select-option value="2">2</ion-select-option>
              <ion-select-option value="2.5">2.5</ion-select-option>
              <ion-select-option value="3">3</ion-select-option>
              <ion-select-option value="3.5">3.5</ion-select-option>
            </ion-select>
            <p v-if="shouldShowError('PPFullness') && v$.PPFullness.required.$invalid" class="validation-error">Pinch pleat fullness is required</p>
          </div>

          <ion-item lines="none" class="bg-gray-50 dark:bg-transparent dark:text-gray-100 rounded-lg dark:border dark:border-white/10">
            <ion-label position="stacked" class="text-sm font-medium text-gray-700 dark:text-gray-200">Return (inches)</ion-label>
            <ion-input v-model="form.return" type="number" class="text-gray-700 dark:text-gray-100" @ionBlur="handleTouched('return')"></ion-input>
          </ion-item>
          <p v-if="shouldShowError('return') && v$.return.required.$invalid" class="validation-error">Return is required</p>
          <p v-else-if="shouldShowError('return') && v$.return.minValue.$invalid" class="validation-error">Return has to be greater than or equal to 0</p>

          <div class="section-card space-y-3">
            <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wide">Opening</h3>
            <ion-radio-group v-model="form.opening" class="flex flex-col space-y-3 text-gray-700 dark:text-gray-100" @ionChange="handleTouched('opening')">
              <ion-item button :detail="false" lines="none" class="bg-transparent dark:bg-transparent rounded-lg">
                <ion-label class="text-sm">On way</ion-label>
                <ion-radio slot="start" value="1" class="text-blue-500"></ion-radio>
              </ion-item>
              <ion-item button :detail="false" lines="none" class="bg-transparent dark:bg-transparent rounded-lg">
                <ion-label class="text-sm">Center open</ion-label>
                <ion-radio slot="start" value="2" class="text-blue-500"></ion-radio>
              </ion-item>
            </ion-radio-group>
          </div>
          <p v-if="shouldShowError('opening') && v$.opening.required.$invalid" class="validation-error">Opening is required</p>

          <div class="section-card space-y-3">
            <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wide">Allow Railroad</h3>
            <ion-radio-group v-model="form.railroad" class="flex flex-col space-y-3 text-gray-700 dark:text-gray-100" @ionChange="handleTouched('railroad')">
              <ion-item button :detail="false" lines="none" class="bg-transparent dark:bg-transparent rounded-lg">
                <ion-label class="text-sm">Yes</ion-label>
                <ion-radio slot="start" value="1" class="text-blue-500"></ion-radio>
              </ion-item>
              <ion-item button :detail="false" lines="none" class="bg-transparent dark:bg-transparent rounded-lg">
                <ion-label class="text-sm">No</ion-label>
                <ion-radio slot="start" value="0" class="text-blue-500"></ion-radio>
              </ion-item>
            </ion-radio-group>
          </div>
          <p v-if="shouldShowError('railroad') && v$.railroad.required.$invalid" class="validation-error">Please select an option</p>

          <div v-if="showErrorBanner" class="bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-200 px-4 py-3 rounded-lg" role="alert">
            <strong class="font-semibold">Oops!</strong>
            <span class="ml-1">There are errors...</span>
          </div>

          <ion-button expand="block" type="submit" class="calculate-btn">Calculate Fabric Needs</ion-button>
        </form>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { reactive, ref, computed } from 'vue';
import { 
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonItem, IonLabel, IonInput, IonSelect, IonSelectOption, IonRadioGroup, IonRadio, IonButton
} from '@ionic/vue';
import { modalController } from '@ionic/vue';
import ResultModal from '@/components/ResultModal.vue';
import useVuelidate from '@vuelidate/core';
import { required, minValue, helpers } from '@vuelidate/validators';

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
  opening: '1',
  railroad: '0'
});

type FormField = keyof typeof form;

const rules = computed(() => ({
  width: {
    required,
    minValue: minValue(1),
    integer: helpers.withParams({ type: 'integer' }, (value: string) => {
      if (!value) return true;
      return Number.isInteger(Number(value));
    })
  },
  height: {
    required,
    minValue: minValue(1),
    integer: helpers.withParams({ type: 'integer' }, (value: string) => {
      if (!value) return true;
      return Number.isInteger(Number(value));
    })
  },
  RFFullness: { required },
  PPFullness: { required },
  return: { required, minValue: minValue(0) },
  opening: { required },
  railroad: { required }
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

// Constants
const widthMargin = 10;
const heightMargin = 10;
const rfSnapSeparation = 4.25;
const ripplefoldFullness60 = 1.8;
const ripplefoldFullness80 = 2.0;
const ripplefoldFullness100 = 2.2;
const ripplefoldFullness120 = 2.4;

const runCalculation = async () => {
  const _panels = parseInt(form.opening);
  
  let _fullness = parseFloat(form.PPFullness);
  if (form.productType === '1') {
    _fullness = ripplefoldFullness100;
    if (form.RFFullness === "60") {
      _fullness = ripplefoldFullness60;
    } else if (form.RFFullness === "80") {
      _fullness = ripplefoldFullness80;
    } else if (form.RFFullness === "120") {
      _fullness = ripplefoldFullness120;
    }
  }

  const _totalHeight = (parseFloat(form.height) + parseFloat(form.heightFraction)) + heightMargin;
  const _totalWidth = ((parseFloat(form.width) + parseFloat(form.widthFraction)) * _fullness) + (_panels * (parseFloat(form.return) + widthMargin));

  let _requiredWidths: number;
  let _requiredFabric: number;
  let _requiredCutLength: number;
  let _requiredCuts: number;
  let _fabricOrientation: string;

  if ((form.railroad === '1') && (_totalHeight < parseFloat(form.fabricWidth))) {
    _fabricOrientation = "Railroad";
    _requiredWidths = 1;
    _requiredCuts = _panels;
    _requiredCutLength = _totalWidth / _panels;
    _requiredFabric = _totalWidth;
  } else {
    _fabricOrientation = "Regular";
    _requiredWidths = Math.ceil(_totalWidth / parseFloat(form.fabricWidth));
    _requiredCuts = _requiredWidths;
    _requiredCutLength = _totalHeight + parseFloat(form.verticalRepeat);
    _requiredFabric = _requiredWidths * _requiredCutLength;
  }
  
  let _requiredSnaps = 0;
  if (form.productType === '1') {
    _requiredSnaps = _panels * Math.ceil(((parseFloat(form.width) + parseFloat(form.widthFraction)) * _fullness / _panels) / rfSnapSeparation);
  }

  const result = {
    requiredFabric: Math.ceil(_requiredFabric / 36),
    fabricWidths: _requiredWidths,
    fabricCuts: _requiredCuts,
    fabricCutsFraction: parseDecimalToFraction(_requiredCutLength) === "1" ? "" : parseDecimalToFraction(_requiredCutLength),
    fabricCutLength: parseDecimalToFraction(_requiredCutLength) === "1" ? Math.floor(_requiredCutLength + 1) : Math.floor(_requiredCutLength),
    requiredSnaps: _requiredSnaps,
    productType: form.productType,
    fabricOrientation: _fabricOrientation,
    width: form.width,
    widthFraction: parseStringToFraction(form.widthFraction),
    height: form.height,
    heightFraction: parseStringToFraction(form.heightFraction),
    fullness: form.productType === '2' ? form.PPFullness : form.RFFullness + "%"
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
