# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: os-flow.spec.ts >> Start Menu >> shows user profile info
- Location: tests\os-flow.spec.ts:143:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByText('Mohammed')
Expected: visible
Error: strict mode violation: getByText('Mohammed') resolved to 2 elements:
    1) <div class="text-slate-800 text-sm font-extrabold truncate tracking-tight">Mohammed</div> aka getByTestId('desktop').getByText('Mohammed')
    2) <div class="" data-title="">Welcome back, Mohammed!</div> aka getByText('Welcome back, Mohammed!')

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for getByText('Mohammed')

```

# Page snapshot

```yaml
- generic [ref=e1]:
  - main [ref=e2]:
    - generic [ref=e3]:
      - generic:
        - img "Wallpaper"
      - generic [ref=e4]:
        - generic [ref=e5]:
          - generic [ref=e6]: ●
          - generic [ref=e7]: 06:42:44
          - generic [ref=e8] [cursor=pointer]: ⬡
          - generic [ref=e9]: Desktop
        - generic [ref=e10]: Still Woozy - Lava
        - generic [ref=e11]:
          - button [ref=e12] [cursor=pointer]:
            - img [ref=e13]
          - button [ref=e15] [cursor=pointer]:
            - img [ref=e16]
          - button [ref=e19] [cursor=pointer]:
            - img [ref=e20]
          - generic [ref=e24]:
            - generic [ref=e25]: 85%
            - img [ref=e26]
          - img [ref=e28]
          - img [ref=e32]
      - generic [ref=e36]:
        - generic [ref=e37]:
          - generic [ref=e38]:
            - img "Avatar" [ref=e40]
            - generic [ref=e41]:
              - generic [ref=e42]: demeter
              - generic [ref=e43]: Good Afternoon!
          - generic [ref=e44]:
            - generic [ref=e45]: may
            - generic [ref=e46]:
              - generic [ref=e47]: su
              - generic [ref=e48]: mo
              - generic [ref=e49]: tu
              - generic [ref=e50]: we
              - generic [ref=e51]: th
              - generic [ref=e52]: fr
              - generic [ref=e53]: sa
            - generic [ref=e54]:
              - generic [ref=e60] [cursor=pointer]: "1"
              - generic [ref=e61] [cursor=pointer]: "2"
              - generic [ref=e62] [cursor=pointer]: "3"
              - generic [ref=e63] [cursor=pointer]: "4"
              - generic [ref=e64] [cursor=pointer]: "5"
              - generic [ref=e65] [cursor=pointer]: "6"
              - generic [ref=e66] [cursor=pointer]: "7"
              - generic [ref=e67] [cursor=pointer]: "8"
              - generic [ref=e68] [cursor=pointer]: "9"
              - generic [ref=e69] [cursor=pointer]: "10"
              - generic [ref=e70] [cursor=pointer]: "11"
              - generic [ref=e71] [cursor=pointer]: "12"
              - generic [ref=e72] [cursor=pointer]: "13"
              - generic [ref=e73] [cursor=pointer]: "14"
              - generic [ref=e74] [cursor=pointer]: "15"
              - generic [ref=e75] [cursor=pointer]: "16"
              - generic [ref=e76] [cursor=pointer]: "17"
              - generic [ref=e77] [cursor=pointer]: "18"
              - generic [ref=e78] [cursor=pointer]: "19"
              - generic [ref=e79] [cursor=pointer]: "20"
              - generic [ref=e80] [cursor=pointer]: "21"
              - generic [ref=e81] [cursor=pointer]: "22"
              - generic [ref=e82] [cursor=pointer]: "23"
              - generic [ref=e83] [cursor=pointer]: "24"
              - generic [ref=e84] [cursor=pointer]: "25"
              - generic [ref=e85] [cursor=pointer]: "26"
              - generic [ref=e86] [cursor=pointer]: "27"
              - generic [ref=e87]: "28"
              - generic [ref=e88] [cursor=pointer]: "29"
              - generic [ref=e89] [cursor=pointer]: "30"
              - generic [ref=e90] [cursor=pointer]: "31"
          - generic [ref=e91]:
            - generic [ref=e92]:
              - generic [ref=e93]: Now Playing
              - generic [ref=e94]: Still Woozy - Lava
            - generic [ref=e95]:
              - generic [ref=e97]:
                - img "Cover Art" [ref=e98]
                - img [ref=e100]
              - generic [ref=e104]:
                - button [ref=e105] [cursor=pointer]:
                  - img [ref=e106]
                - button [ref=e108] [cursor=pointer]:
                  - img [ref=e109]
                - button [ref=e111] [cursor=pointer]:
                  - img [ref=e112]
        - generic [ref=e115]:
          - button "Projects" [ref=e116]:
            - img [ref=e118]
            - generic [ref=e120]: Projects
          - button "Terminal" [ref=e121]:
            - img [ref=e123]
            - generic [ref=e125]: Terminal
          - button "Comms" [ref=e126]:
            - img [ref=e128]
            - generic [ref=e130]: Comms
          - button "About" [ref=e131]:
            - img [ref=e133]
            - generic [ref=e136]: About
          - button "Music" [ref=e137]:
            - img [ref=e139]
            - generic [ref=e143]: Music
          - button "Settings" [ref=e144]:
            - img [ref=e146]
            - generic [ref=e149]: Settings
        - generic [ref=e151]: 06:42
      - generic [ref=e153]:
        - generic [ref=e154]:
          - img [ref=e156]
          - generic [ref=e160]:
            - generic [ref=e161]: Mohammed
            - generic [ref=e162]: Backend Engineer — Node.js & Discord.js
        - generic [ref=e163]:
          - generic [ref=e164]:
            - generic [ref=e165]:
              - generic [ref=e166]:
                - img [ref=e167]
                - text: CPU Performance
              - generic [ref=e169]: 28%
            - img [ref=e171]
            - generic [ref=e173]:
              - generic [ref=e174]: RAM Allocation
              - generic [ref=e175]: 42% (2.8 GB)
          - generic [ref=e178]:
            - generic [ref=e179]:
              - generic [ref=e180]:
                - generic [ref=e181]:
                  - img [ref=e183]
                  - text: Audio Volume
                - generic [ref=e187]: 65%
              - slider [ref=e189] [cursor=pointer]: "65"
            - generic [ref=e190]:
              - generic [ref=e191]:
                - generic [ref=e192]:
                  - img [ref=e194]
                  - text: Brightness
                - generic [ref=e200]: 80%
              - slider [ref=e202] [cursor=pointer]: "80"
          - generic [ref=e203]:
            - generic [ref=e204]: Quick Apps
            - button "Projects Open" [ref=e205] [cursor=pointer]:
              - generic [ref=e206]:
                - img [ref=e208]
                - generic [ref=e210]: Projects
              - generic [ref=e211]: Open
            - button "Terminal Open" [ref=e212] [cursor=pointer]:
              - generic [ref=e213]:
                - img [ref=e215]
                - generic [ref=e217]: Terminal
              - generic [ref=e218]: Open
            - button "Comms Open" [ref=e219] [cursor=pointer]:
              - generic [ref=e220]:
                - img [ref=e222]
                - generic [ref=e224]: Comms
              - generic [ref=e225]: Open
            - button "About Open" [ref=e226] [cursor=pointer]:
              - generic [ref=e227]:
                - img [ref=e229]
                - generic [ref=e232]: About
              - generic [ref=e233]: Open
            - button "Music Open" [ref=e234] [cursor=pointer]:
              - generic [ref=e235]:
                - img [ref=e237]
                - generic [ref=e241]: Music
              - generic [ref=e242]: Open
            - button "Settings Open" [ref=e243] [cursor=pointer]:
              - generic [ref=e244]:
                - img [ref=e246]
                - generic [ref=e249]: Settings
              - generic [ref=e250]: Open
        - generic [ref=e251]:
          - button "Switch Profile Context" [ref=e252] [cursor=pointer]:
            - img [ref=e254]
            - generic [ref=e257]: Switch Profile Context
          - button "Sign Out Session" [ref=e258] [cursor=pointer]:
            - img [ref=e260]
            - generic [ref=e263]: Sign Out Session
      - generic [ref=e264]:
        - button [active] [ref=e265] [cursor=pointer]:
          - img [ref=e266]
        - generic [ref=e269]:
          - button "Projects" [ref=e270] [cursor=pointer]:
            - img [ref=e271]
          - button "Terminal" [ref=e273] [cursor=pointer]:
            - img [ref=e274]
          - button "Comms" [ref=e276] [cursor=pointer]:
            - img [ref=e277]
          - button "About" [ref=e279] [cursor=pointer]:
            - img [ref=e280]
          - button "Music" [ref=e283] [cursor=pointer]:
            - img [ref=e284]
          - button "Settings" [ref=e288] [cursor=pointer]:
            - img [ref=e289]
        - button "Switch User Profile" [ref=e293] [cursor=pointer]:
          - img [ref=e294]
  - region "Notifications alt+T":
    - list:
      - listitem [ref=e297]:
        - button "Close toast" [ref=e298] [cursor=pointer]:
          - img [ref=e299]
        - img [ref=e303]
        - generic [ref=e305]:
          - generic [ref=e306]: Welcome back, Mohammed!
          - generic [ref=e307]: Launching workspace context for Backend Engineer — Node.js & Discord.js...
  - button "Open Next.js Dev Tools" [ref=e313] [cursor=pointer]:
    - img [ref=e314]
  - alert [ref=e317]
```

# Test source

```ts
  47  |   test('skip button transitions to login screen', async ({ page }) => {
  48  |     await page.getByTestId('skip-boot').click({ timeout: 8000 });
  49  |     const loginScreen = page.getByTestId('login-screen');
  50  |     await expect(loginScreen).toBeVisible({ timeout: 8000 });
  51  |   });
  52  | });
  53  | 
  54  | // ============================================================
  55  | // 2. LOGIN SCREEN TESTS
  56  | // ============================================================
  57  | test.describe('Login Screen', () => {
  58  | 
  59  |   test.beforeEach(async ({ page }) => {
  60  |     await page.goto('/');
  61  |     await page.evaluate(() => localStorage.clear());
  62  |     await page.reload();
  63  |     await page.getByTestId('skip-boot').click({ timeout: 8000 });
  64  |     await expect(page.getByTestId('login-screen')).toBeVisible({ timeout: 8000 });
  65  |   });
  66  | 
  67  |   test('shows all three user profiles', async ({ page }) => {
  68  |     await expect(page.getByTestId('login-mohammed')).toBeVisible();
  69  |     await expect(page.getByTestId('login-moamen')).toBeVisible();
  70  |     await expect(page.getByTestId('login-team')).toBeVisible();
  71  |   });
  72  | 
  73  |   test('clicking Mohammed logs into desktop', async ({ page }) => {
  74  |     await page.getByTestId('login-mohammed').click();
  75  |     await expect(page.getByTestId('desktop')).toBeVisible({ timeout: 8000 });
  76  |   });
  77  | 
  78  |   test('clicking Moamen logs into desktop', async ({ page }) => {
  79  |     await page.getByTestId('login-moamen').click();
  80  |     await expect(page.getByTestId('desktop')).toBeVisible({ timeout: 8000 });
  81  |   });
  82  | 
  83  |   test('clicking Team logs into desktop', async ({ page }) => {
  84  |     await page.getByTestId('login-team').click();
  85  |     await expect(page.getByTestId('desktop')).toBeVisible({ timeout: 8000 });
  86  |   });
  87  | });
  88  | 
  89  | // ============================================================
  90  | // 3. DESKTOP LAYOUT TESTS
  91  | // ============================================================
  92  | test.describe('Desktop Layout', () => {
  93  | 
  94  |   test.beforeEach(async ({ page }) => {
  95  |     await loginToDesktop(page);
  96  |   });
  97  | 
  98  |   test('desktop renders with taskbar', async ({ page }) => {
  99  |     await expect(page.getByTestId('desktop')).toBeVisible();
  100 |     await expect(page.getByTestId('taskbar')).toBeVisible();
  101 |   });
  102 | 
  103 |   test('desktop does NOT auto-open windows', async ({ page }) => {
  104 |     const terminalApp = page.getByTestId('terminal-app');
  105 |     await expect(terminalApp).not.toBeVisible();
  106 |   });
  107 | 
  108 |   test('start button is visible and clickable', async ({ page }) => {
  109 |     const startBtn = page.getByTestId('start-button');
  110 |     await expect(startBtn).toBeVisible();
  111 |     await startBtn.click();
  112 |     await expect(page.getByText('Quick Apps')).toBeVisible({ timeout: 5000 });
  113 |   });
  114 | 
  115 |   test('switch user button is visible', async ({ page }) => {
  116 |     const switchBtn = page.getByTestId('switch-user');
  117 |     await expect(switchBtn).toBeVisible();
  118 |   });
  119 | });
  120 | 
  121 | // ============================================================
  122 | // 4. START MENU TESTS
  123 | // ============================================================
  124 | test.describe('Start Menu', () => {
  125 | 
  126 |   test.beforeEach(async ({ page }) => {
  127 |     await loginToDesktop(page);
  128 |   });
  129 | 
  130 |   test('opens and shows Quick Apps section', async ({ page }) => {
  131 |     await page.getByTestId('start-button').click();
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
> 147 |     await expect(page.getByText('Mohammed')).toBeVisible();
      |                                              ^ Error: expect(locator).toBeVisible() failed
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
  232 |     await expect(page.getByTestId('terminal-app')).toBeVisible({ timeout: 8000 });
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
```