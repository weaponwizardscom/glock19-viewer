import { test, expect } from '@playwright/test';

test('index loads and returns correct <title>', async ({ page }) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' });

  // statyczny tytuł z <head><title>…</title>
  await expect(page).toHaveTitle(/Glock 19 Configurator/i);
});
