'use client';
// ============================================================
// Desktop — Main desktop environment with icons + wallpaper
// ============================================================
import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useOSStore } from '@/store/useOSStore';
import { SYSTEM_APPS, USERS } from '@/lib/mockData';
import Taskbar from './Taskbar';
import WindowManager from './WindowManager';

function DesktopIcon({ app, index }: { app: typeof SYSTEM_APPS[0]; index: number }) {
  const openWindow = useOSStore((s) => s.openWindow);

  return (
    <motion.button
      className="flex flex-col items-center gap-2 p-3 rounded-xl
                 hover:bg-white/[0.06] active:bg-white/[0.1]
                 transition-colors cursor-pointer group
                 w-20 sm:w-24 focus:outline-none"
      onClick={() => openWindow(app)}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      whileTap={{ scale: 0.9 }}
    >
      <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white/[0.06] border border-white/[0.08]
                      flex items-center justify-center text-2xl sm:text-3xl
                      group-hover:bg-white/[0.1] group-hover:border-white/[0.15]
                      group-hover:shadow-lg transition-all duration-300
                      backdrop-blur-sm">
        {app.icon}
      </div>
      <span className="text-gray-400 text-[10px] sm:text-xs font-medium text-center leading-tight
                        group-hover:text-white transition-colors truncate w-full">
        {app.title}
      </span>
    </motion.button>
  );
}

function MobileLauncher() {
  return (
    <div className="flex-1 flex items-end pb-4 px-4">
      <div className="w-full grid grid-cols-4 gap-3 place-items-center">
        {SYSTEM_APPS.map((app, i) => (
          <DesktopIcon key={app.id} app={app} index={i} />
        ))}
      </div>
    </div>
  );
}

function DesktopIcons() {
  return (
    <div className="absolute top-4 left-4 flex flex-col gap-1">
      {SYSTEM_APPS.map((app, i) => (
        <DesktopIcon key={app.id} app={app} index={i} />
      ))}
    </div>
  );
}

export default function Desktop() {
  const { currentUser, isMobile, setMobile } = useOSStore();
  const user = currentUser ? USERS[currentUser] : null;

  // Detect mobile
  useEffect(() => {
    const check = () => {
      const mobile = window.innerWidth < 768 ||
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|Samsung/i.test(navigator.userAgent);
      setMobile(mobile);
    };
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, [setMobile]);

  if (!user) return null;

  return (
    <motion.div
      className="fixed inset-0 flex flex-col overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      data-testid="desktop"
    >
      {/* Wallpaper background */}
      <div
        className="absolute inset-0 transition-all duration-700"
        style={{
          background: `
            radial-gradient(ellipse at 20% 20%, ${user.accentColor}12, transparent 50%),
            radial-gradient(ellipse at 80% 80%, ${user.accentColor}08, transparent 50%),
            linear-gradient(135deg, #0a0a0f 0%, #0d0d14 50%, #0a0a12 100%)
          `,
        }}
      />

      {/* Subtle noise texture */}
      <div className="absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.15) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />

      {/* User indicator */}
      <div className="absolute top-4 right-4 z-50 flex items-center gap-2 px-3 py-1.5 rounded-full
                      bg-black/40 backdrop-blur-xl border border-white/[0.06]">
        <span className="text-sm">{user.emoji}</span>
        <span className="text-gray-400 text-[11px] font-medium">{currentUser}</span>
        <div className="w-1.5 h-1.5 rounded-full animate-pulse"
          style={{ backgroundColor: user.accentColor }}
        />
      </div>

      {/* Desktop content area (above taskbar) */}
      <div className="relative flex-1 overflow-hidden" style={{ marginBottom: '56px' }}>
        {/* Window Manager renders all open windows here */}
        <WindowManager />

        {/* Icons: desktop layout or mobile launcher */}
        {isMobile ? <MobileLauncher /> : <DesktopIcons />}
      </div>

      {/* Taskbar */}
      <Taskbar />
    </motion.div>
  );
}
