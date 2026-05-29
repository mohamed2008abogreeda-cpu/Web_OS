import React from 'react';
import { useOSStore } from '@/store/useOSStore';

const Taskbar = () => {
  const currentUser = useOSStore((state) => state.currentUser);
  const openApps = useOSStore((state) => state.windows);

  if (currentUser === "Team") {
    return (
      <div className="absolute top-0 left-0 w-full h-8 bg-[#09090b] border-b-2 border-[#e11d48] z-[100] flex items-center px-4 font-mono text-[#e11d48] text-xs justify-between shadow-[0_4px_0_rgba(225,29,72,0.2)]">
        <div className="flex gap-4">
          <span>ROOT_ACCESS // SYS_SECURE</span>
          <span className="animate-pulse">_</span>
        </div>
        <div>ACTIVE_PROCESSES: [{openApps.length}]</div>
      </div>
    );
  }

  if (currentUser === "Mohammed") {
    return (
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 h-16 bg-os-bg shadow-os rounded-os z-[100] flex items-center px-4 gap-4 border border-[rgba(255,255,255,0.08)]"
           style={{ backdropFilter: "var(--os-blur)", WebkitBackdropFilter: "var(--os-blur)" }}>
        <div className="w-11 h-11 bg-white/10 rounded-full hover:scale-110 transition-transform cursor-pointer border border-white/5" />
        <div className="w-11 h-11 bg-os-accent/50 rounded-full hover:scale-110 transition-transform cursor-pointer border border-os-accent/20" />
      </div>
    );
  }

  if (currentUser === "Moamen") {
    return (
      <div className="absolute bottom-0 left-0 w-full h-12 bg-os-bg border-t border-[rgba(139,92,246,0.3)] z-[100] flex items-center justify-center gap-4 shadow-[0_0_30px_rgba(139,92,246,0.15)]"
           style={{ backdropFilter: "var(--os-blur)", WebkitBackdropFilter: "var(--os-blur)" }}>
        <div className="w-9 h-9 bg-white/5 rounded-md relative cursor-pointer hover:bg-white/10 transition-colors">
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-1 bg-[#8b5cf6] rounded-t-md shadow-[0_0_10px_#8b5cf6]" />
        </div>
      </div>
    );
  }

  return null;
};

export default Taskbar;
