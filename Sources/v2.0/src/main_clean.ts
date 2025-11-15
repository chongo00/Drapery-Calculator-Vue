import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

import { IonicVue } from '@ionic/vue'
import { SplashScreen } from '@capacitor/splash-screen'
import { StatusBar, Style } from '@capacitor/status-bar'
import { Capacitor } from '@capacitor/core'

/* Core CSS required for Ionic components to work properly */
import '@ionic/vue/css/core.css'

/* Basic CSS for apps built with Ionic */
import '@ionic/vue/css/normalize.css'
import '@ionic/vue/css/structure.css'
import '@ionic/vue/css/typography.css'

/* Optional CSS utils that can be commented out */
import '@ionic/vue/css/padding.css'
import '@ionic/vue/css/float-elements.css'
import '@ionic/vue/css/text-alignment.css'
import '@ionic/vue/css/text-transformation.css'
import '@ionic/vue/css/flex-utils.css'
import '@ionic/vue/css/display.css'

/* Theme palettes */
import '@ionic/vue/css/palettes/dark.class.css'

/* Theme variables */
import './theme/variables.css'

const app = createApp(App)
  .use(IonicVue)
  .use(router)

router.isReady().then(() => {
  // Apply saved dark mode preference at boot
  try {
    const saved = localStorage.getItem('darkMode')
    const isDark = saved === 'true'
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
  } catch (err) {
    void err
  }

  app.mount('#app')

  // Ensure native splash screen is hidden once the web app is mounted.
  if (Capacitor.getPlatform() !== 'web') {
    try {
      void SplashScreen.hide()
    } catch (e) {
      void e
    }
  }

  // Ensure the StatusBar doesn't overlay the WebView content (Android/iOS)
  if (Capacitor.getPlatform() !== 'web') {
    try {
      void StatusBar.setOverlaysWebView({ overlay: false })
      // Prefer dark icons/text on the status bar when app content is light
      void StatusBar.setStyle({ style: Style.Dark })
    } catch (err) {
      void err
    }
  }
})
