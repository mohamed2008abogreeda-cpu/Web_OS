// ============================================================
// Web OS Portfolio — Zustand Store (with Team mode)
// ============================================================
import { create } from 'zustand';
import type { OSState, AppDefinition, UserName, BootPhase } from '@/types';

let windowCounter = 0;

export const useOSStore = create<OSState>((set, get) => ({
  // ── Auth ──────────────────────────────────────────────
  currentUser: null,
  bootPhase: 'booting' as BootPhase,

  // ── Window Manager ────────────────────────────────────
  windows: [],
  activeWindowId: null,
  nextZIndex: 100,

  // ── UI ────────────────────────────────────────────────
  isStartMenuOpen: false,
  isMobile: false,

  // ── Admin ─────────────────────────────────────────────
  isAdminAuthenticated: false,

  // ── Actions ───────────────────────────────────────────

  setBootPhase: (phase: BootPhase) => set({ bootPhase: phase }),

  setMobile: (val: boolean) => set({ isMobile: val }),

  loginUser: (name: UserName) =>
    set({
      currentUser: name,
      bootPhase: 'desktop',
      windows: [],
      activeWindowId: null,
      nextZIndex: 100,
      isStartMenuOpen: false,
    }),

  logoutUser: () =>
    set({
      currentUser: null,
      bootPhase: 'login',
      windows: [],
      activeWindowId: null,
      nextZIndex: 100,
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
      nextZIndex: 100,
      isStartMenuOpen: false,
      isAdminAuthenticated: false,
    });
  },

  openWindow: (app: AppDefinition) => {
    const state = get();
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
    const nz = state.nextZIndex + 1;
    const offset = (state.windows.length % 6) * 25;

    // Mobile: open maximized
    const isMob = state.isMobile;

    set({
      windows: [
        ...state.windows,
        {
          id,
          appId: app.id,
          title: app.title,
          component: app.component,
          isOpen: true,
          isMinimized: false,
          isMaximized: isMob,
          zIndex: nz,
          x: isMob ? 0 : 60 + offset,
          y: isMob ? 0 : 30 + offset,
          width: isMob ? window.innerWidth : app.defaultWidth,
          height: isMob ? window.innerHeight - 56 : app.defaultHeight,
          data: app.data,
        },
      ],
      activeWindowId: id,
      nextZIndex: nz,
      isStartMenuOpen: false,
    });
  },

  closeWindow: (id: string) =>
    set((state) => ({
      windows: state.windows.filter((w) => w.id !== id),
      activeWindowId:
        state.activeWindowId === id
          ? state.windows.filter((w) => w.id !== id).at(-1)?.id ?? null
          : state.activeWindowId,
    })),

  minimizeWindow: (id: string) =>
    set((state) => ({
      windows: state.windows.map((w) =>
        w.id === id ? { ...w, isMinimized: true } : w
      ),
      activeWindowId:
        state.activeWindowId === id
          ? state.windows
              .filter((w) => w.id !== id && !w.isMinimized)
              .at(-1)?.id ?? null
          : state.activeWindowId,
    })),

  maximizeWindow: (id: string) =>
    set((state) => ({
      windows: state.windows.map((w) =>
        w.id === id ? { ...w, isMaximized: !w.isMaximized } : w
      ),
    })),

  restoreWindow: (id: string) => {
    const nz = get().nextZIndex + 1;
    set((state) => ({
      windows: state.windows.map((w) =>
        w.id === id ? { ...w, isMinimized: false, zIndex: nz } : w
      ),
      activeWindowId: id,
      nextZIndex: nz,
    }));
  },

  focusWindow: (id: string) => {
    const nz = get().nextZIndex + 1;
    set((state) => ({
      windows: state.windows.map((w) =>
        w.id === id ? { ...w, zIndex: nz } : w
      ),
      activeWindowId: id,
      nextZIndex: nz,
      isStartMenuOpen: false,
    }));
  },

  updateWindowPosition: (id: string, x: number, y: number) =>
    set((state) => ({
      windows: state.windows.map((w) =>
        w.id === id ? { ...w, x, y } : w
      ),
    })),

  updateWindowSize: (id: string, width: number, height: number) =>
    set((state) => ({
      windows: state.windows.map((w) =>
        w.id === id ? { ...w, width, height } : w
      ),
    })),

  toggleStartMenu: () =>
    set((state) => ({ isStartMenuOpen: !state.isStartMenuOpen })),

  setAdminAuthenticated: (val: boolean) =>
    set({ isAdminAuthenticated: val }),
}));
