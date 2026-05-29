'use client';
import { useRef, useState, useCallback } from 'react';
import { Rnd } from 'react-rnd';
import { useOSStore } from '@/store/useOSStore';
import { APP_ICONS, Minus, Maximize2, X } from '@/lib/icons';
import type { WindowState } from '@/types';

interface WinWindowProps {
  window: WindowState;
}

export default function WinWindow({ window: win }: WinWindowProps) {
  const {
    activeWindowId,
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

  if (win.isMaximized) {
    return (
      <div 
        className="fixed inset-0 z-50 flex flex-col bg-zinc-900/90 backdrop-blur-xl pointer-events-auto"
        onMouseDown={handleFocus}
      >
        <div className="h-9 flex items-center justify-between select-none bg-transparent">
          <div className="flex items-center gap-3 pl-4">
            {AppIcon && <AppIcon className="w-4 h-4 text-blue-400" />}
            <span className="text-xs text-white/90 font-segoe">{win.title}</span>
          </div>
          <div className="flex h-full items-center">
            <button onClick={() => minimizeWindow(win.id)} className="hover:bg-white/10 w-11 h-full flex items-center justify-center transition-colors text-white/80">
              <Minus className="w-4 h-4" />
            </button>
            <button onClick={() => maximizeWindow(win.id)} className="hover:bg-white/10 w-11 h-full flex items-center justify-center transition-colors text-white/80">
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
            <button onClick={() => closeWindow(win.id)} className="hover:bg-red-600 hover:text-white w-11 h-full flex items-center justify-center transition-colors text-white/80">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-hidden relative border-t border-white/10">
          <win.component />
        </div>
      </div>
    );
  }

  return (
    <Rnd
      ref={rndRef}
      default={{ x: win.x, y: win.y, width: win.width, height: win.height }}
      minWidth={380}
      minHeight={260}
      style={{ display: win.isMinimized ? 'none' : 'flex', pointerEvents: 'auto' }}
      z={isActive ? 50 : 10}
      dragHandleClassName="win-drag-handle"
      onDragStart={() => setIsDragging(true)}
      onDragStop={(_e, d) => { setIsDragging(false); updateWindowPosition(win.id, d.x, d.y); }}
      onResizeStop={(_e, _dir, ref, _delta, pos) => {
        updateWindowSize(win.id, parseInt(ref.style.width, 10), parseInt(ref.style.height, 10));
        updateWindowPosition(win.id, pos.x, pos.y);
      }}
      onMouseDown={handleFocus}
      bounds="parent"
    >
      <div
        className={`relative flex flex-col w-full h-full overflow-hidden bg-zinc-900/80 backdrop-blur-2xl shadow-2xl border border-white/10 rounded-lg font-sans transition-shadow ${isActive ? 'shadow-[0_0_20px_rgba(0,0,0,0.5)] border-white/20' : ''}`}
        onMouseDown={handleFocus}
      >
        <div className="win-drag-handle h-9 flex items-center justify-between select-none bg-transparent">
          <div className="flex items-center gap-3 pl-4">
            {AppIcon && <AppIcon className="w-4 h-4 text-blue-400" />}
            <span className="text-xs text-white/90 font-segoe">{win.title}</span>
          </div>
          <div className="flex h-full items-center" onMouseDown={e => e.stopPropagation()}>
            <button onClick={() => minimizeWindow(win.id)} className="hover:bg-white/10 w-11 h-full flex items-center justify-center transition-colors text-white/80">
              <Minus className="w-4 h-4" />
            </button>
            <button onClick={() => maximizeWindow(win.id)} className="hover:bg-white/10 w-11 h-full flex items-center justify-center transition-colors text-white/80">
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
            <button onClick={() => closeWindow(win.id)} className="hover:bg-red-600 hover:text-white w-11 h-full flex items-center justify-center transition-colors text-white/80">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-hidden relative border-t border-white/5 bg-[#1e1e1e]">
          {isDragging && <div className="absolute inset-0 z-[999] bg-transparent" />}
          <win.component />
        </div>
      </div>
    </Rnd>
  );
}
