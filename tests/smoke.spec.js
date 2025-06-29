import { test, expect } from '@playwright/test';

test('viewer loads and main SVG is present', async ({ page }) => {
  // jeśli test uruchamiany w CI, ścieżka musi zawierać '/glock19-viewer/'
  const base = process.env.CI ? '/glock19-viewer/' : '/';
  await page.goto(base);

  // maksymalnie 10 sekund na załadowanie SVG
  await expect(page.locator('svg'), { timeout: 10_000 }).toHaveCount(1);

  // upewniamy się, że istnieją przyciski (kolory / części)
  const btnCount = await page.locator('button').count();
  expect(btnCount).toBeGreaterThan(0);
});
