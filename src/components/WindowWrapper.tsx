'use client';
// ============================================================
// WindowWrapper — Draggable/Resizable window with premium glassmorphism
// ============================================================
import { useRef, useCallback, useState } from 'react';
import { Rnd } from 'react-rnd';
import { motion, AnimatePresence } from 'framer-motion';
import { useOSStore } from '@/store/useOSStore';
import { APP_ICONS, Minus, Maximize2, X } from '@/lib/icons';
import type { WindowState } from '@/types';

interface WindowWrapperProps {
  window: WindowState;
  children: React.ReactNode;
}

export default function WindowWrapper({ window: win, children }: WindowWrapperProps) {
  const {
    activeWindowId,
    isMobile,
    focusWindow,
    closeWindow,
    minimizeWindow,
    maximizeWindow,
    updateWindowPosition,
    updateWindowSize,
  } = useOSStore();

  const isActive = activeWindowId === win.id;
  const rndRef = useRef<Rnd>(null);
  const AppIcon = APP_ICONS[win.appId];
  const [isDragging, setIsDragging] = useState(false);

  const handleFocus = useCallback(() => {
    if (!isActive) focusWindow(win.id);
  }, [isActive, focusWindow, win.id]);

  // Mobile or Maximized Mode — Optimized full height and premium animations
  if (isMobile || win.isMaximized) {
    return (
      <AnimatePresence>
        <motion.div
          className="fixed inset-0 z-50 flex flex-col pointer-events-auto"
          style={{ backgroundColor: 'var(--bg-base)' }}
          initial={{ opacity: 0, scale: 0.94, y: 36 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 36 }}
          transition={{ type: 'spring', stiffness: 260, damping: 26 }}
          onClick={handleFocus}
        >
          {/* iOS-style Title Bar */}
          <div
            className="h-[60px] flex items-center justify-between px-4 gap-2 shrink-0 select-none pb-safe"
            style={{ 
              backgroundColor: 'var(--bg-elevated)',
              borderBottom: '1px solid var(--border-subtle)' 
            }}
          >
            <div className="flex items-center gap-3">
               <button
                 onClick={() => closeWindow(win.id)}
                 className="h-11 px-3 rounded-xl flex items-center gap-1 hover:bg-white/5 active:bg-white/10 transition-all duration-150 cursor-pointer"
                 style={{ color: 'var(--color-accent, #10b981)' }}
               >
                 <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                 <span className="text-[17px] font-medium">Back</span>
               </button>
            </div>

            <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2">
               {AppIcon && <AppIcon className="w-4 h-4" style={{ color: 'var(--color-accent, #10b981)' }} />}
               <span className="text-[17px] font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
                 {win.title}
               </span>
            </div>
          </div>

          <div className="flex-1 overflow-hidden relative">
            {children}
          </div>
        </motion.div>
      </AnimatePresence>
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
      style={{ display: win.isMinimized ? 'none' : 'flex', pointerEvents: 'auto' }}
      dragHandleClassName="window-drag-handle"
      onDragStart={() => setIsDragging(true)}
      onDragStop={(_e, d) => {
        setIsDragging(false);
        updateWindowPosition(win.id, d.x, d.y);
      }}
      onResizeStop={(_e, _dir, ref, _delta, pos) => {
        updateWindowSize(win.id, parseInt(ref.style.width, 10), parseInt(ref.style.height, 10));
        updateWindowPosition(win.id, pos.x, pos.y);
      }}
      onMouseDown={handleFocus}
      bounds="parent"
    >
      <motion.div
        className={`
          flex flex-col w-full h-full overflow-hidden select-none
          bg-os-bg backdrop-blur-[var(--os-blur)] border-os-border shadow-os rounded-os
        `}
        initial={{ scale: 0.95, opacity: 0, y: 10 }}
        animate={{ 
          scale: isDragging ? 1.02 : 1, 
          opacity: 1, 
          rotate: isDragging ? 1 : 0,
          y: 0 
        }}
        exit={{ scale: 0.95, opacity: 0, y: 10 }}
        transition={{ type: 'spring', stiffness: 240, damping: 25 }}
        style={{ transformOrigin: 'center center' }}
      >
        {/* Title bar */}
        <div className="window-drag-handle h-12 flex items-center justify-between px-4 shrink-0 select-none"
             style={{ 
               backgroundColor: 'var(--bg-surface)',
               borderBottom: '1px solid var(--border-subtle)' 
             }}>
          
          {/* App icon + Title */}
          <div className="flex items-center gap-3">
            {AppIcon && (
              <AppIcon
                className="w-4 h-4 shrink-0"
                style={{ color: 'var(--color-accent, #10b981)' }}
                strokeWidth={2}
              />
            )}
            <span className="text-sm font-semibold truncate select-none" style={{ color: 'var(--text-primary)' }}>
              {win.title}
            </span>
          </div>

          {/* Unified Cyber-Pro Controls */}
          <div className="flex items-center gap-2 h-full" onMouseDown={(e) => e.stopPropagation()} onTouchStart={(e) => e.stopPropagation()}>
            <button
              onClick={(e) => { e.stopPropagation(); minimizeWindow(win.id); }}
              className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors cursor-pointer hover:bg-white/10"
              style={{ color: 'var(--text-muted)' }}
              title="Minimize"
            >
              <Minus className="w-4 h-4" strokeWidth={2} />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); maximizeWindow(win.id); }}
              className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors cursor-pointer hover:bg-white/10"
              style={{ color: 'var(--text-muted)' }}
              title="Maximize"
            >
              <Maximize2 className="w-3.5 h-3.5" strokeWidth={2} />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); closeWindow(win.id); }}
              className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors cursor-pointer hover:bg-rose-500/20 hover:text-rose-400"
              style={{ color: 'var(--text-muted)' }}
              title="Close"
            >
              <X className="w-4 h-4" strokeWidth={2} />
            </button>
          </div>
        </div>

        {/* Content with Iframe Trap Fix */}
        <div className="flex-1 overflow-hidden relative" style={{ backgroundColor: 'var(--bg-base)' }}>
          {isDragging && <div className="absolute inset-0 z-[999] bg-transparent" />}
          {children}
        </div>
      </motion.div>
    </Rnd>
  );
}
