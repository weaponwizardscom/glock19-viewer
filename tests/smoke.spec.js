import { test, expect } from '@playwright/test';

test('viewer hydrates #app', async ({ page }) => {
  await page.goto('/');                                 // baseURL już zawiera /glock19-viewer/
  await page.waitForSelector('#app :first-child', { timeout: 30_000 });
  const inner = await page.$eval('#app', el => el.innerHTML.trim());
  expect(inner.length).toBeGreaterThan(0);
});
