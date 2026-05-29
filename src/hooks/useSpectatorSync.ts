'use client';
import { useEffect, useRef } from 'react';
import Pusher from 'pusher-js';
import { useOSStore } from '@/store/useOSStore';

export function useSpectatorSync() {
  const isSpectating = useOSStore((s) => s.isSpectating);
  const sessionId = useOSStore((s) => s.sessionId);
  const activeSpectatorSession = useOSStore((s) => s.activeSpectatorSession);
  const syncRemoteState = useOSStore((s) => s.syncRemoteState);
  
  const lastUpdate = useRef<number>(0);

  useEffect(() => {
    // ─── ADMIN MODE (RECEIVER) ──────────────────────────────────
    if (isSpectating && activeSpectatorSession) {
      const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY || 'app-key', {
        cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || 'us2',
      });

      const channel = pusher.subscribe(`sync-${activeSpectatorSession}`);
      
      channel.bind('state-update', (data: { windows: any[], cursor?: { x: number, y: number } }) => {
        syncRemoteState(data.windows, data.cursor);
      });

      return () => {
        channel.unbind_all();
        channel.unsubscribe();
        pusher.disconnect();
      };
    }

    // ─── GUEST MODE (SENDER) ────────────────────────────────────
    if (!isSpectating) {
      const handleMouseMove = (e: MouseEvent) => {
        const now = Date.now();
        if (now - lastUpdate.current < 100) return; // Throttle to 100ms (10fps sync)
        lastUpdate.current = now;

        const windows = useOSStore.getState().windows;
        
        fetch('/api/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId,
            windows,
            cursor: { x: e.clientX, y: e.clientY }
          }),
        }).catch(() => {});
      };

      // Also trigger sync when windows array changes (drag/resize)
      const unsub = useOSStore.subscribe((state, prevState) => {
        if (state.windows !== prevState.windows) {
          fetch('/api/sync', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              sessionId,
              windows: state.windows
            }),
          }).catch(() => {});
        }
      });

      window.addEventListener('mousemove', handleMouseMove);

      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        unsub();
      };
    }
  }, [isSpectating, activeSpectatorSession, sessionId, syncRemoteState]);
}
