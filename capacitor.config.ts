import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'cl.taxo.sgo.inventario',
  appName: 'SGO Inventario',
  webDir: 'www',
  server: {
    androidScheme: 'http'
  },
  plugins: {
    StatusBar: {
      style: 'LIGHT',
      backgroundColor: '#ffffff'
    }
  }
};

export default config;
