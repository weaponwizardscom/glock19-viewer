import { test, expect } from '@playwright/test';

test('viewer loads and main SVG is present', async ({ page }) => {
  // Ścieżka bazowa: w CI (vite preview) to "/"
  // Jeśli w przyszłości uruchomimy testy e2e na produkcji,
  // można dodać zmienną środowiskową BASE_PATH.
  await page.goto('/');

  // czekamy maksymalnie 10 s na pojawienie się SVG
  await expect(page.locator('svg'), { timeout: 10_000 }).toHaveCount(1);

  // co najmniej jeden przycisk (kolor / część)
  const btnCount = await page.locator('button').count();
  expect(btnCount).toBeGreaterThan(0);
});
