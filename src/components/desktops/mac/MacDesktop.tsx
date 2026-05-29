'use client';
import { useOSStore } from '@/store/useOSStore';
import MacWindow from './MacWindow';
import MacTaskbar from './MacTaskbar';

export default function MacDesktop() {
  const { windows } = useOSStore();

  return (
    <div className="w-full h-screen overflow-hidden bg-black flex flex-col font-sans select-none relative">
      
      {/* Top Menu Bar (macOS standard) */}
      <div className="w-full h-6 bg-black/40 backdrop-blur-md flex items-center px-4 justify-between z-[100] text-xs text-white/90 border-b border-white/10 shadow-sm relative">
        <div className="flex items-center gap-4 font-semibold">
          <span></span>
          <span className="font-bold">Finder</span>
          <span className="opacity-80">File</span>
          <span className="opacity-80">Edit</span>
          <span className="opacity-80">View</span>
          <span className="opacity-80">Go</span>
          <span className="opacity-80">Window</span>
          <span className="opacity-80">Help</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="opacity-80">100%</span>
          <span>{new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute:'2-digit' })}</span>
        </div>
      </div>

      {/* Desktop Environment */}
      <div 
        className="absolute inset-0 z-0 w-full h-full bg-cover bg-center bg-no-repeat bg-[#0d0e15]"
        style={{ backgroundImage: 'url(/wallpapers/mac-mojave-dark.jpg)' }} 
      >
        {/* Render Open Windows */}
        {windows.map(win => (
          <MacWindow key={win.id} window={win} />
        ))}
      </div>

      {/* Bottom Floating Dock */}
      <MacTaskbar />

    </div>
  );
}
