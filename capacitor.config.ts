import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.rigelcars.app',
  appName: 'Rigel',

  server: {
    url: 'https://rigelcars.com',
    cleartext: false,
  },
};

export default config;