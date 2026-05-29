'use client';
import { motion } from 'framer-motion';
import { useOSStore } from '@/store/useOSStore';
import { APP_ICONS } from '@/lib/icons';
import type { AppDefinition } from '@/types';
import LinuxWindow from './LinuxWindow';
import LinuxPanel from './LinuxPanel';

const LINUX_APPS: AppDefinition[] = [
  { id: 'terminal', title: 'Root Terminal', component: 'TerminalApp', defaultWidth: 700, defaultHeight: 500 },
  { id: 'projects', title: 'Files', component: 'ProjectViewer', defaultWidth: 800, defaultHeight: 550 },
  { id: 'discord', title: 'Secure Link', component: 'DiscordCallApp', defaultWidth: 400, defaultHeight: 600 },
  { id: 'about', title: 'System Info', component: 'AboutApp', defaultWidth: 600, defaultHeight: 450 },
  { id: 'settings', title: 'Tweaks', component: 'SettingsApp', defaultWidth: 700, defaultHeight: 500 },
];

export default function LinuxDesktop() {
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
      className="w-full h-screen overflow-hidden bg-black flex flex-col font-sans select-none relative"
    >
      
      {/* Top Panel */}
      <LinuxPanel />

      {/* Desktop Environment */}
      <div 
        className="relative flex-1 w-full h-full bg-[url('/wallpapers/porsche_dark_wallpaper.png')] bg-cover bg-center bg-no-repeat mt-7"
      >
        {/* CRT Scanlines Overlay with RGB Separation Illusion */}
        <div 
          className="absolute inset-0 pointer-events-none z-[9999] opacity-[0.12]" 
          style={{
            background: `
              linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), 
              linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06))
            `,
            backgroundSize: '100% 4px, 3px 100%'
          }}
        />

        {/* CRT Screen Vignette (Curved Glass Illusion) */}
        <div 
          className="absolute inset-0 pointer-events-none z-[9998] shadow-[inset_0_0_100px_rgba(0,0,0,0.9)]"
        />
        {/* Desktop Icons - Single Click execution guaranteed */}
        <div className="absolute top-0 left-0 flex flex-col gap-2 p-4 pt-4">
          {LINUX_APPS.map(app => {
            const Icon = APP_ICONS[app.id];
            return (
              <button 
                key={app.id}
                onClick={() => openWindow(app)}
                className="w-20 p-2 flex flex-col items-center justify-center gap-1 hover:bg-white/10 rounded-md cursor-pointer text-white text-xs text-center drop-shadow-md border border-transparent hover:border-white/10 transition-all bg-transparent focus:outline-none"
              >
                {Icon && <Icon className="w-10 h-10 mb-1 drop-shadow-lg text-fuchsia-400" strokeWidth={1.5} />}
                <span className="font-medium truncate w-full shadow-black drop-shadow-md">{app.title}</span>
              </button>
            );
          })}
        </div>

        {/* Render Open Windows STRICTLY using LinuxWindow */}
        {windows.map(win => (
          <LinuxWindow key={win.id} window={win} />
        ))}
      </div>
    </motion.div>
  );
}
