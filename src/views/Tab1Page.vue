<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Drapery Calculator</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true">
      <ion-header collapse="condense">
        <ion-toolbar>
          <ion-title size="large">Drapery Calculator</ion-title>
        </ion-toolbar>
      </ion-header>

      <form @submit.prevent="calculate">
        <ion-list>
          <ion-item>
            <ion-label position="stacked">Width (inches)</ion-label>
            <ion-input v-model="form.width" type="number" :counter="true" :maxlength="10"></ion-input>
          </ion-item>
          <ion-item>
            <ion-label position="stacked">Width Fraction</ion-label>
            <ion-select v-model="form.widthFraction" placeholder="Select">
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
          <ion-item>
            <ion-label position="stacked">Height (inches)</ion-label>
            <ion-input v-model="form.height" type="number" :counter="true" :maxlength="10"></ion-input>
          </ion-item>
          <ion-item>
            <ion-label position="stacked">Height Fraction</ion-label>
            <ion-select v-model="form.heightFraction" placeholder="Select">
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
          <ion-item>
            <ion-label position="stacked">Product</ion-label>
            <ion-radio-group v-model="form.productType">
              <ion-list-header>
                <ion-label>Product Type</ion-label>
              </ion-list-header>
              <ion-item>
                <ion-label>Ripplefold curtain</ion-label>
                <ion-radio slot="start" value="1"></ion-radio>
              </ion-item>
              <ion-item>
                <ion-label>Pinch Pleated curtain</ion-label>
                <ion-radio slot="start" value="2"></ion-radio>
              </ion-item>
            </ion-radio-group>
          </ion-item>
          <ion-item>
            <ion-label position="stacked">Fabric width (inches)</ion-label>
            <ion-select v-model="form.fabricWidth" placeholder="Select">
              <ion-select-option value="54">54</ion-select-option>
              <ion-select-option value="108">108</ion-select-option>
              <ion-select-option value="110">110</ion-select-option>
              <ion-select-option value="118">118</ion-select-option>
            </ion-select>
          </ion-item>
          <ion-item>
            <ion-label position="stacked">Vertical repeat (inches)</ion-label>
            <ion-input v-model="form.verticalRepeat" type="number"></ion-input>
          </ion-item>
          <ion-item v-if="form.productType === '1'">
            <ion-label position="stacked">Fullness (%)</ion-label>
            <ion-select v-model="form.RFFullness" placeholder="Select">
              <ion-select-option value="60">60%</ion-select-option>
              <ion-select-option value="80">80%</ion-select-option>
              <ion-select-option value="100">100%</ion-select-option>
              <ion-select-option value="120">120%</ion-select-option>
            </ion-select>
          </ion-item>
          <ion-item v-if="form.productType === '2'">
            <ion-label position="stacked">Fullness</ion-label>
            <ion-select v-model="form.PPFullness" placeholder="Select">
              <ion-select-option value="2">2</ion-select-option>
              <ion-select-option value="2.5">2.5</ion-select-option>
              <ion-select-option value="3">3</ion-select-option>
              <ion-select-option value="3.5">3.5</ion-select-option>
            </ion-select>
          </ion-item>
          <ion-item>
            <ion-label position="stacked">Return (inches)</ion-label>
            <ion-input v-model="form.return" type="number"></ion-input>
          </ion-item>
          <ion-item>
            <ion-label position="stacked">Opening</ion-label>
            <ion-radio-group v-model="form.opening">
              <ion-list-header>
                <ion-label>Opening Type</ion-label>
              </ion-list-header>
              <ion-item>
                <ion-label>On way</ion-label>
                <ion-radio slot="start" value="1"></ion-radio>
              </ion-item>
              <ion-item>
                <ion-label>Center open</ion-label>
                <ion-radio slot="start" value="2"></ion-radio>
              </ion-item>
            </ion-radio-group>
          </ion-item>
          <ion-item>
            <ion-label position="stacked">Allow Railroad</ion-label>
            <ion-radio-group v-model="form.railroad">
              <ion-list-header>
                <ion-label>Allow Railroad</ion-label>
              </ion-list-header>
              <ion-item>
                <ion-label>Yes</ion-label>
                <ion-radio slot="start" value="1"></ion-radio>
              </ion-item>
              <ion-item>
                <ion-label>No</ion-label>
                <ion-radio slot="start" value="0"></ion-radio>
              </ion-item>
            </ion-radio-group>
          </ion-item>
        </ion-list>
        <ion-button expand="block" type="submit">Calculate</ion-button>
      </form>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { reactive, computed } from 'vue';
import { 
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem, IonLabel, IonInput, IonSelect, IonSelectOption, IonRadioGroup, IonRadio, IonListHeader, IonButton
} from '@ionic/vue';
import { modalController } from '@ionic/vue';
import ResultModal from '@/components/ResultModal.vue';

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

// Constantes
const widthMargin = 10;
const heightMargin = 10;
const rfSnapSeparation = 4.25;
const ripplefoldFullness60 = 1.8;
const ripplefoldFullness80 = 2.0;
const ripplefoldFullness100 = 2.2;
const ripplefoldFullness120 = 2.4;

const calculate = async () => {
  let _panels = parseInt(form.opening);
  
  let _fullness: number;
  if (form.productType === '1') {
    if (form.RFFullness === "60") {
      _fullness = ripplefoldFullness60;
    } else if (form.RFFullness === "80") {
      _fullness = ripplefoldFullness80;
    } else if (form.RFFullness === "100") {
      _fullness = ripplefoldFullness100;
    } else if (form.RFFullness === "120") {
      _fullness = ripplefoldFullness120;
    }
  } else {
    _fullness = parseFloat(form.PPFullness);
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

  const modal = await modalController.create({
    component: ResultModal,
    componentProps: {
      result
    }
  });
  await modal.present();
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
