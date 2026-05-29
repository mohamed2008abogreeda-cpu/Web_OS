// ============================================================
// Web OS Portfolio — Type Definitions (Updated for Team mode)
// ============================================================

export type UserName = 'Mohammed' | 'Moamen' | 'Team';

export interface User {
  id: string;
  name: UserName;
  role: string;
  bio: string;
  avatarUrl: string;
  wallpaper: string;
  accentColor: string;
}

export interface Project {
  id: string;
  userId: string;
  title: string;
  description: string;
  iconUrl: string;
  hasIframe: boolean;
  projectUrl: string;
  liveApiEndpoint: string | null;
  tags: string[];
}

export interface AppDefinition {
  id: string;
  title: string;
  icon: string;
  component: string;
  defaultWidth: number;
  defaultHeight: number;
  minWidth?: number;
  minHeight?: number;
  data?: Record<string, unknown>;
}

export interface WindowState {
  id: string;
  appId: string;
  title: string;
  component: string;
  isOpen: boolean;
  isMinimized: boolean;
  isMaximized: boolean;
  zIndex: number;
  x: number;
  y: number;
  width: number;
  height: number;
  data?: Record<string, unknown>;
}

export interface LiveStats {
  status: 'online' | 'offline' | 'degraded';
  uptime: string;
  ping: number;
  lastChecked: string;
}

export type BootPhase = 'booting' | 'login' | 'desktop';

export interface OSState {
  // Auth
  currentUser: UserName | null;
  bootPhase: BootPhase;

  // Window Manager
  windows: WindowState[];
  activeWindowId: string | null;


  // UI
  isStartMenuOpen: boolean;
  isMobile: boolean;

  // Admin
  isAdminAuthenticated: boolean;

  // Spectator Mode
  sessionId: string;
  isSpectating: boolean;
  activeSpectatorSession: string | null;
  ghostCursor: { x: number; y: number } | null;

  // Actions
  setBootPhase: (phase: BootPhase) => void;
  loginUser: (name: UserName) => void;
  logoutUser: () => void;
  switchUser: () => void;
  openWindow: (app: AppDefinition) => void;
  closeWindow: (id: string) => void;
  minimizeWindow: (id: string) => void;
  maximizeWindow: (id: string) => void;
  restoreWindow: (id: string) => void;
  focusWindow: (id: string) => void;
  updateWindowPosition: (id: string, x: number, y: number) => void;
  updateWindowSize: (id: string, width: number, height: number) => void;
  toggleStartMenu: () => void;
  setAdminAuthenticated: (val: boolean) => void;
  setMobile: (val: boolean) => void;
  
  initSpectator: (targetSessionId: string) => void;
  syncRemoteState: (windows: WindowState[], cursor?: { x: number; y: number }) => void;

