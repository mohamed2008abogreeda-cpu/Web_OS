'use client';
// ============================================================
// Taskbar — Bottom bar with Lucide icons
// ============================================================
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useOSStore } from '@/store/useOSStore';
import { SYSTEM_APPS, USERS } from '@/lib/mockData';
import { APP_ICONS, USER_ICONS, Grid3x3, ArrowLeftRight, LogOut } from '@/lib/icons';
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
    <div className="text-right text-[11px] leading-tight select-none px-2 py-1">
      <div className="text-[var(--text-primary)] font-semibold tracking-wide">{time}</div>
      <div className="text-[var(--text-muted)] text-[10px] mt-0.5">{date}</div>
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

            {/* Menu Panel - Styled as a premium neumorphic glass card */}
            <motion.div
              className="fixed bottom-16 left-3 z-[8001] w-80
                         card-elevated overflow-hidden border border-[var(--border-default)] shadow-2xl backdrop-blur-3xl bg-[var(--bg-elevated)]/90"
              initial={{ opacity: 0, y: 24, scale: 0.94 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 24, scale: 0.94 }}
              transition={{ type: 'spring', stiffness: 380, damping: 30 }}
            >
              {/* User header */}
              <div className="p-4 sm:p-5 border-b border-[var(--border-subtle)] flex items-center gap-3">
                <div
                  className="w-11 h-11 rounded-2xl flex items-center justify-center shadow-inner shrink-0"
                  style={{
                    background: `linear-gradient(135deg, ${user?.accentColor}20, ${user?.accentColor}08)`,
                    border: `1px solid ${user?.accentColor}25`,
                  }}
                >
                  {UserIcon && (
                    <UserIcon
                      className="w-5 h-5"
                      style={{ color: user?.accentColor }}
                      strokeWidth={1.5}
                    />
                  )}
                </div>
                <div className="min-w-0">
                  <div className="text-[var(--text-primary)] text-sm font-semibold truncate">{currentUser}</div>
                  <div className="text-[var(--text-muted)] text-[11px] truncate mt-0.5">{user?.role}</div>
                </div>
              </div>

              {/* Apps (Height-optimized for better touch-areas on Samsung Internet) */}
              <div className="p-2.5 flex flex-col gap-1">
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
                      className="w-full flex items-center gap-3.5 px-3.5 py-3 rounded-xl
                                 text-[var(--text-secondary)] hover:bg-[var(--bg-card-hover)] hover:text-[var(--text-primary)]
                                 active:bg-white/[0.08] active:scale-98 transition-all duration-150 text-left text-sm font-medium"
                    >
                      {AppIcon && (
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center bg-white/[0.03] border border-white/[0.04]"
                        >
                          <AppIcon className="w-4.5 h-4.5 text-[var(--text-secondary)]" strokeWidth={1.6} />
                        </div>
                      )}
                      <span>{app.title}</span>
                    </button>
                  );
                })}
              </div>

              {/* Footer actions */}
              <div className="p-2.5 border-t border-[var(--border-subtle)] flex flex-col gap-1">
                <button
                  onClick={() => {
                    const prevUser = currentUser;
                    switchUser();
                    toggleStartMenu();
                    toast.info(`Switched user context from ${prevUser}`);
                  }}
                  className="w-full flex items-center gap-3.5 px-3.5 py-3 rounded-xl
                             text-[var(--text-secondary)] hover:bg-[var(--bg-card-hover)] hover:text-[var(--text-primary)]
                             active:bg-white/[0.08] active:scale-98 transition-all duration-150 text-left text-sm font-medium"
                >
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-white/[0.03] border border-white/[0.04]">
                    <ArrowLeftRight className="w-4.5 h-4.5 text-[var(--text-tertiary)]" strokeWidth={1.6} />
                  </div>
                  <span>Switch Profile</span>
                </button>
                <button
                  onClick={() => {
                    logoutUser();
                    toggleStartMenu();
                    toast.success('Logged out successfully');
                  }}
                  className="w-full flex items-center gap-3.5 px-3.5 py-3 rounded-xl
                             text-[var(--text-secondary)] hover:bg-rose-500/10 hover:text-rose-400
                             active:bg-rose-500/20 active:scale-98 transition-all duration-150 text-left text-sm font-medium"
                >
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-rose-500/5 border border-rose-500/10">
                    <LogOut className="w-4.5 h-4.5" strokeWidth={1.6} />
                  </div>
                  <span>Sign Out</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ─── Taskbar ─────────────────────────────── */}
      <div
        className="fixed bottom-0 left-0 right-0 z-[7999] h-14
                   bg-[var(--bg-base)]/75 backdrop-blur-2xl border-t border-[var(--border-subtle)]
                   flex items-center px-4 justify-between"
        data-testid="taskbar"
      >
        <div className="flex items-center gap-1.5 h-full">
          {/* Start Button */}
          <button
            onClick={toggleStartMenu}
            className={`
              flex items-center justify-center w-11 h-11 rounded-xl
              transition-all duration-150 active:scale-90
              ${isStartMenuOpen
                ? 'bg-white/[0.1] text-[var(--text-primary)] border border-white/10'
                : 'hover:bg-white/[0.06] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-transparent'
              }
            `}
            data-testid="start-button"
          >
            <Grid3x3 className="w-5.5 h-5.5" strokeWidth={1.6} />
          </button>

          {/* Separator */}
          <div className="w-px h-6 bg-[var(--border-subtle)] mx-1" />

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
                    flex items-center gap-2.5 px-3.5 h-11 rounded-xl text-xs font-semibold
                    transition-all duration-150 shrink-0 relative active:scale-95 border
                    ${isWinActive
                      ? 'bg-white/[0.08] text-[var(--text-primary)] border-white/10'
                      : 'text-[var(--text-muted)] hover:bg-white/[0.04] hover:text-[var(--text-secondary)] border-transparent'
                    }
                  `}
                >
                  {WinIcon && <WinIcon className="w-4 h-4" strokeWidth={1.6} style={{ color: isWinActive ? user?.accentColor : undefined }} />}
                  <span className="max-w-24 truncate">{win.title}</span>

                  {/* Tiny active bottom indicator */}
                  <div
                    className={`absolute bottom-1 left-[30%] right-[30%] h-0.75 rounded-full transition-all duration-200
                      ${isWinActive ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`}
                    style={{ backgroundColor: user?.accentColor }}
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
              toast.info(`Switched user context from ${prevUser}`);
            }}
            className="flex items-center justify-center w-11 h-11 rounded-xl
                       text-[var(--text-muted)] hover:bg-white/[0.06] hover:text-[var(--text-secondary)]
                       active:scale-90 transition-all duration-150"
            data-testid="switch-user"
            title="Switch User Profile"
          >
            <ArrowLeftRight className="w-5.5 h-5.5" strokeWidth={1.6} />
          </button>
          
          <div className="w-px h-6 bg-[var(--border-subtle)] mx-1" />
          
          <Clock />
        </div>
      </div>
    </>
  );
}

