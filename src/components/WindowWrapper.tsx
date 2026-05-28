'use client';
// ============================================================
// WindowWrapper — Draggable/Resizable window with premium glassmorphism
// ============================================================
import { useRef, useCallback, useState } from 'react';
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
        {/* Title bar (Touch optimized: iOS style) */}
        <div
          className="h-[60px] flex items-center px-2 gap-2 shrink-0
                     bg-zinc-900 border-b border-white/10 select-none pb-safe"
        >
          {/* iOS-style Back Button */}
          <button
            onClick={() => closeWindow(win.id)}
            className="h-11 px-3 rounded-xl flex items-center gap-1
                        text-emerald-400 hover:bg-white/5 active:bg-white/10
                        transition-all duration-150 cursor-pointer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
            <span className="text-[17px] font-medium">Back</span>
          </button>
          
          <div className="flex-1 text-center pr-12">
            <span className="text-white text-[17px] font-semibold truncate">
              {win.title}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden bg-zinc-950">
          {children}
        </div>
      </motion.div>
    );
  }

  const [isDragging, setIsDragging] = useState(false);

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
      onDragStart={() => setIsDragging(true)}
      onDragStop={(_e, d) => {
        setIsDragging(false);
        updateWindowPosition(win.id, d.x, d.y);
      }}
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
          select-none
        `}
        initial={{ opacity: 0, scale: 0.94, y: 20 }}
        animate={{ 
          opacity: isActive ? 1 : 0.96, 
          scale: isDragging ? 1.02 : 1, 
          rotate: isDragging ? 1 : 0,
          y: 0 
        }}
        exit={{ opacity: 0, scale: 0.94, y: 20 }}
        transition={{ type: 'spring', stiffness: 240, damping: 25, mass: 0.8 }}
        style={{
          borderRadius: 'var(--radius-window)',
          backgroundColor: isActive ? 'var(--bg-window-content)' : 'var(--bg-window-header)',
          border: `1px solid var(--border-window)`,
          boxShadow: isActive ? 'var(--shadow-window)' : '0 8px 24px rgba(0,0,0,0.03)',
          backdropFilter: 'blur(30px)',
          WebkitBackdropFilter: 'blur(30px)',
          transformOrigin: 'center center'
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
