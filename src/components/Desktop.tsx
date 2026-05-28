'use client';
// ============================================================
// Desktop Environment Manager
// Routes to different desktop layouts based on the current user
// ============================================================
import { useOSStore } from '@/store/useOSStore';
import WindowManager from './WindowManager';
import AeroDesktop from './desktops/AeroDesktop';
import MacOSDesktop from './desktops/MacOSDesktop';
import Win11Desktop from './desktops/Win11Desktop';

export default function Desktop() {
  const { currentUser } = useOSStore();

  const themeClass =
    currentUser === 'Mohammed' ? 'os-macos' :
    currentUser === 'Moamen' ? 'os-aero' :
    currentUser === 'Team' ? 'os-windows' : 'os-windows';

  return (
    <div className={`w-full h-full ${themeClass} font-[family-name:var(--font-os)]`}>
      {currentUser === 'Mohammed' && <MacOSDesktop />}
      {currentUser === 'Moamen' && <AeroDesktop />}
      {currentUser === 'Team' && <Win11Desktop />}
      
      {/* Window Manager stays at the top level to persist apps during switch and to render above the desktop background */}
      <div className="absolute inset-0 z-[100] pointer-events-none">
        <WindowManager />
      </div>
    </div>
  );
}
