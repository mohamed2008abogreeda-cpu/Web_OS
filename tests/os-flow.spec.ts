import { test, expect } from '@playwright/test';

test.describe('Web OS Portfolio — E2E Flow', () => {

  test.beforeEach(async ({ page }) => {
    // Clear localStorage to reset boot state
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  test('1. Boot screen renders and can be skipped', async ({ page }) => {
    // Boot screen should appear
    const bootScreen = page.getByTestId('boot-screen');
    await expect(bootScreen).toBeVisible({ timeout: 5000 });

    // Skip boot
    const skipBtn = page.getByTestId('skip-boot');
    await skipBtn.click();

    // Login screen should appear
    const loginScreen = page.getByTestId('login-screen');
    await expect(loginScreen).toBeVisible({ timeout: 5000 });
  });

  test('2. Click Mohammed avatar to log in', async ({ page }) => {
    // Skip boot
    await page.getByTestId('skip-boot').click({ timeout: 5000 });

    // Wait for login screen
    await expect(page.getByTestId('login-screen')).toBeVisible({ timeout: 5000 });

    // Click Mohammed
    await page.getByTestId('login-mohammed').click();

    // Desktop should appear
    await expect(page.getByTestId('desktop')).toBeVisible({ timeout: 5000 });
  });

  test('3. Open Terminal from desktop', async ({ page }) => {
    // Fast path: skip boot, login
    await page.getByTestId('skip-boot').click({ timeout: 5000 });
    await page.getByTestId('login-mohammed').click();
    await expect(page.getByTestId('desktop')).toBeVisible({ timeout: 5000 });

    // Open terminal via start menu
    await page.getByTestId('start-button').click();
    await page.getByText('Terminal').click();

    // Terminal should be visible
    await expect(page.getByTestId('terminal-app')).toBeVisible({ timeout: 5000 });
  });

  test('4. Type "sudo login admin" and verify password prompt', async ({ page }) => {
    // Fast path
    await page.getByTestId('skip-boot').click({ timeout: 5000 });
    await page.getByTestId('login-mohammed').click();
    await expect(page.getByTestId('desktop')).toBeVisible({ timeout: 5000 });

    // Open terminal
    await page.getByTestId('start-button').click();
    await page.getByText('Terminal').click();
    await expect(page.getByTestId('terminal-app')).toBeVisible({ timeout: 5000 });

    // Type the secret command
    const termInput = page.getByTestId('terminal-input');
    await termInput.fill('sudo login admin');
    await termInput.press('Enter');

    // Verify password prompt appears
    await expect(page.getByText('Enter admin password:')).toBeVisible({ timeout: 3000 });

    // The input should now be a password type
    await expect(termInput).toHaveAttribute('type', 'password');
  });

  test('5. Successful admin login opens Control Panel', async ({ page }) => {
    // Fast path
    await page.getByTestId('skip-boot').click({ timeout: 5000 });
    await page.getByTestId('login-mohammed').click();
    await expect(page.getByTestId('desktop')).toBeVisible({ timeout: 5000 });

    // Open terminal
    await page.getByTestId('start-button').click();
    await page.getByText('Terminal').click();
    const termInput = page.getByTestId('terminal-input');

    // Admin flow
    await termInput.fill('sudo login admin');
    await termInput.press('Enter');
    await expect(page.getByText('Enter admin password:')).toBeVisible({ timeout: 3000 });

    // Enter correct password
    await termInput.fill('letmein2024');
    await termInput.press('Enter');

    // Verify success message
    await expect(page.getByText('Authentication successful')).toBeVisible({ timeout: 3000 });

    // Control Panel window should open
    await expect(page.getByTestId('control-panel')).toBeVisible({ timeout: 5000 });
  });

  test('6. Open project viewer and verify projects load', async ({ page }) => {
    // Fast path
    await page.getByTestId('skip-boot').click({ timeout: 5000 });
    await page.getByTestId('login-mohammed').click();
    await expect(page.getByTestId('desktop')).toBeVisible({ timeout: 5000 });

    // Open Projects app
    await page.getByTestId('start-button').click();
    await page.getByText('Projects').click();

    // Verify project viewer
    await expect(page.getByTestId('project-viewer')).toBeVisible({ timeout: 5000 });

    // GuildMarket should be visible for Mohammed
    await expect(page.getByText('GuildMarket')).toBeVisible({ timeout: 3000 });
  });

  test('7. Switch user changes the desktop context', async ({ page }) => {
    // Fast path
    await page.getByTestId('skip-boot').click({ timeout: 5000 });
    await page.getByTestId('login-mohammed').click();
    await expect(page.getByTestId('desktop')).toBeVisible({ timeout: 5000 });

    // Verify Mohammed is logged in
    await expect(page.getByText('Mohammed')).toBeVisible({ timeout: 3000 });

    // Switch user
    await page.getByTestId('switch-user').click();

    // Should now show Moamen
    await expect(page.getByText('Moamen')).toBeVisible({ timeout: 3000 });
  });

  test('8. Window can be dragged (desktop only)', async ({ page, isMobile }) => {
    test.skip(!!isMobile, 'Drag test only runs on desktop');

    // Fast path
    await page.getByTestId('skip-boot').click({ timeout: 5000 });
    await page.getByTestId('login-mohammed').click();
    await expect(page.getByTestId('desktop')).toBeVisible({ timeout: 5000 });

    // Open terminal
    await page.getByTestId('start-button').click();
    await page.getByText('Terminal').click();
    await expect(page.getByTestId('terminal-app')).toBeVisible({ timeout: 5000 });

    // Find the drag handle and drag the window
    const dragHandle = page.locator('.window-drag-handle').first();
    const box = await dragHandle.boundingBox();

    if (box) {
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
      await page.mouse.down();
      await page.mouse.move(box.x + 200, box.y + 100, { steps: 10 });
      await page.mouse.up();
    }

    // Terminal should still be visible after drag
    await expect(page.getByTestId('terminal-app')).toBeVisible();
  });
});
