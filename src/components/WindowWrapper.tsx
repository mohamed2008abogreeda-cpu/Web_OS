'use client';
// ============================================================
// WindowWrapper — Draggable/Resizable window with Lucide icons
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

  // Mobile: full-screen windows
  if (isMobile || win.isMaximized) {
    return (
      <motion.div
        className="fixed inset-0 z-50 flex flex-col"
        style={{ zIndex: win.zIndex }}
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.98 }}
        transition={{ duration: 0.2 }}
        onClick={handleFocus}
      >
        {/* Title bar */}
        <div
          className="h-12 flex items-center px-4 gap-3 shrink-0
                     bg-[var(--bg-elevated)] border-b border-[var(--border-subtle)]"
          style={{
            boxShadow: isActive ? `0 1px 0 ${user?.accentColor}15` : undefined,
          }}
        >
          {/* Icon + Title */}
          <div className="flex items-center gap-2.5 flex-1 min-w-0">
            {AppIcon && (
              <AppIcon
                className="w-4 h-4 shrink-0"
                style={{ color: isActive ? user?.accentColor : 'var(--text-muted)' }}
                strokeWidth={1.5}
              />
            )}
            <span className="text-[var(--text-secondary)] text-sm font-medium truncate">
              {win.title}
            </span>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => minimizeWindow(win.id)}
              className="w-8 h-8 rounded-lg flex items-center justify-center
                         text-[var(--text-muted)] hover:bg-white/[0.06] hover:text-[var(--text-secondary)]
                         transition-colors"
            >
              <Minus className="w-3.5 h-3.5" strokeWidth={2} />
            </button>
            {win.isMaximized && !isMobile && (
              <button
                onClick={() => restoreWindow(win.id)}
                className="w-8 h-8 rounded-lg flex items-center justify-center
                           text-[var(--text-muted)] hover:bg-white/[0.06] hover:text-[var(--text-secondary)]
                           transition-colors"
              >
                <Maximize2 className="w-3.5 h-3.5" strokeWidth={2} />
              </button>
            )}
            <button
              onClick={() => closeWindow(win.id)}
              className="w-8 h-8 rounded-lg flex items-center justify-center
                         text-[var(--text-muted)] hover:bg-rose-500/15 hover:text-rose-400
                         transition-colors"
            >
              <X className="w-3.5 h-3.5" strokeWidth={2} />
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

  // Desktop: draggable/resizable
  return (
    <Rnd
      ref={rndRef}
      default={{
        x: win.x,
        y: win.y,
        width: win.width,
        height: win.height,
      }}
      minWidth={360}
      minHeight={240}
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
          flex flex-col w-full h-full rounded-2xl overflow-hidden
          border transition-all duration-200
          ${isActive
            ? 'border-[var(--border-default)] shadow-xl shadow-black/40'
            : 'border-[var(--border-subtle)] shadow-lg shadow-black/30 opacity-[0.92]'
          }
        `}
        initial={{ opacity: 0, scale: 0.95, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 12 }}
        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        style={{
          boxShadow: isActive
            ? `0 16px 48px rgba(0,0,0,0.5), 0 0 0 1px ${user?.accentColor}10`
            : undefined,
        }}
      >
        {/* Title bar */}
        <div className="window-drag-handle h-11 flex items-center px-4 gap-3 shrink-0
                        bg-[var(--bg-elevated)] border-b border-[var(--border-subtle)]">
          {/* macOS-style traffic lights */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => closeWindow(win.id)}
              className="w-3 h-3 rounded-full bg-rose-500/70 hover:bg-rose-500
                         transition-colors group relative"
            >
              <X className="w-2 h-2 absolute inset-0.5 text-rose-900 opacity-0 group-hover:opacity-100 transition-opacity" strokeWidth={3} />
            </button>
            <button
              onClick={() => minimizeWindow(win.id)}
              className="w-3 h-3 rounded-full bg-amber-500/70 hover:bg-amber-500
                         transition-colors group relative"
            >
              <Minus className="w-2 h-2 absolute inset-0.5 text-amber-900 opacity-0 group-hover:opacity-100 transition-opacity" strokeWidth={3} />
            </button>
            <button
              onClick={() => maximizeWindow(win.id)}
              className="w-3 h-3 rounded-full bg-emerald-500/70 hover:bg-emerald-500
                         transition-colors group relative"
            >
              <Maximize2 className="w-1.5 h-1.5 absolute inset-[3px] text-emerald-900 opacity-0 group-hover:opacity-100 transition-opacity" strokeWidth={3} />
            </button>
          </div>

          {/* App icon + Title */}
          <div className="flex items-center gap-2 flex-1 min-w-0">
            {AppIcon && (
              <AppIcon
                className="w-3.5 h-3.5 shrink-0"
                style={{ color: isActive ? user?.accentColor : 'var(--text-muted)' }}
                strokeWidth={1.5}
              />
            )}
            <span className="text-[var(--text-secondary)] text-xs font-medium truncate">
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
