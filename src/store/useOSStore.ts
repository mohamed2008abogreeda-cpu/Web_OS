import { create } from 'zustand';
import type { OSState, AppDefinition, UserName, BootPhase, WindowState } from '@/types';

let windowCounter = 0;

// Generate a unique session ID for this instance
const localSessionId = Math.random().toString(36).substring(2, 15);

export const useOSStore = create<OSState>((set, get) => ({
  // ── Auth & Global ──────────────────────────────────────────────
  currentUser: null,
  bootPhase: 'booting' as BootPhase,
  isSpectating: false,
  sessionId: localSessionId,
  activeSpectatorSession: null,
  ghostCursor: null,

  // ── Window Manager ────────────────────────────────────
  windows: [],
  activeWindowId: null,

  // ── UI ────────────────────────────────────────────────
  isStartMenuOpen: false,
  isMobile: false,

  // ── Admin ─────────────────────────────────────────────
  isAdminAuthenticated: false,

  // ── Actions ───────────────────────────────────────────

  setBootPhase: (phase: BootPhase) => set({ bootPhase: phase }),

  setMobile: (val: boolean) => set({ isMobile: val }),

  initSpectator: (targetSessionId: string) => {
    set({
      isSpectating: true,
      activeSpectatorSession: targetSessionId,
      currentUser: 'Team',
      isAdminAuthenticated: true,
      bootPhase: 'desktop',
    });
  },

  syncRemoteState: (windows: WindowState[], cursor?: { x: number; y: number }) => {
    const state = get();
    if (!state.isSpectating) return;
    set({ windows, ...(cursor ? { ghostCursor: cursor } : {}) });
  },

  loginUser: (name: UserName) =>
    set({
      currentUser: name,
      bootPhase: 'desktop',
      windows: [],
      activeWindowId: null,
      isStartMenuOpen: false,
    }),

  logoutUser: () =>
    set({
      currentUser: null,
      bootPhase: 'login',
      windows: [],
      activeWindowId: null,
      isStartMenuOpen: false,
      isAdminAuthenticated: false,
      isSpectating: false,
      activeSpectatorSession: null,
    }),

  switchUser: () => {
    const current = get().currentUser;
    const order: UserName[] = ['Mohammed', 'Moamen', 'Team'];
    const idx = order.indexOf(current || 'Mohammed');
    const next = order[(idx + 1) % order.length];
    set({
      currentUser: next,
      windows: [],
      activeWindowId: null,
      isStartMenuOpen: false,
      isAdminAuthenticated: false,
    });
  },

  openWindow: (app: AppDefinition) => {
    const state = get();
    if (state.isSpectating) return;

    const existing = state.windows.find((w) => w.appId === app.id && w.isOpen);
    if (existing) {
      get().focusWindow(existing.id);
      if (existing.isMinimized) get().restoreWindow(existing.id);
      return;
    }

    windowCounter++;
    const id = `win-${app.id}-${windowCounter}`;
    const offset = (state.windows.length % 6) * 25;
    const isMob = state.isMobile;

    const newWindow: WindowState = {
      id,
      appId: app.id,
      title: app.title,
      component: app.component,
      isOpen: true,
      isMinimized: false,
      isMaximized: isMob,
      zIndex: 0,
      x: isMob ? 0 : 60 + offset,
      y: isMob ? 0 : 30 + offset,
      width: isMob ? window.innerWidth : app.defaultWidth,
      height: isMob ? window.innerHeight - 56 : app.defaultHeight,
      data: app.data,
    };

    set({
      windows: [...state.windows, newWindow],
      activeWindowId: id,
      isStartMenuOpen: false,
    });
  },

  closeWindow: (id: string) => {
    if (get().isSpectating) return;

    const newWindows = get().windows.filter((w) => w.id !== id);
    const newActive = get().activeWindowId === id ? newWindows.at(-1)?.id ?? null : get().activeWindowId;

    set({ windows: newWindows, activeWindowId: newActive });
  },

  minimizeWindow: (id: string) => {
    if (get().isSpectating) return;

    const newWindows = get().windows.map((w) => (w.id === id ? { ...w, isMinimized: true } : w));
    const newActive =
      get().activeWindowId === id
        ? newWindows.filter((w) => w.id !== id && !w.isMinimized).at(-1)?.id ?? null
        : get().activeWindowId;

    set({ windows: newWindows, activeWindowId: newActive });
  },

  maximizeWindow: (id: string) => {
    if (get().isSpectating) return;

    const newWindows = get().windows.map((w) => (w.id === id ? { ...w, isMaximized: !w.isMaximized } : w));
    set({ windows: newWindows });
  },

  restoreWindow: (id: string) => {
    if (get().isSpectating) return;

    const state = get();
    const target = state.windows.find((w) => w.id === id);
    if (!target) return;

    const others = state.windows.filter((w) => w.id !== id);
    const newWindows = [...others, { ...target, isMinimized: false }];

    set({ windows: newWindows, activeWindowId: id });
  },

  focusWindow: (id: string) => {
    if (get().isSpectating) return;

    const state = get();
    if (state.activeWindowId === id) return;

    const target = state.windows.find((w) => w.id === id);
    if (!target) return;

    const others = state.windows.filter((w) => w.id !== id);
    const newWindows = [...others, target];

    set({ windows: newWindows, activeWindowId: id, isStartMenuOpen: false });
  },

  updateWindowPosition: (id: string, x: number, y: number) => {
    if (get().isSpectating) return;

    const newWindows = get().windows.map((w) => (w.id === id ? { ...w, x, y } : w));
    set({ windows: newWindows });
  },

  updateWindowSize: (id: string, width: number, height: number) => {
    if (get().isSpectating) return;

    const newWindows = get().windows.map((w) => (w.id === id ? { ...w, width, height } : w));
    set({ windows: newWindows });
  },

  toggleStartMenu: () => set((state) => ({ isStartMenuOpen: !state.isStartMenuOpen })),

  setAdminAuthenticated: (val: boolean) => set({ isAdminAuthenticated: val }),
}));
