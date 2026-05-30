'use client';
import React, { useState, useEffect } from 'react';
import { Folder, ChevronLeft, ChevronRight, LayoutGrid, List, Search, Star, FileText, Tag, Globe, GitBranch, Eye, RefreshCw, AlertTriangle } from 'lucide-react';
import { useOSStore } from '@/store/useOSStore';
import type { Project } from '@/types';

export default function MacFinder() {
  const { currentUser } = useOSStore();
  const [view, setView] = useState<'grid' | 'list'>('grid');
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
      const res = await fetch(`/api/projects?userId=${encodeURIComponent(currentUser || 'Moamen')}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.projects)) {
        setProjects(data.projects);
        if (data.projects.length > 0) {
          setSelectedProj(data.projects[0]);
        }
      } else {
        throw new Error(data.error || "Failed to load projects");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Network error";
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
      <div className="flex flex-col items-center justify-center w-full h-full bg-black/40 backdrop-blur-2xl text-white font-sans select-none rounded-xl border border-white/10 shadow-2xl p-6">
        <div className="w-10 h-10 border-4 border-white/20 border-t-white rounded-full animate-spin mb-4" />
        <span className="text-xs font-semibold tracking-wide text-white/70">Connecting to Cloudflare D1...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center w-full h-full bg-red-950/20 backdrop-blur-2xl text-red-400 font-sans select-none rounded-xl border border-red-500/25 shadow-2xl p-6">
        <AlertTriangle className="w-12 h-12 mb-3 animate-bounce text-red-500" />
        <div className="text-sm font-bold mb-1 text-white">Database Query Failure</div>
        <div className="text-xs text-red-400/80 mb-4 max-w-sm text-center">{error}</div>
        <button 
          onClick={fetchProjects}
          className="flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/10 px-4 py-1.5 rounded-full transition-colors text-xs font-medium text-white cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Reconnect
        </button>
      </div>
    );
  }

  return (
    <div className="flex w-full h-full bg-black/40 backdrop-blur-2xl text-white font-sans select-none rounded-xl overflow-hidden border border-white/20 shadow-2xl relative">
      
      {/* Sandbox Iframe browser overlay */}
      {isIframeOpen && selectedProj && (
        <div className="absolute inset-0 bg-black z-50 flex flex-col rounded-xl overflow-hidden">
          <div className="h-12 bg-white/10 border-b border-white/10 flex items-center justify-between px-5 backdrop-blur-3xl">
            <span className="text-sm font-semibold flex items-center gap-2">
              <Globe className="w-4 h-4 text-blue-400 animate-pulse" /> Sandbox Live Browser — {selectedProj.title}
            </span>
            <button 
              onClick={() => setIsIframeOpen(false)}
              className="px-4 py-1 bg-white/10 hover:bg-white/20 border border-white/10 rounded-full transition-colors cursor-pointer text-xs font-medium text-white"
            >
              Exit Sandbox
            </button>
          </div>
          <iframe 
            src={selectedProj.projectUrl} 
            className="flex-1 w-full h-full border-none bg-white"
            title={selectedProj.title}
          />
        </div>
      )}

      {/* Sidebar */}
      <div className="w-52 bg-white/5 border-r border-white/10 flex flex-col pt-12 backdrop-blur-3xl shrink-0">
        <div className="px-4 mb-1">
          <h3 className="text-[11px] font-bold text-white/40 uppercase tracking-wide">Favorites</h3>
        </div>
        <button className="flex items-center gap-2 px-6 py-1.5 mx-2 rounded-md hover:bg-white/5 text-[13px] text-white/80 hover:text-white text-left cursor-pointer">
          <Star className="w-4 h-4 text-blue-400" /> Favorites
        </button>
        <button className="flex items-center gap-2 px-6 py-1.5 mx-2 rounded-md bg-white/15 text-[13px] text-white font-medium shadow-sm text-left cursor-default">
          <Folder className="w-4 h-4 text-blue-400" fill="currentColor" /> Projects
        </button>
        <button className="flex items-center gap-2 px-6 py-1.5 mx-2 rounded-md hover:bg-white/5 text-[13px] text-white/80 hover:text-white text-left cursor-pointer">
          <FileText className="w-4 h-4 text-blue-400" /> Documents
        </button>
        
        <div className="px-4 mt-6 mb-1">
          <h3 className="text-[11px] font-bold text-white/40 uppercase tracking-wide">Tags</h3>
        </div>
        <button className="flex items-center gap-2 px-6 py-1.5 mx-2 rounded-md hover:bg-white/5 text-[13px] text-white/80 hover:text-white text-left cursor-pointer">
          <Tag className="w-3.5 h-3.5 text-red-500" fill="currentColor" /> Work
        </button>
        <button className="flex items-center gap-2 px-6 py-1.5 mx-2 rounded-md hover:bg-white/5 text-[13px] text-white/80 hover:text-white text-left cursor-pointer">
          <Tag className="w-3.5 h-3.5 text-orange-500" fill="currentColor" /> Important
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Toolbar */}
        <div className="h-14 flex items-center justify-between px-4 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-4 pl-20"> {/* Padding for traffic lights */}
            <div className="flex items-center gap-1">
              <button 
                onClick={() => setSelectedProj(null)}
                className="p-1 hover:bg-white/10 rounded text-white/40 hover:text-white transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button className="p-1 hover:bg-white/10 rounded text-white/20 transition-colors cursor-default" disabled>
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
            <span className="font-semibold text-[14px]">Projects</span>
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={fetchProjects}
              className="p-1.5 text-white/50 hover:text-white hover:bg-white/10 rounded transition-colors cursor-pointer"
              title="Sync D1"
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            <div className="flex items-center bg-white/10 rounded-md p-0.5">
              <button 
                onClick={() => setView('grid')}
                className={`p-1 rounded cursor-pointer transition-all ${view === 'grid' ? 'bg-white/20 text-white' : 'text-white/60 hover:text-white'}`}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setView('list')}
                className={`p-1 rounded cursor-pointer transition-all ${view === 'list' ? 'bg-white/20 text-white' : 'text-white/60 hover:text-white'}`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
            <div className="flex items-center gap-2 bg-white/10 px-2 py-1 rounded-md">
              <Search className="w-4 h-4 text-white/40" />
              <input 
                type="text" 
                placeholder="Search" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent border-none outline-none text-sm text-white w-24 placeholder:text-white/30"
              />
            </div>
          </div>
        </div>

        {/* Dynamic List Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* File View */}
          <div className="flex-1 overflow-y-auto p-4 min-w-0">
            {filteredProjects.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-white/40 text-sm">
                <Folder className="w-12 h-12 mb-2 text-white/20" />
                <span>No projects match search query</span>
              </div>
            ) : view === 'grid' ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 p-2">
                {filteredProjects.map(proj => (
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
                    className={`flex flex-col items-center gap-2 p-3 rounded-lg border transition-all cursor-pointer group ${
                      selectedProj?.id === proj.id 
                        ? 'bg-white/15 border-white/25 shadow-lg shadow-black/10' 
                        : 'bg-white/0 border-transparent hover:bg-white/5 hover:border-white/5'
                    }`}
                  >
                    <span className="text-5xl drop-shadow-xl group-hover:scale-105 transition-transform mb-1">
                      {proj.iconUrl}
                    </span>
                    <span className="text-[13px] font-semibold text-center truncate w-full">
                      {proj.title}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col w-full">
                <div className="flex border-b border-white/10 pb-1 mb-2 text-[12px] text-white/40 font-medium px-2">
                  <div className="flex-[2]">Name</div>
                  <div className="flex-1">Category</div>
                  <div className="w-24">Sandbox</div>
                </div>
                {filteredProjects.map(proj => (
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
                    className={`flex items-center px-2 py-1.5 rounded-md cursor-pointer text-[13px] border-l-2 transition-colors ${
                      selectedProj?.id === proj.id 
                        ? 'bg-white/15 border-blue-400 text-white' 
                        : 'border-transparent hover:bg-white/5 text-white/70 hover:text-white'
                    }`}
                  >
                    <div className="flex-[2] flex items-center gap-2 truncate">
                      <span className="text-base">{proj.iconUrl}</span>
                      <span className="font-medium">{proj.title}</span>
                    </div>
                    <div className="flex-1 text-white/50 truncate uppercase text-[10px] tracking-wider">{proj.tags[0] || 'App'}</div>
                    <div className="w-24 text-white/50 text-[10px] uppercase">{proj.hasIframe ? 'Available' : 'External'}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Frosted details right sidebar */}
          {selectedProj && (
            <div className="w-72 bg-white/5 border-l border-white/10 flex flex-col p-4 overflow-y-auto shrink-0 backdrop-blur-md">
              <div className="flex flex-col items-center text-center pb-4 mb-4 border-b border-white/10">
                <span className="text-5xl filter drop-shadow-lg mb-2">{selectedProj.iconUrl}</span>
                <h4 className="text-base font-bold text-white leading-snug">{selectedProj.title}</h4>
                <span className="text-[10px] text-white/40 mt-1 uppercase font-semibold tracking-wider">
                  {selectedProj.tags[0]} Developer Item
                </span>
              </div>

              <div className="flex flex-col gap-4 mb-4 text-xs">
                <div>
                  <span className="text-[10px] text-white/50 uppercase font-bold tracking-wider block mb-1">Key Technologies</span>
                  <div className="flex flex-wrap gap-1">
                    {selectedProj.tags.map((t, idx) => (
                      <span key={idx} className="px-2 py-0.5 bg-white/10 text-white rounded text-[10px] font-medium border border-white/5">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>

                {selectedProj.liveApiEndpoint && (
                  <div>
                    <span className="text-[10px] text-white/50 uppercase font-bold tracking-wider block mb-1.5">Edge Operations Status</span>
                    <div className="flex items-center gap-2.5 bg-white/5 border border-white/15 p-2 rounded-lg">
                      <button 
                        onClick={() => checkLiveApi(selectedProj.id, selectedProj.liveApiEndpoint!)}
                        className="p-1 hover:bg-white/10 rounded-full text-white/60 hover:text-white transition-colors cursor-pointer"
                        title="Ping Endpoint"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${pingStatus[selectedProj.id] === 'checking' ? 'animate-spin text-blue-400' : ''}`} />
                      </button>
                      <div className="min-w-0 flex-1">
                        <span className="text-[9px] text-white/40 truncate block">{selectedProj.liveApiEndpoint}</span>
                        <span className={`text-[10px] font-bold flex items-center gap-1 ${
                          pingStatus[selectedProj.id] === 'online' ? 'text-emerald-400' :
                          pingStatus[selectedProj.id] === 'offline' ? 'text-red-400' : 'text-white/60'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            pingStatus[selectedProj.id] === 'online' ? 'bg-emerald-400' :
                            pingStatus[selectedProj.id] === 'offline' ? 'bg-red-400' : 'bg-white/30'
                          }`} />
                          {pingStatus[selectedProj.id] === 'online' ? 'ONLINE' :
                           pingStatus[selectedProj.id] === 'offline' ? 'OFFLINE' : 'STANDBY'}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex-1 border-t border-white/10 pt-3 mb-4">
                <span className="text-[10px] text-white/50 uppercase font-bold tracking-wider block mb-2">Description</span>
                <p className="text-[11px] leading-relaxed text-white/70 bg-black/20 border border-white/5 p-3 rounded-lg overflow-y-auto max-h-40 select-text">
                  {selectedProj.description.replace(/#+\s+/g, '')}
                </p>
              </div>

              <div className="flex flex-col gap-2 mt-auto">
                {selectedProj.hasIframe ? (
                  <button 
                    onClick={() => setIsIframeOpen(true)}
                    className="flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 border border-blue-600 text-white font-bold py-2 rounded-lg transition-colors text-xs cursor-pointer shadow-md shadow-blue-500/10"
                  >
                    <Eye className="w-3.5 h-3.5" /> Open Application
                  </button>
                ) : (
                  <a 
                    href={selectedProj.projectUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 border border-white/10 text-white font-bold py-2 rounded-lg transition-colors text-xs text-center cursor-pointer"
                  >
                    <Globe className="w-3.5 h-3.5" /> External Demo
                  </a>
                )}

                <a 
                  href={selectedProj.projectUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 bg-transparent hover:bg-white/5 border border-white/10 text-white/60 hover:text-white py-2 rounded-lg transition-colors text-xs text-center cursor-pointer"
                >
                  <GitBranch className="w-3.5 h-3.5" /> Repository Source
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

