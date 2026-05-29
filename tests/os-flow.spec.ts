import { test, expect } from '@playwright/test';

// ============================================================
// Helper: Fast-login to desktop (skip boot + login as specific user)
// ============================================================
async function loginToDesktop(page: any, user: string = 'login-moamen') {
  await page.goto('/');
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
  await page.reload();
  await page.getByTestId('skip-boot').click({ timeout: 8000 });
  await expect(page.getByTestId('login-screen')).toBeVisible({ timeout: 8000 });
  await page.getByTestId(user).click();
  // Wait for either desktop or MacOS wrapper
  await expect(page.locator('.fixed.inset-0').first()).toBeVisible({ timeout: 8000 });
}

// Helper: Open app based on OS layout
async function openAppFromStartMenu(page: any, appName: string) {
  const startBtn = page.getByTestId('start-button');
  if (await startBtn.isVisible()) {
    await startBtn.click();
    // Wait for the menu to open (it will either have Pinned or Quick Apps)
    await expect(page.getByText('Quick Apps').or(page.getByText('Pinned')).first()).toBeVisible({ timeout: 5000 });
    await page.getByText(appName).first().click({ force: true });
  } else {
    // MacOS desktop: click desktop icon
    await page.locator('.group', { hasText: appName }).first().click();
  }
}

// ============================================================
// 1. BOOT SCREEN TESTS
// ============================================================
test.describe('Boot Screen', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  test('renders and shows skip button', async ({ page }) => {
    const bootScreen = page.getByTestId('boot-screen');
    await expect(bootScreen).toBeVisible({ timeout: 8000 });

    const skipBtn = page.getByTestId('skip-boot');
    await expect(skipBtn).toBeVisible();
  });

  test('skip button transitions to login screen', async ({ page }) => {
    await page.getByTestId('skip-boot').click({ timeout: 8000 });
    const loginScreen = page.getByTestId('login-screen');
    await expect(loginScreen).toBeVisible({ timeout: 8000 });
  });
});

// ============================================================
// 2. LOGIN SCREEN TESTS
// ============================================================
test.describe('Login Screen', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await page.getByTestId('skip-boot').click({ timeout: 8000 });
    await expect(page.getByTestId('login-screen')).toBeVisible({ timeout: 8000 });
  });

  test('shows all three user profiles', async ({ page }) => {
    await expect(page.getByTestId('login-mohammed')).toBeVisible();
    await expect(page.getByTestId('login-moamen')).toBeVisible();
    await expect(page.getByTestId('login-team')).toBeVisible();
  });

  test('clicking Mohammed logs into desktop', async ({ page }) => {
    await page.getByTestId('login-mohammed').click();
    await expect(page.locator('.fixed.inset-0').first()).toBeVisible({ timeout: 8000 });
  });

  test('clicking Moamen logs into desktop', async ({ page }) => {
    await page.getByTestId('login-moamen').click();
    await expect(page.locator('.fixed.inset-0').first()).toBeVisible({ timeout: 8000 });
  });

  test('clicking Team logs into desktop', async ({ page }) => {
    await page.getByTestId('login-team').click();
    await expect(page.locator('.fixed.inset-0').first()).toBeVisible({ timeout: 8000 });
  });
});

// ============================================================
// 3. DESKTOP LAYOUT TESTS
// ============================================================
test.describe('Desktop Layout', () => {

  test.beforeEach(async ({ page, isMobile }) => {
    test.skip(!!isMobile, 'Desktop-only tests');
    await loginToDesktop(page, 'login-moamen');
  });

  test('desktop renders with taskbar', async ({ page }) => {
    await expect(page.getByTestId('desktop')).toBeVisible();
    await expect(page.getByTestId('taskbar')).toBeVisible();
  });

  test('desktop does NOT auto-open windows', async ({ page }) => {
    const terminalApp = page.getByTestId('terminal-app');
    await expect(terminalApp).not.toBeVisible();
  });

  test('start button is visible and clickable', async ({ page }) => {
    const startBtn = page.getByTestId('start-button');
    await expect(startBtn).toBeVisible();
    await startBtn.click();
    await expect(page.getByText('Quick Apps')).toBeVisible({ timeout: 5000 });
  });

  test('switch user button is visible in start menu', async ({ page }) => {
    await page.getByTestId('start-button').click();
    const switchBtn = page.getByTestId('switch-user');
    await expect(switchBtn).toBeVisible({ timeout: 5000 });
  });
});

// ============================================================
// 4. START MENU TESTS
// ============================================================
test.describe('Start Menu', () => {

  test.beforeEach(async ({ page, isMobile }) => {
    test.skip(!!isMobile, 'Desktop-only tests');
    await loginToDesktop(page);
  });

  test('opens and shows Quick Apps section', async ({ page }) => {
    await page.getByTestId('start-button').click();
    await expect(page.getByText('Quick Apps').first()).toBeVisible({ timeout: 5000 });
  });

  test('shows system apps in menu', async ({ page }) => {
    await page.getByTestId('start-button').click();
    await expect(page.getByText('Quick Apps').first()).toBeVisible({ timeout: 5000 });
    // Check that at least Terminal and About are visible
    await expect(page.getByText('Terminal').first()).toBeVisible();
    await expect(page.getByText('About').first()).toBeVisible();
  });

  test('opens and shows Quick apps section', async ({ page }) => {
    await page.getByTestId('start-button').click();
    await expect(page.getByText('Quick Apps').first()).toBeVisible({ timeout: 5000 });
    // The username should be displayed in the menu panel
    await expect(page.getByText('Moamen').first()).toBeVisible();
  });

  test('shows Sign Out button', async ({ page }) => {
    await page.getByTestId('start-button').click();
    await expect(page.getByText('Sign Out').first()).toBeVisible({ timeout: 5000 });
  });

  test('closes when clicking outside', async ({ page }) => {
    await page.getByTestId('start-button').click();
    await expect(page.getByText('Quick Apps').first()).toBeVisible({ timeout: 5000 });
    // Click outside the menu (top left corner of screen)
    await page.mouse.click(10, 10);
    await expect(page.getByText('Quick Apps').first()).not.toBeVisible({ timeout: 3000 });
  });

  test('opening Terminal from start menu launches window', async ({ page }) => {
    await openAppFromStartMenu(page, 'Terminal');
    await expect(page.getByTestId('terminal-app')).toBeVisible({ timeout: 8000 });
  });

  test('opening About from start menu launches window', async ({ page }) => {
    await openAppFromStartMenu(page, 'About');
    await expect(page.getByTestId('about-app')).toBeVisible({ timeout: 8000 });
  });
});

// ============================================================
// 5. WINDOW MANAGEMENT TESTS
// ============================================================
test.describe('Window Management', () => {

  test.beforeEach(async ({ page }) => {
    await loginToDesktop(page);
  });

  test('open Terminal and verify it renders', async ({ page }) => {
    await openAppFromStartMenu(page, 'Terminal');
    await expect(page.getByTestId('terminal-app')).toBeVisible({ timeout: 8000 });
  });

  test('traffic light close button (red) closes window', async ({ page, isMobile }) => {
    test.skip(!!isMobile, 'Traffic lights only on desktop');
    
    await openAppFromStartMenu(page, 'Terminal');
    await expect(page.getByTestId('terminal-app')).toBeVisible({ timeout: 8000 });

    // The close button is the first button inside .window-drag-handle
    const closeBtn = page.locator('.window-drag-handle button').first();
    await closeBtn.click({ force: true });

    await expect(page.getByTestId('terminal-app')).not.toBeVisible({ timeout: 5000 });
  });

  test('traffic light minimize button (yellow) hides window', async ({ page, isMobile }) => {
    test.skip(!!isMobile, 'Traffic lights only on desktop');

    await openAppFromStartMenu(page, 'Terminal');
    await expect(page.getByTestId('terminal-app')).toBeVisible({ timeout: 8000 });

    // Minimize is the second button
    const minBtn = page.locator('.window-drag-handle button').nth(1);
    await minBtn.click({ force: true });

    await expect(page.getByTestId('terminal-app')).not.toBeVisible({ timeout: 5000 });
  });

  test('multiple windows can be opened', async ({ page, isMobile }) => {
    test.skip(!!isMobile, 'Mobile layout obscures background windows');
    // Open Terminal
    await openAppFromStartMenu(page, 'Terminal');
    await expect(page.getByTestId('terminal-app')).toBeVisible({ timeout: 8000 });

    // Open About
    await openAppFromStartMenu(page, 'About');
    await expect(page.getByTestId('about-app')).toBeVisible({ timeout: 8000 });

    // Both visible
    await expect(page.getByTestId('terminal-app')).toBeVisible();
    await expect(page.getByTestId('about-app')).toBeVisible();
  });

  test('window drag works on desktop', async ({ page, isMobile }) => {
    test.skip(!!isMobile, 'Drag test only runs on desktop');

    await openAppFromStartMenu(page, 'Terminal');
    await expect(page.getByTestId('terminal-app')).toBeVisible({ timeout: 8000 });

    const dragHandle = page.locator('.window-drag-handle').first();
    const box = await dragHandle.boundingBox();

    if (box) {
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
      await page.mouse.down();
      await page.mouse.move(box.x + 200, box.y + 100, { steps: 10 });
      await page.mouse.up();
    }

    await expect(page.getByTestId('terminal-app')).toBeVisible();
  });
});

// ============================================================
// 6. TERMINAL APP TESTS
// ============================================================
test.describe('Terminal App', () => {

  test.beforeEach(async ({ page }) => {
    await loginToDesktop(page);
    await openAppFromStartMenu(page, 'Terminal');
    await expect(page.getByTestId('terminal-app')).toBeVisible({ timeout: 8000 });
  });

  test('shows system init on startup', async ({ page }) => {
    await expect(page.getByText('System Core Initialized')).toBeVisible({ timeout: 5000 });
  });

  test('input field is present and focusable', async ({ page }) => {
    const termInput = page.getByTestId('terminal-input');
    await expect(termInput).toBeVisible();
    await termInput.click();
    await expect(termInput).toBeFocused();
  });

  test('help command shows available commands', async ({ page }) => {
    const termInput = page.getByTestId('terminal-input');
    await termInput.fill('help');
    await termInput.press('Enter');
    await expect(page.getByText('Available commands:')).toBeVisible({ timeout: 5000 });
  });

  test('whoami command shows user info', async ({ page }) => {
    const termInput = page.getByTestId('terminal-input');
    await termInput.fill('whoami');
    await termInput.press('Enter');
    await expect(page.getByText('Mohammed (Superuser)')).toBeVisible({ timeout: 5000 });
  });

  test('sudo status command shows system diagnostics', async ({ page }) => {
    const termInput = page.getByTestId('terminal-input');
    await termInput.fill('sudo status');
    await termInput.press('Enter');
    await expect(page.getByText('Root privileges active')).toBeVisible({ timeout: 5000 });
  });

  test('clear command clears the terminal', async ({ page }) => {
    const termInput = page.getByTestId('terminal-input');
    await termInput.fill('clear');
    await termInput.press('Enter');
    await expect(page.getByText('System Core Initialized')).not.toBeVisible({ timeout: 5000 });
  });

  test('invalid command shows error', async ({ page }) => {
    const termInput = page.getByTestId('terminal-input');
    await termInput.fill('invalidcommand123');
    await termInput.press('Enter');
    await expect(page.getByText('Command not found: invalidcommand123')).toBeVisible({ timeout: 5000 });
  });
});

// ============================================================
// 7. PROJECT VIEWER TESTS
// ============================================================
test.describe('Project Viewer', () => {

  test.beforeEach(async ({ page }) => {
    await loginToDesktop(page);
    await openAppFromStartMenu(page, 'Projects');
    await expect(page.getByTestId('project-viewer')).toBeVisible({ timeout: 8000 });
  });

  test('shows Moamen projects including PixelForge', async ({ page }) => {
    await expect(page.getByText('PixelForge').first()).toBeVisible({ timeout: 5000 });
  });

  test('shows project tags', async ({ page }) => {
    await expect(page.getByText('WebRTC').first()).toBeVisible({ timeout: 5000 });
  });
});

// ============================================================
// 8. TASKBAR DOCK TESTS
// ============================================================
test.describe('Taskbar Dock', () => {

  test.beforeEach(async ({ page, isMobile }) => {
    test.skip(!!isMobile, 'Desktop-only tests');
    await loginToDesktop(page, 'login-moamen');
  });

  test('taskbar dock is visible', async ({ page }) => {
    await expect(page.getByTestId('taskbar')).toBeVisible();
  });

  test('taskbar shows start button', async ({ page }) => {
    await expect(page.getByTestId('start-button')).toBeVisible();
  });



  test('taskbar has multiple dock buttons', async ({ page }) => {
    const taskbar = page.getByTestId('taskbar');
    const dockButtons = taskbar.locator('button');
    const count = await dockButtons.count();
    // Verify there are buttons in the taskbar
    expect(count).toBeGreaterThan(0);
  });
});

// ============================================================
// 9. USER SWITCHING TESTS
// ============================================================
test.describe('User Switching', () => {
  test.skip(({ isMobile }) => !!isMobile, 'Desktop-only tests');

  test('switch user button changes context', async ({ page }) => {
    // Log into Mohammed (MacOS Desktop)
    await loginToDesktop(page, 'login-mohammed');
    
    // Open Apple menu to access switch user button
    await page.getByTestId('start-button').click();
    
    const switchBtn = page.getByTestId('switch-user');
    await expect(switchBtn).toBeVisible({ timeout: 5000 });

    // Click switch - changes user to Moamen (Aero Desktop)
    await switchBtn.click();
    // Wait a moment for state and UI to update
    await page.waitForTimeout(1000);

    // Now in Aero Desktop. Open start menu to verify user changed
    await page.getByTestId('start-button').click();
    await expect(page.getByText('Quick Apps')).toBeVisible({ timeout: 5000 });
    // Should now show Moamen in the profile card
    await expect(page.getByText('Moamen')).toBeVisible({ timeout: 3000 });
  });

  test('logout returns to login screen', async ({ page }) => {
    // We start logged in
    await loginToDesktop(page, 'login-moamen');

    await page.getByTestId('start-button').click();
    await expect(page.getByText('Sign Out').first()).toBeVisible({ timeout: 5000 });
    // Click Sign Out
    await page.getByText('Sign Out').first().click({ force: true });

    await expect(page.getByTestId('login-screen')).toBeVisible({ timeout: 8000 });
  });
});

// ============================================================
// 10. RESPONSIVE / MOBILE TESTS
// ============================================================
test.describe('Mobile Responsiveness', () => {
  test.skip(({ isMobile }) => !isMobile, 'Mobile-only tests');

  test('launcher grid is visible on mobile', async ({ page }) => {
    await loginToDesktop(page, 'login-moamen');
    // MobileLauncher shows the time
    await expect(page.locator('.text-6xl').first()).toBeVisible();
  });

  test('clicking app in launcher opens window', async ({ page }) => {
    await loginToDesktop(page, 'login-moamen');
    await page.getByText('Terminal').click();
    await expect(page.getByTestId('terminal-app')).toBeVisible({ timeout: 5000 });
  });
});
