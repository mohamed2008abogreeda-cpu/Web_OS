-- ============================================================
-- Cloudflare D1 Schema — Web OS Portfolio
-- Run: wrangler d1 execute portfolio-db --file=./schema.sql
-- ============================================================

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL,
  bio TEXT NOT NULL DEFAULT '',
  avatar_url TEXT NOT NULL DEFAULT '',
  wallpaper TEXT NOT NULL DEFAULT '',
  accent_color TEXT NOT NULL DEFAULT '#6366f1',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Projects table
CREATE TABLE IF NOT EXISTS projects (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  icon_url TEXT NOT NULL DEFAULT '📦',
  has_iframe BOOLEAN NOT NULL DEFAULT 0,
  project_url TEXT NOT NULL DEFAULT '',
  live_api_endpoint TEXT,
  tags TEXT NOT NULL DEFAULT '[]', -- JSON array
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Admin sessions (for terminal auth)
CREATE TABLE IF NOT EXISTS admin_sessions (
  id TEXT PRIMARY KEY,
  token TEXT NOT NULL UNIQUE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  expires_at DATETIME NOT NULL
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
CREATE INDEX IF NOT EXISTS idx_admin_sessions_token ON admin_sessions(token);
CREATE INDEX IF NOT EXISTS idx_admin_sessions_expires ON admin_sessions(expires_at);

-- ============================================================
-- Seed Data
-- ============================================================

INSERT OR IGNORE INTO users (id, name, role, bio, avatar_url, accent_color) VALUES
  ('user-1', 'Mohammed', 'Backend Engineer — Node.js & Discord.js',
   'Building scalable backend systems, Discord bots with 24/7 uptime, and edge-native APIs.',
   '/avatars/mohammed.svg', '#6366f1'),
  ('user-2', 'Moamen', 'Creative Developer & UI/UX Engineer',
   'Designing and coding interfaces that feel alive. Passionate about motion design and pixel-perfect craft.',
   '/avatars/moamen.svg', '#06b6d4'),
  ('user-team', 'Team', 'Mohammed & Moamen — Full-Stack Team',
   'A two-person powerhouse building production systems from backend to frontend.',
   '/avatars/team.svg', '#a855f7');

INSERT OR IGNORE INTO projects (id, user_id, title, description, icon_url, has_iframe, project_url, live_api_endpoint, tags) VALUES
  ('proj-guildmarket', 'user-1', 'GuildMarket', 'Decentralized marketplace for Discord communities',
   '🏰', 1, 'https://guildmarket.dev', 'https://api.guildmarket.dev/health',
   '["Node.js","Cloudflare","E-Commerce","Discord"]'),
  ('proj-bot-247', 'user-1', 'Node.js Bot 24/7', 'Production Discord.js bot with zero-downtime',
   '🤖', 0, 'https://github.com/mohammed/discord-bot', 'https://bot-api.lttthedev.com/status',
   '["Discord.js","Node.js","Bot","24/7"]'),
  ('proj-motionkit', 'user-2', 'MotionKit', 'Open-source React animation library',
   '🎨', 1, 'https://motionkit.dev', 'https://api.motionkit.dev/status',
   '["React","Animation","Open Source"]');
