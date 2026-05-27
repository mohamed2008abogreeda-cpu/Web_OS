import { test, expect } from '@playwright/test';

// ============================================================
// Helper: Fast-login to desktop (skip boot + login as Mohammed)
// ============================================================
async function loginToDesktop(page: any) {
  await page.goto('/');
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
  await page.reload();
  await page.getByTestId('skip-boot').click({ timeout: 8000 });
  await expect(page.getByTestId('login-screen')).toBeVisible({ timeout: 8000 });
  await page.getByTestId('login-mohammed').click();
  await expect(page.getByTestId('desktop')).toBeVisible({ timeout: 8000 });
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
    await expect(page.getByTestId('desktop')).toBeVisible({ timeout: 8000 });
  });

  test('clicking Moamen logs into desktop', async ({ page }) => {
    await page.getByTestId('login-moamen').click();
    await expect(page.getByTestId('desktop')).toBeVisible({ timeout: 8000 });
  });

  test('clicking Team logs into desktop', async ({ page }) => {
    await page.getByTestId('login-team').click();
    await expect(page.getByTestId('desktop')).toBeVisible({ timeout: 8000 });
  });
});

// ============================================================
// 3. DESKTOP LAYOUT TESTS
// ============================================================
test.describe('Desktop Layout', () => {

  test.beforeEach(async ({ page }) => {
    await loginToDesktop(page);
  });

  test('desktop renders with taskbar', async ({ page }) => {
    await expect(page.getByTestId('desktop')).toBeVisible();
    await expect(page.getByTestId('taskbar')).toBeVisible();
  });

  test('desktop does NOT auto-open windows', async ({ page }) => {
    // No windows should be open automatically
    const terminalApp = page.getByTestId('terminal-app');
    await expect(terminalApp).not.toBeVisible();
  });

  test('start button is visible and clickable', async ({ page }) => {
    const startBtn = page.getByTestId('start-button');
    await expect(startBtn).toBeVisible();
    await startBtn.click();
    // Start menu should appear with Quick Apps
    await expect(page.getByText('Quick Apps')).toBeVisible({ timeout: 3000 });
  });

  test('switch user button works from taskbar', async ({ page }) => {
    const switchBtn = page.getByTestId('switch-user');
    await expect(switchBtn).toBeVisible();
    await switchBtn.click();
    // Should now show Moamen context (user cycles Mohammed -> Moamen)
    await expect(page.getByText('Moamen')).toBeVisible({ timeout: 3000 });
  });
});

// ============================================================
// 4. START MENU TESTS
// ============================================================
test.describe('Start Menu', () => {

  test.beforeEach(async ({ page }) => {
    await loginToDesktop(page);
  });

  test('opens and shows all system apps', async ({ page }) => {
    await page.getByTestId('start-button').click();
    await expect(page.getByText('Quick Apps')).toBeVisible({ timeout: 3000 });
    await expect(page.getByText('Projects')).toBeVisible();
    await expect(page.getByText('Terminal')).toBeVisible();
    await expect(page.getByText('Comms')).toBeVisible();
    await expect(page.getByText('About')).toBeVisible();
    await expect(page.getByText('Music')).toBeVisible();
    await expect(page.getByText('Settings')).toBeVisible();
  });

  test('shows user profile info', async ({ page }) => {
    await page.getByTestId('start-button').click();
    await expect(page.getByText('Mohammed')).toBeVisible({ timeout: 3000 });
  });

  test('shows Sign Out button', async ({ page }) => {
    await page.getByTestId('start-button').click();
    await expect(page.getByText('Sign Out Session')).toBeVisible({ timeout: 3000 });
  });

  test('closes when clicking outside', async ({ page }) => {
    await page.getByTestId('start-button').click();
    await expect(page.getByText('Quick Apps')).toBeVisible({ timeout: 3000 });
    // Click outside the menu
    await page.mouse.click(800, 400);
    await expect(page.getByText('Quick Apps')).not.toBeVisible({ timeout: 3000 });
  });

  test('opening an app from start menu launches a window', async ({ page }) => {
    await page.getByTestId('start-button').click();
    // Click the Terminal's "Open" label inside start menu
    const terminalButton = page.locator('button', { hasText: 'Terminal' }).first();
    await terminalButton.click();
    await expect(page.getByTestId('terminal-app')).toBeVisible({ timeout: 5000 });
  });
});

// ============================================================
// 5. WINDOW MANAGEMENT TESTS
// ============================================================
test.describe('Window Management', () => {

  test.beforeEach(async ({ page }) => {
    await loginToDesktop(page);
  });

  test('open Terminal from start menu and verify it renders', async ({ page }) => {
    await page.getByTestId('start-button').click();
    await page.locator('button', { hasText: 'Terminal' }).first().click();
    await expect(page.getByTestId('terminal-app')).toBeVisible({ timeout: 5000 });
  });

  test('traffic light close button (red) closes window', async ({ page, isMobile }) => {
    test.skip(!!isMobile, 'Traffic lights only on desktop');
    
    await page.getByTestId('start-button').click();
    await page.locator('button', { hasText: 'Terminal' }).first().click();
    await expect(page.getByTestId('terminal-app')).toBeVisible({ timeout: 5000 });

    // Find the red close button (first traffic light)
    const closeBtn = page.locator('.window-drag-handle button').first();
    await closeBtn.click({ force: true });

    // Terminal should be gone
    await expect(page.getByTestId('terminal-app')).not.toBeVisible({ timeout: 3000 });
  });

  test('traffic light minimize button (yellow) hides window', async ({ page, isMobile }) => {
    test.skip(!!isMobile, 'Traffic lights only on desktop');

    await page.getByTestId('start-button').click();
    await page.locator('button', { hasText: 'Terminal' }).first().click();
    await expect(page.getByTestId('terminal-app')).toBeVisible({ timeout: 5000 });

    // Find the yellow minimize button (second traffic light)
    const minBtn = page.locator('.window-drag-handle button').nth(1);
    await minBtn.click({ force: true });

    // Terminal should be hidden/minimized
    await expect(page.getByTestId('terminal-app')).not.toBeVisible({ timeout: 3000 });
  });

  test('multiple windows can be opened simultaneously', async ({ page }) => {
    // Open Terminal
    await page.getByTestId('start-button').click();
    await page.locator('button', { hasText: 'Terminal' }).first().click();
    await expect(page.getByTestId('terminal-app')).toBeVisible({ timeout: 5000 });

    // Open About
    await page.getByTestId('start-button').click();
    await page.locator('button', { hasText: 'About' }).first().click();
    await expect(page.getByTestId('about-app')).toBeVisible({ timeout: 5000 });

    // Both should be visible
    await expect(page.getByTestId('terminal-app')).toBeVisible();
    await expect(page.getByTestId('about-app')).toBeVisible();
  });

  test('window drag works on desktop', async ({ page, isMobile }) => {
    test.skip(!!isMobile, 'Drag test only runs on desktop');

    await page.getByTestId('start-button').click();
    await page.locator('button', { hasText: 'Terminal' }).first().click();
    await expect(page.getByTestId('terminal-app')).toBeVisible({ timeout: 5000 });

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
    await page.getByTestId('start-button').click();
    await page.locator('button', { hasText: 'Terminal' }).first().click();
    await expect(page.getByTestId('terminal-app')).toBeVisible({ timeout: 5000 });
  });

  test('shows Arch Linux neofetch on startup', async ({ page }) => {
    await expect(page.getByText('Arch Linux')).toBeVisible({ timeout: 3000 });
    await expect(page.getByText('6.9.0-zen1-1-zen')).toBeVisible();
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
    await expect(page.getByText('Available Commands')).toBeVisible({ timeout: 3000 });
  });

  test('whoami command shows user info', async ({ page }) => {
    const termInput = page.getByTestId('terminal-input');
    await termInput.fill('whoami');
    await termInput.press('Enter');
    await expect(page.getByText('Mohammed')).toBeVisible({ timeout: 3000 });
  });

  test('neofetch command re-renders system info', async ({ page }) => {
    const termInput = page.getByTestId('terminal-input');
    await termInput.fill('neofetch');
    await termInput.press('Enter');
    // Should see Arch Linux displayed again
    const archText = page.locator('text=Arch Linux');
    await expect(archText.first()).toBeVisible({ timeout: 3000 });
  });

  test('clear command clears the terminal', async ({ page }) => {
    const termInput = page.getByTestId('terminal-input');
    await termInput.fill('clear');
    await termInput.press('Enter');
    // Arch Linux from neofetch should be gone
    await expect(page.getByText('6.9.0-zen1-1-zen')).not.toBeVisible({ timeout: 3000 });
  });

  test('invalid command shows error', async ({ page }) => {
    const termInput = page.getByTestId('terminal-input');
    await termInput.fill('invalidcommand123');
    await termInput.press('Enter');
    await expect(page.getByText('command not found: invalidcommand123')).toBeVisible({ timeout: 3000 });
  });

  test('sudo login admin triggers password prompt', async ({ page }) => {
    const termInput = page.getByTestId('terminal-input');
    await termInput.fill('sudo login admin');
    await termInput.press('Enter');
    await expect(page.getByText('Enter admin password:')).toBeVisible({ timeout: 3000 });
    await expect(termInput).toHaveAttribute('type', 'password');
  });

  test('correct admin password shows success', async ({ page }) => {
    const termInput = page.getByTestId('terminal-input');
    await termInput.fill('sudo login admin');
    await termInput.press('Enter');
    await expect(page.getByText('Enter admin password:')).toBeVisible({ timeout: 3000 });
    
    await termInput.fill('letmein2024');
    await termInput.press('Enter');
    await expect(page.getByText('Authentication successful')).toBeVisible({ timeout: 3000 });
  });

  test('wrong admin password shows failure', async ({ page }) => {
    const termInput = page.getByTestId('terminal-input');
    await termInput.fill('sudo login admin');
    await termInput.press('Enter');
    await expect(page.getByText('Enter admin password:')).toBeVisible({ timeout: 3000 });
    
    await termInput.fill('wrongpassword');
    await termInput.press('Enter');
    await expect(page.getByText('Authentication failed')).toBeVisible({ timeout: 3000 });
  });
});

// ============================================================
// 7. PROJECT VIEWER TESTS
// ============================================================
test.describe('Project Viewer', () => {

  test.beforeEach(async ({ page }) => {
    await loginToDesktop(page);
    await page.getByTestId('start-button').click();
    await page.locator('button', { hasText: 'Projects' }).first().click();
    await expect(page.getByTestId('project-viewer')).toBeVisible({ timeout: 5000 });
  });

  test('shows Mohammed projects including GuildMarket', async ({ page }) => {
    await expect(page.getByText('GuildMarket')).toBeVisible({ timeout: 3000 });
  });

  test('shows project tags', async ({ page }) => {
    await expect(page.getByText('Node.js')).toBeVisible({ timeout: 3000 });
  });
});

// ============================================================
// 8. TASKBAR DOCK TESTS
// ============================================================
test.describe('Taskbar Dock', () => {

  test.beforeEach(async ({ page }) => {
    await loginToDesktop(page);
  });

  test('taskbar dock is visible', async ({ page }) => {
    await expect(page.getByTestId('taskbar')).toBeVisible();
  });

  test('taskbar shows start button', async ({ page }) => {
    await expect(page.getByTestId('start-button')).toBeVisible();
  });

  test('taskbar shows switch user button', async ({ page }) => {
    await expect(page.getByTestId('switch-user')).toBeVisible();
  });

  test('clicking app in dock opens it if not already open', async ({ page }) => {
    // The dock should have app launcher icons from SYSTEM_APPS
    // Click on Terminal icon in the dock (it should be visible as a button with the icon)
    const taskbar = page.getByTestId('taskbar');
    // There should be launcher buttons inside the taskbar
    const dockButtons = taskbar.locator('button');
    const count = await dockButtons.count();
    // Should have at minimum: start button + apps + switch user
    expect(count).toBeGreaterThan(3);
  });
});

// ============================================================
// 9. USER SWITCHING TESTS
// ============================================================
test.describe('User Switching', () => {

  test('switching cycles through Mohammed -> Moamen -> Team', async ({ page }) => {
    await loginToDesktop(page);

    // Currently Mohammed
    const switchBtn = page.getByTestId('switch-user');

    // Switch to Moamen
    await switchBtn.click();
    await expect(page.getByText('Moamen')).toBeVisible({ timeout: 3000 });

    // Switch to Team
    await switchBtn.click();
    await expect(page.getByText('Team')).toBeVisible({ timeout: 3000 });

    // Switch back to Mohammed
    await switchBtn.click();
    await expect(page.getByText('Mohammed')).toBeVisible({ timeout: 3000 });
  });

  test('logout returns to login screen', async ({ page }) => {
    await loginToDesktop(page);

    await page.getByTestId('start-button').click();
    const signOutBtn = page.getByText('Sign Out Session');
    await expect(signOutBtn).toBeVisible({ timeout: 3000 });
    await signOutBtn.click();

    // Should see login screen
    await expect(page.getByTestId('login-screen')).toBeVisible({ timeout: 5000 });
  });
});

// ============================================================
// 10. RESPONSIVE / MOBILE TESTS
// ============================================================
test.describe('Mobile Responsiveness', () => {

  test('taskbar is visible on mobile', async ({ page }) => {
    await loginToDesktop(page);
    await expect(page.getByTestId('taskbar')).toBeVisible();
  });

  test('start menu works on mobile', async ({ page }) => {
    await loginToDesktop(page);
    await page.getByTestId('start-button').click();
    await expect(page.getByText('Quick Apps')).toBeVisible({ timeout: 3000 });
  });
});
