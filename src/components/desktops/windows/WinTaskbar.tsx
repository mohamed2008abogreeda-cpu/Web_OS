'use client';
import React, { useState, useEffect } from 'react';
import { useOSStore } from '@/store/useOSStore';
import { SYSTEM_APPS } from '@/lib/mockData';
import { APP_ICONS } from '@/lib/icons';
import { LayoutGrid, ChevronUp, Wifi, Volume2 } from 'lucide-react';
import WinStartMenu from './WinStartMenu';
import { AnimatePresence } from 'framer-motion';

export default function WinTaskbar() {
  const { windows, openWindow, activeWindowId, isStartMenuOpen, toggleStartMenu } = useOSStore();
  const [time, setTime] = useState<Date | null>(null);

  useEffect(() => {
    setTime(new Date());
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      {/* Start Menu Overlay */}
      <AnimatePresence>
        {isStartMenuOpen && <WinStartMenu />}
      </AnimatePresence>

      <div className="absolute bottom-0 w-full h-12 bg-[#1c1c1c]/80 backdrop-blur-xl border-t border-white/10 z-[100] flex items-center justify-between px-2 select-none">
        
        {/* Left Section (Empty / Weather Widget Placeholder) */}
        <div className="w-32 h-full flex items-center pl-2">
          {/* Weather could go here */}
        </div>

        {/* Center Section (Start Button & Apps) */}
        <div className="flex-1 flex justify-center items-center h-full gap-1">
          
          {/* Start Button */}
          <div className="flex flex-col items-center justify-center relative h-full">
            <button 
              onClick={toggleStartMenu}
              className={`w-10 h-10 rounded-md flex items-center justify-center transition-colors hover:bg-white/10 ${isStartMenuOpen ? 'bg-white/10' : ''}`}
            >
              <LayoutGrid className="w-6 h-6 text-blue-400" />
            </button>
            <div className={`absolute bottom-0 w-1.5 h-1 rounded-t-full transition-all ${isStartMenuOpen ? 'bg-blue-400' : 'bg-transparent'}`} />
          </div>

          {/* App Icons */}
          {SYSTEM_APPS.map(app => {
            const Icon = APP_ICONS[app.id];
            const isOpen = windows.some(w => w.appId === app.id);
            const isActive = activeWindowId && windows.find(w => w.id === activeWindowId)?.appId === app.id;

            return (
              <div key={app.id} className="flex flex-col items-center justify-center relative h-full">
                <button 
                  onClick={() => openWindow(app)}
                  className={`w-10 h-10 rounded-md flex items-center justify-center transition-colors hover:bg-white/10 ${isActive ? 'bg-white/10' : ''}`}
                  title={app.title}
                >
                  {Icon && <Icon className="w-6 h-6 text-white drop-shadow-sm" strokeWidth={1.5} />}
                </button>
                {/* Active/Open Pill */}
                {isOpen && (
                  <div className={`absolute bottom-0 h-1 rounded-t-full transition-all bg-blue-400 ${isActive ? 'w-4' : 'w-1.5 bg-zinc-400'}`} />
                )}
              </div>
            );
          })}
        </div>

        {/* Right Section (System Tray) */}
        <div className="flex items-center h-full gap-1 pr-2 text-zinc-100">
          <button className="h-full px-2 hover:bg-white/10 rounded-md flex items-center transition-colors">
            <ChevronUp className="w-4 h-4" />
          </button>
          
          <button className="h-full px-2 hover:bg-white/10 rounded-md flex items-center gap-2 transition-colors">
            <Wifi className="w-4 h-4" />
            <Volume2 className="w-4 h-4" />
          </button>

          <button className="h-full px-3 hover:bg-white/10 rounded-md flex flex-col items-end justify-center transition-colors text-[11px] leading-tight">
            <span>{time ? time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Loading...'}</span>
            <span>{time ? time.toLocaleDateString() : 'Loading...'}</span>
          </button>
        </div>

      </div>
    </>
  );
}
