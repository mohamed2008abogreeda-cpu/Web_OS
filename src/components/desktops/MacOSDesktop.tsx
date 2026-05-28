'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useOSStore } from '@/store/useOSStore';
import { SYSTEM_APPS, USERS } from '@/lib/mockData';
import { APP_ICONS } from '@/lib/icons';
import { Wifi, Battery, Volume2, Search, Command } from 'lucide-react';
import MacOSTaskbar from './MacOSTaskbar';

export default function MacOSDesktop() {
  const { windows, activeWindowId, currentUser, openWindow } = useOSStore();
  const user = currentUser ? USERS[currentUser] : null;

  const [time, setTime] = useState('');

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true }));
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  const activeWindow = windows.find((w) => w.id === activeWindowId && w.isOpen && !w.isMinimized);
  const activeAppName = activeWindow ? activeWindow.title : 'Finder';

  return (
    <motion.div
      className="fixed inset-0 flex flex-col overflow-hidden select-none"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
      style={{ backgroundColor: '#000' }}
    >
      {/* Wallpaper */}
      <div className="absolute inset-0 z-0">
        <img
          src={user?.wallpaper || "/wallpaper.jpg"}
          alt="macOS Wallpaper"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/10" />
      </div>

      {/* Top Menu Bar */}
      <div className="h-6 shrink-0 bg-white/20 backdrop-blur-2xl border-b border-white/10 flex items-center justify-between px-3 z-40 text-white text-[13px] font-medium shadow-sm">
        {/* Left: Apple Icon & Menus */}
        <div className="flex items-center gap-4">
          <div className="flex items-center justify-center font-bold text-lg leading-none mb-1 cursor-pointer">
            
          </div>
          <div className="font-bold cursor-pointer">{activeAppName}</div>
          <div className="hidden sm:flex gap-4 text-white/90">
            <span className="cursor-pointer hover:text-white">File</span>
            <span className="cursor-pointer hover:text-white">Edit</span>
            <span className="cursor-pointer hover:text-white">View</span>
            <span className="cursor-pointer hover:text-white">Go</span>
            <span className="cursor-pointer hover:text-white">Window</span>
            <span className="cursor-pointer hover:text-white">Help</span>
          </div>
        </div>

        {/* Right: System Tray */}
        <div className="flex items-center gap-3 text-white/90">
          <Volume2 className="w-3.5 h-3.5 cursor-pointer" />
          <Wifi className="w-3.5 h-3.5 cursor-pointer" />
          <div className="flex items-center gap-1 cursor-pointer">
            <span className="text-xs">100%</span>
            <Battery className="w-4 h-4" />
          </div>
          <Search className="w-3.5 h-3.5 cursor-pointer" />
          <div className="cursor-pointer">{time}</div>
        </div>
      </div>

      {/* Desktop Content */}
      <div className="flex-1 relative z-10 p-4">
        {/* Icons aligned to the right like macOS */}
        <div className="absolute top-4 right-4 flex flex-col gap-4 items-end">
          {SYSTEM_APPS.map((app) => {
            const IconComponent = APP_ICONS[app.id];
            return (
              <div 
                key={app.id} 
                className="flex flex-col items-center gap-1 cursor-pointer group"
                onClick={() => openWindow(app)}
              >
                <div className="w-16 h-16 bg-black/20 border border-white/20 rounded-xl flex items-center justify-center shadow-lg group-hover:bg-black/40 transition-colors backdrop-blur-md">
                  {IconComponent && <IconComponent className="w-8 h-8 text-white drop-shadow-md" />}
                </div>
                <span className="text-white text-xs font-medium px-1.5 py-0.5 rounded bg-black/30 backdrop-blur-sm drop-shadow-md">
                  {app.title}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* macOS Dock */}
      <MacOSTaskbar />
    </motion.div>
  );
}
