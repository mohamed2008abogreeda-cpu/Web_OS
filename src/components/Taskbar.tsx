'use client';
// ============================================================
// Taskbar — Bottom bar with Lucide icons
// ============================================================
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useOSStore } from '@/store/useOSStore';
import { SYSTEM_APPS, USERS } from '@/lib/mockData';
import { APP_ICONS, USER_ICONS, Grid3x3, ArrowLeftRight, LogOut } from '@/lib/icons';

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
    <div className="text-right text-[11px] leading-tight">
      <div className="text-[var(--text-secondary)] font-medium">{time}</div>
      <div className="text-[var(--text-muted)]">{date}</div>
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

            {/* Menu Panel */}
            <motion.div
              className="fixed bottom-16 left-3 z-[8001] w-72
                         card-elevated overflow-hidden"
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
            >
              {/* User header */}
              <div className="p-4 border-b border-[var(--border-subtle)] flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{
                    background: `linear-gradient(135deg, ${user?.accentColor}20, ${user?.accentColor}08)`,
                    border: `1px solid ${user?.accentColor}25`,
                  }}
                >
                  {UserIcon && (
                    <UserIcon
                      className="w-4.5 h-4.5"
                      style={{ color: user?.accentColor }}
                      strokeWidth={1.5}
                    />
                  )}
                </div>
                <div>
                  <div className="text-[var(--text-primary)] text-sm font-medium">{currentUser}</div>
                  <div className="text-[var(--text-muted)] text-[10px]">{user?.role}</div>
                </div>
              </div>

              {/* Apps */}
              <div className="p-2">
                {SYSTEM_APPS.map((app) => {
                  const AppIcon = APP_ICONS[app.id];
                  return (
                    <button
                      key={app.id}
                      onClick={() => {
                        openWindow(app);
                        toggleStartMenu();
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl
                                 text-[var(--text-secondary)] hover:bg-[var(--bg-card-hover)] hover:text-[var(--text-primary)]
                                 transition-colors text-sm"
                    >
                      {AppIcon && (
                        <AppIcon className="w-4 h-4 text-[var(--text-tertiary)]" strokeWidth={1.5} />
                      )}
                      <span>{app.title}</span>
                    </button>
                  );
                })}
              </div>

              {/* Footer actions */}
              <div className="p-2 border-t border-[var(--border-subtle)]">
                <button
                  onClick={() => { switchUser(); toggleStartMenu(); }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl
                             text-[var(--text-tertiary)] hover:bg-[var(--bg-card-hover)] hover:text-[var(--text-primary)]
                             transition-colors text-sm"
                >
                  <ArrowLeftRight className="w-4 h-4" strokeWidth={1.5} />
                  Switch User
                </button>
                <button
                  onClick={() => { logoutUser(); toggleStartMenu(); }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl
                             text-[var(--text-tertiary)] hover:bg-rose-500/10 hover:text-rose-400
                             transition-colors text-sm"
                >
                  <LogOut className="w-4 h-4" strokeWidth={1.5} />
                  Sign Out
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ─── Taskbar ─────────────────────────────── */}
      <div
        className="fixed bottom-0 left-0 right-0 z-[7999] h-14
                   bg-[var(--bg-base)]/80 backdrop-blur-2xl border-t border-[var(--border-subtle)]
                   flex items-center px-3 gap-1"
        data-testid="taskbar"
      >
        {/* Start Button */}
        <button
          onClick={toggleStartMenu}
          className={`
            flex items-center justify-center w-10 h-10 rounded-xl
            transition-all duration-200
            ${isStartMenuOpen
              ? 'bg-white/[0.1] text-[var(--text-primary)]'
              : 'hover:bg-white/[0.06] text-[var(--text-tertiary)] hover:text-[var(--text-primary)]'
            }
          `}
          data-testid="start-button"
        >
          <Grid3x3 className="w-5 h-5" strokeWidth={1.5} />
        </button>

        {/* Separator */}
        <div className="w-px h-6 bg-[var(--border-subtle)] mx-1" />

        {/* Running Windows */}
        <div className="flex-1 flex items-center gap-1 overflow-x-auto scrollbar-hide">
          {windows.map((win) => {
            const WinIcon = APP_ICONS[win.appId];
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
                  flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium
                  transition-all duration-200 shrink-0
                  ${activeWindowId === win.id && !win.isMinimized
                    ? 'bg-white/[0.1] text-[var(--text-primary)] border-b-2'
                    : 'text-[var(--text-muted)] hover:bg-white/[0.04] hover:text-[var(--text-secondary)]'
                  }
                `}
                style={{
                  borderBottomColor: activeWindowId === win.id && !win.isMinimized
                    ? user?.accentColor
                    : 'transparent',
                }}
              >
                {WinIcon && <WinIcon className="w-3.5 h-3.5" strokeWidth={1.5} />}
                <span className="max-w-20 truncate">{win.title}</span>
              </button>
            );
          })}
        </div>

        {/* Right side: Switch User + Clock */}
        <div className="flex items-center gap-3">
          <button
            onClick={switchUser}
            className="flex items-center gap-2 px-2 py-1.5 rounded-lg
                       text-[var(--text-muted)] hover:bg-white/[0.06] hover:text-[var(--text-secondary)]
                       transition-colors text-xs"
            data-testid="switch-user"
            title="Switch User"
          >
            <ArrowLeftRight className="w-4 h-4" strokeWidth={1.5} />
          </button>
          <Clock />
        </div>
      </div>
    </>
  );
}
