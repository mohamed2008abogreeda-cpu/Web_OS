'use client';
import { useRef, useState, useCallback } from 'react';
import { Rnd } from 'react-rnd';
import { useOSStore } from '@/store/useOSStore';
import { APP_ICONS } from '@/lib/icons';
import type { WindowState } from '@/types';
import { Maximize2 } from 'lucide-react';
import AppRenderer from '@/components/apps/AppRenderer';

interface MacWindowProps {
  window: WindowState;
}

export default function MacWindow({ window: win }: MacWindowProps) {
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
  const [hoverControls, setHoverControls] = useState(false);

  const handleFocus = useCallback(() => {
    if (!isActive) focusWindow(win.id);
  }, [isActive, focusWindow, win.id]);

  const trafficLightControls = (
    <div 
      className="flex items-center gap-2 h-full px-4" 
      onMouseEnter={() => setHoverControls(true)}
      onMouseLeave={() => setHoverControls(false)}
      onMouseDown={e => e.stopPropagation()}
    >
      <button 
        onClick={() => closeWindow(win.id)} 
        className="w-3 h-3 rounded-full bg-[#ff5f56] border border-[#e0443e] flex items-center justify-center shadow-inner"
      >
        {hoverControls && <div className="w-2 h-2 text-black/50 leading-none">x</div>}
      </button>
      <button 
        onClick={() => minimizeWindow(win.id)} 
        className="w-3 h-3 rounded-full bg-[#ffbd2e] border border-[#dea123] flex items-center justify-center shadow-inner"
      >
        {hoverControls && <div className="w-2 h-0.5 bg-black/50 leading-none" />}
      </button>
      <button 
        onClick={() => maximizeWindow(win.id)} 
        className="w-3 h-3 rounded-full bg-[#27c93f] border border-[#1aab29] flex items-center justify-center shadow-inner"
      >
        {hoverControls && <Maximize2 className="w-2 h-2 text-black/50" />}
      </button>
    </div>
  );

  if (win.isMaximized) {
    return (
      <div 
        className="fixed inset-0 z-50 flex flex-col bg-black/40 backdrop-blur-3xl shadow-2xl rounded-none pointer-events-auto"
        onMouseDown={handleFocus}
      >
        <div className="h-10 bg-white/10 border-b border-white/5 flex items-center select-none relative backdrop-blur-md">
          {trafficLightControls}
          <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2">
            {AppIcon && <AppIcon className="w-4 h-4 text-white/80" />}
            <span className="text-sm text-white/90 font-medium tracking-wide">{win.title}</span>
          </div>
        </div>
        <div className="flex-1 overflow-hidden relative">
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
      dragHandleClassName="mac-drag-handle"
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
        className={`relative flex flex-col w-full h-full overflow-hidden bg-black/40 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/10 rounded-xl font-sans transition-shadow ${isActive ? 'shadow-[0_30px_60px_rgba(0,0,0,0.6)] border-white/20' : ''}`}
        onMouseDown={handleFocus}
      >
        <div className="mac-drag-handle h-10 bg-white/5 border-b border-white/10 flex items-center select-none relative backdrop-blur-3xl">
          {trafficLightControls}
          <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2">
            {AppIcon && <AppIcon className="w-4 h-4 text-white/80" />}
            <span className="text-sm text-white/90 font-medium tracking-wide drop-shadow-sm">{win.title}</span>
          </div>
        </div>
        <div className="flex-1 overflow-hidden relative">
          {isDragging && <div className="absolute inset-0 z-[999] bg-transparent" />}
          <AppRenderer componentName={win.component as string} windowId={win.id} />
        </div>
      </div>
    </Rnd>
  );
}
