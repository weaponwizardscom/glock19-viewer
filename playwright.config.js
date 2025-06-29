import { defineConfig } from '@playwright/test';

const isCI = !!process.env.CI;               // GitHub Actions ustawia CI=true

export default defineConfig({
  testDir: './tests',

  // Web-server: vite preview
  webServer: {
    command: 'npm run preview -- --port 4173',
    port: 4173,
    timeout: 120_000,
    reuseExistingServer: !isCI
  },

  // baseURL różni się w CI (prefix /glock19-viewer/) i lokalnie (/)
  use: {
    headless: true,
    baseURL: isCI
      ? 'http://localhost:4173/glock19-viewer/'
      : 'http://localhost:4173/'
  }
});
