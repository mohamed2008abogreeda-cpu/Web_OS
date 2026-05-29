# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: os-flow.spec.ts >> Taskbar Dock >> taskbar has multiple dock buttons
- Location: tests\os-flow.spec.ts:356:7

# Error details

```
Error: expect(received).toBeGreaterThan(expected)

Expected: > 0
Received:   0
```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - main [ref=e2]:
    - generic [ref=e3]:
      - region "Notifications alt+T"
      - generic [ref=e4]:
        - generic:
          - img "Wallpaper"
        - generic [ref=e5]:
          - generic [ref=e6]:
            - generic [ref=e7]: ●
            - generic [ref=e8]: 17:26:22
            - generic [ref=e9] [cursor=pointer]: ⬡
            - generic [ref=e10]: Desktop
          - generic [ref=e11]: Still Woozy - Lava
          - generic [ref=e12]:
            - button [ref=e13] [cursor=pointer]:
              - img [ref=e14]
            - button [ref=e16] [cursor=pointer]:
              - img [ref=e17]
            - button [ref=e20] [cursor=pointer]:
              - img [ref=e21]
            - button "85%" [ref=e25] [cursor=pointer]:
              - generic [ref=e26]: 85%
              - img [ref=e27]
            - button [ref=e29] [cursor=pointer]:
              - img [ref=e30]
            - button [ref=e34] [cursor=pointer]:
              - img [ref=e35]
        - generic [ref=e39]:
          - generic [ref=e41]:
            - button "Projects" [ref=e42]:
              - img [ref=e44]
              - generic [ref=e46]: Projects
            - button "Terminal" [ref=e47]:
              - img [ref=e49]
              - generic [ref=e51]: Terminal
            - button "Comms" [ref=e52]:
              - img [ref=e54]
              - generic [ref=e56]: Comms
            - button "About" [ref=e57]:
              - img [ref=e59]
              - generic [ref=e62]: About
            - button "Music" [ref=e63]:
              - img [ref=e65]
              - generic [ref=e69]: Music
            - button "Settings" [ref=e70]:
              - img [ref=e72]
              - generic [ref=e75]: Settings
          - generic [ref=e76]:
            - generic [ref=e77]:
              - img "Avatar" [ref=e79]
              - generic [ref=e80]:
                - generic [ref=e81]: demeter
                - generic [ref=e82]: Good Afternoon!
            - generic [ref=e83]:
              - generic [ref=e84]: may
              - generic [ref=e85]:
                - generic [ref=e86]: su
                - generic [ref=e87]: mo
                - generic [ref=e88]: tu
                - generic [ref=e89]: we
                - generic [ref=e90]: th
                - generic [ref=e91]: fr
                - generic [ref=e92]: sa
              - generic [ref=e93]:
                - generic [ref=e99] [cursor=pointer]: "1"
                - generic [ref=e100] [cursor=pointer]: "2"
                - generic [ref=e101] [cursor=pointer]: "3"
                - generic [ref=e102] [cursor=pointer]: "4"
                - generic [ref=e103] [cursor=pointer]: "5"
                - generic [ref=e104] [cursor=pointer]: "6"
                - generic [ref=e105] [cursor=pointer]: "7"
                - generic [ref=e106] [cursor=pointer]: "8"
                - generic [ref=e107] [cursor=pointer]: "9"
                - generic [ref=e108] [cursor=pointer]: "10"
                - generic [ref=e109] [cursor=pointer]: "11"
                - generic [ref=e110] [cursor=pointer]: "12"
                - generic [ref=e111] [cursor=pointer]: "13"
                - generic [ref=e112] [cursor=pointer]: "14"
                - generic [ref=e113] [cursor=pointer]: "15"
                - generic [ref=e114] [cursor=pointer]: "16"
                - generic [ref=e115] [cursor=pointer]: "17"
                - generic [ref=e116] [cursor=pointer]: "18"
                - generic [ref=e117] [cursor=pointer]: "19"
                - generic [ref=e118] [cursor=pointer]: "20"
                - generic [ref=e119] [cursor=pointer]: "21"
                - generic [ref=e120] [cursor=pointer]: "22"
                - generic [ref=e121] [cursor=pointer]: "23"
                - generic [ref=e122] [cursor=pointer]: "24"
                - generic [ref=e123] [cursor=pointer]: "25"
                - generic [ref=e124] [cursor=pointer]: "26"
                - generic [ref=e125] [cursor=pointer]: "27"
                - generic [ref=e126]: "28"
                - generic [ref=e127] [cursor=pointer]: "29"
                - generic [ref=e128] [cursor=pointer]: "30"
                - generic [ref=e129] [cursor=pointer]: "31"
            - generic [ref=e130]:
              - generic [ref=e131]:
                - generic [ref=e132]: Now Playing
                - generic [ref=e133]: Still Woozy - Lava
              - generic [ref=e134]:
                - generic [ref=e136]:
                  - img "Cover Art" [ref=e137]
                  - img [ref=e139]
                - generic [ref=e143]:
                  - button [ref=e144] [cursor=pointer]:
                    - img [ref=e145]
                  - button [ref=e147] [cursor=pointer]:
                    - img [ref=e148]
                  - button [ref=e150] [cursor=pointer]:
                    - img [ref=e151]
          - generic [ref=e154]: 17:26
        - generic [ref=e155]:
          - button [ref=e156] [cursor=pointer]:
            - img [ref=e157]
          - generic [ref=e160]:
            - button "Projects" [ref=e161] [cursor=pointer]:
              - img [ref=e162]
            - button "Terminal" [ref=e164] [cursor=pointer]:
              - img [ref=e165]
            - button "Comms" [ref=e167] [cursor=pointer]:
              - img [ref=e168]
            - button "About" [ref=e170] [cursor=pointer]:
              - img [ref=e171]
            - button "Music" [ref=e174] [cursor=pointer]:
              - img [ref=e175]
            - button "Settings" [ref=e179] [cursor=pointer]:
              - img [ref=e180]
          - button "Switch User Profile" [ref=e184] [cursor=pointer]:
            - img [ref=e185]
  - region "Notifications alt+T":
    - list:
      - listitem [ref=e188]:
        - button "Close toast" [ref=e189] [cursor=pointer]:
          - img [ref=e190]
        - img [ref=e194]
        - generic [ref=e196]:
          - generic [ref=e197]: Welcome back, Moamen!
          - generic [ref=e198]: Launching workspace context for Creative Developer & UI/UX Engineer...
  - alert [ref=e199]
```

# Test source

```ts
  261 | test.describe('Terminal App', () => {
  262 | 
  263 |   test.beforeEach(async ({ page }) => {
  264 |     await loginToDesktop(page);
  265 |     await openAppFromStartMenu(page, 'Terminal');
  266 |     await expect(page.getByTestId('terminal-app')).toBeVisible({ timeout: 8000 });
  267 |   });
  268 | 
  269 |   test('shows system init on startup', async ({ page }) => {
  270 |     await expect(page.getByText('System Core Initialized')).toBeVisible({ timeout: 5000 });
  271 |   });
  272 | 
  273 |   test('input field is present and focusable', async ({ page }) => {
  274 |     const termInput = page.getByTestId('terminal-input');
  275 |     await expect(termInput).toBeVisible();
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
> 361 |     expect(count).toBeGreaterThan(0);
      |                   ^ Error: expect(received).toBeGreaterThan(expected)
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
  376 |     await page.getByTestId('start-button').click();
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