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
  }, [isActive, focusWindow, win.id]);  // Mobile or Maximized Mode — Optimized full height and premium animations
  if (isMobile || win.isMaximized) {
    return (
      <motion.div
        className="fixed inset-0 z-50 flex flex-col bg-slate-50 pointer-events-auto"
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
                     bg-white border-b border-slate-200/50 select-none"
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
                strokeWidth={1.8}
              />
            )}
            <span className="text-slate-800 text-sm font-extrabold truncate">
              {win.title}
            </span>
          </div>

          {/* Controls with large hit areas (at least 44x44px for Samsung Internet/Android users) */}
          <div className="flex items-center gap-2 h-full">
            <button
              onClick={() => minimizeWindow(win.id)}
              className="w-11 h-11 rounded-xl flex items-center justify-center
                          text-slate-400 hover:bg-slate-100 hover:text-slate-700
                          active:bg-slate-200/50 active:scale-90 transition-all duration-150 cursor-pointer"
              title="Minimize"
            >
              <Minus className="w-4.5 h-4.5" strokeWidth={2.5} />
            </button>
            {win.isMaximized && !isMobile && (
              <button
                onClick={() => restoreWindow(win.id)}
                className="w-11 h-11 rounded-xl flex items-center justify-center
                            text-slate-400 hover:bg-slate-100 hover:text-slate-700
                            active:bg-slate-200/50 active:scale-90 transition-all duration-150 cursor-pointer"
                title="Restore"
              >
                <Maximize2 className="w-4.5 h-4.5" strokeWidth={2.5} />
              </button>
            )}
            <button
              onClick={() => closeWindow(win.id)}
              className="w-11 h-11 rounded-xl flex items-center justify-center
                          text-slate-400 hover:bg-rose-50 hover:text-rose-500
                          active:bg-rose-100 active:scale-90 transition-all duration-150 cursor-pointer"
              title="Close"
            >
              <X className="w-4.5 h-4.5" strokeWidth={2.5} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden bg-slate-50/50">
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
      style={{ zIndex: win.zIndex, display: win.isMinimized ? 'none' : 'flex', pointerEvents: 'auto' }}
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
          flex flex-col w-full h-full rounded-[24px] overflow-hidden
          border transition-all duration-350 select-none
          ${isActive
            ? 'border-white/90 bg-white/88 shadow-xl'
            : 'border-white/70 bg-white/78 shadow-lg opacity-[0.96]'
          }
        `}
        initial={{ opacity: 0, scale: 0.94, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 20 }}
        transition={{ type: 'spring', stiffness: 240, damping: 25 }}
        style={{
          boxShadow: isActive
            ? `inset 0 1px 0 rgba(255,255,255,0.9), 0 16px 48px rgba(0,0,0,0.06), 0 0 0 1px ${user?.accentColor}25`
            : `inset 0 1px 0 rgba(255,255,255,0.8), 0 8px 24px rgba(0,0,0,0.03)`,
        }}
      >
        {/* Title bar */}
        <div className="window-drag-handle h-12 flex items-center px-4 gap-4 shrink-0
                        bg-white/40 border-b border-slate-200/50 select-none">
          
          {/* macOS-style traffic lights with premium micro-interactions */}
          <div className="flex items-center gap-2 h-full" onMouseDown={(e) => e.stopPropagation()} onTouchStart={(e) => e.stopPropagation()}>
            <button
              onMouseDown={(e) => e.stopPropagation()}
              onClick={(e) => { e.stopPropagation(); closeWindow(win.id); }}
              className="w-3.5 h-3.5 rounded-full bg-rose-400/80 hover:bg-rose-500
                         transition-all duration-150 flex items-center justify-center active:scale-90 group relative cursor-pointer z-50"
              title="Close"
            >
              <X className="w-2.2 h-2.2 text-rose-950 opacity-0 group-hover:opacity-100 transition-opacity" strokeWidth={3.5} />
            </button>
            <button
              onMouseDown={(e) => e.stopPropagation()}
              onClick={(e) => { e.stopPropagation(); minimizeWindow(win.id); }}
              className="w-3.5 h-3.5 rounded-full bg-amber-400/80 hover:bg-amber-500
                         transition-all duration-150 flex items-center justify-center active:scale-90 group relative cursor-pointer z-50"
              title="Minimize"
            >
              <Minus className="w-2.2 h-2.2 text-amber-950 opacity-0 group-hover:opacity-100 transition-opacity" strokeWidth={3.5} />
            </button>
            <button
              onMouseDown={(e) => e.stopPropagation()}
              onClick={(e) => { e.stopPropagation(); maximizeWindow(win.id); }}
              className="w-3.5 h-3.5 rounded-full bg-emerald-400/80 hover:bg-emerald-500
                         transition-all duration-150 flex items-center justify-center active:scale-90 group relative cursor-pointer z-50"
              title="Maximize"
            >
              <Maximize2 className="w-1.8 h-1.8 text-emerald-950 opacity-0 group-hover:opacity-100 transition-opacity" strokeWidth={3.5} />
            </button>
          </div>

          {/* App icon + Title */}
          <div className="flex items-center gap-2.5 flex-1 min-w-0">
            {AppIcon && (
              <AppIcon
                className="w-4 h-4 shrink-0"
                style={{ color: isActive ? user?.accentColor : 'var(--text-muted)' }}
                strokeWidth={1.8}
              />
            )}
            <span className="text-slate-700 text-xs font-bold truncate select-none">
              {win.title}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden bg-slate-50/20">
          {children}
        </div>
      </motion.div>
    </Rnd>
  );
}
