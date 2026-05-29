import { test, expect } from '@playwright/test';

// ============================================================
// HELPER: Login to specific environment
// ============================================================
async function loginToDesktop(page: any, userName: string = 'Mohamed Mahmoud Abo Greada') {
  await page.goto('/');
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
  await page.reload();

  // If there's a skip-boot button, click it
  const skipBtn = page.getByTestId('skip-boot');
  if (await skipBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
    await skipBtn.click();
  }

  // Click the user avatar by text
  await page.getByText(userName).click();
  
  // Type password and submit
  await page.locator('input[type="password"]').fill('1234');
  await page.locator('input[type="password"]').press('Enter');

  // Wait for the login screen to disappear (clock should be gone)
  await expect(page.locator('input[type="password"]')).not.toBeVisible({ timeout: 8000 });
}

test.describe('Tri-System OS Flow - Linux Environment', () => {

  test.beforeEach(async ({ page }) => {
    // Mohammed goes to Linux
    await loginToDesktop(page, 'Mohamed Mahmoud Abo Greada');
  });

  test('1. Desktop Boot Test - LinuxPanel renders', async ({ page }) => {
    // Wait for the Linux panel (which has "Applications" text)
    const panelAppsBtn = page.getByText('Applications');
    await expect(panelAppsBtn).toBeVisible({ timeout: 10000 });
  });

  test('2. Window Test - Open Terminal with Brutalist Controls', async ({ page }) => {
    // Click "Applications" dropdown
    await page.getByText('Applications').click();

    // Click "Terminal" in the dropdown menu (ensure we click the one inside the absolute menu)
    await page.locator('.absolute.top-7.left-0 button', { hasText: /^Terminal$/ }).click();

    // Verify the window appears (we can look for the window title "Terminal" inside the window header)
    const windowHeader = page.locator('.linux-drag-handle', { hasText: 'Terminal' });
    await expect(windowHeader).toBeVisible({ timeout: 5000 });

    // Verify Brutalist controls are present (X button inside the window header with red hover class)
    const closeBtn = windowHeader.locator('button.hover\\:bg-red-600');
    await expect(closeBtn).toBeVisible();

    // The inner terminal content should be rendering
    await expect(page.getByText('root@kali:~#')).toBeVisible({ timeout: 5000 });
  });

  test('3. Logout Test - Power button returns to Lock Screen', async ({ page }) => {
    // The Power button is in the top right panel. It has no text but has the Power lucide icon.
    // We can target the button that triggers logout.
    const powerBtn = page.locator('button.hover\\:text-red-500');
    await expect(powerBtn).toBeVisible({ timeout: 5000 });

    // Click power button
    await powerBtn.click();

    // Verify we are back to the Lock Screen (User list should be visible again)
    await expect(page.getByText('Mohamed Mahmoud Abo Greada')).toBeVisible({ timeout: 8000 });
  });

});
