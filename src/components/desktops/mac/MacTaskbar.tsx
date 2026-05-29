'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { useOSStore } from '@/store/useOSStore';
import { SYSTEM_APPS } from '@/lib/mockData';
import { APP_ICONS } from '@/lib/icons';

export default function MacTaskbar() {
  const { windows, openWindow, activeWindowId } = useOSStore();

  return (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-[100] flex items-end">
      <div className="flex items-end gap-2 bg-white/10 backdrop-blur-2xl border border-white/20 shadow-2xl rounded-3xl px-4 py-2">
        {SYSTEM_APPS.map(app => {
          const Icon = APP_ICONS[app.id];
          const isOpen = windows.some(w => w.appId === app.id);
          const isActive = activeWindowId === `win-${app.id}`; // approx check or exact window check

          return (
            <div key={app.id} className="flex flex-col items-center gap-1.5 group cursor-pointer relative" onClick={() => openWindow(app)}>
              
              {/* Tooltip */}
              <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 backdrop-blur-md text-white text-xs px-3 py-1 rounded-md pointer-events-none border border-white/10 shadow-lg whitespace-nowrap">
                {app.title}
              </div>

              <motion.div
                whileHover={{ scale: 1.4, y: -10 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                className="w-12 h-12 rounded-2xl bg-white/20 shadow-lg flex items-center justify-center backdrop-blur-md border border-white/20 origin-bottom"
              >
                {Icon && <Icon className="w-7 h-7 text-white drop-shadow-md" />}
              </motion.div>
              
              {/* Open Indicator Dot */}
              <div className={`w-1 h-1 rounded-full transition-all ${isOpen ? 'bg-white/80' : 'bg-transparent'}`} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
