'use client';
import { useRef, useCallback, useState } from 'react';
import { Rnd } from 'react-rnd';
import { motion, AnimatePresence } from 'framer-motion';
import { useOSStore } from '@/store/useOSStore';
import { APP_ICONS, Minus, Maximize2, X, ChevronLeft } from '@/lib/icons';
import type { WindowState } from '@/types';

interface WindowWrapperProps {
  window: WindowState;
  children: React.ReactNode;
}

export default function WindowWrapper({ window: win, children }: WindowWrapperProps) {
  const activeWindowId = useOSStore((state) => state.activeWindowId);
  const isMobile = useOSStore((state) => state.isMobile);
  const focusWindow = useOSStore((state) => state.focusWindow);
  const closeWindow = useOSStore((state) => state.closeWindow);
  const minimizeWindow = useOSStore((state) => state.minimizeWindow);
  const maximizeWindow = useOSStore((state) => state.maximizeWindow);
  const updateWindowPosition = useOSStore((state) => state.updateWindowPosition);
  const updateWindowSize = useOSStore((state) => state.updateWindowSize);

  const isActive = activeWindowId === win.id;
  const rndRef = useRef<Rnd>(null);
  const AppIcon = APP_ICONS[win.appId];
  const [isDragging, setIsDragging] = useState(false);

  const handleFocus = useCallback(() => {
    if (!isActive) focusWindow(win.id);
  }, [isActive, focusWindow, win.id]);

  if (isMobile) {
    return (
      <AnimatePresence>
        <motion.div
          className="fixed inset-0 z-50 flex flex-col pointer-events-auto bg-os-bg backdrop-blur-[var(--os-blur)]"
          initial={{ opacity: 0, scale: 0.94, y: 36 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 36 }}
          transition={{ type: 'spring', stiffness: 260, damping: 26 }}
          onClick={handleFocus}
        >
          <div className="h-[60px] flex items-center justify-between px-4 gap-2 shrink-0 select-none pb-safe border-b border-os-border bg-black/20">
            <div className="flex items-center gap-3">
               <button onClick={() => closeWindow(win.id)} className="h-11 px-3 rounded-xl flex items-center gap-1 hover:bg-white/5 active:bg-white/10 transition-all duration-150 cursor-pointer text-os-accent">
                 <ChevronLeft className="w-5 h-5" />
                 <span className="text-[17px] font-medium">Back</span>
               </button>
            </div>
            <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2">
               {AppIcon && <AppIcon className="w-4 h-4 text-os-accent" />}
               <span className="text-[17px] font-semibold truncate text-white">{win.title}</span>
            </div>
          </div>
          <div className="flex-1 overflow-hidden relative">
            {children}
          </div>
        </motion.div>
      </AnimatePresence>
    );
  }

  return (
    <Rnd
      ref={rndRef}
      size={win.isMaximized ? { width: '100%', height: '100%' } : { width: win.width, height: win.height }}
      position={win.isMaximized ? { x: 0, y: 0 } : { x: win.x, y: win.y }}
      disableDragging={win.isMaximized}
      enableResizing={!win.isMaximized}
      minWidth={380}
      minHeight={260}
      style={{ display: win.isMinimized ? 'none' : 'flex', pointerEvents: 'auto', transition: 'width 0.2s, height 0.2s, transform 0.2s' }}
      z={isActive ? 50 : 10}
      dragHandleClassName="window-drag-handle"
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
        initial={{ scale: 0.95, opacity: 0, y: 15 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 15 }}
        transition={{ type: "spring", stiffness: 350, damping: 25 }}
        style={{ backdropFilter: "var(--os-blur)", WebkitBackdropFilter: "var(--os-blur)" }}
        className={`relative flex flex-col w-full h-full overflow-hidden bg-os-bg shadow-os shadow-os-border rounded-os border border-os-border ${
          useOSStore.getState().currentUser === "Team" ? "font-mono" : "font-sans"
        }`}
        onMouseDown={handleFocus}
      >
        <div className="window-drag-handle h-12 flex items-center justify-between px-4 shrink-0 select-none border-b border-os-border bg-black/30">
          <div className="flex items-center gap-3">
            {AppIcon && <AppIcon className="w-4 h-4 shrink-0 text-os-accent" strokeWidth={2} />}
            <span className="text-sm font-semibold truncate select-none text-white/90">{win.title}</span>
          </div>
          <div className="flex items-center gap-2 h-full" onMouseDown={(e) => e.stopPropagation()} onTouchStart={(e) => e.stopPropagation()}>
            <button onClick={(e) => { e.stopPropagation(); minimizeWindow(win.id); }} className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors cursor-pointer hover:bg-white/10 text-white/50 hover:text-white"><Minus className="w-4 h-4" strokeWidth={2} /></button>
            <button onClick={(e) => { e.stopPropagation(); maximizeWindow(win.id); }} className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors cursor-pointer hover:bg-white/10 text-white/50 hover:text-white"><Maximize2 className="w-3.5 h-3.5" strokeWidth={2} /></button>
            <button onClick={(e) => { e.stopPropagation(); closeWindow(win.id); }} className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors cursor-pointer hover:bg-rose-500/20 hover:text-rose-400 text-white/50"><X className="w-4 h-4" strokeWidth={2} /></button>
          </div>
        </div>
        <div className="flex-1 overflow-hidden relative">
          {isDragging && <div className="absolute inset-0 z-[999] bg-transparent" />}
          {children}
        </div>
      </motion.div>
    </Rnd>
  );
}
