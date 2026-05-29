'use client';
import { motion } from 'framer-motion';
import { useOSStore } from '@/store/useOSStore';
import { SYSTEM_APPS } from '@/lib/mockData';
import { APP_ICONS } from '@/lib/icons';

export default function MacTaskbar() {
  const { windows, activeWindowId, openWindow, minimizeWindow, focusWindow } = useOSStore();

  const handleAppClick = (app: typeof SYSTEM_APPS[0]) => {
    const existing = windows.find(w => w.appId === app.id);
    if (existing) {
      if (existing.isMinimized) {
        useOSStore.getState().restoreWindow(existing.id);
      } else if (activeWindowId === existing.id) {
        minimizeWindow(existing.id);
      } else {
        focusWindow(existing.id);
      }
    } else {
      openWindow(app);
    }
  };

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[100] select-none">
      <div className="flex items-center gap-2 px-3 py-2 bg-black/30 backdrop-blur-3xl border border-white/10 rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.8)]">
        {SYSTEM_APPS.map(app => {
          const Icon = APP_ICONS[app.id];
          const isOpen = windows.some(w => w.appId === app.id);
          const isActive = activeWindowId && windows.find(w => w.id === activeWindowId)?.appId === app.id;

          return (
            <div key={app.id} className="relative flex flex-col items-center">
              <motion.button
                whileHover={{ scale: 1.2, y: -10 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => handleAppClick(app)}
                className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all bg-gradient-to-b from-white/10 to-white/5 shadow-inner border border-white/10 hover:border-white/20 hover:shadow-xl ${isActive ? 'bg-white/20 border-white/30' : ''}`}
                title={app.title}
              >
                {Icon && <Icon className="w-7 h-7 text-white drop-shadow-md" />}
              </motion.button>
              
              {/* Dot indicator for open apps */}
              {isOpen && (
                <div className="absolute -bottom-1 w-1 h-1 rounded-full bg-white/80 shadow-[0_0_4px_rgba(255,255,255,0.8)]" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
