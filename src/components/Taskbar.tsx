'use client';

import React from 'react';
import { useOSStore } from '@/store/useOSStore';
import { motion } from 'framer-motion';
import { APPS } from '@/config/apps';
import { Power, Terminal } from 'lucide-react';

export default function Taskbar() {
  const { currentUser, windows, focusWindow, logoutUser } = useOSStore();
  const openWindows = windows.filter(w => w.isOpen);

  if (currentUser === 'Mohammed') {
    return (
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-3 px-4 py-2 rounded-os bg-os-bg backdrop-blur-[var(--os-blur)] border-os-border shadow-os z-[9000]">
        {openWindows.map(w => {
          const app = APPS.find(a => a.id === w.appId);
          return (
            <motion.button
              key={w.id}
              whileHover={{ scale: 1.2, y: -4 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => focusWindow(w.id)}
              className="w-10 h-10 rounded-lg flex items-center justify-center bg-white/10 border border-white/5 shadow-sm overflow-hidden"
              title={app?.name}
            >
              {app?.icon && <app.icon className="w-6 h-6 text-white drop-shadow-md" />}
            </motion.button>
          );
        })}
        <div className="w-px h-8 bg-white/20 mx-1" />
        <motion.button
          whileHover={{ scale: 1.2, y: -4 }}
          onClick={logoutUser}
          className="w-10 h-10 rounded-lg flex items-center justify-center bg-red-500/80 text-white"
        >
          <Power className="w-5 h-5" />
        </motion.button>
      </div>
    );
  }

  if (currentUser === 'Moamen') {
    return (
      <div className="absolute bottom-0 left-0 right-0 h-14 flex items-center justify-center gap-2 px-4 bg-os-bg backdrop-blur-[var(--os-blur)] border-t border-os-border shadow-os z-[9000]">
        {openWindows.map(w => {
          const app = APPS.find(a => a.id === w.appId);
          const isActive = useOSStore.getState().activeWindowId === w.id;
          return (
            <button
              key={w.id}
              onClick={() => focusWindow(w.id)}
              className="relative w-12 h-12 rounded-md flex items-center justify-center hover:bg-white/10 transition-colors"
              title={app?.name}
            >
              {app?.icon && <app.icon className="w-6 h-6 text-white drop-shadow-sm" />}
              {/* Glowing active indicator */}
              {isActive && (
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-1 bg-os-accent rounded-t-full shadow-[0_0_8px_var(--os-accent)]" />
              )}
            </button>
          );
        })}
        <button
          onClick={logoutUser}
          className="ml-auto w-10 h-10 rounded-md flex items-center justify-center hover:bg-red-500/20 text-red-400 transition-colors"
        >
          <Power className="w-5 h-5" />
        </button>
      </div>
    );
  }

  // Team (Hacker)
  return (
    <div className="absolute top-0 left-0 right-0 h-8 flex items-center justify-between px-4 bg-black border-b border-os-border shadow-os font-mono text-os-accent text-xs z-[9000]">
      <div className="flex items-center gap-4">
        <span className="font-bold flex items-center gap-2"><Terminal className="w-3 h-3"/> ROOT_ACCESS</span>
        <div className="flex gap-2">
          {openWindows.map(w => {
            const app = APPS.find(a => a.id === w.appId);
            const isActive = useOSStore.getState().activeWindowId === w.id;
            return (
              <button
                key={w.id}
                onClick={() => focusWindow(w.id)}
                className={`px-2 py-0.5 border ${isActive ? 'bg-os-accent text-black border-os-accent' : 'border-os-accent/30 hover:border-os-accent text-os-accent'}`}
              >
                [{app?.name || w.appId}]
              </button>
            );
          })}
        </div>
      </div>
      <div className="flex items-center gap-4">
        <span>SYS.STATUS: ONLINE</span>
        <button onClick={logoutUser} className="hover:text-red-500 hover:bg-red-500/10 px-2 py-0.5 border border-transparent hover:border-red-500 transition-colors">
          [TERM_SESSION]
        </button>
      </div>
    </div>
  );
}
