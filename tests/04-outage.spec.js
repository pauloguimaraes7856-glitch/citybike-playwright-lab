const { test, expect } = require('@playwright/test');

// MISSION 4 — Mock the first /api/stations GET as 503, confirm the error banner,
// then let Retry loading reach the real server and recover to 4 stations.

test('station API outage shows an error and retry restores results', async ({ page }) => {
  let attempts = 0;
  await page.route('**/api/stations', async route => {
    attempts++;
    if (attempts === 1) {
      await route.fulfill({ status: 503, json: { error: 'down' } });
    } else {
      await route.continue();
    }
  });

  await page.goto('/');
  await expect(page.getByText('Unable to load stations.')).toBeVisible();

  await page.getByRole('button', { name: 'Retry loading' }).click();

  await expect(page.getByTestId('station-card')).toHaveCount(4);
  await expect(page.getByText('Unable to load stations.')).toBeHidden();
});
