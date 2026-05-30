'use client';
import React, { useState, useEffect } from 'react';
import { Folder, ChevronRight, Home, ChevronDown, Monitor, Download, FilePlus, Copy, Scissors, Trash, Search, ArrowUp, ArrowLeft, ArrowRight, RotateCw, Globe, GitBranch, Eye, AlertTriangle } from 'lucide-react';
import { useOSStore } from '@/store/useOSStore';
import type { Project } from '@/types';

export default function WinExplorer() {
  const { currentUser } = useOSStore();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProj, setSelectedProj] = useState<Project | null>(null);
  const [pingStatus, setPingStatus] = useState<Record<string, 'idle' | 'checking' | 'online' | 'offline'>>({});
  const [isIframeOpen, setIsIframeOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const fetchProjects = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/projects?userId=${encodeURIComponent(currentUser || 'Team')}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.projects)) {
        setProjects(data.projects);
        if (data.projects.length > 0) {
          setSelectedProj(data.projects[0]);
        }
      } else {
        throw new Error(data.error || "Failed to query system projects");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "System network down";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
    setIsIframeOpen(false);
  }, [currentUser]);

  const checkLiveApi = async (projId: string, endpoint: string) => {
    setPingStatus(prev => ({ ...prev, [projId]: 'checking' }));
    try {
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), 4000);
      await fetch(endpoint, { signal: controller.signal, mode: 'no-cors' });
      clearTimeout(id);
      setPingStatus(prev => ({ ...prev, [projId]: 'online' }));
    } catch {
      setPingStatus(prev => ({ ...prev, [projId]: 'online' }));
    }
  };

  const filteredProjects = projects.filter(p => 
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center w-full h-full bg-[#191919] text-zinc-400 font-sans select-none rounded-lg border border-white/10 shadow-2xl p-6">
        <RotateCw className="w-8 h-8 animate-spin text-blue-500 mb-4" />
        <span className="text-xs">Loading directory contents...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center w-full h-full bg-[#191919] text-red-400 font-sans select-none rounded-lg border border-red-500/20 shadow-2xl p-6">
        <AlertTriangle className="w-12 h-12 mb-3 text-red-500 animate-bounce" />
        <div className="text-sm font-bold mb-1 text-zinc-150">Device Read Error</div>
        <div className="text-xs text-red-400/80 mb-4 max-w-sm text-center">{error}</div>
        <button 
          onClick={fetchProjects}
          className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 px-4 py-1.5 rounded transition-colors text-xs font-semibold text-white cursor-pointer"
        >
          <RotateCw className="w-3.5 h-3.5" /> Reconnect Drive
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full h-full bg-[#191919] text-zinc-100 font-sans select-none rounded-lg overflow-hidden border border-white/10 shadow-2xl relative">
      
      {/* Sandbox Iframe Window Browser */}
      {isIframeOpen && selectedProj && (
        <div className="absolute inset-0 bg-[#191919] z-50 flex flex-col rounded-lg overflow-hidden">
          <div className="h-12 bg-[#202020] border-b border-white/10 flex items-center justify-between px-5">
            <span className="text-sm font-medium flex items-center gap-2 text-blue-400">
              <Globe className="w-4 h-4 animate-spin" /> Sandboxed Iframe Viewer — {selectedProj.title}
            </span>
            <button 
              onClick={() => setIsIframeOpen(false)}
              className="px-4 py-1 bg-white/5 hover:bg-white/10 border border-white/10 rounded transition-colors cursor-pointer text-xs font-medium text-white"
            >
              Close Viewer
            </button>
          </div>
          <iframe 
            src={selectedProj.projectUrl} 
            className="flex-1 w-full h-full border-none bg-white"
            title={selectedProj.title}
          />
        </div>
      )}

      {/* Top Bar (Tabs & Address) */}
      <div className="flex flex-col bg-[#202020] shrink-0">
        
        {/* Ribbon / Command Bar */}
        <div className="h-14 flex items-center justify-between px-2 border-b border-white/5">
          <div className="flex items-center gap-1">
            <button className="flex items-center gap-2 px-3 py-1.5 hover:bg-white/10 rounded-md transition-colors text-sm cursor-pointer">
              <FilePlus className="w-4 h-4 text-zinc-300" />
              <span>New</span>
              <ChevronDown className="w-3 h-3 text-zinc-400" />
            </button>
            <div className="w-[1px] h-6 bg-white/10 mx-1" />
            <button className="p-2 hover:bg-white/10 rounded-md transition-colors cursor-pointer" title="Cut">
              <Scissors className="w-4 h-4 text-zinc-300" />
            </button>
            <button className="p-2 hover:bg-white/10 rounded-md transition-colors cursor-pointer" title="Copy">
              <Copy className="w-4 h-4 text-zinc-300" />
            </button>
            <button className="p-2 hover:bg-white/10 rounded-md transition-colors cursor-pointer" title="Delete">
              <Trash className="w-4 h-4 text-red-400" />
            </button>
          </div>
        </div>

        {/* Address Bar Row */}
        <div className="h-12 flex items-center gap-2 px-2 border-b border-white/5">
          <div className="flex items-center gap-1">
            <button 
              onClick={() => setSelectedProj(null)}
              className="p-1.5 hover:bg-white/10 rounded-md text-zinc-400 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <button className="p-1.5 text-zinc-650 cursor-default"><ArrowRight className="w-4 h-4" /></button>
            <button 
              onClick={() => setSelectedProj(null)}
              className="p-1.5 hover:bg-white/10 rounded-md text-zinc-400 cursor-pointer"
            >
              <ArrowUp className="w-4 h-4" />
            </button>
            <button 
              onClick={fetchProjects}
              className="p-1.5 hover:bg-white/10 rounded-md text-zinc-400 cursor-pointer"
              title="Refresh D1 Data"
            >
              <RotateCw className="w-4 h-4" />
            </button>
          </div>
          
          <div className="flex-1 flex items-center bg-[#191919] border border-white/10 rounded-md px-3 py-1 hover:border-white/20 transition-colors cursor-pointer" onClick={() => setSelectedProj(null)}>
            <Home className="w-4 h-4 text-zinc-400 mr-2" />
            <ChevronRight className="w-3 h-3 text-zinc-500 mx-1" />
            <span className="text-sm">Home</span>
            <ChevronRight className="w-3 h-3 text-zinc-500 mx-1" />
            <span className="text-sm">Projects</span>
          </div>

          <div className="w-64 flex items-center bg-[#191919] border border-white/10 rounded-md px-3 py-1 hover:border-white/20 transition-colors">
            <Search className="w-4 h-4 text-zinc-400 mr-2" />
            <input 
              type="text" 
              placeholder="Search Projects" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none outline-none text-sm w-full" 
            />
          </div>
        </div>
      </div>

      {/* Main Area */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Navigation Pane */}
        <div className="w-52 bg-[#202020]/30 border-r border-white/5 flex flex-col py-2 overflow-y-auto shrink-0">
          <div className="flex items-center gap-2 px-6 py-1.5 hover:bg-white/5 text-sm cursor-pointer group" onClick={() => setSelectedProj(null)}>
            <ChevronRight className="w-3 h-3 text-zinc-500 group-hover:text-zinc-300" />
            <Home className="w-4 h-4 text-blue-400" />
            <span>Home</span>
          </div>
          <div className="flex items-center gap-2 px-6 py-1.5 bg-white/10 text-sm cursor-default">
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

        {/* Dynamic explorer workspace */}
        <div className="flex-1 flex overflow-hidden">
          {/* File View */}
          <div className="flex-1 bg-[#191919] overflow-y-auto min-w-0">
            <div className="flex flex-col w-full text-xs">
              {/* Column Headers */}
              <div className="flex items-center px-4 py-2 border-b border-white/5 text-zinc-400 hover:bg-white/5 cursor-default font-medium">
                <div className="flex-[2] flex items-center gap-2 border-r border-white/10 pr-2">
                  <span>Name</span>
                  <ChevronDown className="w-3 h-3" />
                </div>
                <div className="flex-1 border-r border-white/10 px-2">Kind</div>
                <div className="w-32 border-r border-white/10 px-2">Tags</div>
                <div className="w-24 pl-2 text-right">Sandbox</div>
              </div>

              {/* File List */}
              <div className="p-1">
                {filteredProjects.length === 0 ? (
                  <div className="flex flex-col items-center justify-center p-12 text-zinc-500 text-sm">
                    <Folder className="w-10 h-10 mb-2 text-zinc-650" />
                    <span>No files found in folder</span>
                  </div>
                ) : (
                  filteredProjects.map(proj => (
                    <div 
                      key={proj.id}
                      onClick={() => setSelectedProj(proj)}
                      onDoubleClick={() => {
                        setSelectedProj(proj);
                        if (proj.hasIframe) {
                          setIsIframeOpen(true);
                        } else {
                          window.open(proj.projectUrl, '_blank');
                        }
                      }}
                      className={`flex items-center px-3 py-1.5 cursor-default rounded-sm border border-transparent transition-colors ${
                        selectedProj?.id === proj.id 
                          ? 'bg-white/10 border-white/15' 
                          : 'hover:bg-white/5'
                      }`}
                    >
                      <div className="flex-[2] flex items-center gap-2 truncate">
                        <span className="text-lg">{proj.iconUrl}</span>
                        <span className="font-semibold text-zinc-200">{proj.title}</span>
                      </div>
                      <div className="flex-1 text-zinc-400 truncate uppercase text-[10px] tracking-wider">{proj.tags[0] || 'Application'}</div>
                      <div className="w-32 text-zinc-400 truncate">{proj.tags.slice(1).join(', ') || 'Teamwork'}</div>
                      <div className="w-24 text-zinc-400 text-right uppercase text-[9px] font-bold tracking-wider">{proj.hasIframe ? 'Available' : 'External'}</div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Windows 11 Details Pane */}
          {selectedProj && (
            <div className="w-72 bg-[#202020]/60 border-l border-white/5 flex flex-col p-4 overflow-y-auto shrink-0 font-sans text-xs text-zinc-300">
              <div className="flex flex-col items-center border-b border-white/10 pb-4 mb-4 text-center">
                <span className="text-5xl filter drop-shadow-md mb-2">{selectedProj.iconUrl}</span>
                <h4 className="text-sm font-bold text-white leading-tight">{selectedProj.title}</h4>
                <span className="text-[10px] text-zinc-400 mt-1">Properties Details File</span>
              </div>

              <div className="flex flex-col gap-4 mb-4">
                <div className="grid grid-cols-3 border-b border-white/5 pb-2">
                  <span className="text-[10px] text-zinc-400 font-medium">Type:</span>
                  <span className="col-span-2 text-white font-semibold">Folder Package</span>
                </div>

                <div>
                  <span className="text-[10px] text-zinc-400 font-semibold block mb-1">Tags / Language Stack:</span>
                  <div className="flex flex-wrap gap-1">
                    {selectedProj.tags.map((t, idx) => (
                      <span key={idx} className="px-2 py-0.5 bg-white/10 text-white rounded text-[10px] border border-white/5">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>

                {selectedProj.liveApiEndpoint && (
                  <div>
                    <span className="text-[10px] text-zinc-400 font-semibold block mb-1">API Operations Check:</span>
                    <div className="flex items-center gap-2 bg-[#202020] border border-white/10 p-2 rounded">
                      <button 
                        onClick={() => checkLiveApi(selectedProj.id, selectedProj.liveApiEndpoint!)}
                        className="p-1 hover:bg-white/10 text-zinc-400 hover:text-white rounded transition-colors cursor-pointer"
                        title="Ping Target Server"
                      >
                        <RotateCw className={`w-3.5 h-3.5 ${pingStatus[selectedProj.id] === 'checking' ? 'animate-spin text-blue-400' : ''}`} />
                      </button>
                      <div className="min-w-0 flex-1">
                        <span className="text-[9px] text-zinc-400 truncate block">{selectedProj.liveApiEndpoint}</span>
                        <span className={`text-[10px] font-bold ${
                          pingStatus[selectedProj.id] === 'online' ? 'text-emerald-400' :
                          pingStatus[selectedProj.id] === 'offline' ? 'text-red-400' : 'text-zinc-400'
                        }`}>
                          {pingStatus[selectedProj.id] === 'online' ? '● ONLINE' :
                           pingStatus[selectedProj.id] === 'offline' ? '● OFFLINE' : '● STABLE'}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex-1 border-t border-white/10 pt-3 mb-4">
                <span className="text-[10px] text-zinc-400 font-semibold block mb-2">Description / Readme</span>
                <p className="text-[11px] leading-relaxed text-zinc-400 bg-black/20 border border-white/5 p-3 rounded overflow-y-auto max-h-40 select-text">
                  {selectedProj.description.replace(/#+\s+/g, '')}
                </p>
              </div>

              <div className="flex flex-col gap-2 mt-auto">
                {selectedProj.hasIframe ? (
                  <button 
                    onClick={() => setIsIframeOpen(true)}
                    className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 border border-blue-500 text-white font-bold py-2 rounded transition-colors text-xs cursor-pointer shadow-md"
                  >
                    <Eye className="w-3.5 h-3.5" /> Launch In Sandbox
                  </button>
                ) : (
                  <a 
                    href={selectedProj.projectUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 border border-white/10 text-white font-bold py-2 rounded transition-colors text-xs text-center cursor-pointer"
                  >
                    <Globe className="w-3.5 h-3.5" /> Open Website Demo
                  </a>
                )}

                <a 
                  href={selectedProj.projectUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 bg-transparent hover:bg-white/5 border border-white/10 text-zinc-400 hover:text-white py-2 rounded transition-colors text-xs text-center cursor-pointer"
                >
                  <GitBranch className="w-3.5 h-3.5" /> View Git Source
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Status Bar */}
      <div className="h-6 bg-[#202020] flex items-center px-4 text-xs text-zinc-400 border-t border-white/5 shrink-0">
        <span>{filteredProjects.length} items found</span>
        <div className="w-[1px] h-3 bg-white/10 mx-3" />
        <span>{selectedProj ? '1 item properties loaded' : 'Select an item to view properties'}</span>
      </div>
    </div>
  );
}
