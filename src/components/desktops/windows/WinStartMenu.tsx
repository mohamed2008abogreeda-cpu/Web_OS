'use client';
import React, { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useOSStore } from '@/store/useOSStore';
import { SYSTEM_APPS } from '@/lib/mockData';
import { APP_ICONS } from '@/lib/icons';
import { Search, ChevronRight, Power, UserCircle2 } from 'lucide-react';

export default function WinStartMenu() {
  const { openWindow, toggleStartMenu, logoutUser } = useOSStore();
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        // Find if they clicked the start button itself, let the button handle it
        const target = event.target as Element;
        if (!target.closest('button[title="Start"]') && !target.closest('.start-button-area')) {
          toggleStartMenu();
        }
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [toggleStartMenu]);

  return (
    <motion.div
      ref={menuRef}
      initial={{ opacity: 0, y: 50, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="absolute bottom-14 left-1/2 -translate-x-1/2 bg-[#1c1c1c]/90 backdrop-blur-2xl border border-white/10 rounded-xl shadow-2xl w-[400px] h-[550px] p-6 flex flex-col z-[101] text-zinc-100 select-none font-segoe"
    >
      {/* Search Bar */}
      <div className="flex items-center bg-[#2d2d2d] border-t border-[#444] border-l border-r border-b border-black/50 rounded-full px-4 py-2 mb-6 shadow-inner hover:bg-[#333] transition-colors cursor-text">
        <Search className="w-4 h-4 text-zinc-400 mr-3" />
        <span className="text-sm text-zinc-400">Type here to search</span>
      </div>

      {/* Pinned Section */}
      <div className="flex flex-col mb-4">
        <div className="flex items-center justify-between mb-4 px-2">
          <h3 className="text-sm font-semibold text-white">Pinned</h3>
          <button className="flex items-center gap-1 text-xs text-zinc-300 hover:text-white bg-white/5 hover:bg-white/10 px-2 py-1 rounded transition-colors">
            <span>All apps</span>
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>
        
        <div className="grid grid-cols-4 gap-y-6">
          {SYSTEM_APPS.map(app => {
            const Icon = APP_ICONS[app.id];
            return (
              <div 
                key={app.id}
                onClick={() => openWindow(app)}
                className="flex flex-col items-center justify-center gap-2 hover:bg-white/10 rounded-md p-2 cursor-pointer transition-colors"
              >
                <div className="w-10 h-10 flex items-center justify-center bg-white/5 rounded-lg shadow-sm border border-white/5">
                  {Icon && <Icon className="w-6 h-6 text-white drop-shadow-md" />}
                </div>
                <span className="text-xs text-zinc-300 font-medium truncate w-full text-center">{app.title}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recommended Section */}
      <div className="flex flex-col flex-1 mt-4">
        <div className="flex items-center justify-between mb-4 px-2">
          <h3 className="text-sm font-semibold text-white">Recommended</h3>
          <button className="flex items-center gap-1 text-xs text-zinc-300 hover:text-white bg-white/5 hover:bg-white/10 px-2 py-1 rounded transition-colors">
            <span>More</span>
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>
        
        <div className="grid grid-cols-2 gap-4 px-2">
          {/* Mock Recommended Items */}
          <div className="flex items-center gap-3 hover:bg-white/10 p-2 rounded-md cursor-pointer transition-colors">
            <div className="w-8 h-8 flex items-center justify-center bg-blue-500/20 rounded">
              <span className="text-blue-400 font-bold text-xs">DOC</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-white">Architecture.pdf</span>
              <span className="text-[10px] text-zinc-400">1 hour ago</span>
            </div>
          </div>
          <div className="flex items-center gap-3 hover:bg-white/10 p-2 rounded-md cursor-pointer transition-colors">
            <div className="w-8 h-8 flex items-center justify-center bg-orange-500/20 rounded">
              <span className="text-orange-400 font-bold text-xs">IMG</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-white">Design_v2.png</span>
              <span className="text-[10px] text-zinc-400">Yesterday</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Profile & Power */}
      <div className="absolute bottom-0 left-0 w-full h-16 bg-black/20 border-t border-white/5 rounded-b-xl flex items-center justify-between px-6">
        <div className="flex items-center gap-3 hover:bg-white/10 p-2 rounded-md cursor-pointer transition-colors">
          <div className="w-8 h-8 rounded-full bg-zinc-700 flex items-center justify-center overflow-hidden border border-white/20">
            <UserCircle2 className="w-8 h-8 text-zinc-400" />
          </div>
          <span className="text-sm font-medium text-white">Team</span>
        </div>
        
        <button 
          onClick={logoutUser}
          className="p-2 hover:bg-white/10 rounded-md transition-colors text-zinc-300 hover:text-white"
          title="Power"
        >
          <Power className="w-4 h-4" />
        </button>
      </div>

    </motion.div>
  );
}
