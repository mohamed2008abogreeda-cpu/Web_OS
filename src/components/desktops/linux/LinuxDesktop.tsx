'use client';
import { motion } from 'framer-motion';
import { useOSStore } from '@/store/useOSStore';
import { APP_ICONS } from '@/lib/icons';
import type { AppDefinition } from '@/types';
import LinuxWindow from './LinuxWindow';
import LinuxPanel from './LinuxPanel';

export const LINUX_APPS: AppDefinition[] = [
  { id: 'app-terminal', title: 'Root Terminal', icon: '⌨️', component: 'TerminalApp', defaultWidth: 700, defaultHeight: 500 },
  { id: 'app-projects', title: 'Files', icon: '📂', component: 'ProjectViewer', defaultWidth: 800, defaultHeight: 550 },
  { id: 'app-comms', title: 'Secure Link', icon: '📞', component: 'DiscordCallApp', defaultWidth: 400, defaultHeight: 600 },
  { id: 'app-about', title: 'System Info', icon: '👤', component: 'AboutApp', defaultWidth: 600, defaultHeight: 450 },
  { id: 'app-settings', title: 'Tweaks', icon: '⚙️', component: 'SettingsApp', defaultWidth: 700, defaultHeight: 500 },
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
                className="group w-24 p-2 flex flex-col items-center justify-center gap-1 hover:bg-white/10 rounded-md cursor-pointer text-zinc-400 hover:text-emerald-400 text-xs text-center drop-shadow-md border border-transparent hover:border-white/10 transition-all bg-transparent focus:outline-none"
              >
                {Icon && <Icon className="w-10 h-10 mb-1 drop-shadow-lg text-zinc-400 group-hover:text-emerald-400 transition-colors" strokeWidth={1.5} />}
                <span className="font-medium whitespace-normal leading-tight shadow-black drop-shadow-md break-words">{app.title}</span>
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
