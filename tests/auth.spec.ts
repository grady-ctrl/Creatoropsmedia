import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('should show sign-in page for unauthenticated users', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/auth\/signin/);
    await expect(page.getByText('Creator Ops Division')).toBeVisible();
  });

  test('should display sign-in form', async ({ page }) => {
    await page.goto('/auth/signin');
    await expect(page.getByPlaceholder(/email/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /send magic link/i })).toBeVisible();
  });

  test('should require valid email', async ({ page }) => {
    await page.goto('/auth/signin');
    const emailInput = page.getByPlaceholder(/email/i);
    const submitButton = page.getByRole('button', { name: /send magic link/i });

    await emailInput.fill('invalid-email');
    await submitButton.click();

    // HTML5 validation should prevent submission
    const validationMessage = await emailInput.evaluate((el: HTMLInputElement) => el.validationMessage);
    expect(validationMessage).toBeTruthy();
  });
});

test.describe('Dashboard (requires auth)', () => {
  // These tests would require authentication setup
  // For MVP, we're demonstrating the structure

  test.skip('should display dashboard overview', async ({ page }) => {
    // This would require proper auth setup with test user
    await page.goto('/dashboard');
    await expect(page.getByText('Dashboard Overview')).toBeVisible();
  });

  test.skip('should navigate to creators page', async ({ page }) => {
    await page.goto('/dashboard');
    await page.getByRole('link', { name: 'Creators' }).click();
    await expect(page).toHaveURL('/dashboard/creators');
  });
});
