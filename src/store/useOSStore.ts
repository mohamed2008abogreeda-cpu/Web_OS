import { create } from 'zustand';
import type { OSState } from '@/types';
import { createWindowSlice } from './createWindowSlice';
import { createSystemSlice } from './createSystemSlice';

export const useOSStore = create<OSState>((set, get, store) => ({
  ...createWindowSlice(set, get, store),
  ...createSystemSlice(set, get, store),
}));

// ── State-Driven PostHog Telemetry Subscriber ──────────────────────
if (typeof window !== 'undefined') {
  let prevWindows: any[] = [];
  let prevBsod = false;
  let prevUser: string | null = null;
  let prevSpectating = false;

  useOSStore.subscribe((state) => {
    // 1. Capture App Opened events when windows are added
    const currentWindows = state.windows;
    if (currentWindows && prevWindows && currentWindows.length > prevWindows.length) {
      const added = currentWindows.filter(
        (cw) => !prevWindows.some((pw) => pw.id === cw.id)
      );
      added.forEach((win) => {
        try {
          const posthog = require('posthog-js').default;
          if (posthog && typeof posthog.capture === 'function') {
            posthog.capture('App Opened', { 
              appId: win.appId, 
              title: win.title,
              sessionId: state.sessionId
            });
          }
        } catch (err) {
          console.warn('[PostHog Store Subscriber] Capture App Opened failed:', err);
        }
      });
    }
    prevWindows = currentWindows || [];

    // 2. Capture critical BSOD states (crash events)
    if (state.isBsod && !prevBsod) {
      try {
        const posthog = require('posthog-js').default;
        if (posthog && typeof posthog.capture === 'function') {
          posthog.capture('BSOD Triggered', { 
            sessionId: state.sessionId 
          });
        }
      } catch (err) {}
    }
    prevBsod = state.isBsod || false;

    // 3. Capture switching OS user profile states
    if (state.currentUser !== prevUser) {
      if (state.currentUser) {
        try {
          const posthog = require('posthog-js').default;
          if (posthog && typeof posthog.capture === 'function') {
            posthog.capture('Profile Switched', { 
              profile: state.currentUser,
              sessionId: state.sessionId
            });
          }
        } catch (err) {}
      }
      prevUser = state.currentUser;
    }

    // 4. Capture spectator God-Mode activations
    if (state.isSpectating && !prevSpectating) {
      try {
        const posthog = require('posthog-js').default;
        if (posthog && typeof posthog.capture === 'function') {
          posthog.capture('Spectator Mode Initiated', {
            targetSession: state.activeSpectatorSession,
            sessionId: state.sessionId
          });
        }
      } catch (err) {}
    }
    prevSpectating = state.isSpectating || false;
  });
}
