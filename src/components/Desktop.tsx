'use client';
// ============================================================
// Desktop Environment Manager
// Routes to different desktop layouts based on the current user
// ============================================================
import { useOSStore, broadcastCursor } from '@/store/useOSStore';
import WindowManager from './WindowManager';
import AeroDesktop from './desktops/AeroDesktop';
import MacOSDesktop from './desktops/MacOSDesktop';
import Win11Desktop from './desktops/Win11Desktop';
import MobileLauncher from './desktops/MobileLauncher';
import GhostCursor from './GhostCursor';
import { Toaster } from 'sonner';

export default function Desktop() {
  const { currentUser, isSpectating, isMobile } = useOSStore();

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isSpectating) {
      broadcastCursor(e.clientX, e.clientY);
    }
  };

  return (
    <div 
      className="w-full h-full bg-zinc-950 text-white font-[family-name:var(--font-os)] overflow-hidden"
      onMouseMove={handleMouseMove}
    >
      <Toaster position="bottom-right" theme="dark" />
      <GhostCursor />
      
      {isMobile ? (
        <MobileLauncher />
      ) : (
        <>
          {currentUser === 'Mohammed' && <MacOSDesktop />}
          {currentUser === 'Moamen' && <AeroDesktop />}
          {currentUser === 'Team' && <Win11Desktop />}
        </>
      )}
      
      {/* Window Manager stays at the top level to persist apps during switch and to render above the desktop background */}
      <div className="absolute inset-0 z-[100] pointer-events-none">
        <WindowManager />
      </div>
    </div>
  );
}
