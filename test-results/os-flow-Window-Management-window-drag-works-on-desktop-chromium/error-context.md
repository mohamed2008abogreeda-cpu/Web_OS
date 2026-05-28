# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: os-flow.spec.ts >> Window Management >> window drag works on desktop
- Location: tests\os-flow.spec.ts:228:7

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
  - img "Wallpaper"
  - text: ● 06:46:17 ⬡ Desktop Still Woozy - Lava
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
  - text: 06:46
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
  132 |     await expect(page.getByText('Quick Apps')).toBeVisible({ timeout: 5000 });
  133 |   });
  134 | 
  135 |   test('shows system apps in menu', async ({ page }) => {
  136 |     await page.getByTestId('start-button').click();
  137 |     await expect(page.getByText('Quick Apps')).toBeVisible({ timeout: 5000 });
  138 |     // Check that at least Terminal and About are visible
  139 |     await expect(page.locator('button', { hasText: 'Terminal' }).first()).toBeVisible();
  140 |     await expect(page.locator('button', { hasText: 'About' }).first()).toBeVisible();
  141 |   });
  142 | 
  143 |   test('shows user profile info', async ({ page }) => {
  144 |     await page.getByTestId('start-button').click();
  145 |     await expect(page.getByText('Quick Apps')).toBeVisible({ timeout: 5000 });
  146 |     // The username should be displayed in the menu panel
  147 |     await expect(page.getByText('Mohammed')).toBeVisible();
  148 |   });
  149 | 
  150 |   test('shows Sign Out button', async ({ page }) => {
  151 |     await page.getByTestId('start-button').click();
  152 |     await expect(page.getByText('Sign Out Session')).toBeVisible({ timeout: 5000 });
  153 |   });
  154 | 
  155 |   test('closes when clicking outside', async ({ page }) => {
  156 |     await page.getByTestId('start-button').click();
  157 |     await expect(page.getByText('Quick Apps')).toBeVisible({ timeout: 5000 });
  158 |     // Click the backdrop overlay to close
  159 |     await page.locator('.fixed.inset-0').first().click({ force: true });
  160 |     await expect(page.getByText('Quick Apps')).not.toBeVisible({ timeout: 3000 });
  161 |   });
  162 | 
  163 |   test('opening Terminal from start menu launches window', async ({ page }) => {
  164 |     await openAppFromStartMenu(page, 'Terminal');
  165 |     await expect(page.getByTestId('terminal-app')).toBeVisible({ timeout: 8000 });
  166 |   });
  167 | 
  168 |   test('opening About from start menu launches window', async ({ page }) => {
  169 |     await openAppFromStartMenu(page, 'About');
  170 |     await expect(page.getByTestId('about-app')).toBeVisible({ timeout: 8000 });
  171 |   });
  172 | });
  173 | 
  174 | // ============================================================
  175 | // 5. WINDOW MANAGEMENT TESTS
  176 | // ============================================================
  177 | test.describe('Window Management', () => {
  178 | 
  179 |   test.beforeEach(async ({ page }) => {
  180 |     await loginToDesktop(page);
  181 |   });
  182 | 
  183 |   test('open Terminal and verify it renders', async ({ page }) => {
  184 |     await openAppFromStartMenu(page, 'Terminal');
  185 |     await expect(page.getByTestId('terminal-app')).toBeVisible({ timeout: 8000 });
  186 |   });
  187 | 
  188 |   test('traffic light close button (red) closes window', async ({ page, isMobile }) => {
  189 |     test.skip(!!isMobile, 'Traffic lights only on desktop');
  190 |     
  191 |     await openAppFromStartMenu(page, 'Terminal');
  192 |     await expect(page.getByTestId('terminal-app')).toBeVisible({ timeout: 8000 });
  193 | 
  194 |     // The close button is the first button inside .window-drag-handle
  195 |     const closeBtn = page.locator('.window-drag-handle button').first();
  196 |     await closeBtn.click({ force: true });
  197 | 
  198 |     await expect(page.getByTestId('terminal-app')).not.toBeVisible({ timeout: 5000 });
  199 |   });
  200 | 
  201 |   test('traffic light minimize button (yellow) hides window', async ({ page, isMobile }) => {
  202 |     test.skip(!!isMobile, 'Traffic lights only on desktop');
  203 | 
  204 |     await openAppFromStartMenu(page, 'Terminal');
  205 |     await expect(page.getByTestId('terminal-app')).toBeVisible({ timeout: 8000 });
  206 | 
  207 |     // Minimize is the second button
  208 |     const minBtn = page.locator('.window-drag-handle button').nth(1);
  209 |     await minBtn.click({ force: true });
  210 | 
  211 |     await expect(page.getByTestId('terminal-app')).not.toBeVisible({ timeout: 5000 });
  212 |   });
  213 | 
  214 |   test('multiple windows can be opened', async ({ page }) => {
  215 |     // Open Terminal
  216 |     await openAppFromStartMenu(page, 'Terminal');
  217 |     await expect(page.getByTestId('terminal-app')).toBeVisible({ timeout: 8000 });
  218 | 
  219 |     // Open About
  220 |     await openAppFromStartMenu(page, 'About');
  221 |     await expect(page.getByTestId('about-app')).toBeVisible({ timeout: 8000 });
  222 | 
  223 |     // Both visible
  224 |     await expect(page.getByTestId('terminal-app')).toBeVisible();
  225 |     await expect(page.getByTestId('about-app')).toBeVisible();
  226 |   });
  227 | 
  228 |   test('window drag works on desktop', async ({ page, isMobile }) => {
  229 |     test.skip(!!isMobile, 'Drag test only runs on desktop');
  230 | 
  231 |     await openAppFromStartMenu(page, 'Terminal');
> 232 |     await expect(page.getByTestId('terminal-app')).toBeVisible({ timeout: 8000 });
      |                                                    ^ Error: expect(locator).toBeVisible() failed
  233 | 
  234 |     const dragHandle = page.locator('.window-drag-handle').first();
  235 |     const box = await dragHandle.boundingBox();
  236 | 
  237 |     if (box) {
  238 |       await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  239 |       await page.mouse.down();
  240 |       await page.mouse.move(box.x + 200, box.y + 100, { steps: 10 });
  241 |       await page.mouse.up();
  242 |     }
  243 | 
  244 |     await expect(page.getByTestId('terminal-app')).toBeVisible();
  245 |   });
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
```