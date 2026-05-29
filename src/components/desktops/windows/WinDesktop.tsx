'use client';
import { useOSStore } from '@/store/useOSStore';
import { SYSTEM_APPS } from '@/lib/mockData';
import { APP_ICONS } from '@/lib/icons';
import WinWindow from './WinWindow';
import WinTaskbar from './WinTaskbar';

export default function WinDesktop() {
  const { windows, openWindow } = useOSStore();

  return (
    <div className="w-full h-screen overflow-hidden bg-black flex flex-col font-segoe select-none relative">
      
      {/* Desktop Environment */}
      <div 
        className="absolute inset-0 z-0 w-full h-full bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: 'url(/wallpaper.jpg)' }} // Standard Win11 Bloom wallpaper equivalent
      >
        {/* Desktop Icons (Top-Left to Bottom) */}
        <div className="absolute top-0 left-0 flex flex-col gap-2 p-2 pt-4">
          {SYSTEM_APPS.map(app => {
            const Icon = APP_ICONS[app.id];
            return (
              <div 
                key={app.id}
                onClick={() => openWindow(app)}
                className="w-20 p-2 flex flex-col items-center justify-center gap-1.5 hover:bg-white/10 rounded-sm border border-transparent hover:border-white/20 cursor-pointer text-white text-xs text-center drop-shadow-md transition-colors"
              >
                {Icon && <Icon className="w-8 h-8 drop-shadow-lg text-blue-400" strokeWidth={1.5} />}
                <span className="font-medium truncate w-full drop-shadow-md text-[11px]">{app.title}</span>
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

    </div>
  );
}
