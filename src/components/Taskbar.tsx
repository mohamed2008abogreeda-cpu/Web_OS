'use client';
// ============================================================
// Taskbar — Bottom floating app dock launcher (GNOME style)
// ============================================================
import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useOSStore } from '@/store/useOSStore';
import { SYSTEM_APPS, USERS } from '@/lib/mockData';
import { APP_ICONS, USER_ICONS, Grid3x3, ArrowLeftRight, LogOut, Volume2, Sun, Activity } from '@/lib/icons';
import { toast } from 'sonner';

function PerformanceMonitorWidget({ accentColor }: { accentColor: string }) {
  const [cpuPoints, setCpuPoints] = useState<number[]>([25, 30, 22, 35, 40, 28, 45, 30, 32, 28, 35, 22, 30, 25, 28]);
  const [ramValue, setRamValue] = useState(42);

  useEffect(() => {
    const interval = setInterval(() => {
      setCpuPoints((prev) => [...prev.slice(1), Math.floor(Math.random() * 32) + 16]);
      setRamValue((prev) => {
        const delta = Math.random() > 0.5 ? 1 : -1;
        return Math.max(38, Math.min(48, prev + delta));
      });
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  const pathData = useMemo(() => {
    const width = 160;
    const height = 40;
    const step = width / (cpuPoints.length - 1);
    return cpuPoints
      .map((val, idx) => {
        const x = idx * step;
        const y = height - (val / 100) * height;
        return `${idx === 0 ? 'M' : 'L'} ${x} ${y}`;
      })
      .join(' ');
  }, [cpuPoints]);

  return (
    <div className="card-surface p-3 border border-white/5 bg-white/50 rounded-2xl flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider flex items-center gap-1">
          <Activity className="w-3 h-3 text-purple-500" />
          CPU Performance
        </span>
        <span className="text-[10px] font-mono text-purple-600 font-bold">{cpuPoints.at(-1)}%</span>
      </div>

      <div className="h-10 w-full relative overflow-hidden bg-purple-50/50 rounded-lg border border-purple-100/30">
        <svg className="w-full h-full" viewBox="0 0 160 40" preserveAspectRatio="none">
          <path
            d={pathData}
            fill="none"
            stroke={accentColor}
            strokeWidth="1.5"
            className="transition-all duration-500"
          />
        </svg>
      </div>

      <div className="flex items-center justify-between text-[10px] text-slate-500 font-semibold mt-1">
        <span>RAM Allocation</span>
        <span className="font-mono text-slate-700 font-bold">{ramValue}% (2.8 GB)</span>
      </div>
      <div className="h-1.5 w-full bg-slate-200/50 rounded-full overflow-hidden border border-white/5">
        <div 
          className="h-full rounded-full transition-all duration-500" 
          style={{ width: `${ramValue}%`, backgroundColor: accentColor }}
        />
      </div>
    </div>
  );
}

function TactileControllerWidget({ icon, label, value, onChange, accentColor }: {
  icon: React.ReactNode;
  label: string;
  value: number;
  onChange: (val: number) => void;
  accentColor: string;
}) {
  return (
    <div className="card-surface p-3 border border-white/5 bg-white/50 rounded-2xl flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider flex items-center gap-1">
          <span className="text-slate-400">{icon}</span>
          {label}
        </span>
        <span className="text-[10px] font-mono text-slate-700 font-bold">{value}%</span>
      </div>
      
      <div className="h-7 flex items-center w-full relative group">
        <input
          type="range"
          min="0"
          max="100"
          value={value}
          onChange={(e) => onChange(parseInt(e.target.value))}
          className="w-full bg-transparent h-1.5 rounded-full appearance-none cursor-pointer focus:outline-none"
          style={{
            accentColor: accentColor,
            background: `linear-gradient(to right, ${accentColor} 0%, ${accentColor} ${value}%, rgba(0,0,0,0.06) ${value}%, rgba(0,0,0,0.06) 100%)`,
          }}
        />
      </div>
    </div>
  );
}

export default function Taskbar() {
  const {
    windows,
    activeWindowId,
    currentUser,
    isStartMenuOpen,
    toggleStartMenu,
    openWindow,
    focusWindow,
    restoreWindow,
    minimizeWindow,
    switchUser,
    logoutUser,
  } = useOSStore();

  const user = currentUser ? USERS[currentUser] : null;
  const UserIcon = currentUser ? USER_ICONS[currentUser] : null;

  // Custom controller states
  const [volValue, setVolValue] = useState(65);
  const [brightValue, setBrightValue] = useState(80);

  const handleVolChange = (val: number) => {
    setVolValue(val);
    toast.success(`UI Audio Volume: ${val}%`, { id: 'vol-toast', duration: 1000 });
  };

  const handleBrightChange = (val: number) => {
    setBrightValue(val);
    toast.success(`Screen Brightness: ${val}%`, { id: 'bright-toast', duration: 1000 });
  };

  const activeAccent = user?.accentColor || '#ec4899';

  return (
    <>
      {/* ─── Start Menu Overlay ──────────────────── */}
      <AnimatePresence>
        {isStartMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 z-[8000]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => toggleStartMenu()}
            />

            {/* Menu Panel */}
            <motion.div
              className="fixed bottom-20 left-6 z-[8001] w-88 max-w-[calc(100vw-24px)]
                         card-elevated overflow-hidden border border-white/60 shadow-xl backdrop-blur-3xl bg-white/86 text-slate-800"
              initial={{ opacity: 0, y: 24, scale: 0.94 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 24, scale: 0.94 }}
              transition={{ type: 'spring', stiffness: 350, damping: 28 }}
            >
              {/* User profile card */}
              <div className="p-4 sm:p-5 border-b border-slate-200/50 flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-md shrink-0 bg-white"
                  style={{
                    border: `1.5px solid ${activeAccent}35`,
                  }}
                >
                  {UserIcon && (
                    <UserIcon
                      className="w-5.5 h-5.5"
                      style={{ color: activeAccent }}
                      strokeWidth={1.8}
                    />
                  )}
                </div>
                <div className="min-w-0">
                  <div className="text-slate-800 text-sm font-extrabold truncate tracking-tight">{currentUser || 'demeter'}</div>
                  <div className="text-slate-500 text-[11px] truncate mt-0.5 font-bold uppercase tracking-wider">{user?.role || 'Creative Developer'}</div>
                </div>
              </div>

              {/* Modular Workspace Layout */}
              <div className="p-4 flex flex-col gap-3 max-h-[360px] overflow-y-auto scrollbar-hide">
                {/* Performance Monitor Widget */}
                <PerformanceMonitorWidget accentColor={activeAccent} />

                {/* Tactile sliders */}
                <div className="grid grid-cols-2 gap-2.5">
                  <TactileControllerWidget
                    icon={<Volume2 className="w-3.5 h-3.5" />}
                    label="Audio Volume"
                    value={volValue}
                    onChange={handleVolChange}
                    accentColor={activeAccent}
                  />
                  <TactileControllerWidget
                    icon={<Sun className="w-3.5 h-3.5" />}
                    label="Brightness"
                    value={brightValue}
                    onChange={handleBrightChange}
                    accentColor={activeAccent}
                  />
                </div>

                {/* Quick Apps */}
                <div className="flex flex-col gap-1 mt-1">
                  <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider mb-1 px-1">Quick Apps</span>
                  {SYSTEM_APPS.map((app) => {
                    const AppIcon = APP_ICONS[app.id];
                    return (
                      <button
                        key={app.id}
                        onClick={() => {
                          openWindow(app);
                          toggleStartMenu();
                          toast.success(`Opening ${app.title}`);
                        }}
                        className="w-full flex items-center justify-between px-3.5 py-3 rounded-2xl
                                   text-slate-600 hover:bg-slate-100 hover:text-slate-800
                                   active:bg-slate-200/50 active:scale-[0.98] transition-all duration-150 text-left text-sm font-extrabold border border-transparent hover:border-slate-200/40 shadow-sm bg-white/40 cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          {AppIcon && (
                            <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-white border border-slate-100 shadow-sm">
                              <AppIcon className="w-4.5 h-4.5 text-slate-500" strokeWidth={1.8} />
                            </div>
                          )}
                          <span>{app.title}</span>
                        </div>
                        <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider bg-white/80 px-2 py-0.5 rounded-md border border-slate-100">Open</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Footer System operations */}
              <div className="p-3 border-t border-slate-200/50 bg-slate-50/50 flex flex-col gap-1">
                <button
                  onClick={() => {
                    switchUser();
                    toggleStartMenu();
                    toast.info(`Switched profile context to target developer`);
                  }}
                  className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl
                             text-slate-600 hover:bg-slate-100 hover:text-slate-800
                             active:bg-slate-200/50 active:scale-[0.98] transition-all duration-150 text-left text-xs font-bold cursor-pointer"
                >
                  <div className="w-8.5 h-8.5 rounded-xl flex items-center justify-center bg-white border border-slate-100 shadow-sm">
                    <ArrowLeftRight className="w-4.5 h-4.5 text-slate-400" strokeWidth={1.8} />
                  </div>
                  <span>Switch Profile Context</span>
                </button>
                <button
                  onClick={() => {
                    logoutUser();
                    toggleStartMenu();
                    toast.success('OS Session terminated');
                  }}
                  className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl
                             text-slate-600 hover:bg-rose-50 hover:text-rose-600
                             active:bg-rose-100 active:scale-[0.98] transition-all duration-150 text-left text-xs font-bold cursor-pointer"
                >
                  <div className="w-8.5 h-8.5 rounded-xl flex items-center justify-center bg-rose-50 border border-rose-100 shadow-sm">
                    <LogOut className="w-4.5 h-4.5 text-rose-500" strokeWidth={1.8} />
                  </div>
                  <span>Sign Out Session</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ─── Center Floating Dock (GNOME style) ─────────────────── */}
      <div
        className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[7999] h-14 max-w-[90vw]
                   bg-white/80 backdrop-blur-3xl border border-white/60
                   flex items-center px-3.5 gap-2.5 rounded-2xl shadow-xl transition-all duration-300"
        data-testid="taskbar"
      >
        {/* Start / Menu grid button */}
        <button
          onClick={toggleStartMenu}
          className={`
            flex items-center justify-center w-10.5 h-10.5 rounded-xl
            transition-all duration-150 active:scale-[0.93] cursor-pointer
            ${isStartMenuOpen
              ? 'bg-purple-400/20 text-purple-600 border border-purple-400/30 shadow-inner'
              : 'hover:bg-slate-100/80 text-slate-600 hover:text-slate-900 border border-transparent'
            }
          `}
          data-testid="start-button"
        >
          <Grid3x3 className="w-5.5 h-5.5" strokeWidth={1.8} />
        </button>

        {/* Separator */}
        <div className="w-px h-6 bg-slate-300/60 mx-0.5" />

        {/* Apps Dock Launchers with dynamic window indicators */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide py-1">
          {SYSTEM_APPS.map((app) => {
            const AppIcon = APP_ICONS[app.id];
            
            // Check if there are any open windows for this app
            const openWins = windows.filter((w) => w.appId === app.id && w.isOpen);
            const isOpen = openWins.length > 0;
            
            // Check if any window is active
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
                className={`
                  flex items-center justify-center w-10.5 h-10.5 rounded-xl
                  transition-all duration-150 shrink-0 relative active:scale-95 border cursor-pointer
                  ${isActive
                    ? 'bg-white text-slate-800 border-slate-200 shadow-sm'
                    : 'text-slate-500 hover:bg-slate-100/80 hover:text-slate-800 border-transparent'
                  }
                `}
                title={app.title}
              >
                {AppIcon && (
                  <AppIcon 
                    className="w-5 h-5" 
                    strokeWidth={1.8} 
                    style={{ color: isActive ? activeAccent : undefined }} 
                  />
                )}

                {/* Tactile active indicator dot underneath the app launcher */}
                {isOpen && (
                  <div
                    className={`absolute bottom-0.75 w-1.2 h-1.2 rounded-full transition-all duration-200
                      ${isActive ? 'scale-100 shadow-[0_0_6px_currentColor]' : 'scale-90 opacity-60'}`}
                    style={{ backgroundColor: activeAccent, color: activeAccent }}
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Separator */}
        <div className="w-px h-6 bg-slate-300/60 mx-0.5" />

        {/* Profile Switcher Quick Launcher */}
        <button
          onClick={() => {
            switchUser();
            toast.info(`Switched profile context to target developer`);
          }}
          className="flex items-center justify-center w-10.5 h-10.5 rounded-xl
                     text-slate-500 hover:bg-slate-100/80 hover:text-slate-800
                     active:scale-[0.93] transition-all duration-150 border border-transparent cursor-pointer"
          data-testid="switch-user"
          title="Switch User Profile"
        >
          <ArrowLeftRight className="w-5 h-5" strokeWidth={1.8} />
        </button>
      </div>
    </>
  );
}
