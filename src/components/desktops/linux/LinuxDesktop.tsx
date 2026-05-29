'use client';
import { useOSStore } from '@/store/useOSStore';
import { SYSTEM_APPS } from '@/lib/mockData';
import { APP_ICONS } from '@/lib/icons';
import LinuxWindow from './LinuxWindow';
import LinuxPanel from './LinuxPanel';

export default function LinuxDesktop() {
  const { windows, openWindow } = useOSStore();

  return (
    <div className="w-full h-screen overflow-hidden bg-black flex flex-col font-sans select-none">
      
      {/* Top Panel */}
      <LinuxPanel />

      {/* Desktop Environment */}
      <div 
        className="relative flex-1 w-full h-full bg-[url('/wallpapers/porsche_dark_wallpaper.png')] bg-cover bg-center bg-no-repeat mt-7"
      >
        {/* Desktop Icons */}
        <div className="absolute top-0 left-0 flex flex-col gap-2 p-4 pt-4">
          {SYSTEM_APPS.map(app => {
            const Icon = APP_ICONS[app.id];
            return (
              <div 
                key={app.id}
                onClick={() => openWindow(app)}
                className="w-20 p-2 flex flex-col items-center justify-center gap-1 hover:bg-white/10 rounded-md cursor-pointer text-white text-xs text-center drop-shadow-md border border-transparent hover:border-white/10 transition-all"
              >
                {Icon && <Icon className="w-10 h-10 mb-1 drop-shadow-lg text-emerald-400" strokeWidth={1.5} />}
                <span className="font-medium truncate w-full shadow-black drop-shadow-md">{app.title}</span>
              </div>
            );
          })}
        </div>

        {/* Render Open Windows */}
        {windows.map(win => (
          <LinuxWindow key={win.id} window={win} />
        ))}
      </div>
    </div>
  );
}
