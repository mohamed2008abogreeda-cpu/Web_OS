'use client';
// ============================================================
// MobileDesktop — 100% Native-feel Mobile OS Launcher & Environment
// ============================================================
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useOSStore } from '@/store/useOSStore';
import { APP_ICONS, USER_ICONS, Wifi, Battery, Clock, Volume2, Shield } from '@/lib/icons';
import { SYSTEM_APPS } from '@/lib/mockData';
import type { UserName } from '@/types';
import dynamic from 'next/dynamic';

// Lazy-loaded dynamic window renderers to prevent circular dependency overhead
const LinuxWindow = dynamic(() => import('./linux/LinuxWindow'), { ssr: false });
const MacWindow = dynamic(() => import('./mac/MacWindow'), { ssr: false });
const WinWindow = dynamic(() => import('./windows/WinWindow'), { ssr: false });

export default function MobileDesktop() {
  const { windows, currentUser, loginUser, openWindow } = useOSStore();
  const [time, setTime] = useState('');

  useEffect(() => {
    const updateTime = () => {
      setTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Compute theme assets & styles based on the active user profile
  const getThemeConfig = () => {
    switch (currentUser) {
      case 'Mohammed': // Linux/Brutalist Neon Theme
        return {
          wallpaper: "url('/wallpapers/porsche_dark_wallpaper.png')",
          accentColor: '#10b981', // emerald-500
          fontClass: 'font-mono',
          containerClass: 'text-emerald-400 bg-black',
          appClass: 'bg-black/60 border border-emerald-500/20 text-emerald-400 active:bg-emerald-500/20',
          statusBarClass: 'bg-[#202020] border-b border-[#333] text-zinc-400 font-mono',
          dockClass: 'bg-black/70 border border-emerald-500/10',
          crtOverlay: true,
          clockLayout: 'text-emerald-400 text-5xl font-mono tracking-widest',
        };
      case 'Moamen': // macOS Mojave Glassmorphic Theme
        return {
          wallpaper: "url('/wallpapers/mac-mojave-dark.jpg')",
          accentColor: '#3b82f6', // blue-500
          fontClass: 'font-sans',
          containerClass: 'text-white/90 bg-[#0d0e15]',
          appClass: 'bg-white/10 backdrop-blur-xl border border-white/15 text-white/90 active:bg-white/20',
          statusBarClass: 'bg-black/30 border-b border-white/5 text-white/90 font-sans',
          dockClass: 'bg-white/5 backdrop-blur-2xl border border-white/10 shadow-2xl',
          crtOverlay: false,
          clockLayout: 'text-white text-6xl font-light tracking-tight text-shadow-md',
        };
      case 'Team': // Windows 11 Modern Fluent Theme
        return {
          wallpaper: "url('/wallpapers/porsche-pink.jpeg')",
          accentColor: '#ec4899', // pink-500
          fontClass: 'font-sans',
          containerClass: 'text-zinc-950 bg-zinc-50',
          appClass: 'bg-white/80 backdrop-blur-md border border-white/40 shadow-sm text-zinc-800 active:bg-zinc-100',
          statusBarClass: 'bg-white/45 border-b border-black/5 text-zinc-800 font-sans',
          dockClass: 'bg-white/60 backdrop-blur-xl border border-white/60 shadow-lg',
          crtOverlay: false,
          clockLayout: 'text-zinc-900 text-5xl font-semibold tracking-tight',
        };
      default:
        return {
          wallpaper: 'none',
          accentColor: '#3b82f6',
          fontClass: 'font-sans',
          containerClass: 'text-white bg-zinc-950',
          appClass: 'bg-zinc-900 border border-white/10 text-white',
          statusBarClass: 'bg-zinc-900 text-white',
          dockClass: 'bg-zinc-900',
          crtOverlay: false,
          clockLayout: 'text-white text-5xl',
        };
    }
  };

  const theme = getThemeConfig();

  // Active open windows (only the ones matching the mobile viewport z-indexes)
  const openWindows = windows.filter(w => w.isOpen);

  return (
    <div
      style={{
        backgroundImage: theme.wallpaper,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
      className={`fixed inset-0 w-full h-full flex flex-col overflow-hidden select-none transition-all duration-700 ${theme.fontClass} ${theme.containerClass}`}
    >
      {/* CRT Scanline Visual Filter (For Linux User profile only) */}
      {theme.crtOverlay && (
        <>
          <div 
            className="absolute inset-0 pointer-events-none z-[9999] opacity-[0.1]" 
            style={{
              background: `
                linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), 
                linear-gradient(90deg, rgba(255, 0, 0, 0.05), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.05))
              `,
              backgroundSize: '100% 4px, 3px 100%'
            }}
          />
          <div className="absolute inset-0 pointer-events-none z-[9998] shadow-[inset_0_0_80px_rgba(0,0,0,0.85)]" />
        </>
      )}

      {/* Top Mobile Status Bar */}
      <div className={`h-8 w-full flex items-center justify-between px-5 text-[11px] font-medium tracking-wide z-20 shrink-0 select-none ${theme.statusBarClass}`}>
        <div className="flex items-center gap-1.5">
          {currentUser === 'Mohammed' ? (
            <span className="text-emerald-400 font-mono">[ROOT@KALI]</span>
          ) : (
            <span className="font-semibold">{time}</span>
          )}
        </div>
        
        {/* Device Status System Indicators */}
        <div className="flex items-center gap-2.5">
          <Wifi className="w-3.5 h-3.5 opacity-90" strokeWidth={2.5} />
          {currentUser === 'Mohammed' ? (
            <span className="text-[10px]">[CELL: UP]</span>
          ) : (
            <Volume2 className="w-3.5 h-3.5 opacity-90" strokeWidth={2.5} />
          )}
          <div className="flex items-center gap-1">
            <span className="text-[10px]">{currentUser === 'Mohammed' ? '[BATT: 98%]' : '98%'}</span>
            <Battery className="w-4 h-4 opacity-90" strokeWidth={2} />
          </div>
        </div>
      </div>

      {/* Main Home Screen Scrollable Shell */}
      <div className="flex-1 w-full flex flex-col items-center justify-between py-6 px-5 relative overflow-y-auto">
        
        {/* Top Section: Elegant Dynamic Clock Widget */}
        <div className="mt-8 flex flex-col items-center text-center">
          <motion.span 
            key={currentUser}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={theme.clockLayout}
          >
            {time}
          </motion.span>
          <motion.span 
            key={`${currentUser}-date`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.7 }}
            className={`text-xs mt-2 uppercase tracking-widest ${currentUser === 'Team' ? 'text-zinc-500 font-semibold' : 'text-zinc-400'}`}
          >
            {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
          </motion.span>
        </div>

        {/* Middle Section: App Grid */}
        <div className="w-full max-w-[340px] grid grid-cols-3 gap-y-6 gap-x-5 my-auto justify-center select-none pt-4 pb-8">
          {SYSTEM_APPS.map((app) => {
            const Icon = APP_ICONS[app.id];
            return (
              <button
                key={app.id}
                onClick={() => openWindow(app)}
                className="flex flex-col items-center gap-2 group outline-none cursor-pointer bg-transparent border-0"
              >
                <div className={`w-14 h-14 rounded-[22%] flex items-center justify-center shadow-md
                              group-active:scale-90 transition-transform duration-200 ${theme.appClass}`}>
                  {Icon ? (
                    <Icon className="w-6 h-6" strokeWidth={1.75} />
                  ) : (
                    <span className="text-xl">{app.icon}</span>
                  )}
                </div>
                <span className={`text-[11px] font-semibold text-center truncate w-full tracking-wide 
                              ${currentUser === 'Team' ? 'text-zinc-800' : 'text-white/80'}`}>
                  {app.title}
                </span>
              </button>
            );
          })}
        </div>

        {/* Bottom Section: Dynamic User Switcher Dock */}
        <div className={`w-full max-w-[340px] rounded-[24px] p-3 flex items-center justify-around select-none shrink-0 ${theme.dockClass}`}>
          {(['Mohammed', 'Moamen', 'Team'] as UserName[]).map((user) => {
            const isActive = currentUser === user;
            const UserIcon = USER_ICONS[user];
            
            return (
              <button
                key={user}
                onClick={() => loginUser(user)}
                className="flex flex-col items-center gap-1 group relative outline-none cursor-pointer bg-transparent border-0"
              >
                <div 
                  className={`w-11 h-11 rounded-full flex items-center justify-center transition-all duration-300 relative
                            ${isActive ? 'scale-110 shadow-lg' : 'opacity-65 active:scale-95'}`}
                  style={{
                    background: isActive 
                      ? theme.accentColor
                      : (currentUser === 'Team' ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.08)')
                  }}
                >
                  {UserIcon ? (
                    <UserIcon className={`w-5 h-5 ${isActive ? 'text-white' : (currentUser === 'Team' ? 'text-zinc-800' : 'text-zinc-300')}`} strokeWidth={isActive ? 2.5 : 1.75} />
                  ) : (
                    <span className="text-lg">👤</span>
                  )}
                  
                  {/* Small Active Dot Badge */}
                  {isActive && (
                    <motion.div 
                      layoutId="activeDot"
                      className="absolute -bottom-1 w-1.5 h-1.5 rounded-full bg-white shadow"
                    />
                  )}
                </div>
                <span className={`text-[9px] font-bold tracking-wider uppercase mt-1 transition-all duration-300
                              ${isActive ? 'opacity-100 scale-105' : 'opacity-50'}`}>
                  {user}
                </span>
              </button>
            );
          })}
        </div>

      </div>

      {/* Fullscreen Mobile OS Windows Overlay Layer */}
      <AnimatePresence>
        {openWindows.map((win) => {
          // Dynamically resolve window component based on the active user profile theme
          const WinRenderer = 
            currentUser === 'Mohammed' ? LinuxWindow :
            currentUser === 'Moamen' ? MacWindow : WinWindow;

          return (
            <WinRenderer key={win.id} window={win} />
          );
        })}
      </AnimatePresence>

    </div>
  );
}
