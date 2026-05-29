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
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="w-full h-screen overflow-hidden bg-black flex flex-col font-sans select-none"
    >
      
      {/* Top Panel */}
      <LinuxPanel />

      {/* Desktop Environment */}
      <div 
        className="relative flex-1 w-full h-full bg-[url('/wallpapers/linux-unix-dark.jpg')] bg-cover bg-center bg-no-repeat mt-7"
      >
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
