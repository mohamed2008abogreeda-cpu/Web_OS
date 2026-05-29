'use client';
import { useState, useEffect, useRef } from 'react';
import { TerminalSquare, Wifi, Volume2, Battery, Power } from 'lucide-react';
import { useOSStore } from '@/store/useOSStore';
import { SYSTEM_APPS } from '@/lib/mockData';
import { APP_ICONS } from '@/lib/icons';

export default function LinuxPanel() {
  const [time, setTime] = useState<Date | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { openWindow } = useOSStore();

  useEffect(() => {
    setTime(new Date());
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }
    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMenuOpen]);

  return (
    <div className="fixed top-0 left-0 w-full h-7 bg-[#111111] text-zinc-300 text-[13px] font-sans font-medium flex justify-between items-center px-4 z-[100] shadow-md border-b border-[#333] select-none">
      
      {/* Left Section (Activities) */}
      <div className="h-full flex items-center relative" ref={menuRef}>
        <button 
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className={`px-3 h-full flex items-center transition-colors gap-2 cursor-pointer ${isMenuOpen ? 'bg-white/10 text-white' : 'hover:bg-white/10'}`}
        >
          <TerminalSquare className="w-4 h-4" />
          <span>Applications</span>
        </button>

        {/* Dropdown Menu */}
        {isMenuOpen && (
          <div className="absolute top-7 left-0 w-60 bg-[#1a1a1a] border border-[#333] shadow-2xl z-[9999] py-2 flex flex-col">
            {SYSTEM_APPS.map(app => {
              const Icon = APP_ICONS[app.id];
              return (
                <button
                  key={app.id}
                  onClick={() => {
                    openWindow(app);
                    setIsMenuOpen(false);
                  }}
                  className="flex items-center gap-3 px-4 py-2 hover:bg-emerald-600 hover:text-white transition-colors text-zinc-300 text-left w-full cursor-pointer"
                >
                  {Icon && <Icon className="w-4 h-4" />}
                  <span>{app.title}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Center Section (Clock) */}
      <div className="h-full flex items-center">
        <button className="hover:text-white transition-colors cursor-pointer px-3 h-full flex items-center">
          {time ? time.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) + ' ' + time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Loading...'}
        </button>
      </div>

      {/* Right Section (System Tray) */}
      <div className="h-full flex items-center gap-4 pr-1">
        <div className="flex items-center gap-3 text-zinc-400">
          <Wifi className="w-3.5 h-3.5 cursor-pointer hover:text-white transition-colors" />
          <Volume2 className="w-3.5 h-3.5 cursor-pointer hover:text-white transition-colors" />
          <Battery className="w-3.5 h-3.5 cursor-pointer hover:text-white transition-colors" />
        </div>
        <button className="hover:text-red-500 transition-colors cursor-pointer text-zinc-400 h-full flex items-center px-2">
          <Power className="w-3.5 h-3.5" />
        </button>
      </div>

    </div>
  );
}
