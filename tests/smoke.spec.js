import { test, expect } from '@playwright/test';

test('viewer loads and main SVG is present', async ({ page }) => {
  // dzięki baseURL możemy wejść po prostu na '/'
  await page.goto('/');

  // maksymalnie 15 s na pojawienie się SVG
  await expect(page.locator('svg'), { timeout: 15_000 }).toHaveCount(1);

  // przyciski koloru / części muszą istnieć
  const btnCount = await page.locator('button').count();
  expect(btnCount).toBeGreaterThan(0);
});
