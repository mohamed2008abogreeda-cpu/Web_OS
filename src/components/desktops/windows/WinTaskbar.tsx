'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useOSStore } from '@/store/useOSStore';
import { SYSTEM_APPS } from '@/lib/mockData';
import { APP_ICONS } from '@/lib/icons';
import { Wifi, Volume2, Battery, ChevronUp } from 'lucide-react';

export default function WinTaskbar() {
  const { windows, activeWindowId, openWindow, minimizeWindow, focusWindow } = useOSStore();
  const [time, setTime] = useState<Date | null>(null);

  useEffect(() => {
    setTime(new Date());
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

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
    <div className="fixed bottom-0 left-0 w-full h-12 bg-zinc-900/85 backdrop-blur-xl border-t border-white/10 z-[100] flex justify-between select-none">
      
      {/* Left Area (Weather / Widgets placeholder) */}
      <div className="w-48 h-full flex items-center px-4 hover:bg-white/10 transition-colors cursor-pointer text-xs text-white/80">
        <span className="font-segoe">Sunny 24°C</span>
      </div>

      {/* Center Area (Pinned / Open Apps) */}
      <div className="flex-1 flex items-center justify-center gap-1 h-full">
        {/* Start Button Mock */}
        <div className="w-10 h-10 rounded-md hover:bg-white/10 flex items-center justify-center cursor-pointer transition-colors">
          <svg viewBox="0 0 88 88" className="w-5 h-5 text-[#00a4ef]"><path fill="currentColor" d="M0 12.402l35.687-4.86.016 34.423-35.67.23zm35.67 33.529l.028 34.453L0 76.82v-29.53zM40.336 6.36L88 0v41.332l-47.664.385zm47.664 39.112L88 88l-47.664-6.62V46.01z"/></svg>
        </div>

        {SYSTEM_APPS.map(app => {
          const Icon = APP_ICONS[app.id];
          const isOpen = windows.some(w => w.appId === app.id);
          const isActive = activeWindowId && windows.find(w => w.id === activeWindowId)?.appId === app.id;

          return (
            <div key={app.id} className="relative h-full flex items-center justify-center w-10">
              <button
                onClick={() => handleAppClick(app)}
                className={`w-9 h-9 rounded-md flex items-center justify-center transition-all ${isActive ? 'bg-white/10 shadow-inner' : 'hover:bg-white/10'}`}
                title={app.title}
              >
                {Icon && <Icon className="w-5 h-5 text-white" strokeWidth={1.5} />}
              </button>
              
              {/* Active Indicator Line */}
              {isOpen && (
                <motion.div 
                  layoutId={`win-indicator-${app.id}`}
                  className={`absolute bottom-0 h-1 rounded-t-sm transition-all bg-blue-400 ${isActive ? 'w-4' : 'w-1.5'}`} 
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Right Area (System Tray & Clock) */}
      <div className="flex items-center h-full pr-2 gap-1 text-white/90">
        <button className="h-full px-2 hover:bg-white/10 transition-colors rounded-md flex items-center">
          <ChevronUp className="w-4 h-4" />
        </button>
        <button className="h-full px-2 hover:bg-white/10 transition-colors rounded-md flex items-center gap-3">
          <Wifi className="w-4 h-4" />
          <Volume2 className="w-4 h-4" />
          <Battery className="w-4 h-4" />
        </button>
        <button className="h-full px-2 hover:bg-white/10 transition-colors rounded-md flex flex-col items-end justify-center text-xs font-segoe">
          <span>{time ? time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}</span>
          <span>{time ? time.toLocaleDateString([], { month: '2-digit', day: '2-digit', year: 'numeric' }) : ''}</span>
        </button>
      </div>

    </div>
  );
}
