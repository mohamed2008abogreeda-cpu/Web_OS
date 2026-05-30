'use client';
import { useRef, useState, useCallback } from 'react';
import { Rnd } from 'react-rnd';
import { useOSStore } from '@/store/useOSStore';
import { APP_ICONS, Minus, Maximize2, X, ChevronLeft } from '@/lib/icons';
import type { WindowState } from '@/types';
import AppRenderer from '@/components/apps/AppRenderer';

interface WinWindowProps {
  window: WindowState;
}

export default function WinWindow({ window: win }: WinWindowProps) {
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

  // Windows 11 Mobile responsive layout to optimize layout on narrow viewports
  if (isMobile) {
    return (
      <div
        onMouseDown={handleFocus}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: isActive ? 60 : 40,
          display: win.isMinimized ? 'none' : 'flex',
          pointerEvents: 'auto',
        }}
        className={`relative flex flex-col overflow-hidden bg-[#fafafa] shadow-2xl border-0 font-sans`}
      >
        <div className="h-14 flex items-center justify-between select-none bg-transparent shrink-0 relative border-b border-black/5">
          <div className="flex items-center gap-1 z-10">
            <button
              onClick={() => closeWindow(win.id)}
              className="h-10 px-3 rounded-lg flex items-center gap-1 hover:bg-black/5 active:bg-black/10 transition-colors cursor-pointer text-zinc-700 font-sans"
            >
              <ChevronLeft className="w-5 h-5 text-zinc-700" />
              <span className="text-[15px] font-medium">Back</span>
            </button>
          </div>
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="flex items-center gap-2">
              {AppIcon && <AppIcon className="w-4 h-4 text-pink-500" />}
              <span className="text-[14px] text-zinc-800 font-semibold tracking-wide font-segoe truncate max-w-[160px]">{win.title}</span>
            </div>
          </div>
          <div className="w-20 flex justify-end z-10 pr-2">
            <button onClick={() => closeWindow(win.id)} className="w-9 h-9 rounded-lg hover:bg-red-500/10 active:bg-red-500/20 flex items-center justify-center transition-colors text-zinc-500 hover:text-red-600">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-hidden relative bg-[#fafafa] pb-safe">
          <AppRenderer componentName={win.component as string} windowId={win.id} />
        </div>
      </div>
    );
  }

  // Bulletproof maximization: bypass react-rnd state constraints to eliminate offsets and gaps
  if (win.isMaximized) {
    return (
      <div
        onMouseDown={handleFocus}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: 'calc(100% - 48px)', // Windows Taskbar subtraction (48px)
          zIndex: isActive ? 50 : 10,
          display: win.isMinimized ? 'none' : 'flex',
          pointerEvents: 'auto',
        }}
        className={`relative flex flex-col overflow-hidden bg-[#fafafa] shadow-xl border border-black/10 rounded-none border-0 font-sans transition-shadow ${isActive ? 'shadow-[0_0_30px_rgba(0,0,0,0.15)]' : ''}`}
      >
        <div className="win-drag-handle h-9 flex items-center justify-between select-none bg-transparent">
          <div className="flex items-center gap-3 pl-4">
            {AppIcon && <AppIcon className="w-4 h-4 text-pink-500" />}
            <span className="text-xs text-zinc-800 font-segoe">{win.title}</span>
          </div>
          <div className="flex h-full items-center" onMouseDown={e => e.stopPropagation()}>
            <button onClick={() => minimizeWindow(win.id)} className="hover:bg-black/5 w-11 h-full flex items-center justify-center transition-colors text-zinc-600">
              <Minus className="w-4 h-4" />
            </button>
            <button onClick={() => maximizeWindow(win.id)} className="hover:bg-black/5 w-11 h-full flex items-center justify-center transition-colors text-zinc-600">
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
            <button onClick={() => closeWindow(win.id)} className="hover:bg-red-500 hover:text-white w-11 h-full flex items-center justify-center transition-colors text-zinc-600">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-hidden relative border-t border-black/5 bg-[#fafafa]">
          <AppRenderer componentName={win.component as string} windowId={win.id} />
        </div>
      </div>
    );
  }

  return (
    <Rnd
      ref={rndRef}
      size={{ width: win.width, height: win.height }}
      position={{ x: win.x, y: win.y }}
      disableDragging={false}
      enableResizing={true}
      minWidth={380}
      minHeight={260}
      style={{ display: win.isMinimized ? 'none' : 'flex', pointerEvents: 'auto', transition: 'width 0.2s, height 0.2s, transform 0.2s' }}
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
        className={`relative flex flex-col w-full h-full overflow-hidden bg-white/85 backdrop-blur-2xl shadow-xl border border-black/10 rounded-lg font-sans transition-shadow ${isActive ? 'shadow-[0_0_30px_rgba(0,0,0,0.15)] border-black/20' : ''}`}
        onMouseDown={handleFocus}
      >
        <div className="win-drag-handle h-9 flex items-center justify-between select-none bg-transparent">
          <div className="flex items-center gap-3 pl-4">
            {AppIcon && <AppIcon className="w-4 h-4 text-pink-500" />}
            <span className="text-xs text-zinc-800 font-segoe">{win.title}</span>
          </div>
          <div className="flex h-full items-center" onMouseDown={e => e.stopPropagation()}>
            <button onClick={() => minimizeWindow(win.id)} className="hover:bg-black/5 w-11 h-full flex items-center justify-center transition-colors text-zinc-600">
              <Minus className="w-4 h-4" />
            </button>
            <button onClick={() => maximizeWindow(win.id)} className="hover:bg-black/5 w-11 h-full flex items-center justify-center transition-colors text-zinc-600">
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
            <button onClick={() => closeWindow(win.id)} className="hover:bg-red-500 hover:text-white w-11 h-full flex items-center justify-center transition-colors text-zinc-600">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-hidden relative border-t border-black/5 bg-[#fafafa]">
          {isDragging && <div className="absolute inset-0 z-[999] bg-transparent" />}
          <AppRenderer componentName={win.component as string} windowId={win.id} />
        </div>
      </div>
    </Rnd>
  );
}

