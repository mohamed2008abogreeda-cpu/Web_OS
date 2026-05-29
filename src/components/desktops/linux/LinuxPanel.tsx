'use client';
import { useState, useEffect } from 'react';
import { TerminalSquare, Wifi, Volume2, Battery, Power } from 'lucide-react';

export default function LinuxPanel() {
  const [time, setTime] = useState<Date | null>(null);

  useEffect(() => {
    setTime(new Date());
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed top-0 left-0 w-full h-7 bg-[#111111] text-zinc-300 text-[13px] font-sans font-medium flex justify-between items-center px-4 z-[100] shadow-md border-b border-black select-none">
      
      {/* Left Section (Activities) */}
      <div className="h-full flex items-center">
        <button className="hover:bg-white/10 px-3 h-full flex items-center rounded-sm transition-colors gap-2 cursor-pointer">
          <TerminalSquare className="w-4 h-4" />
          <span>Applications</span>
        </button>
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
        <button className="hover:text-red-400 transition-colors cursor-pointer text-zinc-400 h-full flex items-center px-2">
          <Power className="w-3.5 h-3.5" />
        </button>
      </div>

    </div>
  );
}
