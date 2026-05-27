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
      className="fixed inset-0 flex flex-col overflow-hidden select-none"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      data-testid="desktop"
    >
      {/* Premium Wallpaper Background */}
      <div className="absolute inset-0 select-none pointer-events-none z-0">
        <img
          src="/wallpaper.jpg"
          alt="Wallpaper"
          className="w-full h-full object-cover object-center scale-105 filter brightness-[0.4] contrast-[1.05]"
        />
        {/* Subtle accent color ambient glow */}
        <div
          className="absolute inset-0 opacity-[0.25] mix-blend-screen"
          style={{
            background: `radial-gradient(ellipse at 50% 50%, ${user?.accentColor}18 0%, transparent 80%)`,
          }}
        />
        {/* Sleek grid mesh overlay */}
        <div 
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px',
          }}
        />
      </div>

      {/* Desktop content area */}
      <div className="flex-1 relative z-10">
        {/* Icon grid */}
        <div className={`
          absolute z-10 p-6 sm:p-8
          ${isMobile
            ? 'inset-x-0 bottom-24 flex flex-col justify-end'
            : 'top-0 left-0'
          }
        `}>
          <div className={`
            ${isMobile
              ? 'grid grid-cols-4 gap-4 px-2 justify-items-center'
              : 'flex flex-col gap-3'
            }
          `}>
            {SYSTEM_APPS.map((app, i) => {
              const IconComponent = APP_ICONS[app.id];

              return (
                <motion.button
                  key={app.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + i * 0.05, type: 'spring', stiffness: 300, damping: 25 }}
                  onClick={() => openWindow(app)}
                  className={`
                    group flex items-center rounded-2xl
                    transition-all duration-200 border border-transparent
                    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20
                    ${isMobile
                      ? 'flex-col gap-2 p-3 w-20 h-22 hover:bg-white/[0.06] active:scale-90 hover:border-white/5 active:bg-white/[0.1] active:border-white/10'
                      : 'gap-3 p-3 hover:bg-white/[0.04] w-28 hover:border-white/5 hover:shadow-md'
                    }
                  `}
                >
                  {/* Icon with optimized touch hit area (minimum 44px on mobile) */}
                  <div
                    className={`
                      icon-container shrink-0 shadow-lg flex items-center justify-center
                      ${isMobile ? 'w-13 h-13 rounded-2xl' : 'w-11 h-11 rounded-xl'}
                    `}
                    style={{
                      background: `linear-gradient(135deg, ${user?.accentColor}12, ${user?.accentColor}06)`,
                      borderColor: `${user?.accentColor}25`,
                    }}
                  >
                    {IconComponent && (
                      <IconComponent
                        className={`${isMobile ? 'w-6 h-6' : 'w-5 h-5'} transition-colors group-hover:scale-105 duration-200`}
                        style={{ color: user?.accentColor }}
                        strokeWidth={1.5}
                      />
                    )}
                  </div>

                  {/* Label */}
                  <span className={`
                    text-[var(--text-secondary)] group-hover:text-[var(--text-primary)]
                    transition-colors font-medium text-center truncate w-full
                    ${isMobile ? 'text-[11px] leading-tight px-1' : 'text-xs text-left'}
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

