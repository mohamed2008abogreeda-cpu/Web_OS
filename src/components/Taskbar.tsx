'use client';
// ============================================================
// Taskbar — Bottom bar with custom widgets start menu & Lucide icons
// ============================================================
import { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useOSStore } from '@/store/useOSStore';
import { SYSTEM_APPS, USERS } from '@/lib/mockData';
import { APP_ICONS, USER_ICONS, Grid3x3, ArrowLeftRight, LogOut, Volume2, Sun, Activity } from '@/lib/icons';
import { toast } from 'sonner';

function Clock() {
  const [time, setTime] = useState('');
  const [date, setDate] = useState('');

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }));
      setDate(now.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="text-right text-[11px] leading-tight select-none px-2 py-1 font-semibold">
      <div className="text-[var(--text-primary)] font-bold tracking-wide">{time}</div>
      <div className="text-[var(--text-muted)] text-[10px] mt-0.5">{date}</div>
    </div>
  );
}

// ── SVG Neon Activity Graph Widget ─────────────────────────
function PerformanceMonitorWidget({ accentColor }: { accentColor: string }) {
  const [cpuPoints, setCpuPoints] = useState<number[]>([25, 30, 22, 35, 40, 28, 45, 30, 32, 28, 35, 22, 30, 25, 28]);
  const [ramValue, setRamValue] = useState(42);

  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate real SRE performance trace fluctuation
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
        // Map 0-100 to height (40 to 0)
        const y = height - (val / 100) * height;
        return `${idx === 0 ? 'M' : 'L'} ${x} ${y}`;
      })
      .join(' ');
  }, [cpuPoints]);

  return (
    <div className="card-surface p-3 border border-white/5 bg-[var(--bg-base)]/50 rounded-2xl flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-[10px] text-[var(--text-secondary)] font-bold uppercase tracking-wider flex items-center gap-1">
          <Activity className="w-3 h-3 text-cyan-400" />
          CPU Performance
        </span>
        <span className="text-[10px] font-mono text-cyan-400 font-bold">{cpuPoints.at(-1)}%</span>
      </div>

      {/* SVG chart */}
      <div className="h-10 w-full relative overflow-hidden bg-black/20 rounded-lg">
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

      <div className="flex items-center justify-between text-[10px] text-[var(--text-muted)] font-semibold mt-1">
        <span>RAM Allocation</span>
        <span className="font-mono text-[var(--text-secondary)] font-bold">{ramValue}% (2.8 GB)</span>
      </div>
      <div className="h-1.5 w-full bg-black/30 rounded-full overflow-hidden border border-white/5">
        <div 
          className="h-full rounded-full transition-all duration-500" 
          style={{ width: `${ramValue}%`, backgroundColor: accentColor }}
        />
      </div>
    </div>
  );
}

// ── Tactile Slider Widget (inspired by Neumorphic knobs) ─────
function TactileControllerWidget({ icon, label, value, onChange, accentColor }: {
  icon: React.ReactNode;
  label: string;
  value: number;
  onChange: (val: number) => void;
  accentColor: string;
}) {
  return (
    <div className="card-surface p-3 border border-white/5 bg-[var(--bg-base)]/50 rounded-2xl flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <span className="text-[10px] text-[var(--text-secondary)] font-bold uppercase tracking-wider flex items-center gap-1">
          <span className="text-[var(--text-muted)]">{icon}</span>
          {label}
        </span>
        <span className="text-[10px] font-mono text-[var(--text-secondary)] font-bold">{value}%</span>
      </div>
      
      {/* Slider Track with optimized touch grab boundaries */}
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
            background: `linear-gradient(to right, ${accentColor} 0%, ${accentColor} ${value}%, rgba(255,255,255,0.06) ${value}%, rgba(255,255,255,0.06) 100%)`,
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
    // Silent haptic indicator toast
    toast.success(`UI Audio Volume: ${val}%`, { id: 'vol-toast', duration: 1000 });
  };

  const handleBrightChange = (val: number) => {
    setBrightValue(val);
    toast.success(`Screen Brightness: ${val}%`, { id: 'bright-toast', duration: 1000 });
  };

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

            {/* Menu Panel - Re-engineered as a beautiful spatial Command Center */}
            <motion.div
              className="fixed bottom-16 left-3 z-[8001] w-88 max-w-[calc(100vw-24px)]
                         card-elevated overflow-hidden border border-white/[0.08] shadow-2xl backdrop-blur-3xl bg-[#090d16]/92"
              initial={{ opacity: 0, y: 24, scale: 0.94 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 24, scale: 0.94 }}
              transition={{ type: 'spring', stiffness: 350, damping: 28 }}
            >
              {/* User profile card */}
              <div className="p-4 sm:p-5 border-b border-white/[0.05] flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg shrink-0"
                  style={{
                    background: `linear-gradient(135deg, ${user?.accentColor}20, ${user?.accentColor}06)`,
                    border: `1.5px solid ${user?.accentColor}25`,
                  }}
                >
                  {UserIcon && (
                    <UserIcon
                      className="w-5.5 h-5.5"
                      style={{ color: user?.accentColor }}
                      strokeWidth={1.5}
                    />
                  )}
                </div>
                <div className="min-w-0">
                  <div className="text-[var(--text-primary)] text-sm font-bold truncate tracking-tight">{currentUser}</div>
                  <div className="text-[var(--text-secondary)] text-[11px] truncate mt-0.5 font-medium opacity-85">{user?.role}</div>
                </div>
              </div>

              {/* Modular Workspace Layout */}
              <div className="p-4 flex flex-col gap-3 max-h-[360px] overflow-y-auto scrollbar-hide">
                
                {/* SVG Performance Monitor Widget */}
                {user && (
                  <PerformanceMonitorWidget accentColor={user.accentColor} />
                )}

                {/* Tactile sliders Inspired by Neumorphic control knobs */}
                {user && (
                  <div className="grid grid-cols-2 gap-2.5">
                    <TactileControllerWidget
                      icon={<Volume2 className="w-3.5 h-3.5" />}
                      label="Audio Volume"
                      value={volValue}
                      onChange={handleVolChange}
                      accentColor={user.accentColor}
                    />
                    <TactileControllerWidget
                      icon={<Sun className="w-3.5 h-3.5" />}
                      label="Brightness"
                      value={brightValue}
                      onChange={handleBrightChange}
                      accentColor={user.accentColor}
                    />
                  </div>
                )}

                {/* Action Applications Section */}
                <div className="flex flex-col gap-1 mt-1">
                  <span className="text-[10px] text-[var(--text-muted)] font-bold uppercase tracking-wider mb-1 px-1">Quick Apps</span>
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
                                   text-[var(--text-secondary)] hover:bg-[var(--bg-card-hover)] hover:text-[var(--text-primary)]
                                   active:bg-white/[0.08] active:scale-[0.98] transition-all duration-150 text-left text-sm font-semibold border border-transparent hover:border-white/5 shadow-sm"
                      >
                        <div className="flex items-center gap-3">
                          {AppIcon && (
                            <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-white/[0.03] border border-white/[0.04]">
                              <AppIcon className="w-4.5 h-4.5 text-[var(--text-secondary)]" strokeWidth={1.5} />
                            </div>
                          )}
                          <span>{app.title}</span>
                        </div>
                        <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider bg-white/[0.04] px-2 py-0.5 rounded-md border border-white/5">Open</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Footer System operations */}
              <div className="p-3 border-t border-white/[0.05] bg-black/15 flex flex-col gap-1">
                <button
                  onClick={() => {
                    const prevUser = currentUser;
                    switchUser();
                    toggleStartMenu();
                    toast.info(`Switched profile context to target developer`);
                  }}
                  className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl
                             text-[var(--text-secondary)] hover:bg-[var(--bg-card-hover)] hover:text-[var(--text-primary)]
                             active:bg-white/[0.08] active:scale-[0.98] transition-all duration-150 text-left text-xs font-semibold"
                >
                  <div className="w-8.5 h-8.5 rounded-xl flex items-center justify-center bg-white/[0.03] border border-white/[0.04]">
                    <ArrowLeftRight className="w-4.5 h-4.5 text-[var(--text-tertiary)]" strokeWidth={1.5} />
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
                             text-[var(--text-secondary)] hover:bg-rose-500/10 hover:text-rose-400
                             active:bg-rose-500/20 active:scale-[0.98] transition-all duration-150 text-left text-xs font-semibold"
                >
                  <div className="w-8.5 h-8.5 rounded-xl flex items-center justify-center bg-rose-500/5 border border-rose-500/10">
                    <LogOut className="w-4.5 h-4.5" strokeWidth={1.5} />
                  </div>
                  <span>Sign Out Session</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ─── Taskbar ─────────────────────────────── */}
      <div
        className="fixed bottom-0 left-0 right-0 z-[7999] h-14
                   bg-[#090d16]/70 backdrop-blur-3xl border-t border-white/[0.08]
                   flex items-center px-4 justify-between"
        data-testid="taskbar"
      >
        <div className="flex items-center gap-1.5 h-full">
          {/* Start Button */}
          <button
            onClick={toggleStartMenu}
            className={`
              flex items-center justify-center w-11 h-11 rounded-xl
              transition-all duration-150 active:scale-[0.93]
              ${isStartMenuOpen
                ? 'bg-white/[0.1] text-[var(--text-primary)] border border-white/10 shadow-lg'
                : 'hover:bg-white/[0.05] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-transparent'
              }
            `}
            data-testid="start-button"
          >
            <Grid3x3 className="w-5.5 h-5.5" strokeWidth={1.5} />
          </button>

          {/* Separator */}
          <div className="w-px h-6 bg-white/[0.06] mx-1" />

          {/* Running Windows */}
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide h-full py-1">
            {windows.map((win) => {
              const WinIcon = APP_ICONS[win.appId];
              const isWinActive = activeWindowId === win.id && !win.isMinimized;

              return (
                <button
                  key={win.id}
                  onClick={() => {
                    if (win.isMinimized) {
                      restoreWindow(win.id);
                    } else if (activeWindowId === win.id) {
                      minimizeWindow(win.id);
                    } else {
                      focusWindow(win.id);
                    }
                  }}
                  className={`
                    flex items-center gap-2.5 px-3.5 h-11 rounded-xl text-xs font-bold
                    transition-all duration-150 shrink-0 relative active:scale-95 border
                    ${isWinActive
                      ? 'bg-white/[0.08] text-[var(--text-primary)] border-white/10 shadow-sm'
                      : 'text-[var(--text-muted)] hover:bg-white/[0.03] hover:text-[var(--text-secondary)] border-transparent'
                    }
                  `}
                >
                  {WinIcon && <WinIcon className="w-4 h-4" strokeWidth={1.5} style={{ color: isWinActive ? user?.accentColor : undefined }} />}
                  <span className="max-w-24 truncate">{win.title}</span>

                  {/* Tactile active bottom indicator */}
                  <div
                    className={`absolute bottom-1 left-[32%] right-[32%] h-0.75 rounded-full transition-all duration-200
                      ${isWinActive ? 'opacity-100 scale-100 shadow-[0_0_8px_currentColor]' : 'opacity-0 scale-50'}`}
                    style={{ backgroundColor: user?.accentColor, color: user?.accentColor }}
                  />
                </button>
              );
            })}
          </div>
        </div>

        {/* Right side: Switch Profile Quick Button + Clock */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              const prevUser = currentUser;
              switchUser();
              toast.info(`Switched profile context to target developer`);
            }}
            className="flex items-center justify-center w-11 h-11 rounded-xl
                       text-[var(--text-muted)] hover:bg-white/[0.05] hover:text-[var(--text-secondary)]
                       active:scale-[0.93] transition-all duration-150"
            data-testid="switch-user"
            title="Switch User Profile"
          >
            <ArrowLeftRight className="w-5.5 h-5.5" strokeWidth={1.5} />
          </button>
          
          <div className="w-px h-6 bg-white/[0.06] mx-1" />
          
          <Clock />
        </div>
      </div>
    </>
  );
}
