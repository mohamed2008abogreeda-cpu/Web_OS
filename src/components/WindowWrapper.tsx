'use client';
// ============================================================
// WindowWrapper — Draggable/Resizable window with premium glassmorphism
// ============================================================
import { useRef, useCallback } from 'react';
import { Rnd } from 'react-rnd';
import { motion } from 'framer-motion';
import { useOSStore } from '@/store/useOSStore';
import { USERS } from '@/lib/mockData';
import { APP_ICONS, Minus, Maximize2, X } from '@/lib/icons';
import type { WindowState } from '@/types';

interface WindowWrapperProps {
  window: WindowState;
  children: React.ReactNode;
}

export default function WindowWrapper({ window: win, children }: WindowWrapperProps) {
  const {
    activeWindowId,
    currentUser,
    isMobile,
    focusWindow,
    closeWindow,
    minimizeWindow,
    maximizeWindow,
    restoreWindow,
    updateWindowPosition,
    updateWindowSize,
  } = useOSStore();

  const user = currentUser ? USERS[currentUser] : null;
  const isActive = activeWindowId === win.id;
  const rndRef = useRef<Rnd>(null);
  const AppIcon = APP_ICONS[win.appId];

  const handleFocus = useCallback(() => {
    if (!isActive) focusWindow(win.id);
  }, [isActive, focusWindow, win.id]);

  // Mobile or Maximized Mode — Optimized full height and premium animations
  if (isMobile || win.isMaximized) {
    return (
      <motion.div
        className="fixed inset-0 z-50 flex flex-col bg-[var(--bg-base)]"
        style={{ zIndex: win.zIndex }}
        initial={{ opacity: 0, scale: 0.94, y: 36 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 36 }}
        transition={{ type: 'spring', stiffness: 260, damping: 26 }}
        onClick={handleFocus}
      >
        {/* Title bar (Touch optimized: height 14 to fit 44px min hit targets) */}
        <div
          className="h-14 flex items-center px-4 gap-3 shrink-0
                     bg-[#090d16] border-b border-white/[0.06] select-none"
          style={{
            boxShadow: isActive ? `0 1.5px 0 ${user?.accentColor}18` : undefined,
          }}
        >
          {/* Icon + Title */}
          <div className="flex items-center gap-3.5 flex-1 min-w-0 h-full">
            {AppIcon && (
              <AppIcon
                className="w-5 h-5 shrink-0"
                style={{ color: isActive ? user?.accentColor : 'var(--text-muted)' }}
                strokeWidth={1.5}
              />
            )}
            <span className="text-[var(--text-secondary)] text-sm font-bold truncate">
              {win.title}
            </span>
          </div>

          {/* Controls with large hit areas (at least 44x44px for Samsung Internet/Android users) */}
          <div className="flex items-center gap-2 h-full">
            <button
              onClick={() => minimizeWindow(win.id)}
              className="w-11 h-11 rounded-xl flex items-center justify-center
                         text-[var(--text-muted)] hover:bg-white/[0.06] hover:text-[var(--text-secondary)]
                         active:bg-white/[0.1] active:scale-90 transition-all duration-150"
              title="Minimize"
            >
              <Minus className="w-4.5 h-4.5" strokeWidth={2.2} />
            </button>
            {win.isMaximized && !isMobile && (
              <button
                onClick={() => restoreWindow(win.id)}
                className="w-11 h-11 rounded-xl flex items-center justify-center
                           text-[var(--text-muted)] hover:bg-white/[0.06] hover:text-[var(--text-secondary)]
                           active:bg-white/[0.1] active:scale-90 transition-all duration-150"
                title="Restore"
              >
                <Maximize2 className="w-4.5 h-4.5" strokeWidth={2.2} />
              </button>
            )}
            <button
              onClick={() => closeWindow(win.id)}
              className="w-11 h-11 rounded-xl flex items-center justify-center
                         text-[var(--text-muted)] hover:bg-rose-500/10 hover:text-rose-400
                         active:bg-rose-500/20 active:scale-90 transition-all duration-150"
              title="Close"
            >
              <X className="w-4.5 h-4.5" strokeWidth={2.2} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden bg-[var(--bg-base)]">
          {children}
        </div>
      </motion.div>
    );
  }

  // Desktop: draggable/resizable with premium fluid physics-based motion
  return (
    <Rnd
      ref={rndRef}
      default={{
        x: win.x,
        y: win.y,
        width: win.width,
        height: win.height,
      }}
      minWidth={380}
      minHeight={260}
      style={{ zIndex: win.zIndex, display: win.isMinimized ? 'none' : 'flex' }}
      dragHandleClassName="window-drag-handle"
      onDragStop={(_e, d) => updateWindowPosition(win.id, d.x, d.y)}
      onResizeStop={(_e, _dir, ref, _delta, pos) => {
        updateWindowSize(win.id, parseInt(ref.style.width), parseInt(ref.style.height));
        updateWindowPosition(win.id, pos.x, pos.y);
      }}
      onMouseDown={handleFocus}
      bounds="parent"
    >
      <motion.div
        className={`
          flex flex-col w-full h-full rounded-[20px] overflow-hidden
          border transition-all duration-350 select-none
          ${isActive
            ? 'border-white/[0.08] bg-[#090d16]/90 shadow-[0_24px_72px_rgba(0,0,0,0.85)]'
            : 'border-white/[0.05] bg-[#090d16]/75 shadow-[0_12px_36px_rgba(0,0,0,0.6)] opacity-[0.93]'
          }
        `}
        initial={{ opacity: 0, scale: 0.94, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 20 }}
        transition={{ type: 'spring', stiffness: 240, damping: 25 }}
        style={{
          boxShadow: isActive
            ? `inset 0 1px 0 rgba(255,255,255,0.06), 0 24px 64px rgba(0,0,0,0.7), 0 0 0 1.5px ${user?.accentColor}18`
            : `inset 0 1px 0 rgba(255,255,255,0.03), 0 12px 32px rgba(0,0,0,0.5)`,
        }}
      >
        {/* Title bar */}
        <div className="window-drag-handle h-12 flex items-center px-4 gap-4 shrink-0
                        bg-[#090d16] border-b border-white/[0.05] select-none">
          
          {/* macOS-style traffic lights with premium micro-interactions */}
          <div className="flex items-center gap-2 h-full">
            <button
              onClick={() => closeWindow(win.id)}
              className="w-3.5 h-3.5 rounded-full bg-rose-500/70 hover:bg-rose-500
                         transition-all duration-150 flex items-center justify-center active:scale-90 group relative"
              title="Close"
            >
              <X className="w-2.2 h-2.2 text-rose-950 opacity-0 group-hover:opacity-100 transition-opacity" strokeWidth={3} />
            </button>
            <button
              onClick={() => minimizeWindow(win.id)}
              className="w-3.5 h-3.5 rounded-full bg-amber-500/70 hover:bg-amber-500
                         transition-all duration-150 flex items-center justify-center active:scale-90 group relative"
              title="Minimize"
            >
              <Minus className="w-2.2 h-2.2 text-amber-950 opacity-0 group-hover:opacity-100 transition-opacity" strokeWidth={3} />
            </button>
            <button
              onClick={() => maximizeWindow(win.id)}
              className="w-3.5 h-3.5 rounded-full bg-emerald-500/70 hover:bg-emerald-500
                         transition-all duration-150 flex items-center justify-center active:scale-90 group relative"
              title="Maximize"
            >
              <Maximize2 className="w-1.8 h-1.8 text-emerald-950 opacity-0 group-hover:opacity-100 transition-opacity" strokeWidth={3} />
            </button>
          </div>

          {/* App icon + Title */}
          <div className="flex items-center gap-2.5 flex-1 min-w-0">
            {AppIcon && (
              <AppIcon
                className="w-4 h-4 shrink-0"
                style={{ color: isActive ? user?.accentColor : 'var(--text-muted)' }}
                strokeWidth={1.5}
              />
            )}
            <span className="text-[var(--text-secondary)] text-xs font-bold truncate select-none">
              {win.title}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden bg-[var(--bg-base)]">
          {children}
        </div>
      </motion.div>
    </Rnd>
  );
}
