'use client';
import { useRef, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Rnd } from 'react-rnd';
import { useOSStore } from '@/store/useOSStore';
import { APP_ICONS, Minus, Maximize2, X, ChevronLeft } from '@/lib/icons';
import type { WindowState } from '@/types';
import AppRenderer from '@/components/apps/AppRenderer';

interface LinuxWindowProps {
  window: WindowState;
}

export default function LinuxWindow({ window: win }: LinuxWindowProps) {
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

  // Gnome Mobile responsive layout to optimize layout on narrow viewports
  if (isMobile) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 30 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
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
        className="flex flex-col bg-[#121212] border-0 font-sans"
      >
        <div className="h-14 bg-[#202020] border-b border-[#333] flex items-center justify-between px-3 select-none shrink-0 relative">
          <div className="flex items-center gap-1 z-10">
            <button
              onClick={() => closeWindow(win.id)}
              className="h-10 px-3 rounded-lg flex items-center gap-1 hover:bg-white/5 active:bg-white/10 transition-colors cursor-pointer text-emerald-400 font-sans"
            >
              <ChevronLeft className="w-5 h-5 text-emerald-400" />
              <span className="text-[15px] font-medium">Back</span>
            </button>
          </div>
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="flex items-center gap-2">
              {AppIcon && <AppIcon className="w-4 h-4 text-zinc-300" />}
              <span className="text-[15px] text-zinc-200 font-semibold tracking-wide font-sans truncate max-w-[160px]">{win.title}</span>
            </div>
          </div>
          <div className="w-16 flex justify-end z-10">
            <button onClick={() => closeWindow(win.id)} className="w-8 h-8 rounded-full hover:bg-red-600/20 active:bg-red-600/30 flex items-center justify-center transition-colors text-zinc-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-hidden relative bg-[#121212] pb-safe">
          <AppRenderer componentName={win.component as string} windowId={win.id} />
        </div>
      </motion.div>
    );
  }

  // Bulletproof maximization: bypass react-rnd state constraints to eliminate offsets and gaps
  if (win.isMaximized) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.15, ease: "easeOut" }}
        onMouseDown={handleFocus}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: isActive ? 50 : 10,
          display: win.isMinimized ? 'none' : 'flex',
          pointerEvents: 'auto',
        }}
        className="relative flex flex-col overflow-hidden bg-[#121212] shadow-2xl border border-[#333] rounded-none border-0 font-sans"
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
          <AppRenderer componentName={win.component as string} windowId={win.id} />
        </div>
      </motion.div>
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
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96 }}
        transition={{ duration: 0.15, ease: "easeOut" }}
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
      </motion.div>
    </Rnd>
  );
}

