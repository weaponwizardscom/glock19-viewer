
import { test, expect } from '@playwright/test';
test('page loads title', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/Glock 19/i);
});
