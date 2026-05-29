import React from 'react';
import { useOSStore } from '@/store/useOSStore';

export const Taskbar = () => {
  const currentUser = useOSStore((state) => state.currentUser);
  const openApps = useOSStore((state) => state.windows);

  // 1. Team Persona: Top Hacker Status Bar
  if (currentUser === "Team") {
    return (
      <div className="absolute top-0 left-0 w-full h-8 bg-[#09090b] border-b-2 border-[#e11d48] z-[100] flex items-center px-4 font-mono text-[#e11d48] text-xs justify-between shadow-[0_4px_0_rgba(225,29,72,0.2)]">
        <div className="flex gap-4">
          <span>ROOT_ACCESS // SYS_SECURE</span>
          <span className="animate-pulse">_</span>
        </div>
        <div>
          ACTIVE_PROCESSES: [{openApps.length}]
        </div>
      </div>
    );
  }

  // 2. Mohammed Persona: Floating macOS Glass Dock
  if (currentUser === "Mohammed") {
    return (
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 h-16 bg-os-bg shadow-os shadow-os-border rounded-os z-[100] flex items-center px-4 gap-4"
           style={{ backdropFilter: "var(--os-blur)", WebkitBackdropFilter: "var(--os-blur)" }}>
        {/* سيتم وضع الأيقونات هنا لاحقاً باستخدام Framer Motion Scale */}
        <div className="w-10 h-10 bg-white/10 rounded-full hover:scale-110 transition-transform cursor-pointer" />
        <div className="w-10 h-10 bg-white/10 rounded-full hover:scale-110 transition-transform cursor-pointer" />
      </div>
    );
  }

  // 3. Moamen Persona: Windows 11 Full-width Glowing Taskbar
  if (currentUser === "Moamen") {
    return (
      <div className="absolute bottom-0 left-0 w-full h-12 bg-os-bg border-t border-[rgba(139,92,246,0.5)] z-[100] flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(139,92,246,0.2)]"
           style={{ backdropFilter: "var(--os-blur)", WebkitBackdropFilter: "var(--os-blur)" }}>
        <div className="w-8 h-8 bg-white/10 rounded-md relative cursor-pointer hover:bg-white/20 transition-colors">
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-1 bg-[#8b5cf6] rounded-t-md shadow-[0_0_10px_#8b5cf6]" />
        </div>
      </div>
    );
  }

  return null;
};
