'use client';

import { useEffect, useRef } from 'react';
import { useOSStore } from '@/store/useOSStore';

/**
 * Visitor Spectator Sync Hook (Broadcaster Role)
 * 
 * Silently captures the visitor's mouse coordinates and active window state,
 * throttling updates to max once every 100ms to broadcast state securely
 * to spectating admin dashboards without network flooding.
 * 
 * FIX 1: Coordinates are normalized to 0.0–1.0 ratios (percentage of viewport)
 *        so they render correctly on any screen size.
 * FIX 11: Uses navigator.sendBeacon() for fire-and-forget delivery.
 *         sendBeacon doesn't block the UI thread and survives page unload.
 */
export function useSpectatorSync() {
  const lastUpdate = useRef<number>(0);

  useEffect(() => {
    // Only broadcast if the current agent is NOT a spectating admin
    const isSpectating = useOSStore.getState().isSpectating;
    if (isSpectating) return;

    const handleMouseMove = (e: MouseEvent) => {
      const now = Date.now();
      
      // Throttle: max once every 100ms
      if (now - lastUpdate.current < 100) return;
      lastUpdate.current = now;

      // Extract currently open windows array from centralized state store
      const activeWindows = useOSStore.getState().windows;

      // Normalize coordinates to 0.0–1.0 ratios for cross-screen compatibility
      const payload = JSON.stringify({
        x: e.clientX / window.innerWidth,
        y: e.clientY / window.innerHeight,
        screenWidth: window.innerWidth,
        screenHeight: window.innerHeight,
        activeWindows,
      });

      // sendBeacon: fire-and-forget POST — no connection kept alive,
      // no UI thread blocking, survives page unload
      navigator.sendBeacon(
        '/api/sync',
        new Blob([payload], { type: 'application/json' })
      );
    };

    // Initialize global mouse tracking listener
    window.addEventListener('mousemove', handleMouseMove);

    // Clean up on component unmount to prevent resource leaks
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);
}
