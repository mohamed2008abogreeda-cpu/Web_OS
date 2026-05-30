// ============================================================
// Web OS Portfolio — Mock Data (with Team + Discord Bots)
// ============================================================
import type { User, Project, AppDefinition } from '@/types';

// ── Users ───────────────────────────────────────────────
export const USERS: Record<string, User> = {
  Mohammed: {
    id: 'user-1',
    name: 'Mohammed',
    role: 'Backend Engineer — Node.js & Discord.js',
    bio: 'Building scalable backend systems, Discord bots with 24/7 uptime, and edge-native APIs. Passionate about Node.js, Cloudflare Workers, and real-time systems.',
    avatarUrl: '/avatars/mohammed.svg',
    wallpaper: '/wallpapers/dark-grid.svg',
    accentColor: '#6366f1',
  },
  Moamen: {
    id: 'user-2',
    name: 'Moamen',
    role: 'Creative Developer & UI/UX Engineer',
    bio: 'Designing and coding interfaces that feel alive. Passionate about motion design, accessibility, and pixel-perfect craft. React, Figma, and Framer Motion.',
    avatarUrl: '/avatars/moamen.svg',
    wallpaper: '/wallpapers/dark-waves.svg',
    accentColor: '#06b6d4',
  },
  Team: {
    id: 'user-team',
    name: 'Team',
    role: 'Mohammed & Moamen — Full-Stack Team',
    bio: 'A two-person powerhouse building production systems from backend to frontend. Node.js bots, Next.js apps, and Cloudflare infrastructure.',
    avatarUrl: '/avatars/team.svg',
    wallpaper: '/wallpapers/porsche_dark_wallpaper.png',
    accentColor: '#a855f7',
  },
};

// ── Projects ────────────────────────────────────────────
export const PROJECTS: Project[] = [
  // Mohammed's Projects
  {
    id: 'proj-guildmarket',
    userId: 'user-1',
    title: 'GuildMarket',
    description:
`## GuildMarket — Server Marketplace

A full-featured marketplace platform for Discord communities — combining guild management with e-commerce.

### Architecture
- **Backend:** Node.js + Express, Cloudflare Workers
- **Database:** Cloudflare D1 (SQLite at the Edge)
- **Storage:** Cloudflare R2 for assets
- **Auth:** Discord OAuth2 + JWT sessions
- **Payments:** Stripe Connect for guild owners

### Core Features
- Guild storefronts with custom branding and themes
- Real-time inventory sync via WebSocket
- Revenue sharing dashboard with analytics
- Role-based access control (Owner/Admin/Mod/Member)
- Automated order fulfillment through Discord DMs

### Status
🟢 **Live in production** — 12k+ active users, 340+ registered guilds`,
    iconUrl: '🏰',
    hasIframe: true,
    projectUrl: 'https://guildmarket.dev',
    liveApiEndpoint: 'https://api.guildmarket.dev/health',
    tags: ['Node.js', 'Cloudflare', 'E-Commerce', 'Discord'],
  },
  {
    id: 'proj-bot-247',
    userId: 'user-1',
    title: 'Node.js Bot 24/7',
    description:
`## Discord Bot — 24/7 Uptime

A production-grade Discord.js bot running on Node.js with zero-downtime deployments.

### Features
- **Moderation Suite:** Auto-mod, word filters, raid protection
- **Music System:** YouTube/Spotify playback via Lavalink
- **Economy System:** Virtual currency, daily rewards, shop
- **Leveling:** XP tracking, role rewards, leaderboards
- **Tickets:** Support ticket system with transcripts
- **Custom Commands:** User-defined commands via dashboard

### Infrastructure
- Hosted on Railway with auto-restart
- PM2 process management
- Redis for caching & rate limiting
- PostgreSQL for persistent data
- Health checks every 30s

### Stats
- 🟢 99.97% uptime (last 90 days)
- 📊 150+ servers, 45k+ users`,
    iconUrl: '🤖',
    hasIframe: false,
    projectUrl: 'https://github.com/mohammed/discord-bot',
    liveApiEndpoint: 'https://bot-api.lttthedev.com/status',
    tags: ['Discord.js', 'Node.js', 'Bot', '24/7'],
  },
  {
    id: 'proj-edgedb',
    userId: 'user-1',
    title: 'EdgeDB CLI',
    description:
`## EdgeDB CLI — D1 Management

A terminal-based management tool for Cloudflare D1 databases.

### Features
- Interactive SQL shell with syntax highlighting
- Migration management (up/down/status)
- Automated backup to R2
- Schema diffing and visualization

### Built With
- Node.js + Commander.js
- Better-sqlite3 for local testing
- Chalk for ANSI colors`,
    iconUrl: '🗄️',
    hasIframe: false,
    projectUrl: 'https://github.com/mohammed/edgedb-cli',
    liveApiEndpoint: null,
    tags: ['CLI', 'Database', 'Node.js'],
  },

  // Moamen's Projects
  {
    id: 'proj-motionkit',
    userId: 'user-2',
    title: 'MotionKit',
    description:
`## MotionKit — Animation Library

An open-source animation library for React, built on top of Framer Motion.

### Features
- 50+ pre-built animation presets
- Scroll-triggered animations
- Layout transition helpers
- Spring physics configurator

### Stats
- ⭐ 3.2k GitHub stars
- 📦 18k weekly npm downloads`,
    iconUrl: '🎨',
    hasIframe: true,
    projectUrl: 'https://motionkit.dev',
    liveApiEndpoint: 'https://api.motionkit.dev/status',
    tags: ['React', 'Animation', 'Open Source'],
  },
  {
    id: 'proj-pixelforge',
    userId: 'user-2',
    title: 'PixelForge',
    description:
`## PixelForge — Pixel Art Editor

Browser-based pixel art editor with real-time collaboration.

### Features
- Canvas-based drawing engine (60fps)
- Layer management system
- Multiplayer cursors via WebRTC
- Export to PNG, GIF, sprite sheets
- Palette generator from images`,
    iconUrl: '🖼️',
    hasIframe: true,
    projectUrl: 'https://pixelforge.app',
    liveApiEndpoint: null,
    tags: ['Canvas', 'WebRTC', 'Creative Tools'],
  },
  {
    id: 'proj-formcraft',
    userId: 'user-2',
    title: 'FormCraft',
    description:
`## FormCraft — Form Builder

Drag-and-drop form builder with conditional logic.

### Features
- Visual form designer
- Conditional field visibility
- Multi-step forms with progress
- Webhook integrations
- Analytics dashboard`,
    iconUrl: '📋',
    hasIframe: false,
    projectUrl: 'https://github.com/moamen/formcraft',
    liveApiEndpoint: null,
    tags: ['React', 'Forms', 'SaaS'],
  },

  // Team Projects
  {
    id: 'proj-deepseek',
    userId: 'user-team',
    title: 'DeepSeek Benchmarks',
    description:
`## DeepSeek Local Benchmarks

Local AI model benchmarking suite for comparing inference speeds and output quality across DeepSeek, Llama, and Mistral models.

### Features
- Automated benchmark runs with configurable parameters
- GPU utilization monitoring (CUDA/ROCm)
- Token-per-second metrics with statistical analysis
- Side-by-side output comparison
- Results export to JSON/CSV`,
    iconUrl: '🧪',
    hasIframe: false,
    projectUrl: 'https://github.com/team/deepseek-benchmarks',
    liveApiEndpoint: null,
    tags: ['AI', 'Benchmarks', 'Python'],
  },
];

// ── App Definitions (Desktop Apps) ──────────────────────
export const SYSTEM_APPS: AppDefinition[] = [
  {
    id: 'app-projects',
    title: 'Projects',
    icon: '📂',
    component: 'ProjectViewer',
    defaultWidth: 900,
    defaultHeight: 620,
  },
  {
    id: 'app-terminal',
    title: 'Terminal',
    icon: '⌨️',
    component: 'TerminalApp',
    defaultWidth: 720,
    defaultHeight: 480,
  },
  {
    id: 'app-comms',
    title: 'Comms',
    icon: '📞',
    component: 'DiscordCallApp',
    defaultWidth: 420,
    defaultHeight: 560,
  },
  {
    id: 'app-about',
    title: 'About',
    icon: '👤',
    component: 'AboutApp',
    defaultWidth: 560,
    defaultHeight: 500,
  },
  {
    id: 'app-music',
    title: 'Music',
    icon: '🎵',
    component: 'MusicApp',
    defaultWidth: 380,
    defaultHeight: 500,
  },
  {
    id: 'app-settings',
    title: 'Settings',
    icon: '⚙️',
    component: 'SettingsApp',
    defaultWidth: 480,
    defaultHeight: 400,
  },
];

// ── Boot Logs (BIOS/lttthedev style) ────────────────────
export const BOOT_LOGS: string[] = [
  'POST: Power-On Self Test...',
  'CPU: AMD Ryzen 9 7950X @ 5.7GHz [OK]',
  'RAM: 64GB DDR5-6000 [OK]',
  'GPU: NVIDIA RTX 4090 24GB [OK]',
  'NVMe: Samsung 990 Pro 2TB [OK]',
  '',
  'BIOS v4.2.1-webos — lttthedev Custom ROM',
  '═══════════════════════════════════════════',
  '',
  '[INIT] Loading kernel modules...',
  '[  OK  ] Mounted /dev/portfolio',
  '[  OK  ] Starting network-manager.service',
  '[  OK  ] Connecting to Cloudflare Edge Network...',
  '[  OK  ] Cloudflare D1 database mounted — /db/portfolio.sqlite',
  '[  OK  ] Cloudflare R2 bucket "assets" — accessible',
  '[  OK  ] WebRTC signaling server — initialized',
  '',
  '[USERS] Loading user profiles from D1...',
  '[  OK  ] Mohammed — Backend Engineer (Node.js/Discord.js)',
  '[  OK  ] Moamen — Creative Developer (React/Framer)',
  '[  OK  ] Team workspace — shared context loaded',
  '',
  '[  OK  ] Indexing project database... 7 projects found',
  '[  OK  ] GuildMarket API — responding (200 OK, 12ms)',
  '[  OK  ] Discord Bot status — ONLINE (150 servers)',
  '',
  '[STACK] Initializing runtime...',
  '[  OK  ] Next.js 16 — App Router ready',
  '[  OK  ] React 19 — Concurrent Mode active',
  '[  OK  ] Zustand store — hydrated from localStorage',
  '[  OK  ] Framer Motion — animation engine loaded',
  '[  OK  ] react-rnd — window manager service started',
  '[  OK  ] Tailwind CSS 4 — Lightning Engine ready',
  '',
  '[APPS ] Registering desktop applications...',
  '         app-projects    → Projects         [LOADED]',
  '         app-terminal    → Terminal         [LOADED]',
  '         app-comms       → Comms            [LOADED]',
  '         app-about       → About            [LOADED]',
  '         app-settings    → Settings         [LOADED]',
  '',
  '[  OK  ] Audio subsystem — ready',
  '[  OK  ] Discord WebRTC bridge — standby',
  '[  OK  ] Security: CSP headers configured',
  '[  OK  ] Security: iframe sandbox policies set',
  '[  OK  ] Samsung Internet compatibility — verified',
  '',
  '[FINAL] Running integrity checks...',
  '[  OK  ] All 23 services operational',
  '',
  '═══════════════════════════════════════════',
  '  WEB-OS PORTFOLIO v1.0.0 — Boot Complete',
  '  Workspace: Mohammed & Moamen',
  '  Runtime: Next.js 16 + Cloudflare Edge',
  '═══════════════════════════════════════════',
  '',
  'Starting graphical interface...',
];

// Helper: get projects for a user
export function getProjectsForUser(userId: string): Project[] {
  if (userId === 'user-team') {
    return PROJECTS; // Team sees all
  }
  return PROJECTS.filter((p) => p.userId === userId || p.userId === 'user-team');
}
