import { StateCreator } from 'zustand';
import type { OSState, UserName, BootPhase, WindowState } from '@/types';

// Client-side local session ID initialization with localStorage persistence
let localSessionId = 'ssr-placeholder';
if (typeof window !== 'undefined') {
  localSessionId = localStorage.getItem('webos_posthog_session_id') || '';
  if (!localSessionId) {
    localSessionId = Math.random().toString(36).substring(2, 15) + '-' + Date.now();
    localStorage.setItem('webos_posthog_session_id', localSessionId);
  }
}

export const createSystemSlice: StateCreator<
  OSState,
  [],
  [],
  Pick<
    OSState,
    | 'currentUser'
    | 'bootPhase'
    | 'isSpectating'
    | 'sessionId'
    | 'activeSpectatorSession'
    | 'ghostCursor'
    | 'isStartMenuOpen'
    | 'isMobile'
    | 'isAdminAuthenticated'
    | 'isBsod'
    | 'setBsod'
    | 'setBootPhase'
    | 'setMobile'
    | 'initSpectator'
    | 'syncRemoteState'
    | 'loginUser'
    | 'logoutUser'
    | 'switchUser'
    | 'toggleStartMenu'
    | 'setAdminAuthenticated'
    | 'chatMessages'
    | 'addChatMessage'
    | 'clearChat'
  >
> = (set, get) => ({
  currentUser: null,
  bootPhase: 'booting' as BootPhase,
  isSpectating: false,
  sessionId: localSessionId,
  activeSpectatorSession: null,
  ghostCursor: null,
  isStartMenuOpen: false,
  isMobile: false,
  isAdminAuthenticated: false,
  isBsod: false,
  chatMessages: [],

  setBootPhase: (phase: BootPhase) => set({ bootPhase: phase }),
  setMobile: (val: boolean) => set({ isMobile: val }),
  setBsod: (val: boolean) => set({ isBsod: val }),

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

  logoutUser: () => {
    set({ currentUser: null });
    setTimeout(() => {
      set({
        bootPhase: 'login',
        windows: [],
        activeWindowId: null,
        isStartMenuOpen: false,
        isAdminAuthenticated: false,
        isSpectating: false,
        activeSpectatorSession: null,
      });
    }, 600);
  },

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

  toggleStartMenu: () => set((state) => ({ isStartMenuOpen: !state.isStartMenuOpen })),
  setAdminAuthenticated: (val: boolean) => set({ isAdminAuthenticated: val }),

  addChatMessage: (msg) => set((state) => ({ chatMessages: [...state.chatMessages, msg] })),
  clearChat: () => set({ chatMessages: [] }),
});
