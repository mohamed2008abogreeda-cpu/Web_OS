'use client';

import { useEffect, useRef } from 'react';
import { useOSStore } from '@/store/useOSStore';
import Pusher from 'pusher-js';

/**
 * Visitor Spectator Sync Hook (Broadcaster & bi-directional Command Listener)
 * 
 * Captures visitor coordinates and active window state, applying highly optimized
 * 1000ms strict throttling and 20px Euclidean delta-distance checks to prevent API flooding.
 * 
 * Normalized coordinates logic:
 *   - visitor.x / visitor.viewportWidth represents relative percentage width.
 *   - visitor.y / visitor.viewportHeight represents relative percentage height.
 * 
 * Subscribes to unique bi-directional visitor channels (e.g. visitor-channel-${sessionId})
 * to receive and process remote admin interventions in real-time.
 */
export function useSpectatorSync() {
  const lastUpdate = useRef<number>(0);
  const previousX = useRef<number>(0);
  const previousY = useRef<number>(0);
  const previousWindowHash = useRef<string>('');

  useEffect(() => {
    const isSpectating = useOSStore.getState().isSpectating;
    const sessionId = useOSStore.getState().sessionId;
    
    // Admins do not broadcast, they only spectate
    if (isSpectating) return;

    // 1. Establish Bi-directional Pusher listener for Admin interventions
    const key = process.env.NEXT_PUBLIC_PUSHER_KEY || 'app-key';
    const cluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER || 'us2';
    
    const pusher = new Pusher(key, {
      cluster,
      forceTLS: true,
    });

    const channelName = `visitor-channel-${sessionId}`;
    const channel = pusher.subscribe(channelName);

    // Dynamic admin-to-visitor command dispatcher
    channel.bind('admin-command', (data: { type: string; payload?: any }) => {
      if (!data || !data.type) return;

      const store = useOSStore.getState();

      if (data.type === "FORCE_BSOD") {
        if (store.setBsod) store.setBsod(true);
      } else if (data.type === "OPEN_MODAL") {
        const appId = data.payload?.appId;
        if (appId) {
          const { SYSTEM_APPS } = require('@/lib/mockData');
          const { LINUX_APPS } = require('@/components/desktops/linux/LinuxDesktop');
          
          const app = 
            SYSTEM_APPS.find((a: any) => a.id === appId) || 
            LINUX_APPS.find((a: any) => a.id === appId);

          if (app) {
            store.openWindow(app);
          }
        }
      } else if (data.type === "SWITCH_USER") {
        store.switchUser();
      }
    });

    // 2. Track Mouse Movement and Broadcast coordinates
    const handleMouseMove = (e: MouseEvent) => {
      const now = Date.now();
      
      // Strict 1000ms Throttling gate
      if (now - lastUpdate.current < 1000) return;

      const activeWindows = useOSStore.getState().windows;
      const windowsHash = JSON.stringify(activeWindows.map(w => ({ id: w.id, isOpen: w.isOpen })));

      // Calculate Euclidean distance: hypotenuse = Math.hypot(dx, dy)
      const dx = e.clientX - previousX.current;
      const dy = e.clientY - previousY.current;
      const distance = Math.hypot(dx, dy);
      const stateChanged = windowsHash !== previousWindowHash.current;

      // Delta Threshold check (only transmit if cursor translated > 20px OR window state changed)
      if (distance < 20 && !stateChanged) return;

      lastUpdate.current = now;
      previousX.current = e.clientX;
      previousY.current = e.clientY;
      previousWindowHash.current = windowsHash;

      // Mathematical Normalization Payload
      const payload = JSON.stringify({
        sessionId,
        x: e.clientX,
        y: e.clientY,
        viewportWidth: window.innerWidth,
        viewportHeight: window.innerHeight,
        activeWindows,
      });

      // Secure async edge-compliant fetch transaction (fire-and-forget)
      fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: payload
      }).catch(err => {
        console.warn('[SpectatorSync Broadcaster] Fetch sync dispatch failed:', err);
      });
    };

    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      channel.unbind_all();
      channel.unsubscribe();
      pusher.disconnect();
    };
  }, []);
}
