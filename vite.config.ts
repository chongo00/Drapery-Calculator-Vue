/// <reference types="vitest" />

import legacy from '@vitejs/plugin-legacy'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import { defineConfig } from 'vite'

// https://vitejs.dev/config/
export default defineConfig({
  // Use a relative base so built assets load correctly from the file:// served
  // location that Capacitor uses on Android/iOS. Previously this project used
  // an absolute base which caused the APK to reference "/Drapery-Calculator-Vue/..."
  // and the WebView failed to find the JS/CSS files, producing a black screen.
  base: './',
  plugins: [
    vue(),
    legacy()
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom'
  }
})
