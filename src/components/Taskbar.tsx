import React from 'react';
import { useOSStore } from '@/store/useOSStore';
import { Terminal, Phone, FolderGit2, Settings, User } from 'lucide-react';
import { SYSTEM_APPS } from '@/lib/mockData';
import type { LucideIcon } from 'lucide-react';

// ── Taskbar icon mapping (LucideIcon keyed by app id) ──
const ICON_MAP: Record<string, LucideIcon> = {
  'app-about': User,
  'app-projects': FolderGit2,
  'app-terminal': Terminal,
  'app-comms': Phone,
  'app-settings': Settings,
};

const Taskbar = () => {
  const currentUser = useOSStore((state) => state.currentUser);
  const openApps = useOSStore((state) => state.windows);
  const openWindow = useOSStore((state) => state.openWindow);
  const activeWindowId = useOSStore((state) => state.activeWindowId);

  if (currentUser === "Team") {
    return (
      <div className="absolute top-0 left-0 w-full h-8 bg-[#09090b] border-b-2 border-[#e11d48] z-[100] flex items-center px-4 font-mono text-[#e11d48] text-xs justify-between shadow-[0_4px_0_rgba(225,29,72,0.2)] select-none">
        <div className="flex gap-4">
          <span>ROOT_ACCESS // SYS_SECURE</span>
          <span className="animate-pulse">_</span>
        </div>
        <div className="flex gap-4 items-center">
          {SYSTEM_APPS.map(app => (
            <button key={app.id} onClick={() => openWindow(app)} className="hover:text-white transition-colors uppercase tracking-widest cursor-pointer">
              [{app.id}]
            </button>
          ))}
          <span className="ml-4 text-white/40">PROCESSES: {openApps.length}</span>
        </div>
      </div>
    );
  }

  if (currentUser === "Mohammed") {
    return (
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 h-16 bg-os-bg shadow-os rounded-os z-[100] flex items-center px-4 gap-4 border border-[rgba(255,255,255,0.08)]"
           style={{ backdropFilter: "var(--os-blur)", WebkitBackdropFilter: "var(--os-blur)" }}>
        {SYSTEM_APPS.map(app => {
          const Icon = ICON_MAP[app.id];
          const isActive = openApps.some(w => w.appId === app.id);
          return (
            <div key={app.id} onClick={() => openWindow(app)} className="relative group flex justify-center">
              <div className={`w-11 h-11 rounded-full flex items-center justify-center cursor-pointer transition-all duration-300 hover:scale-[1.2] hover:-translate-y-2 ${isActive ? 'bg-os-accent/20 border-os-accent/50' : 'bg-white/5 border-white/10 hover:bg-white/10'} border`}>
                {Icon && <Icon className={`w-5 h-5 ${isActive ? 'text-os-accent' : 'text-white/70 group-hover:text-white'}`} />}
              </div>
              {isActive && <div className="absolute -bottom-1.5 w-1 h-1 rounded-full bg-os-accent shadow-[0_0_5px_var(--os-accent)]" />}
            </div>
          );
        })}
      </div>
    );
  }

  if (currentUser === "Moamen") {
    return (
      <div className="absolute bottom-0 left-0 w-full h-12 bg-os-bg border-t border-[rgba(139,92,246,0.3)] z-[100] flex items-center justify-center gap-4 shadow-[0_0_30px_rgba(139,92,246,0.15)]"
           style={{ backdropFilter: "var(--os-blur)", WebkitBackdropFilter: "var(--os-blur)" }}>
        {SYSTEM_APPS.map(app => {
          const Icon = ICON_MAP[app.id];
          const isActive = openApps.some(w => w.appId === app.id);
          const isFocused = activeWindowId?.includes(app.id);
          return (
            <div key={app.id} onClick={() => openWindow(app)} className={`w-10 h-10 rounded-md relative cursor-pointer flex items-center justify-center transition-all duration-200 ${isActive ? 'bg-white/10' : 'hover:bg-white/5'}`}>
              {Icon && <Icon className={`w-5 h-5 ${isActive ? 'text-os-accent' : 'text-zinc-400'}`} />}
              {isActive && (
                <div className={`absolute bottom-0 left-1/2 -translate-x-1/2 h-1 bg-os-accent rounded-t-md transition-all duration-300 shadow-[0_0_10px_var(--os-accent)] ${isFocused ? 'w-6' : 'w-2'}`} />
              )}
            </div>
          );
        })}
      </div>
    );
  }

  return null;
};

export default Taskbar;
