'use client';
import React, { useState } from 'react';
import { Folder, ChevronRight, Home, ChevronDown, Monitor, Download, FilePlus, Copy, Scissors, Trash, Search, ArrowUp, ArrowLeft, ArrowRight, RotateCw } from 'lucide-react';

const PROJECTS = [
  { id: '1', name: 'VoiceCordAI', type: 'File folder', date: '10/12/2023 2:30 PM', size: '' },
  { id: '2', name: 'GuildMarket', type: 'File folder', date: '11/5/2023 9:15 AM', size: '' },
  { id: '3', name: 'WebOS_Core', type: 'File folder', date: '12/1/2023 6:22 PM', size: '' },
];

export default function WinExplorer() {
  const [activeItem, setActiveItem] = useState<string | null>(null);

  return (
    <div className="flex flex-col w-full h-full bg-[#191919] text-zinc-100 font-sans select-none rounded-lg overflow-hidden border border-white/10 shadow-2xl">
      
      {/* Top Bar (Tabs & Address) */}
      <div className="flex flex-col bg-[#202020]">
        
        {/* Ribbon / Command Bar */}
        <div className="h-14 flex items-center justify-between px-2 border-b border-white/5">
          <div className="flex items-center gap-1">
            <button className="flex items-center gap-2 px-3 py-1.5 hover:bg-white/10 rounded-md transition-colors text-sm">
              <FilePlus className="w-4 h-4 text-zinc-300" />
              <span>New</span>
              <ChevronDown className="w-3 h-3 text-zinc-400" />
            </button>
            <div className="w-[1px] h-6 bg-white/10 mx-1" />
            <button className="p-2 hover:bg-white/10 rounded-md transition-colors" title="Cut">
              <Scissors className="w-4 h-4 text-zinc-300" />
            </button>
            <button className="p-2 hover:bg-white/10 rounded-md transition-colors" title="Copy">
              <Copy className="w-4 h-4 text-zinc-300" />
            </button>
            <button className="p-2 hover:bg-white/10 rounded-md transition-colors" title="Delete">
              <Trash className="w-4 h-4 text-red-400" />
            </button>
          </div>
        </div>

        {/* Address Bar Row */}
        <div className="h-12 flex items-center gap-2 px-2 border-b border-white/5">
          <div className="flex items-center gap-1">
            <button className="p-1.5 hover:bg-white/10 rounded-md text-zinc-400"><ArrowLeft className="w-4 h-4" /></button>
            <button className="p-1.5 hover:bg-white/10 rounded-md text-zinc-600"><ArrowRight className="w-4 h-4" /></button>
            <button className="p-1.5 hover:bg-white/10 rounded-md text-zinc-400"><ArrowUp className="w-4 h-4" /></button>
            <button className="p-1.5 hover:bg-white/10 rounded-md text-zinc-400"><RotateCw className="w-4 h-4" /></button>
          </div>
          
          <div className="flex-1 flex items-center bg-[#191919] border border-white/10 rounded-md px-3 py-1 hover:border-white/20 transition-colors">
            <Home className="w-4 h-4 text-zinc-400 mr-2" />
            <ChevronRight className="w-3 h-3 text-zinc-500 mx-1" />
            <span className="text-sm">Home</span>
            <ChevronRight className="w-3 h-3 text-zinc-500 mx-1" />
            <span className="text-sm">Projects</span>
          </div>

          <div className="w-64 flex items-center bg-[#191919] border border-white/10 rounded-md px-3 py-1 hover:border-white/20 transition-colors">
            <Search className="w-4 h-4 text-zinc-400 mr-2" />
            <input type="text" placeholder="Search Projects" className="bg-transparent border-none outline-none text-sm w-full" />
          </div>
        </div>
      </div>

      {/* Main Area */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Navigation Pane */}
        <div className="w-56 bg-[#202020]/50 border-r border-white/5 flex flex-col py-2 overflow-y-auto">
          <div className="flex items-center gap-2 px-6 py-1.5 hover:bg-white/5 text-sm cursor-pointer group">
            <ChevronRight className="w-3 h-3 text-zinc-500 group-hover:text-zinc-300" />
            <Home className="w-4 h-4 text-blue-400" />
            <span>Home</span>
          </div>
          <div className="flex items-center gap-2 px-6 py-1.5 bg-white/10 text-sm cursor-pointer">
            <div className="w-3" /> {/* Spacer */}
            <Folder className="w-4 h-4 text-yellow-500" fill="currentColor" />
            <span>Projects</span>
          </div>
          <div className="flex items-center gap-2 px-6 py-1.5 hover:bg-white/5 text-sm cursor-pointer group">
            <div className="w-3" />
            <Download className="w-4 h-4 text-blue-400" />
            <span>Downloads</span>
          </div>
          <div className="flex items-center gap-2 px-6 py-1.5 hover:bg-white/5 text-sm cursor-pointer group mt-4">
            <ChevronRight className="w-3 h-3 text-zinc-500 group-hover:text-zinc-300" />
            <Monitor className="w-4 h-4 text-zinc-300" />
            <span>This PC</span>
          </div>
        </div>

        {/* File View */}
        <div className="flex-1 bg-[#191919] overflow-y-auto">
          <div className="flex flex-col w-full">
            {/* Column Headers */}
            <div className="flex items-center px-4 py-2 border-b border-white/5 text-xs text-zinc-400 hover:bg-white/5 cursor-default">
              <div className="flex-[2] flex items-center gap-2 border-r border-white/10 pr-2">
                <span>Name</span>
                <ChevronDown className="w-3 h-3" />
              </div>
              <div className="flex-1 border-r border-white/10 px-2">Date modified</div>
              <div className="w-32 border-r border-white/10 px-2">Type</div>
              <div className="w-24 pl-2">Size</div>
            </div>

            {/* File List */}
            <div className="p-1">
              {PROJECTS.map(item => (
                <div 
                  key={item.id}
                  onClick={() => setActiveItem(item.id)}
                  className={`flex items-center px-3 py-1.5 text-sm cursor-default rounded-sm border border-transparent ${
                    activeItem === item.id 
                      ? 'bg-white/10 border-white/20' 
                      : 'hover:bg-white/5'
                  }`}
                >
                  <div className="flex-[2] flex items-center gap-2">
                    <Folder className="w-5 h-5 text-yellow-500 drop-shadow-sm" fill="currentColor" />
                    <span>{item.name}</span>
                  </div>
                  <div className="flex-1 text-zinc-400 truncate">{item.date}</div>
                  <div className="w-32 text-zinc-400 truncate">{item.type}</div>
                  <div className="w-24 text-zinc-400 text-right">{item.size}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {/* Status Bar */}
      <div className="h-6 bg-[#202020] flex items-center px-4 text-xs text-zinc-400 border-t border-white/5">
        <span>{PROJECTS.length} items</span>
        <div className="w-[1px] h-3 bg-white/10 mx-3" />
        <span>{activeItem ? '1 item selected' : ''}</span>
      </div>
    </div>
  );
}
