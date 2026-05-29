'use client';
// ============================================================
// Desktop Environment Manager
// Routes to different desktop layouts based on the current user
// ============================================================
import { useOSStore } from '@/store/useOSStore';
import { useSpectatorSync } from '@/hooks/useSpectatorSync';
import WindowManager from './WindowManager';
import Taskbar from './Taskbar';
import MobileLauncher from './desktops/MobileLauncher';
import GhostCursor from './GhostCursor';
import { Toaster } from 'sonner';

export default function Desktop() {
  const { currentUser, isMobile } = useOSStore();
  useSpectatorSync();

  return (
    <div className="w-full h-full relative bg-os-bg text-white font-[family-name:var(--font-os)] overflow-hidden">
      <Toaster position="bottom-right" theme="dark" />
      <GhostCursor />
      
      {isMobile ? (
        <MobileLauncher />
      ) : (
        <Taskbar />
      )}
      
      {/* Window Manager stays at the top level to persist apps during switch and to render above the desktop background */}
      <div className="absolute inset-0 z-[100] pointer-events-none">
        <WindowManager />
      </div>
    </div>
  );
}
