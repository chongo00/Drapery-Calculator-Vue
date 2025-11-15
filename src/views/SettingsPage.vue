<template>
  <!-- Vista no utilizada. Consultar SettingsPage_fixed.vue -->
  <ion-page>
    <ion-content class="ion-padding">
      <ion-text color="medium">
        <p>Esta vista ya no se usa. Consulta <code>SettingsPage_fixed.vue</code>.</p>
      </ion-text>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonPage, IonContent, IonText } from '@ionic/vue'
</script>

<style scoped>
ion-content {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 60vh;
  text-align: center;
}

p {
  font-size: 0.95rem;
}
</style>
