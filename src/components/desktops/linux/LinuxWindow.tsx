'use client';
import { useRef, useState, useCallback } from 'react';
import { Rnd } from 'react-rnd';
import { useOSStore } from '@/store/useOSStore';
import { APP_ICONS, Minus, Maximize2, X } from '@/lib/icons';
import type { WindowState } from '@/types';
import AppRenderer from '@/components/apps/AppRenderer';

interface LinuxWindowProps {
  window: WindowState;
}

export default function LinuxWindow({ window: win }: LinuxWindowProps) {
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
        className="fixed inset-0 top-7 z-50 flex flex-col bg-[#121212] border border-[#333] rounded-none pointer-events-auto"
        onMouseDown={handleFocus}
      >
        <div className="h-8 bg-[#202020] border-b border-[#333] flex items-center justify-between px-3 select-none">
          <div className="flex items-center gap-2">
            {AppIcon && <AppIcon className="w-4 h-4 text-zinc-300" />}
            <span className="text-[13px] text-zinc-300 font-sans tracking-wide font-medium">{win.title}</span>
          </div>
          <div className="flex h-full items-center">
            <button onClick={() => minimizeWindow(win.id)} className="hover:bg-white/10 w-8 h-full flex items-center justify-center transition-colors text-zinc-400">
              <Minus className="w-3 h-3" />
            </button>
            <button onClick={() => maximizeWindow(win.id)} className="hover:bg-white/10 w-8 h-full flex items-center justify-center transition-colors text-zinc-400">
              <Maximize2 className="w-3 h-3" />
            </button>
            <button onClick={() => closeWindow(win.id)} className="hover:bg-red-600 hover:text-white w-8 h-full flex items-center justify-center transition-colors text-zinc-400">
              <X className="w-3 h-3" />
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-hidden relative bg-[#121212]">
          <AppRenderer componentName={win.component as string} windowId={win.id} />
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
      dragHandleClassName="linux-drag-handle"
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
        className="relative flex flex-col w-full h-full overflow-hidden bg-[#121212] shadow-2xl border border-[#333] rounded-none font-sans"
        onMouseDown={handleFocus}
      >
        <div className="linux-drag-handle h-8 bg-[#202020] border-b border-[#333] flex items-center justify-between px-3 select-none">
          <div className="flex items-center gap-2">
            {AppIcon && <AppIcon className="w-4 h-4 text-zinc-300" />}
            <span className="text-[13px] text-zinc-300 font-sans tracking-wide font-medium">{win.title}</span>
          </div>
          <div className="flex h-full items-center" onMouseDown={e => e.stopPropagation()}>
            <button onClick={() => minimizeWindow(win.id)} className="hover:bg-white/10 w-8 h-full flex items-center justify-center transition-colors text-zinc-400">
              <Minus className="w-3 h-3" />
            </button>
            <button onClick={() => maximizeWindow(win.id)} className="hover:bg-white/10 w-8 h-full flex items-center justify-center transition-colors text-zinc-400">
              <Maximize2 className="w-3 h-3" />
            </button>
            <button onClick={() => closeWindow(win.id)} className="hover:bg-red-600 hover:text-white w-8 h-full flex items-center justify-center transition-colors text-zinc-400">
              <X className="w-3 h-3" />
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-hidden relative bg-[#121212]">
          {isDragging && <div className="absolute inset-0 z-[999] bg-transparent" />}
          <AppRenderer componentName={win.component as string} windowId={win.id} />
        </div>
      </div>
    </Rnd>
  );
}
