'use client';
// ============================================================
// Desktop — Main workspace with Lucide icon grid
// ============================================================
import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useOSStore } from '@/store/useOSStore';
import { SYSTEM_APPS, USERS } from '@/lib/mockData';
import { APP_ICONS } from '@/lib/icons';
import Taskbar from './Taskbar';
import WindowManager from './WindowManager';

export default function Desktop() {
  const { currentUser, openWindow, isMobile, setMobile } = useOSStore();
  const user = currentUser ? USERS[currentUser] : null;

  // Detect mobile
  useEffect(() => {
    const check = () => setMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, [setMobile]);

  return (
    <motion.div
      className="fixed inset-0 flex flex-col overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      data-testid="desktop"
    >
      {/* Wallpaper — gradient background */}
      <div className="absolute inset-0 bg-[var(--bg-base)]">
        {/* Ambient glows based on user accent */}
        <div
          className="absolute top-0 left-0 w-full h-full"
          style={{
            background: `
              radial-gradient(ellipse at 20% 20%, ${user?.accentColor}08 0%, transparent 50%),
              radial-gradient(ellipse at 80% 80%, ${user?.accentColor}05 0%, transparent 50%),
              radial-gradient(ellipse at 50% 50%, rgba(255,255,255,0.01) 0%, transparent 80%)
            `,
          }}
        />
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      {/* Desktop content area */}
      <div className="flex-1 relative">
        {/* Icon grid */}
        <div className={`
          absolute z-10 p-6
          ${isMobile
            ? 'inset-0 flex flex-col justify-end pb-20'
            : 'top-0 left-0'
          }
        `}>
          <div className={`
            ${isMobile
              ? 'grid grid-cols-4 gap-4 px-2'
              : 'flex flex-col gap-2'
            }
          `}>
            {SYSTEM_APPS.map((app, i) => {
              const IconComponent = APP_ICONS[app.id];

              return (
                <motion.button
                  key={app.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + i * 0.05 }}
                  onClick={() => openWindow(app)}
                  className={`
                    group flex items-center gap-3 rounded-xl
                    transition-all duration-200
                    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20
                    ${isMobile
                      ? 'flex-col gap-1.5 p-3 hover:bg-white/[0.06] active:scale-95'
                      : 'px-3 py-2.5 hover:bg-white/[0.04] w-28'
                    }
                  `}
                >
                  {/* Icon */}
                  <div
                    className={`
                      icon-container shrink-0
                      ${isMobile ? 'w-12 h-12' : 'w-10 h-10'}
                    `}
                    style={{
                      background: `linear-gradient(135deg, ${user?.accentColor}12, ${user?.accentColor}06)`,
                      borderColor: `${user?.accentColor}18`,
                    }}
                  >
                    {IconComponent && (
                      <IconComponent
                        className={`${isMobile ? 'w-5 h-5' : 'w-4.5 h-4.5'} transition-colors`}
                        style={{ color: user?.accentColor }}
                        strokeWidth={1.5}
                      />
                    )}
                  </div>

                  {/* Label */}
                  <span className={`
                    text-[var(--text-secondary)] group-hover:text-[var(--text-primary)]
                    transition-colors font-medium
                    ${isMobile ? 'text-[10px]' : 'text-xs'}
                  `}>
                    {app.title}
                  </span>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Window Manager */}
        <WindowManager />
      </div>

      {/* Taskbar */}
      <Taskbar />
    </motion.div>
  );
}
