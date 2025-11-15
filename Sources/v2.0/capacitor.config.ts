import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.blindsbook.draperycalculator',
  appName: 'Drapery-Calculator-Vue',
  webDir: 'dist'
};

// Configure the SplashScreen plugin to auto-hide by default on native platforms.
// This helps avoid a permanent black splash if the web app initialization crashes
// before explicitly hiding the native splash screen.
(config as any).plugins = {
  SplashScreen: {
    launchAutoHide: true,
    // keep the launch splash visible for a short time (ms)
    launchShowDuration: 300
  }
};

export default config;
