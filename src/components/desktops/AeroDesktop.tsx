'use client';
// ============================================================
// Desktop — Main workspace in Aero Pastel rice style
// ============================================================
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useOSStore } from '@/store/useOSStore';
import { SYSTEM_APPS, USERS } from '@/lib/mockData';
import { APP_ICONS } from '@/lib/icons';
import { Play, Pause, SkipForward, SkipBack, Wifi, Battery, Volume2, RotateCcw, Lock, Edit3 } from 'lucide-react';
import AeroTaskbar from './AeroTaskbar';

function ClockWidget() {
  const [time, setTime] = useState('');

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }));
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-5 px-8 rounded-[24px] bg-white/80 border border-white/60 shadow-xl text-5xl font-extrabold text-slate-800 tracking-tight z-10 flex items-center justify-center select-none font-mono">
      {time}
    </div>
  );
}

function CalendarWidget() {
  const now = new Date();
  const monthName = now.toLocaleString('en-US', { month: 'long' }).toLowerCase();
  const dayOfMonth = now.getDate();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const firstDayIndex = new Date(now.getFullYear(), now.getMonth(), 1).getDay();

  const days = [];
  for (let i = 0; i < firstDayIndex; i++) {
    days.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  const weekDays = ['su', 'mo', 'tu', 'we', 'th', 'fr', 'sa'];

  return (
    <div className="bg-[#bcd1ed]/40 border border-blue-200/50 p-4.5 rounded-[22px] shadow-inner flex flex-col select-none w-full">
      <div className="text-center text-xs font-extrabold text-slate-700 tracking-wider lowercase mb-3">
        {monthName}
      </div>
      <div className="grid grid-cols-7 gap-y-1.5 text-center text-[10px] font-extrabold text-slate-400 uppercase mb-2">
        {weekDays.map((d) => (
          <div key={d}>{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-y-1.5 justify-items-center text-center text-xs font-bold text-slate-700">
        {days.map((day, idx) => {
          if (day === null) return <div key={`empty-${idx}`} className="w-7 h-7" />;
          const isToday = day === dayOfMonth;
          return (
            <div
              key={day}
              className={`w-7 h-7 flex items-center justify-center rounded-full transition-all duration-200
                ${isToday
                  ? 'bg-blue-700 text-white font-extrabold shadow-md scale-110'
                  : 'hover:bg-blue-200/50 cursor-pointer'
                }`}
            >
              {day}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function MusicWidget() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(38);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        setProgress((p) => (p >= 100 ? 0 : p + 1));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  return (
    <div className="bg-gradient-to-br from-[#dbeafe]/70 to-[#e0e7ff]/70 border border-indigo-200/50 p-4 rounded-[22px] shadow-inner flex flex-col gap-3 select-none w-full">
      <div className="flex flex-col min-w-0">
        <span className="text-[9px] font-extrabold text-indigo-400 uppercase tracking-widest">Now Playing</span>
        <span className="text-xs font-extrabold text-slate-800 truncate mt-0.5">Still Woozy - Lava</span>
      </div>

      <div className="flex gap-3 items-center">
        {/* Left Column: Album Art + Progress */}
        <div className="flex flex-col gap-2.5 flex-1 min-w-0">
          <div className="w-full aspect-square rounded-2xl overflow-hidden bg-gradient-to-tr from-purple-300 via-pink-300 to-indigo-300 shadow-md relative group">
            <img
              src="/wallpaper.jpg"
              alt="Cover Art"
              className={`w-full h-full object-cover transition-transform duration-1000 ${isPlaying ? 'animate-spin' : ''}`}
              style={{ animationDuration: '12s' }}
            />
            <div className="absolute inset-0 bg-black/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              {isPlaying ? <Pause className="w-5 h-5 text-white" /> : <Play className="w-5 h-5 text-white" fill="white" />}
            </div>
          </div>
          {/* Progress Bar */}
          <div className="w-full bg-slate-200/80 h-1.5 rounded-full overflow-hidden relative">
            <div className="bg-indigo-600 h-full rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
          </div>
        </div>

        {/* Right Column: Vertical Controls */}
        <div className="flex flex-col gap-3 items-center justify-center text-slate-500 shrink-0 p-1.5 bg-white/50 border border-white/60 rounded-2xl shadow-sm">
          <button className="hover:text-indigo-600 transition-colors cursor-pointer active:scale-90"><SkipBack className="w-4 h-4" /></button>
          <button onClick={() => setIsPlaying(!isPlaying)} className="hover:text-indigo-600 transition-colors cursor-pointer text-slate-800 bg-white p-2 rounded-xl border border-slate-200/30 shadow-sm active:scale-90">
            {isPlaying ? <Pause className="w-4.5 h-4.5" /> : <Play className="w-4.5 h-4.5" fill="currentColor" />}
          </button>
          <button className="hover:text-indigo-600 transition-colors cursor-pointer active:scale-90"><SkipForward className="w-4 h-4" /></button>
        </div>
      </div>
    </div>
  );
}

export default function AeroDesktop() {
  const { windows, activeWindowId, currentUser, openWindow, isMobile, setMobile } = useOSStore();
  const user = currentUser ? USERS[currentUser] : null;

  const [topTime, setTopTime] = useState('');

  // Top Status Bar time with seconds (e.g. 18:04:19)
  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTopTime(now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }));
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  // Detect mobile
  useEffect(() => {
    const check = () => setMobile(window.innerWidth < 1024);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, [setMobile]);

  // Note: removed auto-open windows feature per user request

  const activeWindow = windows.find((w) => w.id === activeWindowId && w.isOpen && !w.isMinimized);

  return (
    <motion.div
      className="fixed inset-0 flex flex-col overflow-hidden select-none bg-[#fdf2f8]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
      data-testid="desktop"
    >
      {/* High-Fidelity Cinematic Wallpaper Background */}
      <div className="absolute inset-0 select-none pointer-events-none z-0 overflow-hidden">
        <img
          src="/wallpaper.jpg"
          alt="Wallpaper"
          className="w-full h-full object-cover"
          style={{ objectPosition: 'center center', minWidth: '100%', minHeight: '100%' }}
        />
        
        {/* Soft pastel accent overlay light */}
        <div
          className="absolute inset-0 opacity-[0.08] mix-blend-overlay pointer-events-none"
          style={{
            background: `radial-gradient(ellipse at 50% 50%, ${user?.accentColor || '#ec4899'}40 0%, transparent 70%)`,
          }}
        />
      </div>

      {/* Top Status Bar (Pastel macOS/GNOME style matching bottom screen exactly) */}
      <div className="h-9 shrink-0 bg-white/20 backdrop-blur-xl border-b border-white/40 flex items-center justify-between px-4 z-40 text-slate-800 text-xs font-bold shadow-sm">
        {/* Left Side: status controls & pills */}
        <div className="flex items-center gap-2">
          {/* Circular badge dot */}
          <div className="w-4.5 h-4.5 rounded-full bg-slate-800/80 flex items-center justify-center text-[7px] text-white">
            ●
          </div>
          {/* Time Capsule */}
          <div className="bg-white/40 border border-white/50 px-3 py-0.5 rounded-full shadow-sm text-[11px] text-slate-800 font-extrabold">
            {topTime}
          </div>
          {/* Icon Circle Toggle */}
          <div className="w-5 h-5 rounded-full border border-white/50 bg-white/30 flex items-center justify-center text-slate-700 cursor-pointer">
            ⬡
          </div>
          {/* Active app capsule */}
          <div className="bg-purple-100/60 border border-purple-200/50 px-3.5 py-0.5 rounded-full shadow-sm text-[10px] text-purple-700 font-extrabold uppercase tracking-wider">
            {activeWindow ? activeWindow.title : 'Desktop'}
          </div>
        </div>
        
        {/* Center: Song Playing */}
        <div className="text-slate-800 text-[11px] font-extrabold tracking-wider bg-white/10 px-4 py-0.5 rounded-full border border-white/20 shadow-inner">
           Still Woozy - Lava
        </div>
        
        {/* Right Status Indicators */}
        <div className="flex items-center gap-2">
          {/* Action Pills */}
          <button className="w-6.5 h-6.5 rounded-full hover:bg-white/40 text-slate-700 flex items-center justify-center cursor-pointer transition-colors" onClick={() => toast('Edit Mode activated')}>
            <Edit3 className="w-3.5 h-3.5" />
          </button>
          <button className="w-6.5 h-6.5 rounded-full hover:bg-white/40 text-slate-700 flex items-center justify-center cursor-pointer transition-colors" onClick={() => toast('Refreshing Desktop...')}>
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          <button className="w-6.5 h-6.5 rounded-full hover:bg-white/40 text-slate-700 flex items-center justify-center cursor-pointer transition-colors" onClick={() => toast.info('System Secured')}>
            <Lock className="w-3.5 h-3.5" />
          </button>

          {/* Separation bar */}
          <div className="w-px h-4 bg-slate-400/30 mx-1" />

          {/* Battery pill */}
          <button className="flex items-center gap-1.5 bg-sky-200/60 border border-sky-300/40 px-2.5 py-0.5 rounded-full shadow-sm hover:bg-sky-300/60 transition-colors cursor-pointer" onClick={() => toast.info('Battery Status', { description: '85% Charging' })}>
            <span className="text-[10px] text-sky-800 font-extrabold">85%</span>
            <Battery className="w-3.5 h-3.5 text-sky-700" strokeWidth={2.5} />
          </button>

          <button className="hover:bg-white/40 p-1 rounded-md transition-colors cursor-pointer" onClick={() => toast.success('Wi-Fi Connected')}>
            <Wifi className="w-4 h-4 text-slate-700" strokeWidth={2.2} />
          </button>
          <button className="hover:bg-white/40 p-1 rounded-md transition-colors cursor-pointer" onClick={() => toast('Volume Settings')}>
            <Volume2 className="w-4 h-4 text-slate-700" strokeWidth={2.2} />
          </button>
        </div>
      </div>

      {/* Desktop content area */}
      <div className="flex-1 relative z-10 p-5 flex gap-6 overflow-hidden">

        {/* Desktop icon grid */}
        <div className={`
          flex-1 relative
          ${isMobile
            ? 'flex flex-col justify-end'
            : ''
          }
        `}>
          <div className={`
            absolute
            ${isMobile
              ? 'inset-x-0 bottom-20 grid grid-cols-4 gap-4 px-2 justify-items-center'
              : 'top-2 left-4 grid grid-cols-2 gap-3'
            }
          `}>
            {SYSTEM_APPS.map((app, i) => {
              const IconComponent = APP_ICONS[app.id];

              return (
                <motion.button
                  key={app.id}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.12 + i * 0.05, type: 'spring', stiffness: 280, damping: 22 }}
                  onClick={() => openWindow(app)}
                  className={`
                    group flex flex-col items-center justify-center rounded-2xl
                    transition-all duration-200 border border-transparent
                    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400/40
                    ${isMobile
                      ? 'gap-2 p-3 w-20 h-22 hover:bg-white/40 active:scale-90 hover:border-white/50 active:bg-white/50 hover:shadow-md'
                      : 'gap-2 p-3 w-22 h-22 hover:bg-white/30 hover:border-white/50 hover:shadow-lg active:scale-93 hover:backdrop-blur-sm'
                    }
                  `}
                >
                  {/* Icon */}
                  <div
                    className={`
                      icon-container shrink-0 flex items-center justify-center shadow-md relative overflow-hidden bg-white/80 border border-white
                      ${isMobile ? 'w-13 h-13 rounded-2xl' : 'w-12 h-12 rounded-2xl'}
                    `}
                    style={{
                      boxShadow: `0 4px 12px rgba(0,0,0,0.03), inset 0 1px 0 rgba(255,255,255,0.9)`,
                    }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.2] to-white/[0.6] pointer-events-none" />

                    {IconComponent && (
                      <IconComponent
                        className={`${isMobile ? 'w-6.5 h-6.5' : 'w-5.5 h-5.5'} transition-all duration-300 group-hover:scale-110`}
                        style={{ color: user?.accentColor || '#ec4899' }}
                        strokeWidth={1.8}
                      />
                    )}
                  </div>

                  {/* Label — full text, no truncation */}
                  <span className={`
                    text-slate-700 group-hover:text-slate-900
                    transition-colors font-bold text-center leading-tight
                    ${isMobile ? 'text-[11px] px-1' : 'text-[11px]'}
                  `}>
                    {app.title}
                  </span>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Right Unified Widget Panel (Hidden on mobile) */}
        {!isMobile && (
          <div className="w-80 shrink-0 bg-white/60 backdrop-blur-2xl border border-white/60 rounded-[32px] p-5 shadow-2xl flex flex-col gap-5.5 select-none h-full overflow-y-auto scrollbar-hide py-5.5 z-20">
            {/* Profile Avatar Card */}
            <div className="flex flex-col items-center gap-2.5 text-center mt-1">
              <div className="w-20 h-20 rounded-full overflow-hidden shrink-0 border-2 border-white shadow-xl bg-slate-100 relative group">
                <img src="/avatars/puppy.png" alt="Avatar" className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
              </div>
              <div className="flex flex-col items-center">
                <span className="text-sm font-extrabold text-slate-800 tracking-tight">demeter</span>
                <span className="text-[10px] font-bold text-slate-400 uppercase mt-0.5 tracking-widest">Good Afternoon!</span>
              </div>
            </div>

            {/* Calendar widget */}
            <CalendarWidget />

            {/* Music Player widget */}
            <MusicWidget />
          </div>
        )}

        {/* Large digital Clock widget (Bottom right, hidden on mobile) */}
        {!isMobile && (
          <div className="absolute bottom-24 right-6 animate-fadeIn">
            <ClockWidget />
          </div>
        )}

        {/* Window Manager removed from here, handled by parent Desktop.tsx */}
      </div>

      {/* Taskbar */}
      <AeroTaskbar />
    </motion.div>
  );
}
