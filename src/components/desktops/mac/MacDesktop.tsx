'use client';
import { useState } from 'react';
import { useOSStore } from '@/store/useOSStore';
import MacWindow from './MacWindow';
import MacTaskbar from './MacTaskbar';

export default function MacDesktop() {
  const { windows, logoutUser } = useOSStore();
  const [isAppleMenuOpen, setIsAppleMenuOpen] = useState(false);

  return (
    <div className="w-full h-screen overflow-hidden bg-black flex flex-col font-sans select-none relative">
      
      {/* Top Menu Bar (macOS standard) */}
      <div className="w-full h-6 bg-black/40 backdrop-blur-md flex items-center px-4 justify-between z-[100] text-xs text-white/90 border-b border-white/10 shadow-sm relative">
        <div className="flex items-center gap-4 font-semibold h-full">
          <div className="relative h-full flex items-center">
            <button 
              onClick={() => setIsAppleMenuOpen(!isAppleMenuOpen)}
              className={`px-2 h-full flex items-center transition-colors cursor-pointer rounded-sm ${isAppleMenuOpen ? 'bg-white/20' : 'hover:bg-white/10'}`}
            >
              
            </button>
            {isAppleMenuOpen && (
              <div className="absolute top-6 left-0 w-56 bg-[#1e1e1e]/90 backdrop-blur-2xl border border-white/10 shadow-2xl rounded-md py-1 flex flex-col z-[999] text-sm font-normal">
                <button className="px-4 py-1 text-left hover:bg-blue-500 hover:text-white transition-colors cursor-default">About This Mac</button>
                <div className="h-[1px] w-full bg-white/10 my-1" />
                <button className="px-4 py-1 text-left hover:bg-blue-500 hover:text-white transition-colors cursor-default">System Settings...</button>
                <div className="h-[1px] w-full bg-white/10 my-1" />
                <button 
                  onClick={logoutUser}
                  className="px-4 py-1 text-left hover:bg-blue-500 hover:text-white transition-colors cursor-default"
                >
                  Shut Down...
                </button>
              </div>
            )}
          </div>
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
