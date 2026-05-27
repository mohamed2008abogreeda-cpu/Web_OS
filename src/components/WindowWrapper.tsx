'use client';
// ============================================================
// WindowWrapper — Draggable, resizable window using react-rnd
// ============================================================
import { useRef, useCallback } from 'react';
import { Rnd } from 'react-rnd';
import { motion, AnimatePresence } from 'framer-motion';
import { useOSStore } from '@/store/useOSStore';
import type { WindowState } from '@/types';

interface WindowWrapperProps {
  window: WindowState;
  children: React.ReactNode;
}

export default function WindowWrapper({ window: win, children }: WindowWrapperProps) {
  const {
    closeWindow,
    minimizeWindow,
    maximizeWindow,
    focusWindow,
    updateWindowPosition,
    updateWindowSize,
    activeWindowId,
  } = useOSStore();

  const rndRef = useRef<Rnd>(null);
  const isActive = activeWindowId === win.id;

  const handleFocus = useCallback(() => {
    if (!isActive) focusWindow(win.id);
  }, [isActive, focusWindow, win.id]);

  if (win.isMinimized) return null;

  const isMax = win.isMaximized;

  return (
    <AnimatePresence>
      <Rnd
        ref={rndRef}
        default={{
          x: win.x,
          y: win.y,
          width: win.width,
          height: win.height,
        }}
        position={isMax ? { x: 0, y: 0 } : undefined}
        size={
          isMax
            ? { width: '100%', height: 'calc(100vh - 56px)' }
            : undefined
        }
        disableDragging={isMax}
        enableResizing={!isMax}
        minWidth={360}
        minHeight={240}
        bounds="parent"
        dragHandleClassName="window-drag-handle"
        style={{ zIndex: win.zIndex }}
        onDragStart={handleFocus}
        onDragStop={(_e, d) => {
          updateWindowPosition(win.id, d.x, d.y);
        }}
        onResizeStop={(_e, _dir, ref, _delta, position) => {
          updateWindowSize(
            win.id,
            parseInt(ref.style.width),
            parseInt(ref.style.height)
          );
          updateWindowPosition(win.id, position.x, position.y);
        }}
        onMouseDown={handleFocus}
        data-testid={`window-${win.appId}`}
      >
        <motion.div
          className={`
            flex flex-col w-full h-full rounded-xl overflow-hidden
            border backdrop-blur-2xl shadow-2xl
            ${isActive
              ? 'border-white/[0.12] bg-gray-950/90 shadow-black/60'
              : 'border-white/[0.06] bg-gray-950/80 shadow-black/40 opacity-95'
            }
          `}
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.92 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
        >
          {/* ─── Title Bar ────────────────────────────── */}
          <div
            className={`
              window-drag-handle flex items-center justify-between h-10 px-3
              border-b select-none cursor-default shrink-0
              ${isActive ? 'border-white/[0.08] bg-white/[0.03]' : 'border-white/[0.04] bg-white/[0.01]'}
            `}
            onDoubleClick={() => maximizeWindow(win.id)}
          >
            {/* Window Controls (macOS style) */}
            <div className="flex items-center gap-2">
              <button
                onClick={(e) => { e.stopPropagation(); closeWindow(win.id); }}
                className="w-3 h-3 rounded-full bg-red-500/80 hover:bg-red-500 transition-colors
                           flex items-center justify-center group"
                data-testid={`close-${win.appId}`}
                aria-label="Close"
              >
                <svg className="w-1.5 h-1.5 text-red-900 opacity-0 group-hover:opacity-100" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth={4} strokeLinecap="round" />
                </svg>
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); minimizeWindow(win.id); }}
                className="w-3 h-3 rounded-full bg-yellow-500/80 hover:bg-yellow-500 transition-colors
                           flex items-center justify-center group"
                aria-label="Minimize"
              >
                <svg className="w-1.5 h-1.5 text-yellow-900 opacity-0 group-hover:opacity-100" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M5 12h14" stroke="currentColor" strokeWidth={4} strokeLinecap="round" />
                </svg>
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); maximizeWindow(win.id); }}
                className="w-3 h-3 rounded-full bg-green-500/80 hover:bg-green-500 transition-colors
                           flex items-center justify-center group"
                aria-label="Maximize"
              >
                <svg className="w-1.5 h-1.5 text-green-900 opacity-0 group-hover:opacity-100" fill="currentColor" viewBox="0 0 24 24">
                  <rect x="4" y="4" width="16" height="16" rx="2" stroke="currentColor" strokeWidth={3} fill="none" />
                </svg>
              </button>
            </div>

            {/* Title */}
            <span className="text-gray-400 text-xs font-medium tracking-wide truncate mx-4">
              {win.title}
            </span>

            {/* Spacer for symmetry */}
            <div className="w-16" />
          </div>

          {/* ─── Content ──────────────────────────────── */}
          <div className="flex-1 overflow-hidden">
            {children}
          </div>
        </motion.div>
      </Rnd>
    </AnimatePresence>
  );
}
