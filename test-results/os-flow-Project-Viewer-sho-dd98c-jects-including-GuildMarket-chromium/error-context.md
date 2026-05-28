# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: os-flow.spec.ts >> Project Viewer >> shows Mohammed projects including GuildMarket
- Location: tests\os-flow.spec.ts:349:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByTestId('project-viewer')
Expected: visible
Timeout: 8000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 8000ms
  - waiting for getByTestId('project-viewer')

```

```yaml
- main:
  - img "Wallpaper"
  - text: ● 06:49:59 ⬡ Desktop Still Woozy - Lava
  - button
  - button
  - button
  - text: 85%
  - img "Avatar"
  - text: demeter Good Afternoon! may su mo tu we th fr sa 1 2 3 4 5 6 7 8 9 10 11 12 13 14 15 16 17 18 19 20 21 22 23 24 25 26 27 28 29 30 31 Now Playing Still Woozy - Lava
  - img "Cover Art"
  - button
  - button
  - button
  - button "Projects"
  - button "Terminal"
  - button "Comms"
  - button "About"
  - button "Music"
  - button "Settings"
  - text: 06:49
  - button
  - button "Projects"
  - button "Terminal"
  - button "Comms"
  - button "About"
  - button "Music"
  - button "Settings"
  - button "Switch User Profile"
- region "Notifications alt+T"
- alert
```

# Test source

```ts
  246 | });
  247 | 
  248 | // ============================================================
  249 | // 6. TERMINAL APP TESTS
  250 | // ============================================================
  251 | test.describe('Terminal App', () => {
  252 | 
  253 |   test.beforeEach(async ({ page }) => {
  254 |     await loginToDesktop(page);
  255 |     await openAppFromStartMenu(page, 'Terminal');
  256 |     await expect(page.getByTestId('terminal-app')).toBeVisible({ timeout: 8000 });
  257 |   });
  258 | 
  259 |   test('shows Arch Linux neofetch on startup', async ({ page }) => {
  260 |     await expect(page.getByText('Arch Linux')).toBeVisible({ timeout: 5000 });
  261 |   });
  262 | 
  263 |   test('input field is present and focusable', async ({ page }) => {
  264 |     const termInput = page.getByTestId('terminal-input');
  265 |     await expect(termInput).toBeVisible();
  266 |     await termInput.click();
  267 |     await expect(termInput).toBeFocused();
  268 |   });
  269 | 
  270 |   test('help command shows available commands', async ({ page }) => {
  271 |     const termInput = page.getByTestId('terminal-input');
  272 |     await termInput.fill('help');
  273 |     await termInput.press('Enter');
  274 |     await expect(page.getByText('Available Commands')).toBeVisible({ timeout: 5000 });
  275 |   });
  276 | 
  277 |   test('whoami command shows user info', async ({ page }) => {
  278 |     const termInput = page.getByTestId('terminal-input');
  279 |     await termInput.fill('whoami');
  280 |     await termInput.press('Enter');
  281 |     await expect(page.getByText('Mohammed')).toBeVisible({ timeout: 5000 });
  282 |   });
  283 | 
  284 |   test('neofetch command re-renders system info', async ({ page }) => {
  285 |     const termInput = page.getByTestId('terminal-input');
  286 |     await termInput.fill('neofetch');
  287 |     await termInput.press('Enter');
  288 |     const archText = page.locator('text=Arch Linux');
  289 |     await expect(archText.first()).toBeVisible({ timeout: 5000 });
  290 |   });
  291 | 
  292 |   test('clear command clears the terminal', async ({ page }) => {
  293 |     const termInput = page.getByTestId('terminal-input');
  294 |     await termInput.fill('clear');
  295 |     await termInput.press('Enter');
  296 |     // Kernel version from neofetch should be gone
  297 |     await expect(page.getByText('6.9.0-zen1-1-zen')).not.toBeVisible({ timeout: 5000 });
  298 |   });
  299 | 
  300 |   test('invalid command shows error', async ({ page }) => {
  301 |     const termInput = page.getByTestId('terminal-input');
  302 |     await termInput.fill('invalidcommand123');
  303 |     await termInput.press('Enter');
  304 |     await expect(page.getByText('command not found: invalidcommand123')).toBeVisible({ timeout: 5000 });
  305 |   });
  306 | 
  307 |   test('sudo login admin triggers password prompt', async ({ page }) => {
  308 |     const termInput = page.getByTestId('terminal-input');
  309 |     await termInput.fill('sudo login admin');
  310 |     await termInput.press('Enter');
  311 |     await expect(page.getByText('Enter admin password:')).toBeVisible({ timeout: 5000 });
  312 |     await expect(termInput).toHaveAttribute('type', 'password');
  313 |   });
  314 | 
  315 |   test('correct admin password shows success', async ({ page }) => {
  316 |     const termInput = page.getByTestId('terminal-input');
  317 |     await termInput.fill('sudo login admin');
  318 |     await termInput.press('Enter');
  319 |     await expect(page.getByText('Enter admin password:')).toBeVisible({ timeout: 5000 });
  320 |     
  321 |     await termInput.fill('letmein2024');
  322 |     await termInput.press('Enter');
  323 |     await expect(page.getByText('Authentication successful')).toBeVisible({ timeout: 5000 });
  324 |   });
  325 | 
  326 |   test('wrong admin password shows failure', async ({ page }) => {
  327 |     const termInput = page.getByTestId('terminal-input');
  328 |     await termInput.fill('sudo login admin');
  329 |     await termInput.press('Enter');
  330 |     await expect(page.getByText('Enter admin password:')).toBeVisible({ timeout: 5000 });
  331 |     
  332 |     await termInput.fill('wrongpassword');
  333 |     await termInput.press('Enter');
  334 |     await expect(page.getByText('Authentication failed')).toBeVisible({ timeout: 5000 });
  335 |   });
  336 | });
  337 | 
  338 | // ============================================================
  339 | // 7. PROJECT VIEWER TESTS
  340 | // ============================================================
  341 | test.describe('Project Viewer', () => {
  342 | 
  343 |   test.beforeEach(async ({ page }) => {
  344 |     await loginToDesktop(page);
  345 |     await openAppFromStartMenu(page, 'Projects');
> 346 |     await expect(page.getByTestId('project-viewer')).toBeVisible({ timeout: 8000 });
      |                                                      ^ Error: expect(locator).toBeVisible() failed
  347 |   });
  348 | 
  349 |   test('shows Mohammed projects including GuildMarket', async ({ page }) => {
  350 |     await expect(page.getByText('GuildMarket')).toBeVisible({ timeout: 5000 });
  351 |   });
  352 | 
  353 |   test('shows project tags', async ({ page }) => {
  354 |     await expect(page.getByText('Node.js')).toBeVisible({ timeout: 5000 });
  355 |   });
  356 | });
  357 | 
  358 | // ============================================================
  359 | // 8. TASKBAR DOCK TESTS
  360 | // ============================================================
  361 | test.describe('Taskbar Dock', () => {
  362 | 
  363 |   test.beforeEach(async ({ page }) => {
  364 |     await loginToDesktop(page);
  365 |   });
  366 | 
  367 |   test('taskbar dock is visible', async ({ page }) => {
  368 |     await expect(page.getByTestId('taskbar')).toBeVisible();
  369 |   });
  370 | 
  371 |   test('taskbar shows start button', async ({ page }) => {
  372 |     await expect(page.getByTestId('start-button')).toBeVisible();
  373 |   });
  374 | 
  375 |   test('taskbar shows switch user button', async ({ page }) => {
  376 |     await expect(page.getByTestId('switch-user')).toBeVisible();
  377 |   });
  378 | 
  379 |   test('taskbar has multiple dock buttons', async ({ page }) => {
  380 |     const taskbar = page.getByTestId('taskbar');
  381 |     const dockButtons = taskbar.locator('button');
  382 |     const count = await dockButtons.count();
  383 |     // start + apps + switch user = at least 4
  384 |     expect(count).toBeGreaterThan(3);
  385 |   });
  386 | });
  387 | 
  388 | // ============================================================
  389 | // 9. USER SWITCHING TESTS
  390 | // ============================================================
  391 | test.describe('User Switching', () => {
  392 | 
  393 |   test('switch user button changes context', async ({ page }) => {
  394 |     await loginToDesktop(page);
  395 |     const switchBtn = page.getByTestId('switch-user');
  396 | 
  397 |     // Click switch - should change user
  398 |     await switchBtn.click();
  399 |     // Wait a moment for state to update
  400 |     await page.waitForTimeout(500);
  401 | 
  402 |     // Open start menu to verify user changed
  403 |     await page.getByTestId('start-button').click();
  404 |     await expect(page.getByText('Quick Apps')).toBeVisible({ timeout: 5000 });
  405 |     // Should now show Moamen in the profile card
  406 |     await expect(page.getByText('Moamen')).toBeVisible({ timeout: 3000 });
  407 |   });
  408 | 
  409 |   test('logout returns to login screen', async ({ page }) => {
  410 |     await loginToDesktop(page);
  411 | 
  412 |     await page.getByTestId('start-button').click();
  413 |     await expect(page.getByText('Sign Out Session')).toBeVisible({ timeout: 5000 });
  414 |     // Click Sign Out using force since backdrop may intercept
  415 |     await page.getByText('Sign Out Session').click({ force: true });
  416 | 
  417 |     await expect(page.getByTestId('login-screen')).toBeVisible({ timeout: 8000 });
  418 |   });
  419 | });
  420 | 
  421 | // ============================================================
  422 | // 10. RESPONSIVE / MOBILE TESTS
  423 | // ============================================================
  424 | test.describe('Mobile Responsiveness', () => {
  425 | 
  426 |   test('taskbar is visible on mobile', async ({ page }) => {
  427 |     await loginToDesktop(page);
  428 |     await expect(page.getByTestId('taskbar')).toBeVisible();
  429 |   });
  430 | 
  431 |   test('start menu works on mobile', async ({ page }) => {
  432 |     await loginToDesktop(page);
  433 |     await page.getByTestId('start-button').click();
  434 |     await expect(page.getByText('Quick Apps')).toBeVisible({ timeout: 5000 });
  435 |   });
  436 | });
  437 | 
```