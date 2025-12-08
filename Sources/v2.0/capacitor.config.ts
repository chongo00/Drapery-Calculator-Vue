import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.blindsbook.drap-calc',
  appName: 'BlindsBook Drapery Calculator',
  webDir: 'dist'
};


(config as any).plugins = {
  SplashScreen: {
    launchAutoHide: true,
    // keep the launch splash visible for a short time (ms)
    launchShowDuration: 300
  }
};

export default config;
