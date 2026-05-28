import { create } from 'zustand';
import type { OSState, AppDefinition, UserName, BootPhase, WindowState } from '@/types';

let windowCounter = 0;
let bc: BroadcastChannel | null = null;

if (typeof window !== 'undefined') {
  bc = new BroadcastChannel('os-mirror');
}

const broadcastState = (windows: WindowState[]) => {
  if (bc) {
    bc.postMessage({ type: 'SYNC_WINDOWS', windows });
  }
};

let lastCursorTime = 0;
export const broadcastCursor = (x: number, y: number) => {
  if (!bc) return;
  const now = Date.now();
  if (now - lastCursorTime > 50) { // throttle 50ms
    bc.postMessage({ type: 'SYNC_CURSOR', cursor: { x, y } });
    lastCursorTime = now;
  }
};

export const useOSStore = create<OSState>((set, get) => {
  // Listen for sync messages
  if (bc) {
    bc.onmessage = (event) => {
      if (!get().isSpectating) return;
      if (event.data.type === 'SYNC_WINDOWS') {
        set({ windows: event.data.windows });
      } else if (event.data.type === 'SYNC_CURSOR') {
        set({ ghostCursor: event.data.cursor });
      }
    };
  }

  return {
    // ── Auth & Global ──────────────────────────────────────────────
    currentUser: null,
    bootPhase: 'booting' as BootPhase,
    isSpectating: false,

    // ── Window Manager ────────────────────────────────────
    windows: [],
    activeWindowId: null,
    nextZIndex: 100, // kept for signature compatibility, though z-index is array-driven now

    // ── UI ────────────────────────────────────────────────
    isStartMenuOpen: false,
    isMobile: false,

    // ── Admin ─────────────────────────────────────────────
    isAdminAuthenticated: false,

    // ── Actions ───────────────────────────────────────────

    setBootPhase: (phase: BootPhase) => set({ bootPhase: phase }),

    setMobile: (val: boolean) => set({ isMobile: val }),

    setSpectating: (val: boolean) => set({ isSpectating: val }),

    syncWindows: (windows: WindowState[]) => set({ windows }),

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

      const existing = state.windows.find(
        (w) => w.appId === app.id && w.isOpen
      );
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
        zIndex: 0, // Not strictly used if rendering order matters, but maintained
        x: isMob ? 0 : 60 + offset,
        y: isMob ? 0 : 30 + offset,
        width: isMob ? window.innerWidth : app.defaultWidth,
        height: isMob ? window.innerHeight - 56 : app.defaultHeight,
        data: app.data,
      };

      const newWindows = [...state.windows, newWindow];
      set({
        windows: newWindows,
        activeWindowId: id,
        isStartMenuOpen: false,
      });
      broadcastState(newWindows);
    },

    closeWindow: (id: string) => {
      if (get().isSpectating) return;
      
      const newWindows = get().windows.filter((w) => w.id !== id);
      const newActive = get().activeWindowId === id ? newWindows.at(-1)?.id ?? null : get().activeWindowId;
      
      set({ windows: newWindows, activeWindowId: newActive });
      broadcastState(newWindows);
    },

    minimizeWindow: (id: string) => {
      if (get().isSpectating) return;

      const newWindows = get().windows.map((w) => w.id === id ? { ...w, isMinimized: true } : w);
      const newActive = get().activeWindowId === id ? newWindows.filter(w => w.id !== id && !w.isMinimized).at(-1)?.id ?? null : get().activeWindowId;
      
      set({ windows: newWindows, activeWindowId: newActive });
      broadcastState(newWindows);
    },

    maximizeWindow: (id: string) => {
      if (get().isSpectating) return;

      const newWindows = get().windows.map((w) => w.id === id ? { ...w, isMaximized: !w.isMaximized } : w);
      set({ windows: newWindows });
      broadcastState(newWindows);
    },

    restoreWindow: (id: string) => {
      if (get().isSpectating) return;

      const state = get();
      const target = state.windows.find(w => w.id === id);
      if (!target) return;

      const others = state.windows.filter(w => w.id !== id);
      const newWindows = [...others, { ...target, isMinimized: false }];

      set({ windows: newWindows, activeWindowId: id });
      broadcastState(newWindows);
    },

    focusWindow: (id: string) => {
      if (get().isSpectating) return;

      const state = get();
      if (state.activeWindowId === id) return; // already focused

      const target = state.windows.find((w) => w.id === id);
      if (!target) return;

      const others = state.windows.filter((w) => w.id !== id);
      const newWindows = [...others, target];

      set({ windows: newWindows, activeWindowId: id, isStartMenuOpen: false });
      broadcastState(newWindows);
    },

    updateWindowPosition: (id: string, x: number, y: number) => {
      if (get().isSpectating) return;

      const newWindows = get().windows.map((w) => w.id === id ? { ...w, x, y } : w);
      set({ windows: newWindows });
      broadcastState(newWindows);
    },

    updateWindowSize: (id: string, width: number, height: number) => {
      if (get().isSpectating) return;

      const newWindows = get().windows.map((w) => w.id === id ? { ...w, width, height } : w);
      set({ windows: newWindows });
      broadcastState(newWindows);
    },

    toggleStartMenu: () =>
      set((state) => ({ isStartMenuOpen: !state.isStartMenuOpen })),

    setAdminAuthenticated: (val: boolean) =>
      set({ isAdminAuthenticated: val }),
  };
});
