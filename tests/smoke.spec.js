import { test, expect } from '@playwright/test';

test('viewer loads and hydrates #app', async ({ page }) => {
  await page.goto('/');                           // baseURL ustawiony w configu
  // czekamy do 30 s aż w #app pojawi się pierwszy element potomny
  await page.waitForSelector('#app :first-child', { timeout: 30_000 });

  // upewniamy się, że węzeł #app nie jest pusty
  const innerHTML = await page.$eval('#app', el => el.innerHTML.trim());
  expect(innerHTML.length).toBeGreaterThan(0);
});
