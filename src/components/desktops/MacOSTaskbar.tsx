'use client';
import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useOSStore } from '@/store/useOSStore';
import { SYSTEM_APPS, USERS } from '@/lib/mockData';
import { APP_ICONS } from '@/lib/icons';
import { toast } from 'sonner';

export default function MacOSTaskbar() {
  const { windows, activeWindowId, openWindow, focusWindow, restoreWindow, minimizeWindow, currentUser } = useOSStore();
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const activeAccent = currentUser ? USERS[currentUser]?.accentColor || '#3b82f6' : '#3b82f6';

  return (
    <div className="fixed bottom-3 left-1/2 -translate-x-1/2 z-[7999]">
      <div 
        className="flex items-end gap-2 px-3 py-2 rounded-3xl bg-white/40 backdrop-blur-3xl border border-white/50 shadow-2xl"
        onMouseLeave={() => setHoveredIndex(null)}
      >
        {SYSTEM_APPS.map((app, index) => {
          const AppIcon = APP_ICONS[app.id];
          const openWins = windows.filter((w) => w.appId === app.id && w.isOpen);
          const isOpen = openWins.length > 0;
          const isActive = openWins.some((w) => activeWindowId === w.id && !w.isMinimized);

          // Calculate scaling based on distance to hovered icon
          let scale = 1;
          let y = 0;
          if (hoveredIndex !== null) {
            const distance = Math.abs(hoveredIndex - index);
            if (distance === 0) {
              scale = 1.4;
              y = -10;
            } else if (distance === 1) {
              scale = 1.2;
              y = -5;
            } else if (distance === 2) {
              scale = 1.05;
              y = -2;
            }
          }

          return (
            <motion.button
              key={app.id}
              initial={false}
              animate={{ scale, y }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              onMouseEnter={() => setHoveredIndex(index)}
              onClick={() => {
                if (!isOpen) {
                  openWindow(app);
                } else {
                  const firstWin = openWins[0];
                  if (firstWin.isMinimized) {
                    restoreWindow(firstWin.id);
                  } else if (activeWindowId === firstWin.id) {
                    minimizeWindow(firstWin.id);
                  } else {
                    focusWindow(firstWin.id);
                  }
                }
              }}
              className="relative flex flex-col items-center justify-end w-12 h-12 outline-none group cursor-pointer"
              title={app.title}
            >
              <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-[0_4px_12px_rgba(0,0,0,0.1)] border border-slate-200 overflow-hidden relative">
                {AppIcon && <AppIcon className="w-7 h-7 text-slate-700 relative z-10" strokeWidth={1.5} />}
                {/* Glossy overlay */}
                <div className="absolute inset-0 bg-gradient-to-b from-white/60 to-transparent h-1/2 pointer-events-none" />
              </div>

              {/* Active Indicator Dot */}
              {isOpen && (
                <div 
                  className="absolute -bottom-2 w-1 h-1 rounded-full bg-slate-800" 
                  style={{ backgroundColor: isActive ? activeAccent : '#64748b' }}
                />
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
