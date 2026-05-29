'use client';

import { useEffect, useRef } from 'react';
import { useOSStore } from '@/store/useOSStore';

/**
 * Visitor Spectator Sync Hook (Broadcaster Role)
 * Silently captures the visitor's mouse coordinates and active window state,
 * throttling updates to max once every 100ms to broadcast state securely
 * to spectating admin dashboards without network flooding.
 */
export function useSpectatorSync() {
  const lastUpdate = useRef<number>(0);

  useEffect(() => {
    // Only broadcast if the current agent is NOT a spectating admin
    const isSpectating = useOSStore.getState().isSpectating;
    if (isSpectating) return;

    const handleMouseMove = (e: MouseEvent) => {
      const now = Date.now();
      
      // Implement throttling mechanism: max once every 100ms
      if (now - lastUpdate.current < 100) return;
      lastUpdate.current = now;

      // Extract currently open windows array from centralized state store
      const activeWindows = useOSStore.getState().windows;

      // Send silent payload to Edge-compatible sync endpoint
      fetch('/api/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          x: e.clientX,
          y: e.clientY,
          activeWindows,
        }),
      }).catch((err) => {
        // Silently capture any network/broadcast failures
        console.error('Broadcaster synchronization pipeline error:', err);
      });
    };

    // Initialize global mouse tracking listener
    window.addEventListener('mousemove', handleMouseMove);

    // Flawless cleanup on component unmount to prevent resource leaks
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);
}
