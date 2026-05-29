'use client';
import React, { useState } from 'react';
import { Folder, ChevronLeft, ChevronRight, LayoutGrid, List, Search, Star, FileText, Tag } from 'lucide-react';

const PROJECTS = [
  { id: '1', name: 'VoiceCordAI', type: 'folder', date: 'Oct 12, 2023 at 2:30 PM' },
  { id: '2', name: 'GuildMarket', type: 'folder', date: 'Nov 05, 2023 at 9:15 AM' },
  { id: '3', name: 'WebOS_Core', type: 'folder', date: 'Dec 01, 2023 at 6:22 PM' },
];

export default function MacFinder() {
  const [view, setView] = useState<'grid' | 'list'>('grid');

  return (
    <div className="flex w-full h-full bg-black/40 backdrop-blur-2xl text-white font-sans select-none rounded-xl overflow-hidden border border-white/20 shadow-2xl">
      
      {/* Sidebar */}
      <div className="w-52 bg-white/10 border-r border-white/10 flex flex-col pt-12 backdrop-blur-3xl">
        <div className="px-4 mb-1">
          <h3 className="text-[11px] font-bold text-white/50 uppercase tracking-wide">Favorites</h3>
        </div>
        <button className="flex items-center gap-2 px-6 py-1.5 mx-2 rounded-md hover:bg-white/10 text-[13px] text-white">
          <Star className="w-4 h-4 text-blue-400" /> Favorites
        </button>
        <button className="flex items-center gap-2 px-6 py-1.5 mx-2 rounded-md bg-white/20 text-[13px] text-white font-medium shadow-sm">
          <Folder className="w-4 h-4 text-blue-400" fill="currentColor" /> Projects
        </button>
        <button className="flex items-center gap-2 px-6 py-1.5 mx-2 rounded-md hover:bg-white/10 text-[13px] text-white">
          <FileText className="w-4 h-4 text-blue-400" /> Documents
        </button>
        
        <div className="px-4 mt-6 mb-1">
          <h3 className="text-[11px] font-bold text-white/50 uppercase tracking-wide">Tags</h3>
        </div>
        <button className="flex items-center gap-2 px-6 py-1.5 mx-2 rounded-md hover:bg-white/10 text-[13px] text-white">
          <Tag className="w-3.5 h-3.5 text-red-500" fill="currentColor" /> Work
        </button>
        <button className="flex items-center gap-2 px-6 py-1.5 mx-2 rounded-md hover:bg-white/10 text-[13px] text-white">
          <Tag className="w-3.5 h-3.5 text-orange-500" fill="currentColor" /> Important
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Toolbar */}
        <div className="h-14 flex items-center justify-between px-4 border-b border-white/10">
          <div className="flex items-center gap-4 pl-20"> {/* Padding for traffic lights */}
            <div className="flex items-center gap-1">
              <button className="p-1 hover:bg-white/10 rounded text-white/50 hover:text-white transition-colors">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button className="p-1 hover:bg-white/10 rounded text-white/50 hover:text-white transition-colors">
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
            <span className="font-semibold text-[14px]">Projects</span>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center bg-white/10 rounded-md p-0.5">
              <button 
                onClick={() => setView('grid')}
                className={`p-1 rounded shadow-sm ${view === 'grid' ? 'bg-white/20 text-white' : 'text-white/60 hover:text-white'}`}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setView('list')}
                className={`p-1 rounded shadow-sm ${view === 'list' ? 'bg-white/20 text-white' : 'text-white/60 hover:text-white'}`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
            <div className="flex items-center gap-2 bg-white/10 px-2 py-1 rounded-md">
              <Search className="w-4 h-4 text-white/50" />
              <input 
                type="text" 
                placeholder="Search" 
                className="bg-transparent border-none outline-none text-sm text-white w-24 placeholder:text-white/40"
              />
            </div>
          </div>
        </div>

        {/* File View */}
        <div className="flex-1 overflow-y-auto p-4">
          {view === 'grid' ? (
            <div className="grid grid-cols-4 lg:grid-cols-5 gap-6 p-4">
              {PROJECTS.map(item => (
                <div key={item.id} className="flex flex-col items-center gap-2 p-2 rounded-lg hover:bg-white/10 cursor-pointer group transition-colors">
                  <Folder className="w-16 h-16 text-blue-400 drop-shadow-xl" fill="currentColor" />
                  <span className="text-[13px] font-medium px-2 py-0.5 rounded group-hover:bg-blue-500/80 transition-colors text-center truncate w-full">
                    {item.name}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col w-full">
              <div className="flex border-b border-white/10 pb-1 mb-2 text-[12px] text-white/50 font-medium px-2">
                <div className="flex-[2]">Name</div>
                <div className="flex-1">Date Modified</div>
                <div className="w-24">Kind</div>
              </div>
              {PROJECTS.map(item => (
                <div key={item.id} className="flex items-center px-2 py-1.5 hover:bg-white/10 rounded-md cursor-pointer text-[13px]">
                  <div className="flex-[2] flex items-center gap-2">
                    <Folder className="w-5 h-5 text-blue-400 drop-shadow-sm" fill="currentColor" />
                    <span>{item.name}</span>
                  </div>
                  <div className="flex-1 text-white/60">{item.date}</div>
                  <div className="w-24 text-white/60">Folder</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
