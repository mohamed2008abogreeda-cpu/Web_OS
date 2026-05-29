'use client';
import React, { useState } from 'react';
import { Folder, ChevronRight, Home, LayoutGrid, List } from 'lucide-react';

const PROJECTS = [
  { id: '1', name: 'VoiceCordAI', type: 'folder', date: 'Oct 12 14:30' },
  { id: '2', name: 'GuildMarket', type: 'folder', date: 'Nov 05 09:15' },
  { id: '3', name: 'WebOS_Core', type: 'folder', date: 'Dec 01 18:22' },
  { id: '4', name: 'README.md', type: 'file', date: 'Dec 02 10:00' },
];

export default function LinuxFiles() {
  const [view, setView] = useState<'grid' | 'list'>('grid');

  return (
    <div className="flex flex-col w-full h-full bg-[#121212] text-zinc-300 font-sans select-none rounded-none border border-[#333]">
      
      {/* Header / Toolbar */}
      <div className="h-12 bg-[#202020] border-b border-[#333] flex items-center justify-between px-4">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-sm font-medium">
          <div className="p-1.5 hover:bg-[#333] cursor-pointer transition-colors">
            <Home className="w-4 h-4 text-zinc-400" />
          </div>
          <ChevronRight className="w-4 h-4 text-zinc-600" />
          <div className="px-2 py-1 hover:bg-[#333] cursor-pointer transition-colors">root</div>
          <ChevronRight className="w-4 h-4 text-zinc-600" />
          <div className="px-2 py-1 bg-[#333] text-white">projects</div>
        </div>

        {/* View Toggles */}
        <div className="flex items-center gap-1 border border-[#444] p-0.5">
          <button 
            onClick={() => setView('grid')}
            className={`p-1.5 ${view === 'grid' ? 'bg-[#444] text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button 
            onClick={() => setView('list')}
            className={`p-1.5 ${view === 'list' ? 'bg-[#444] text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* Sidebar (Optional for Nautilus, but requested brutalist grid) */}
        <div className="w-48 bg-[#1a1a1a] border-r border-[#333] flex flex-col py-2">
          <div className="px-4 py-2 text-xs font-bold text-zinc-500 uppercase tracking-wider">Places</div>
          <button className="flex items-center gap-3 px-4 py-2 hover:bg-[#2a2a2a] text-sm text-zinc-300 w-full text-left">
            <Home className="w-4 h-4 text-zinc-400" /> Home
          </button>
          <button className="flex items-center gap-3 px-4 py-2 bg-[#2a2a2a] border-l-2 border-emerald-500 text-sm text-white w-full text-left">
            <Folder className="w-4 h-4 text-emerald-500" /> Projects
          </button>
        </div>

        {/* File Grid/List */}
        <div className="flex-1 bg-[#121212] p-4 overflow-y-auto">
          {view === 'grid' ? (
            <div className="grid grid-cols-4 gap-4">
              {PROJECTS.map(item => (
                <div key={item.id} className="flex flex-col items-center justify-center p-4 hover:bg-[#222] border border-transparent hover:border-[#444] cursor-pointer group">
                  <Folder className="w-16 h-16 text-orange-600 drop-shadow-md group-hover:scale-105 transition-transform" fill="currentColor" />
                  <span className="mt-2 text-[13px] text-center text-zinc-300 font-medium w-full truncate">{item.name}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col w-full">
              <div className="flex border-b border-[#333] pb-2 mb-2 text-xs font-bold text-zinc-500 uppercase tracking-wider">
                <div className="flex-1">Name</div>
                <div className="w-32">Modified</div>
                <div className="w-24">Type</div>
              </div>
              {PROJECTS.map(item => (
                <div key={item.id} className="flex items-center hover:bg-[#222] py-2 cursor-pointer text-sm">
                  <div className="flex-1 flex items-center gap-3 px-2">
                    <Folder className="w-5 h-5 text-orange-600" fill="currentColor" />
                    <span className="text-zinc-200">{item.name}</span>
                  </div>
                  <div className="w-32 text-zinc-500">{item.date}</div>
                  <div className="w-24 text-zinc-500">{item.type}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
