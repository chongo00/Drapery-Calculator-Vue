<template>
  <ion-header>
    <ion-toolbar>
      <ion-title>Calculation Results</ion-title>
      <ion-buttons slot="end">
        <ion-button @click="closeModal">Close</ion-button>
      </ion-buttons>
    </ion-toolbar>
  </ion-header>
  <ion-content class="ion-padding">
    <ion-card>
      <ion-card-content>
        <ion-item>
          <ion-label>
            <strong>Width:</strong> {{ result.width }} <span class="fractions">{{ result.widthFraction }}</span> inches
          </ion-label>
        </ion-item>
        <ion-item>
          <ion-label>
            <strong>Height:</strong> {{ result.height }} <span class="fractions">{{ result.heightFraction }}</span> inches
          </ion-label>
        </ion-item>
        <ion-item>
          <ion-label>
            <strong>Product Type:</strong> {{ result.productType == '1' ? 'Ripplefold curtain' : 'Pinch Pleated curtain' }}
          </ion-label>
        </ion-item>
        <ion-item>
          <ion-label>
            <strong>Fullness:</strong> {{ result.fullness }}
          </ion-label>
        </ion-item>
        <ion-item>
          <ion-label>
            <strong>Required Fabric:</strong> {{ result.requiredFabric }} yards
          </ion-label>
        </ion-item>
        <ion-item>
          <ion-label>
            <strong>Fabric Orientation:</strong> {{ result.fabricOrientation }}
          </ion-label>
        </ion-item>
        <ion-item>
          <ion-label>
            <strong>Fabric Widths:</strong> {{ result.fabricWidths }}
          </ion-label>
        </ion-item>
        <ion-item>
          <ion-label>
            <strong>Fabric Cuts:</strong> {{ result.fabricCuts }} x {{ result.fabricCutLength }} <span class="fractions">{{ result.fabricCutsFraction }}</span> inches
          </ion-label>
        </ion-item>
        <ion-item v-if="result.productType == '1'">
          <ion-label>
            <strong>Required Snaps:</strong> {{ result.requiredSnaps }}
          </ion-label>
        </ion-item>
      </ion-card-content>
    </ion-card>
  </ion-content>
</template>

<script setup lang="ts">
import { IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonContent, IonCard, IonCardContent, IonItem, IonLabel, modalController } from '@ionic/vue';

interface Props {
  result: {
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
  };
}

const props = defineProps<Props>();

const closeModal = () => {
  modalController.dismiss();
};
</script>

<style scoped>
.fractions {
  font-style: italic;
}
</style>
