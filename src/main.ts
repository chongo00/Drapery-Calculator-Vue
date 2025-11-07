import { createApp } from 'vue'
import App from './App.vue'
import router from './router';

import { IonicVue } from '@ionic/vue';

/* Core CSS required for Ionic components to work properly */
import '@ionic/vue/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/vue/css/normalize.css';
import '@ionic/vue/css/structure.css';
import '@ionic/vue/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/vue/css/padding.css';
import '@ionic/vue/css/float-elements.css';
import '@ionic/vue/css/text-alignment.css';
import '@ionic/vue/css/text-transformation.css';
import '@ionic/vue/css/flex-utils.css';
import '@ionic/vue/css/display.css';

/**
 * Ionic Dark Mode
 * -----------------------------------------------------
 * For more info, please see:
 * https://ionicframework.com/docs/theming/dark-mode
 */

/* @import '@ionic/vue/css/palettes/dark.always.css'; */
/* @import '@ionic/vue/css/palettes/dark.class.css'; */
import '@ionic/vue/css/palettes/dark.class.css';

/* Theme variables */
import './theme/variables.css';

const app = createApp(App)
  .use(IonicVue)
  .use(router);

router.isReady().then(() => {
  // Apply saved dark mode preference at boot
  try {
    const saved = localStorage.getItem('darkMode');
    const isDark = saved === 'true';
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
  } catch (err) {
    void err;
  }

  app.mount('#app');
});
