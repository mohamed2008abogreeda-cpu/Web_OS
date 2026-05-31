import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

// ── Users Table ───────────────────────────────────────────────
export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  name: text('name').notNull().unique(),
  role: text('role').notNull(),
  bio: text('bio').notNull().default(''),
  avatarUrl: text('avatar_url').notNull().default(''),
  wallpaper: text('wallpaper').notNull().default(''),
  accentColor: text('accent_color').notNull().default('#6366f1'),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`),
});

// ── Projects Table ─────────────────────────────────────────────
export const projects = sqliteTable('projects', {
  id: text('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  description: text('description').notNull().default(''),
  iconUrl: text('icon_url').notNull().default('📦'),
  hasIframe: integer('has_iframe', { mode: 'boolean' }).notNull().default(false),
  projectUrl: text('project_url').notNull().default(''),
  liveApiEndpoint: text('live_api_endpoint'),
  tags: text('tags').notNull().default('[]'), // Stored as a JSON array string
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`),
});

// ── Logs Table ─────────────────────────────────────────────────
export const logs = sqliteTable('logs', {
  id: text('id').primaryKey(),
  sessionId: text('session_id').notNull(),
  action: text('action').notNull(),
  details: text('details'),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});

// ── Admin Sessions Table ───────────────────────────────────────
export const adminSessions = sqliteTable('admin_sessions', {
  id: text('id').primaryKey(),
  token: text('token').notNull().unique(),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
  expiresAt: text('expires_at').notNull(), // text timestamp
});
