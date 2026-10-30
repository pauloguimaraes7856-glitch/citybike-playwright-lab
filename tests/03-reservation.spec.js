const { test, expect } = require('@playwright/test');

// MISSION 3 — Add two realistic tests:
// (a) invalid email gives visible error without a POST to /api/reservations
// (b) a successful reservation; intercept/mock POST /api/reservations and assert
//     the JSON request payload and success message.

test('invalid email blocks reservation', async ({ page }) => {
  let called = false;
  await page.route('**/api/reservations', async route => {
    called = true;
    await route.abort();
  });

  await page.goto('/');
  await page.getByRole('button', { name: 'Reserve at Central Square' }).click();
  await page.getByLabel('Email address').fill('abc');
  await page.getByRole('button', { name: 'Confirm reservation' }).click();

  await expect(page.getByText('Enter a valid email address.')).toBeVisible();
  expect(called).toBe(false);
});

test('reservation sends correct payload and confirms booking', async ({ page }) => {
  let data;
  await page.route('**/api/reservations', async route => {
    data = route.request().postDataJSON();
    await route.fulfill({ status: 201, json: { reservationId: 'CB-DEMO-777' } });
  });

  await page.goto('/');
  await page.getByRole('button', { name: 'Reserve at Central Square' }).click();
  await page.getByLabel('Email address').fill('student@example.com');
  await page.getByRole('button', { name: 'Confirm reservation' }).click();

  await expect(page.getByText('Reservation confirmed: CB-DEMO-777')).toBeVisible();
  expect(data.stationId).toBe('central');
  expect(data.email).toBe('student@example.com');
});
