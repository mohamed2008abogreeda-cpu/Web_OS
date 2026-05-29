import { create } from 'zustand';
import type { OSState, AppDefinition, UserName, BootPhase, WindowState } from '@/types';

let windowCounter = 0;
const localSessionId = Math.random().toString(36).substring(2, 15);

export const useOSStore = create<OSState>((set, get) => ({
  currentUser: null,
  bootPhase: 'booting' as BootPhase,
  isSpectating: false,
  sessionId: localSessionId,
  activeSpectatorSession: null,
  ghostCursor: null,
  windows: [],
  activeWindowId: null,
  isStartMenuOpen: false,
  isMobile: false,
  isAdminAuthenticated: false,

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

  loginUser: (user) => set({ 
    currentUser: user,
    bootPhase: 'desktop',
    windows: [],
    activeWindowId: null 
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
      bootPhase: 'desktop',
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
    
    // SSR Safety Check
    const screenW = typeof window !== 'undefined' ? window.innerWidth : 1024;
    const screenH = typeof window !== 'undefined' ? window.innerHeight : 768;

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
      width: isMob ? screenW : app.defaultWidth,
      height: isMob ? screenH - 56 : app.defaultHeight,
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
    const newActive = get().activeWindowId === id
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
    set({ windows: [...others, { ...target, isMinimized: false }], activeWindowId: id });
  },

  focusWindow: (id: string) => {
    if (get().isSpectating) return;
    const state = get();
    if (state.activeWindowId === id) return;
    const target = state.windows.find((w) => w.id === id);
    if (!target) return;
    const others = state.windows.filter((w) => w.id !== id);
    set({ windows: [...others, target], activeWindowId: id, isStartMenuOpen: false });
  },

  updateWindowPosition: (id: string, x: number, y: number) => {
    if (get().isSpectating) return;
    set({ windows: get().windows.map((w) => (w.id === id ? { ...w, x, y } : w)) });
  },

  updateWindowSize: (id: string, width: number, height: number) => {
    if (get().isSpectating) return;
    set({ windows: get().windows.map((w) => (w.id === id ? { ...w, width, height } : w)) });
  },

  toggleStartMenu: () => set((state) => ({ isStartMenuOpen: !state.isStartMenuOpen })),
  setAdminAuthenticated: (val: boolean) => set({ isAdminAuthenticated: val }),
}));
