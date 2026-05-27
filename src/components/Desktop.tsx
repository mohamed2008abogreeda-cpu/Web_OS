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
      transition={{ duration: 0.6 }}
      data-testid="desktop"
    >
      {/* High-Fidelity Cinematic Wallpaper Background */}
      <div className="absolute inset-0 select-none pointer-events-none z-0 overflow-hidden">
        <img
          src="/wallpaper.jpg"
          alt="Wallpaper"
          className="w-full h-full object-cover object-center scale-102 filter brightness-[0.38] contrast-[1.08] saturate-[0.95]"
        />
        
        {/* Subtle accent color ambient glow lights */}
        <div
          className="absolute inset-0 opacity-[0.28] mix-blend-screen pointer-events-none"
          style={{
            background: `radial-gradient(ellipse at 50% 50%, ${user?.accentColor}18 0%, transparent 80%)`,
          }}
        />
        
        {/* Delicate grain noise filter overlay */}
        <div 
          className="absolute inset-0 opacity-[0.015] pointer-events-none"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px',
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
              : 'flex flex-col gap-4'
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
                    group flex items-center rounded-2xl
                    transition-all duration-200 border border-transparent
                    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20
                    ${isMobile
                      ? 'flex-col gap-2 p-3 w-20 h-22 hover:bg-white/[0.05] active:scale-90 hover:border-white/5 active:bg-white/[0.08] active:border-white/10'
                      : 'gap-3.5 p-3 hover:bg-white/[0.03] w-28 hover:border-white/5 hover:shadow-lg active:scale-95'
                    }
                  `}
                >
                  {/* Icon with optimized touch hit area (minimum 44px on mobile) and inner tactile shadow */}
                  <div
                    className={`
                      icon-container shrink-0 flex items-center justify-center shadow-2xl relative overflow-hidden
                      ${isMobile ? 'w-13 h-13 rounded-2xl' : 'w-11.5 h-11.5 rounded-xl'}
                    `}
                    style={{
                      background: `linear-gradient(135deg, ${user?.accentColor}15, ${user?.accentColor}04)`,
                      borderColor: `${user?.accentColor}25`,
                      boxShadow: `inset 0 1px 0 rgba(255,255,255,0.04), 0 8px 24px rgba(0,0,0,0.5)`,
                    }}
                  >
                    {/* Glass glare effect inside icon */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.015] to-white/[0.05] pointer-events-none" />

                    {IconComponent && (
                      <IconComponent
                        className={`${isMobile ? 'w-6.5 h-6.5' : 'w-5.5 h-5.5'} transition-all duration-300 group-hover:scale-108`}
                        style={{ color: user?.accentColor }}
                        strokeWidth={1.5}
                      />
                    )}
                  </div>

                  {/* Label */}
                  <span className={`
                    text-[var(--text-secondary)] group-hover:text-[var(--text-primary)]
                    transition-colors font-semibold text-center truncate w-full tracking-wide
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
