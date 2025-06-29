import { test, expect } from '@playwright/test';

test('viewer loads and main SVG is present', async ({ page }) => {
  // otwieramy stronę z uwzględnieniem base "/glock19-viewer/"
  await page.goto('/glock19-viewer/');

  // sprawdzamy, że SVG konfiguratora istnieje
  await expect(page.locator('svg')).toHaveCount(1);

  // upewniamy się, że jest co najmniej jeden przycisk (część lub kolor)
  const btns = await page.locator('button').count();
  expect(btns).toBeGreaterThan(0);
});
