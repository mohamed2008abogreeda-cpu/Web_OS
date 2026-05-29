# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: os-flow.spec.ts >> Terminal App >> sudo status command shows system diagnostics
- Location: tests\os-flow.spec.ts:294:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByTestId('terminal-app')
Expected: visible
Timeout: 8000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 8000ms
  - waiting for getByTestId('terminal-app')

```

```yaml
- main:
  - region "Notifications alt+T"
  - img "Wallpaper"
  - text: ● 17:25:54 ⬡ Desktop Still Woozy - Lava
  - button
  - button
  - button
  - button "85%"
  - button
  - button
  - button "Projects"
  - button "Terminal"
  - button "Comms"
  - button "About"
  - button "Music"
  - button "Settings"
  - img "Avatar"
  - text: demeter Good Afternoon! may su mo tu we th fr sa 1 2 3 4 5 6 7 8 9 10 11 12 13 14 15 16 17 18 19 20 21 22 23 24 25 26 27 28 29 30 31 Now Playing Still Woozy - Lava
  - img "Cover Art"
  - button
  - button
  - button
  - text: 17:25
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
  166 |     await expect(page.getByText('Quick Apps').first()).toBeVisible({ timeout: 5000 });
  167 |     // Click outside the menu (top left corner of screen)
  168 |     await page.mouse.click(10, 10);
  169 |     await expect(page.getByText('Quick Apps').first()).not.toBeVisible({ timeout: 3000 });
  170 |   });
  171 | 
  172 |   test('opening Terminal from start menu launches window', async ({ page }) => {
  173 |     await openAppFromStartMenu(page, 'Terminal');
  174 |     await expect(page.getByTestId('terminal-app')).toBeVisible({ timeout: 8000 });
  175 |   });
  176 | 
  177 |   test('opening About from start menu launches window', async ({ page }) => {
  178 |     await openAppFromStartMenu(page, 'About');
  179 |     await expect(page.getByTestId('about-app')).toBeVisible({ timeout: 8000 });
  180 |   });
  181 | });
  182 | 
  183 | // ============================================================
  184 | // 5. WINDOW MANAGEMENT TESTS
  185 | // ============================================================
  186 | test.describe('Window Management', () => {
  187 | 
  188 |   test.beforeEach(async ({ page }) => {
  189 |     await loginToDesktop(page);
  190 |   });
  191 | 
  192 |   test('open Terminal and verify it renders', async ({ page }) => {
  193 |     await openAppFromStartMenu(page, 'Terminal');
  194 |     await expect(page.getByTestId('terminal-app')).toBeVisible({ timeout: 8000 });
  195 |   });
  196 | 
  197 |   test('traffic light close button (red) closes window', async ({ page, isMobile }) => {
  198 |     test.skip(!!isMobile, 'Traffic lights only on desktop');
  199 |     
  200 |     await openAppFromStartMenu(page, 'Terminal');
  201 |     await expect(page.getByTestId('terminal-app')).toBeVisible({ timeout: 8000 });
  202 | 
  203 |     // The close button is the first button inside .window-drag-handle
  204 |     const closeBtn = page.locator('.window-drag-handle button').first();
  205 |     await closeBtn.click({ force: true });
  206 | 
  207 |     await expect(page.getByTestId('terminal-app')).not.toBeVisible({ timeout: 5000 });
  208 |   });
  209 | 
  210 |   test('traffic light minimize button (yellow) hides window', async ({ page, isMobile }) => {
  211 |     test.skip(!!isMobile, 'Traffic lights only on desktop');
  212 | 
  213 |     await openAppFromStartMenu(page, 'Terminal');
  214 |     await expect(page.getByTestId('terminal-app')).toBeVisible({ timeout: 8000 });
  215 | 
  216 |     // Minimize is the second button
  217 |     const minBtn = page.locator('.window-drag-handle button').nth(1);
  218 |     await minBtn.click({ force: true });
  219 | 
  220 |     await expect(page.getByTestId('terminal-app')).not.toBeVisible({ timeout: 5000 });
  221 |   });
  222 | 
  223 |   test('multiple windows can be opened', async ({ page, isMobile }) => {
  224 |     test.skip(!!isMobile, 'Mobile layout obscures background windows');
  225 |     // Open Terminal
  226 |     await openAppFromStartMenu(page, 'Terminal');
  227 |     await expect(page.getByTestId('terminal-app')).toBeVisible({ timeout: 8000 });
  228 | 
  229 |     // Open About
  230 |     await openAppFromStartMenu(page, 'About');
  231 |     await expect(page.getByTestId('about-app')).toBeVisible({ timeout: 8000 });
  232 | 
  233 |     // Both visible
  234 |     await expect(page.getByTestId('terminal-app')).toBeVisible();
  235 |     await expect(page.getByTestId('about-app')).toBeVisible();
  236 |   });
  237 | 
  238 |   test('window drag works on desktop', async ({ page, isMobile }) => {
  239 |     test.skip(!!isMobile, 'Drag test only runs on desktop');
  240 | 
  241 |     await openAppFromStartMenu(page, 'Terminal');
  242 |     await expect(page.getByTestId('terminal-app')).toBeVisible({ timeout: 8000 });
  243 | 
  244 |     const dragHandle = page.locator('.window-drag-handle').first();
  245 |     const box = await dragHandle.boundingBox();
  246 | 
  247 |     if (box) {
  248 |       await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  249 |       await page.mouse.down();
  250 |       await page.mouse.move(box.x + 200, box.y + 100, { steps: 10 });
  251 |       await page.mouse.up();
  252 |     }
  253 | 
  254 |     await expect(page.getByTestId('terminal-app')).toBeVisible();
  255 |   });
  256 | });
  257 | 
  258 | // ============================================================
  259 | // 6. TERMINAL APP TESTS
  260 | // ============================================================
  261 | test.describe('Terminal App', () => {
  262 | 
  263 |   test.beforeEach(async ({ page }) => {
  264 |     await loginToDesktop(page);
  265 |     await openAppFromStartMenu(page, 'Terminal');
> 266 |     await expect(page.getByTestId('terminal-app')).toBeVisible({ timeout: 8000 });
      |                                                    ^ Error: expect(locator).toBeVisible() failed
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
  361 |     expect(count).toBeGreaterThan(0);
  362 |   });
  363 | });
  364 | 
  365 | // ============================================================
  366 | // 9. USER SWITCHING TESTS
```