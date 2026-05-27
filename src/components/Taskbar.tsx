'use client';
// ============================================================
// Taskbar — Bottom bar with start menu, running apps, clock
// ============================================================
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useOSStore } from '@/store/useOSStore';
import { SYSTEM_APPS, USERS } from '@/lib/mockData';

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
      <div className="text-gray-300 font-medium">{time}</div>
      <div className="text-gray-500">{date}</div>
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
                         bg-gray-950/95 backdrop-blur-2xl border border-white/[0.08]
                         rounded-2xl shadow-2xl shadow-black/60 overflow-hidden"
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
            >
              {/* User header */}
              <div className="p-4 border-b border-white/[0.06] flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-lg"
                  style={{
                    background: `linear-gradient(135deg, ${user?.accentColor}30, ${user?.accentColor}10)`,
                  }}
                >
                  {user?.emoji || '👤'}
                </div>
                <div>
                  <div className="text-white text-sm font-medium">{currentUser}</div>
                  <div className="text-gray-500 text-[10px]">{user?.role}</div>
                </div>
              </div>

              {/* Apps */}
              <div className="p-2">
                {SYSTEM_APPS.map((app) => (
                  <button
                    key={app.id}
                    onClick={() => {
                      openWindow(app);
                      toggleStartMenu();
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg
                               text-gray-300 hover:bg-white/[0.06] hover:text-white
                               transition-colors text-sm"
                  >
                    <span className="text-lg w-6 text-center">{app.icon}</span>
                    <span>{app.title}</span>
                  </button>
                ))}
              </div>

              {/* Footer actions */}
              <div className="p-2 border-t border-white/[0.06]">
                <button
                  onClick={() => { switchUser(); toggleStartMenu(); }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg
                             text-gray-400 hover:bg-white/[0.06] hover:text-white
                             transition-colors text-sm"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
                  </svg>
                  Switch User
                </button>
                <button
                  onClick={() => { logoutUser(); toggleStartMenu(); }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg
                             text-gray-400 hover:bg-red-500/10 hover:text-red-400
                             transition-colors text-sm"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
                  </svg>
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
                   bg-gray-950/80 backdrop-blur-2xl border-t border-white/[0.06]
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
              ? 'bg-white/[0.1] text-white'
              : 'hover:bg-white/[0.06] text-gray-400 hover:text-white'
            }
          `}
          data-testid="start-button"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <rect x="3" y="3" width="8" height="8" rx="1.5" />
            <rect x="13" y="3" width="8" height="8" rx="1.5" />
            <rect x="3" y="13" width="8" height="8" rx="1.5" />
            <rect x="13" y="13" width="8" height="8" rx="1.5" />
          </svg>
        </button>

        {/* Separator */}
        <div className="w-px h-6 bg-white/[0.06] mx-1" />

        {/* Running Windows */}
        <div className="flex-1 flex items-center gap-1 overflow-x-auto scrollbar-hide">
          {windows.map((win) => (
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
                  ? 'bg-white/[0.1] text-white border-b-2'
                  : 'text-gray-500 hover:bg-white/[0.04] hover:text-gray-300'
                }
              `}
              style={{
                borderBottomColor: activeWindowId === win.id && !win.isMinimized
                  ? user?.accentColor
                  : 'transparent',
              }}
            >
              <span className="text-sm">
                {SYSTEM_APPS.find((a) => a.id === win.appId)?.icon || '📄'}
              </span>
              <span className="max-w-20 truncate">{win.title}</span>
            </button>
          ))}
        </div>

        {/* Right side: Switch User + Clock */}
        <div className="flex items-center gap-3">
          {/* Switch User */}
          <button
            onClick={switchUser}
            className="flex items-center gap-2 px-2 py-1.5 rounded-lg
                       text-gray-500 hover:bg-white/[0.06] hover:text-gray-300
                       transition-colors text-xs"
            data-testid="switch-user"
            title="Switch User"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
            </svg>
          </button>

          {/* Clock */}
          <Clock />
        </div>
      </div>
    </>
  );
}
