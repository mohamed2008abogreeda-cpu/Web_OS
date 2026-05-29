'use client';
import { useOSStore } from '@/store/useOSStore';
import { motion } from 'framer-motion';
import { SYSTEM_APPS } from '@/lib/mockData';
import { APP_ICONS } from '@/lib/icons';
import WinWindow from './WinWindow';
import WinTaskbar from './WinTaskbar';

export default function WinDesktop() {
  const { windows, openWindow } = useOSStore();

  return (
    <motion.div 
      initial={{ scaleX: 0, scaleY: 0.01, filter: 'brightness(3) contrast(2)' }}
      animate={{ 
        scaleX: [0, 1, 1], 
        scaleY: [0.01, 0.01, 1], 
        filter: ['brightness(3) contrast(2)', 'brightness(2) contrast(1.5)', 'brightness(1) contrast(1)'] 
      }}
      exit={{ 
        scaleX: [1, 1, 0], 
        scaleY: [1, 0.01, 0.01], 
        filter: ['brightness(1) contrast(1)', 'brightness(2) contrast(1.5)', 'brightness(3) contrast(2)'] 
      }}
      transition={{ duration: 0.6, times: [0, 0.4, 1], ease: "easeInOut" }}
      className="w-full h-screen overflow-hidden bg-zinc-100 flex flex-col font-segoe select-none relative"
    >
      
      {/* Desktop Environment */}
      <div 
        className="absolute inset-0 z-0 w-full h-full bg-cover bg-center bg-no-repeat bg-[#f0f0f0]"
        style={{ backgroundImage: 'url(/wallpapers/porsche-pink.jpeg)' }} 
      >
        {/* Desktop Icons (Top-Left to Bottom) */}
        <div className="absolute top-0 left-0 flex flex-col gap-2 p-2 pt-4">
          {SYSTEM_APPS.map(app => {
            const Icon = APP_ICONS[app.id];
            return (
              <div 
                key={app.id}
                onClick={() => openWindow(app)}
                className="w-20 p-2 flex flex-col items-center justify-center gap-1.5 hover:bg-black/5 rounded-sm border border-transparent hover:border-black/10 cursor-pointer text-zinc-900 text-xs text-center transition-colors"
              >
                <div className="w-10 h-10 flex items-center justify-center bg-white/80 backdrop-blur-md rounded-lg shadow-sm border border-black/5">
                  {Icon && <Icon className="w-5 h-5 text-pink-600" strokeWidth={1.5} />}
                </div>
                <span className="font-semibold truncate w-full bg-white/60 px-1 py-0.5 rounded backdrop-blur-sm text-[11px] border border-black/5 shadow-sm">{app.title}</span>
              </div>
            );
          })}
        </div>

        {/* Render Open Windows */}
        {windows.map(win => (
          <WinWindow key={win.id} window={win} />
        ))}
      </div>

      {/* Bottom Taskbar */}
      <WinTaskbar />

    </motion.div>
  );
}
