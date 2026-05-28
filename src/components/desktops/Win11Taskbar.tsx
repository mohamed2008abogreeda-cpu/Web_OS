'use client';
import { useState, useEffect } from 'react';
import { useOSStore } from '@/store/useOSStore';
import { SYSTEM_APPS } from '@/lib/mockData';
import { APP_ICONS, Grid3x3 } from '@/lib/icons';
import { Wifi, Battery, Volume2, Search } from 'lucide-react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';

export default function Win11Taskbar() {
  const { windows, activeWindowId, openWindow, focusWindow, restoreWindow, minimizeWindow, isStartMenuOpen, toggleStartMenu } = useOSStore();
  const [time, setTime] = useState('');
  const [date, setDate] = useState('');

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }));
      setDate(now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }));
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed bottom-4 left-0 right-0 flex items-end justify-between px-6 z-[7999] pointer-events-none">
      
      {/* Left side: Weather / Widgets Pill */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <div className="pointer-events-auto bg-black/40 backdrop-blur-2xl border border-white/10 flex items-center gap-2 text-white/90 px-4 py-2.5 rounded-[20px] cursor-pointer hover:bg-white/10 transition-colors text-sm font-medium shadow-2xl h-[52px]">
            <span className="text-yellow-400">☀️</span> 
            <div className="flex flex-col leading-tight">
              <span>24°C</span>
              <span className="text-[10px] text-white/50">Eskişehir</span>
            </div>
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" sideOffset={16} className="w-64 bg-zinc-950/90 backdrop-blur-3xl border-white/10 text-white p-4 rounded-2xl shadow-2xl">
          <DropdownMenuLabel className="text-lg font-light tracking-tight">Weather</DropdownMenuLabel>
          <div className="flex items-center gap-4 mt-2 mb-4">
            <span className="text-4xl">☀️</span>
            <div>
              <div className="text-2xl font-bold">24°C</div>
              <div className="text-sm text-zinc-400">Sunny</div>
            </div>
          </div>
          <DropdownMenuSeparator className="bg-white/10" />
          <div className="mt-2 text-xs text-zinc-400 flex justify-between">
            <span>Humidity: 45%</span>
            <span>Wind: 12km/h</span>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Center: App Dock Pill */}
      <div className="pointer-events-auto bg-black/40 backdrop-blur-2xl border border-white/10 flex items-center gap-2 px-4 py-2 rounded-[24px] shadow-2xl h-[52px]">
        {/* Start Button */}
        <button
          onClick={toggleStartMenu}
          className={`w-10 h-10 flex items-center justify-center rounded-[14px] transition-colors ${
            isStartMenuOpen ? 'bg-white/20' : 'hover:bg-white/10'
          }`}
        >
          <Grid3x3 className="w-5 h-5 text-[#3b82f6]" />
        </button>

        {/* Search */}
        <button 
          onClick={() => toast.info('Search functionality coming soon')}
          className="w-10 h-10 flex items-center justify-center rounded-[14px] hover:bg-white/10 transition-colors"
        >
          <Search className="w-5 h-5 text-white/80" />
        </button>

        <div className="w-px h-6 bg-white/20 mx-1" />

        {/* Apps */}
        {SYSTEM_APPS.map((app) => {
          const AppIcon = APP_ICONS[app.id];
          const openWins = windows.filter((w) => w.appId === app.id && w.isOpen);
          const isOpen = openWins.length > 0;
          const isActive = openWins.some((w) => activeWindowId === w.id && !w.isMinimized);

          return (
            <button
              key={app.id}
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
              className={`relative w-10 h-10 flex flex-col items-center justify-center rounded-[14px] transition-all duration-150 group ${
                isActive ? 'bg-white/10' : 'hover:bg-white/5'
              }`}
              title={app.title}
            >
              {AppIcon && <AppIcon className="w-5 h-5 text-white drop-shadow-md relative z-10 transition-transform group-active:scale-90" />}
              
              {/* Active Indicator */}
              {isOpen && (
                <div className={`absolute bottom-0 w-3 h-1 rounded-full transition-all duration-300 ${
                  isActive ? 'bg-[#3b82f6] w-4' : 'bg-white/40'
                }`} />
              )}
            </button>
          );
        })}
      </div>

      {/* Right side: System Tray Pill */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <div className="pointer-events-auto bg-black/40 backdrop-blur-2xl border border-white/10 flex items-center gap-4 px-4 py-2 rounded-[20px] shadow-2xl h-[52px] cursor-pointer hover:bg-white/10 transition-colors">
            <div className="flex items-center gap-3 text-white/90">
              <Wifi className="w-4 h-4" />
              <Volume2 className="w-4 h-4" />
              <Battery className="w-4 h-4" />
            </div>
            
            <div className="w-px h-6 bg-white/20" />

            <div className="flex flex-col items-end justify-center text-white/90">
              <span className="text-[11px] font-medium leading-tight">{time}</span>
              <span className="text-[11px] leading-tight text-white/70">{date}</span>
            </div>
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" sideOffset={16} className="w-72 bg-zinc-950/90 backdrop-blur-3xl border-white/10 text-white p-2 rounded-2xl shadow-2xl">
          <DropdownMenuLabel className="px-2 pt-2">Quick Settings</DropdownMenuLabel>
          <DropdownMenuSeparator className="bg-white/10" />
          <div className="p-2 grid grid-cols-2 gap-2">
            <button className="flex items-center gap-3 p-3 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/30 transition-colors text-left" onClick={() => toast.success('Wi-Fi Connected', { description: 'Antigravity-Net (5GHz)' })}>
              <Wifi className="w-5 h-5" />
              <span className="text-sm font-medium">Wi-Fi</span>
            </button>
            <button className="flex items-center gap-3 p-3 rounded-xl bg-zinc-800 border border-white/5 hover:bg-zinc-700 transition-colors text-left" onClick={() => toast('Volume adjusted to 60%')}>
              <Volume2 className="w-5 h-5" />
              <span className="text-sm font-medium">Volume</span>
            </button>
            <button className="flex items-center gap-3 p-3 rounded-xl bg-zinc-800 border border-white/5 hover:bg-zinc-700 transition-colors text-left" onClick={() => toast.info('Battery Status', { description: '100% Fully Charged' })}>
              <Battery className="w-5 h-5" />
              <span className="text-sm font-medium">Battery</span>
            </button>
          </div>
          <DropdownMenuSeparator className="bg-white/10" />
          <DropdownMenuItem className="focus:bg-white/10 focus:text-white rounded-lg p-3 mx-2 cursor-pointer" onClick={() => toast('Opening full settings...')}>
            All Settings
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

    </div>
  );
}
