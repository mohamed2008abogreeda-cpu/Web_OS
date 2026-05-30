'use client';

import { useEffect, useRef } from 'react';
import { useOSStore } from '@/store/useOSStore';

/**
 * Visitor Spectator Sync Hook (Broadcaster & bi-directional Command Listener)
 * 
 * Captures visitor coordinates and active window state, applying highly optimized
 * 1000ms strict throttling and 20px Euclidean delta-distance checks to prevent network flooding.
 * 
 * Swapped out Pusher in favor of high-performance native Cloudflare WebSockets using Durable Objects.
 */
export function useSpectatorSync() {
  const lastUpdate = useRef<number>(0);
  const previousX = useRef<number>(0);
  const previousY = useRef<number>(0);
  const previousWindowHash = useRef<string>('');
  const socketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const isSpectating = useOSStore.getState().isSpectating;
    const sessionId = useOSStore.getState().sessionId;
    
    // Admins do not broadcast, they only spectate
    if (isSpectating) return;

    let reconnectDelay = 1000;
    let isCleanup = false;

    // Establish persistent, native WebSocket connection with exponential backoff reconnection
    const connect = () => {
      if (isCleanup) return;

      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const host = window.location.host;
      const wsUrl = `${protocol}//${host}/api/sync?role=visitor&sessionId=${sessionId}`;

      const ws = new WebSocket(wsUrl);
      socketRef.current = ws;

      ws.onopen = () => {
        console.log('[SpectatorSync WS] Connected as visitor:', sessionId);
        reconnectDelay = 1000; // Reset reconnection delay on successful connection
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          // Handle incoming admin remote interventions in real-time
          if (data.type === 'admin-command') {
            const command = data.payload;
            if (!command || !command.type) return;

            const store = useOSStore.getState();

            if (command.type === "FORCE_BSOD") {
              if (store.setBsod) store.setBsod(true);
            } else if (command.type === "OPEN_MODAL") {
              const appId = command.payload?.appId;
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
            } else if (command.type === "SWITCH_USER") {
              store.switchUser();
            }
          }
        } catch (err) {
          console.warn('[SpectatorSync WS] Message processing failed:', err);
        }
      };

      ws.onclose = () => {
        if (isCleanup) return;
        console.log(`[SpectatorSync WS] Disconnected. Reconnecting in ${reconnectDelay}ms...`);
        setTimeout(connect, reconnectDelay);
        reconnectDelay = Math.min(reconnectDelay * 2, 30000); // Backoff up to 30 seconds
      };

      ws.onerror = (err) => {
        console.error('[SpectatorSync WS] Socket error:', err);
        ws.close();
      };
    };

    connect();

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
      const payload = {
        x: e.clientX,
        y: e.clientY,
        viewportWidth: window.innerWidth,
        viewportHeight: window.innerHeight,
        activeWindows,
      };

      const socket = socketRef.current;
      if (socket && socket.readyState === WebSocket.OPEN) {
        // Fast path: send over active WebSocket connection with zero HTTP overhead
        socket.send(JSON.stringify({
          type: 'sync',
          payload
        }));
      } else {
        // Graceful fallback: post to edge route if WebSocket is establishing or offline
        fetch('/api/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId,
            ...payload
          })
        }).catch(err => {
          console.warn('[SpectatorSync WS Fallback] Fetch sync dispatch failed:', err);
        });
      }
    };

    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      isCleanup = true;
      window.removeEventListener('mousemove', handleMouseMove);
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, []);
}
