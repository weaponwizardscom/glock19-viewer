import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  webServer: {
    command: 'npm run preview -- --port 4173 --base /glock19-viewer/',
    port: 4173,
    timeout: 120000,
    reuseExistingServer: true
  },
  use: {
    baseURL: 'http://localhost:4173/glock19-viewer/',
    headless: true
  }
});
