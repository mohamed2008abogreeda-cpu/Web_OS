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
          flex flex-col w-full h-full overflow-hidden
          transition-all duration-350 select-none
        `}
        initial={{ opacity: 0, scale: 0.94, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 20 }}
        transition={{ type: 'spring', stiffness: 240, damping: 25 }}
        style={{
          borderRadius: 'var(--radius-window)',
          backgroundColor: isActive ? 'var(--bg-window-content)' : 'var(--bg-window-header)',
          border: `1px solid var(--border-window)`,
          boxShadow: isActive ? 'var(--shadow-window)' : '0 8px 24px rgba(0,0,0,0.03)',
          opacity: isActive ? 1 : 0.96,
          backdropFilter: 'blur(30px)',
          WebkitBackdropFilter: 'blur(30px)',
        }}
      >
        {/* Title bar */}
        <div className="window-drag-handle h-10 flex items-center px-4 gap-4 shrink-0 select-none"
             style={{ 
               backgroundColor: 'var(--bg-window-header)',
               borderBottom: '1px solid var(--border-window)' 
             }}>
          
          {/* macOS-style traffic lights */}
          {currentUser === 'Mohammed' && (
            <div className="flex items-center gap-2 h-full" onMouseDown={(e) => e.stopPropagation()} onTouchStart={(e) => e.stopPropagation()}>
              <button
                onMouseDown={(e) => e.stopPropagation()}
                onClick={(e) => { e.stopPropagation(); closeWindow(win.id); }}
                className="w-3.5 h-3.5 rounded-full bg-rose-400 hover:bg-rose-500
                           transition-all duration-150 flex items-center justify-center group z-50 cursor-pointer"
              >
                <X className="w-2 h-2 text-rose-950 opacity-0 group-hover:opacity-100 transition-opacity" strokeWidth={3} />
              </button>
              <button
                onMouseDown={(e) => e.stopPropagation()}
                onClick={(e) => { e.stopPropagation(); minimizeWindow(win.id); }}
                className="w-3.5 h-3.5 rounded-full bg-amber-400 hover:bg-amber-500
                           transition-all duration-150 flex items-center justify-center group z-50 cursor-pointer"
              >
                <Minus className="w-2 h-2 text-amber-950 opacity-0 group-hover:opacity-100 transition-opacity" strokeWidth={3} />
              </button>
              <button
                onMouseDown={(e) => e.stopPropagation()}
                onClick={(e) => { e.stopPropagation(); maximizeWindow(win.id); }}
                className="w-3.5 h-3.5 rounded-full bg-emerald-400 hover:bg-emerald-500
                           transition-all duration-150 flex items-center justify-center group z-50 cursor-pointer"
              >
                <Maximize2 className="w-1.5 h-1.5 text-emerald-950 opacity-0 group-hover:opacity-100 transition-opacity" strokeWidth={3} />
              </button>
            </div>
          )}

          {/* App icon + Title */}
          <div className={`flex items-center gap-2.5 flex-1 min-w-0 ${currentUser === 'Moamen' ? 'justify-center' : ''}`}>
            {AppIcon && (
              <AppIcon
                className="w-4 h-4 shrink-0"
                style={{ color: isActive ? user?.accentColor : 'var(--text-muted)' }}
                strokeWidth={1.8}
              />
            )}
            <span className="text-slate-700 text-xs font-semibold truncate select-none">
              {win.title}
            </span>
          </div>

          {/* Windows / Aero controls */}
          {currentUser !== 'Mohammed' && (
            <div className="flex items-center gap-1 h-full" onMouseDown={(e) => e.stopPropagation()} onTouchStart={(e) => e.stopPropagation()}>
              <button
                onMouseDown={(e) => e.stopPropagation()}
                onClick={(e) => { e.stopPropagation(); minimizeWindow(win.id); }}
                className={`flex items-center justify-center transition-colors cursor-pointer text-slate-500 z-50 ${
                  currentUser === 'Team' ? 'w-10 h-8 hover:bg-black/10' : 'w-8 h-8 rounded-full hover:bg-black/10'
                }`}
                title="Minimize"
              >
                <Minus className="w-3.5 h-3.5" strokeWidth={2} />
              </button>
              <button
                onMouseDown={(e) => e.stopPropagation()}
                onClick={(e) => { e.stopPropagation(); maximizeWindow(win.id); }}
                className={`flex items-center justify-center transition-colors cursor-pointer text-slate-500 z-50 ${
                  currentUser === 'Team' ? 'w-10 h-8 hover:bg-black/10' : 'w-8 h-8 rounded-full hover:bg-black/10'
                }`}
                title="Maximize"
              >
                <Maximize2 className="w-3.5 h-3.5" strokeWidth={2} />
              </button>
              <button
                onMouseDown={(e) => e.stopPropagation()}
                onClick={(e) => { e.stopPropagation(); closeWindow(win.id); }}
                className={`flex items-center justify-center transition-colors cursor-pointer z-50 ${
                  currentUser === 'Team' 
                    ? 'w-10 h-8 hover:bg-rose-500 hover:text-white text-slate-500' 
                    : 'w-8 h-8 rounded-full bg-rose-100 text-rose-600 hover:bg-rose-500 hover:text-white'
                }`}
                title="Close"
              >
                <X className="w-3.5 h-3.5" strokeWidth={2} />
              </button>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden" style={{ backgroundColor: 'var(--bg-app)' }}>
          {children}
        </div>
      </motion.div>
    </Rnd>
  );
}
