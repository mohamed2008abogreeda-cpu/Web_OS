# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: os-flow.spec.ts >> User Switching >> switch user button changes context
- Location: tests\os-flow.spec.ts:371:7

# Error details

```
TimeoutError: locator.click: Timeout 15000ms exceeded.
Call log:
  - waiting for getByTestId('start-button')

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - main [ref=e2]:
    - generic [ref=e3]:
      - region "Notifications alt+T"
      - generic [ref=e4]:
        - img "macOS Wallpaper" [ref=e6]
        - generic [ref=e8]:
          - generic [ref=e9]:
            - generic [ref=e10] [cursor=pointer]: 
            - generic [ref=e11] [cursor=pointer]: Finder
            - generic [ref=e12]:
              - generic [ref=e13] [cursor=pointer]: File
              - generic [ref=e14] [cursor=pointer]: Edit
              - generic [ref=e15] [cursor=pointer]: View
              - generic [ref=e16] [cursor=pointer]: Go
              - generic [ref=e17] [cursor=pointer]: Window
              - generic [ref=e18] [cursor=pointer]: Help
          - generic [ref=e19]:
            - generic [ref=e20] [cursor=pointer]:
              - img [ref=e21]
              - img [ref=e25]
              - generic [ref=e29]:
                - generic [ref=e30]: 100%
                - img [ref=e31]
            - img [ref=e33] [cursor=pointer]
            - generic [ref=e36] [cursor=pointer]: Thu, May 28, 05:26 PM
        - generic [ref=e38]:
          - generic [ref=e39] [cursor=pointer]:
            - img [ref=e41]
            - generic [ref=e43]: Projects
          - generic [ref=e44] [cursor=pointer]:
            - img [ref=e46]
            - generic [ref=e48]: Terminal
          - generic [ref=e49] [cursor=pointer]:
            - img [ref=e51]
            - generic [ref=e53]: Comms
          - generic [ref=e54] [cursor=pointer]:
            - img [ref=e56]
            - generic [ref=e59]: About
          - generic [ref=e60] [cursor=pointer]:
            - img [ref=e62]
            - generic [ref=e66]: Music
          - generic [ref=e67] [cursor=pointer]:
            - img [ref=e69]
            - generic [ref=e72]: Settings
        - generic [ref=e74]:
          - button "Projects" [ref=e75] [cursor=pointer]:
            - img [ref=e77]
          - button "Terminal" [ref=e79] [cursor=pointer]:
            - img [ref=e81]
          - button "Comms" [ref=e83] [cursor=pointer]:
            - img [ref=e85]
          - button "About" [ref=e87] [cursor=pointer]:
            - img [ref=e89]
          - button "Music" [ref=e92] [cursor=pointer]:
            - img [ref=e94]
          - button "Settings" [ref=e98] [cursor=pointer]:
            - img [ref=e100]
  - region "Notifications alt+T"
  - alert [ref=e103]
```

# Test source

```ts
  276 |     await termInput.click();
  277 |     await expect(termInput).toBeFocused();
  278 |   });
  279 | 
  280 |   test('help command shows available commands', async ({ page }) => {
  281 |     const termInput = page.getByTestId('terminal-input');
  282 |     await termInput.fill('help');
  283 |     await termInput.press('Enter');
  284 |     await expect(page.getByText('Available commands:')).toBeVisible({ timeout: 5000 });
  285 |   });
  286 | 
  287 |   test('whoami command shows user info', async ({ page }) => {
  288 |     const termInput = page.getByTestId('terminal-input');
  289 |     await termInput.fill('whoami');
  290 |     await termInput.press('Enter');
  291 |     await expect(page.getByText('Mohammed (Superuser)')).toBeVisible({ timeout: 5000 });
  292 |   });
  293 | 
  294 |   test('sudo status command shows system diagnostics', async ({ page }) => {
  295 |     const termInput = page.getByTestId('terminal-input');
  296 |     await termInput.fill('sudo status');
  297 |     await termInput.press('Enter');
  298 |     await expect(page.getByText('Root privileges active')).toBeVisible({ timeout: 5000 });
  299 |   });
  300 | 
  301 |   test('clear command clears the terminal', async ({ page }) => {
  302 |     const termInput = page.getByTestId('terminal-input');
  303 |     await termInput.fill('clear');
  304 |     await termInput.press('Enter');
  305 |     await expect(page.getByText('System Core Initialized')).not.toBeVisible({ timeout: 5000 });
  306 |   });
  307 | 
  308 |   test('invalid command shows error', async ({ page }) => {
  309 |     const termInput = page.getByTestId('terminal-input');
  310 |     await termInput.fill('invalidcommand123');
  311 |     await termInput.press('Enter');
  312 |     await expect(page.getByText('Command not found: invalidcommand123')).toBeVisible({ timeout: 5000 });
  313 |   });
  314 | });
  315 | 
  316 | // ============================================================
  317 | // 7. PROJECT VIEWER TESTS
  318 | // ============================================================
  319 | test.describe('Project Viewer', () => {
  320 | 
  321 |   test.beforeEach(async ({ page }) => {
  322 |     await loginToDesktop(page);
  323 |     await openAppFromStartMenu(page, 'Projects');
  324 |     await expect(page.getByTestId('project-viewer')).toBeVisible({ timeout: 8000 });
  325 |   });
  326 | 
  327 |   test('shows Moamen projects including PixelForge', async ({ page }) => {
  328 |     await expect(page.getByText('PixelForge').first()).toBeVisible({ timeout: 5000 });
  329 |   });
  330 | 
  331 |   test('shows project tags', async ({ page }) => {
  332 |     await expect(page.getByText('WebRTC').first()).toBeVisible({ timeout: 5000 });
  333 |   });
  334 | });
  335 | 
  336 | // ============================================================
  337 | // 8. TASKBAR DOCK TESTS
  338 | // ============================================================
  339 | test.describe('Taskbar Dock', () => {
  340 | 
  341 |   test.beforeEach(async ({ page, isMobile }) => {
  342 |     test.skip(!!isMobile, 'Desktop-only tests');
  343 |     await loginToDesktop(page, 'login-moamen');
  344 |   });
  345 | 
  346 |   test('taskbar dock is visible', async ({ page }) => {
  347 |     await expect(page.getByTestId('taskbar')).toBeVisible();
  348 |   });
  349 | 
  350 |   test('taskbar shows start button', async ({ page }) => {
  351 |     await expect(page.getByTestId('start-button')).toBeVisible();
  352 |   });
  353 | 
  354 | 
  355 | 
  356 |   test('taskbar has multiple dock buttons', async ({ page }) => {
  357 |     const taskbar = page.getByTestId('taskbar');
  358 |     const dockButtons = taskbar.locator('button');
  359 |     const count = await dockButtons.count();
  360 |     // Verify there are buttons in the taskbar
  361 |     expect(count).toBeGreaterThan(0);
  362 |   });
  363 | });
  364 | 
  365 | // ============================================================
  366 | // 9. USER SWITCHING TESTS
  367 | // ============================================================
  368 | test.describe('User Switching', () => {
  369 |   test.skip(({ isMobile }) => !!isMobile, 'Desktop-only tests');
  370 | 
  371 |   test('switch user button changes context', async ({ page }) => {
  372 |     // Log into Mohammed (MacOS Desktop)
  373 |     await loginToDesktop(page, 'login-mohammed');
  374 |     
  375 |     // Open Apple menu to access switch user button
> 376 |     await page.getByTestId('start-button').click();
      |                                            ^ TimeoutError: locator.click: Timeout 15000ms exceeded.
  377 |     
  378 |     const switchBtn = page.getByTestId('switch-user');
  379 |     await expect(switchBtn).toBeVisible({ timeout: 5000 });
  380 | 
  381 |     // Click switch - changes user to Moamen (Aero Desktop)
  382 |     await switchBtn.click();
  383 |     // Wait a moment for state and UI to update
  384 |     await page.waitForTimeout(1000);
  385 | 
  386 |     // Now in Aero Desktop. Open start menu to verify user changed
  387 |     await page.getByTestId('start-button').click();
  388 |     await expect(page.getByText('Quick Apps')).toBeVisible({ timeout: 5000 });
  389 |     // Should now show Moamen in the profile card
  390 |     await expect(page.getByText('Moamen')).toBeVisible({ timeout: 3000 });
  391 |   });
  392 | 
  393 |   test('logout returns to login screen', async ({ page }) => {
  394 |     // We start logged in
  395 |     await loginToDesktop(page, 'login-moamen');
  396 | 
  397 |     await page.getByTestId('start-button').click();
  398 |     await expect(page.getByText('Sign Out').first()).toBeVisible({ timeout: 5000 });
  399 |     // Click Sign Out
  400 |     await page.getByText('Sign Out').first().click({ force: true });
  401 | 
  402 |     await expect(page.getByTestId('login-screen')).toBeVisible({ timeout: 8000 });
  403 |   });
  404 | });
  405 | 
  406 | // ============================================================
  407 | // 10. RESPONSIVE / MOBILE TESTS
  408 | // ============================================================
  409 | test.describe('Mobile Responsiveness', () => {
  410 |   test.skip(({ isMobile }) => !isMobile, 'Mobile-only tests');
  411 | 
  412 |   test('launcher grid is visible on mobile', async ({ page }) => {
  413 |     await loginToDesktop(page, 'login-moamen');
  414 |     // MobileLauncher shows the time
  415 |     await expect(page.locator('.text-6xl').first()).toBeVisible();
  416 |   });
  417 | 
  418 |   test('clicking app in launcher opens window', async ({ page }) => {
  419 |     await loginToDesktop(page, 'login-moamen');
  420 |     await page.getByText('Terminal').click();
  421 |     await expect(page.getByTestId('terminal-app')).toBeVisible({ timeout: 5000 });
  422 |   });
  423 | });
  424 | 
```