import { defineConfig } from '@playwright/test';

const isCI = !!process.env.CI;

//  ❗ KLUCZOWA ZMIANA → --base /glock19-viewer/
export default defineConfig({
  testDir: './tests',
  webServer: {
    command: 'npm run preview -- --port 4173 --base /glock19-viewer/',
    port: 4173,
    timeout: 120_000,
    reuseExistingServer: !isCI
  },
  use: {
    headless: true,
    baseURL: 'http://localhost:4173/glock19-viewer/'
  }
});
