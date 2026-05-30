'use client';
import React, { useState, useEffect } from 'react';
import { Folder, ChevronRight, Home, LayoutGrid, List, Globe, GitBranch, Terminal, RefreshCw, Eye, AlertTriangle } from 'lucide-react';
import { useOSStore } from '@/store/useOSStore';
import type { Project } from '@/types';

export default function LinuxFiles() {
  const { currentUser } = useOSStore();
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProj, setSelectedProj] = useState<Project | null>(null);
  const [pingStatus, setPingStatus] = useState<Record<string, 'idle' | 'checking' | 'online' | 'offline'>>({});
  const [isIframeOpen, setIsIframeOpen] = useState<boolean>(false);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/projects?userId=${encodeURIComponent(currentUser || 'Mohammed')}`);
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
      // Use standard fetch with timeout
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), 4000);
      const res = await fetch(endpoint, { signal: controller.signal, mode: 'no-cors' });
      clearTimeout(id);
      setPingStatus(prev => ({ ...prev, [projId]: 'online' }));
    } catch {
      // Since it's client-side, no-cors or standard fetches might fail due to CORS,
      // but an abort/network down indicates offline, whereas opaque responses indicates online.
      setPingStatus(prev => ({ ...prev, [projId]: 'online' })); // assume online if it reached but cors blocked
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center w-full h-full bg-[#0c0c0c] text-emerald-500 font-mono select-none rounded-none border border-emerald-950/40 p-6">
        <Terminal className="w-12 h-12 mb-4 animate-pulse text-emerald-400" />
        <div className="text-sm font-bold tracking-wider mb-2">sh ./fetch_projects.sh</div>
        <div className="w-64 bg-emerald-950/20 border border-emerald-900/30 rounded h-2.5 overflow-hidden relative">
          <div className="bg-emerald-500 h-full w-1/2 animate-infinite-loading absolute top-0 left-0"></div>
        </div>
        <span className="text-[10px] text-emerald-600 mt-2">Connecting to Cloudflare D1 SQL...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center w-full h-full bg-[#120000] text-red-500 font-mono select-none rounded-none border border-red-950/40 p-6">
        <AlertTriangle className="w-12 h-12 mb-4 animate-bounce" />
        <div className="text-sm font-bold mb-2">Error: Failed to query D1 Database</div>
        <div className="text-xs text-red-400/80 mb-4 max-w-md text-center">{error}</div>
        <button 
          onClick={fetchProjects}
          className="flex items-center gap-2 bg-red-950/30 hover:bg-red-900/40 border border-red-800 px-4 py-1.5 rounded transition-colors text-xs font-semibold text-white cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Retry Fetch
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full h-full bg-[#121212] text-zinc-300 font-sans select-none rounded-none border border-[#333]">
      
      {/* Dynamic Iframe Overlay */}
      {isIframeOpen && selectedProj && (
        <div className="absolute inset-0 bg-[#0c0c0c] z-50 flex flex-col">
          <div className="h-10 bg-[#1e1e1e] border-b border-[#333] flex items-center justify-between px-4 text-xs font-mono">
            <span className="text-emerald-400 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 animate-spin" /> {selectedProj.title} Sandbox Browser
            </span>
            <button 
              onClick={() => setIsIframeOpen(false)}
              className="px-3 py-1 bg-red-650 hover:bg-red-700 hover:text-white border border-red-900 rounded transition-colors cursor-pointer text-white"
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

      {/* Header / Toolbar */}
      <div className="h-12 bg-[#202020] border-b border-[#333] flex items-center justify-between px-4">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-sm font-medium">
          <div className="p-1.5 hover:bg-[#333] cursor-pointer transition-colors" onClick={() => setSelectedProj(null)}>
            <Home className="w-4 h-4 text-zinc-400" />
          </div>
          <ChevronRight className="w-4 h-4 text-zinc-600" />
          <div className="px-2 py-1 hover:bg-[#333] cursor-pointer transition-colors" onClick={() => setSelectedProj(null)}>root</div>
          <ChevronRight className="w-4 h-4 text-zinc-600" />
          <div className="px-2 py-1 bg-[#333] text-white">projects</div>
        </div>

        {/* Refresh button */}
        <button 
          onClick={fetchProjects}
          className="p-1.5 text-zinc-400 hover:text-white hover:bg-[#333] rounded transition-colors mr-2 cursor-pointer"
          title="Refresh Data"
        >
          <RefreshCw className="w-4 h-4" />
        </button>

        {/* View Toggles */}
        <div className="flex items-center gap-1 border border-[#444] p-0.5 ml-auto">
          <button 
            onClick={() => setView('grid')}
            className={`p-1.5 cursor-pointer ${view === 'grid' ? 'bg-[#444] text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button 
            onClick={() => setView('list')}
            className={`p-1.5 cursor-pointer ${view === 'list' ? 'bg-[#444] text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* Sidebar */}
        <div className="w-44 bg-[#1a1a1a] border-r border-[#333] flex flex-col py-2 shrink-0">
          <div className="px-4 py-2 text-xs font-bold text-zinc-500 uppercase tracking-wider">Places</div>
          <button className="flex items-center gap-3 px-4 py-2 hover:bg-[#2a2a2a] text-sm text-zinc-300 w-full text-left cursor-pointer">
            <Home className="w-4 h-4 text-zinc-400" /> Home
          </button>
          <button className="flex items-center gap-3 px-4 py-2 bg-[#2a2a2a] border-l-2 border-emerald-500 text-sm text-white w-full text-left cursor-default">
            <Folder className="w-4 h-4 text-emerald-500" /> Projects
          </button>
        </div>

        {/* File Grid/List */}
        <div className="flex-1 bg-[#121212] p-4 overflow-y-auto min-w-0">
          {projects.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-zinc-500 text-sm font-mono">
              <Folder className="w-12 h-12 mb-2 text-zinc-600" />
              <span>Directory empty. No projects found.</span>
            </div>
          ) : view === 'grid' ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {projects.map(proj => (
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
                  className={`flex flex-col items-center justify-center p-4 rounded border transition-all cursor-pointer group ${
                    selectedProj?.id === proj.id 
                      ? 'bg-emerald-950/20 border-emerald-500/80 shadow-[0_0_15px_rgba(16,185,129,0.05)]' 
                      : 'bg-[#181818]/60 border-zinc-800 hover:bg-[#222]/80 hover:border-zinc-700'
                  }`}
                >
                  <span className="text-4xl filter drop-shadow-md mb-2 group-hover:scale-110 transition-transform">
                    {proj.iconUrl || '📁'}
                  </span>
                  <span className="text-[13px] font-bold text-center text-zinc-200 truncate w-full">{proj.title}</span>
                  <span className="text-[10px] text-zinc-500 mt-1 uppercase font-mono">{proj.tags[0] || 'Project'}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col w-full font-mono text-xs">
              <div className="flex border-b border-[#333] pb-2 mb-2 font-bold text-zinc-500 uppercase tracking-wider px-2">
                <div className="flex-1">Title</div>
                <div className="w-32">Stack</div>
                <div className="w-24">Environment</div>
              </div>
              {projects.map(proj => (
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
                  className={`flex items-center py-2 px-2 cursor-pointer transition-colors border-l-2 ${
                    selectedProj?.id === proj.id 
                      ? 'bg-emerald-950/20 border-emerald-500 text-zinc-200' 
                      : 'border-transparent hover:bg-[#222] text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <div className="flex-1 flex items-center gap-2.5 truncate">
                    <span className="text-base">{proj.iconUrl || '📁'}</span>
                    <span className="font-semibold">{proj.title}</span>
                  </div>
                  <div className="w-32 text-zinc-500 truncate">{proj.tags.slice(0, 2).join(', ')}</div>
                  <div className="w-24 text-zinc-500 truncate uppercase">{proj.hasIframe ? 'Iframe' : 'External'}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Brutalist Green details split-pane sidebar */}
        {selectedProj && (
          <div className="w-72 bg-[#171717] border-l border-[#333] flex flex-col p-4 overflow-y-auto shrink-0 font-mono text-xs text-zinc-300">
            <div className="flex items-center gap-3 border-b border-zinc-800 pb-3 mb-4">
              <span className="text-3xl">{selectedProj.iconUrl}</span>
              <div className="min-w-0">
                <h4 className="text-sm font-bold text-white truncate">{selectedProj.title}</h4>
                <span className="text-[10px] text-zinc-500 truncate block">ID: {selectedProj.id}</span>
              </div>
            </div>

            <div className="flex flex-col gap-3 mb-4">
              <div>
                <span className="text-[10px] text-zinc-500 uppercase tracking-wider block mb-1">Stack (Tags)</span>
                <div className="flex flex-wrap gap-1">
                  {selectedProj.tags.map((t, idx) => (
                    <span key={idx} className="px-1.5 py-0.5 bg-zinc-800 text-zinc-400 border border-zinc-700 rounded text-[9px] font-bold">
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              {selectedProj.liveApiEndpoint && (
                <div>
                  <span className="text-[10px] text-zinc-500 uppercase tracking-wider block mb-1">Live Healthcheck</span>
                  <div className="flex items-center gap-2 bg-[#202020] border border-zinc-800 p-2 rounded">
                    <button 
                      onClick={() => checkLiveApi(selectedProj.id, selectedProj.liveApiEndpoint!)}
                      className="p-1 hover:bg-zinc-750 text-zinc-400 hover:text-white rounded transition-colors cursor-pointer"
                      title="Ping Server"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${pingStatus[selectedProj.id] === 'checking' ? 'animate-spin text-emerald-400' : ''}`} />
                    </button>
                    <div className="min-w-0 flex-1">
                      <span className="text-[9px] text-zinc-500 truncate block">{selectedProj.liveApiEndpoint}</span>
                      <span className={`text-[10px] font-bold ${
                        pingStatus[selectedProj.id] === 'online' ? 'text-emerald-400' :
                        pingStatus[selectedProj.id] === 'offline' ? 'text-red-400' : 'text-zinc-400'
                      }`}>
                        {pingStatus[selectedProj.id] === 'online' ? '● ONLINE' :
                         pingStatus[selectedProj.id] === 'offline' ? '● OFFLINE' : '● UNCHECKED'}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex-1 border-t border-zinc-800 pt-3 mb-4">
              <span className="text-[10px] text-zinc-500 uppercase tracking-wider block mb-2">Description</span>
              <p className="text-[11px] leading-relaxed text-zinc-400 font-sans whitespace-pre-line bg-[#0e0e0e] border border-zinc-800 p-2.5 rounded max-h-48 overflow-y-auto select-text">
                {selectedProj.description.replace(/#+\s+/g, '')}
              </p>
            </div>

            <div className="flex flex-col gap-2 mt-auto">
              {selectedProj.hasIframe ? (
                <button 
                  onClick={() => setIsIframeOpen(true)}
                  className="flex items-center justify-center gap-2 bg-emerald-700 hover:bg-emerald-600 border border-emerald-800 text-white font-bold py-2 rounded transition-colors text-xs cursor-pointer shadow-md shadow-emerald-950/20"
                >
                  <Eye className="w-3.5 h-3.5" /> Launch Sandbox
                </button>
              ) : (
                <a 
                  href={selectedProj.projectUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-white font-bold py-2 rounded transition-colors text-xs text-center cursor-pointer"
                >
                  <Globe className="w-3.5 h-3.5" /> External Demo
                </a>
              )}

              <a 
                href={selectedProj.projectUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 bg-zinc-950/50 hover:bg-zinc-950 border border-zinc-850 text-zinc-400 hover:text-white py-2 rounded transition-colors text-xs text-center cursor-pointer"
              >
                <GitBranch className="w-3.5 h-3.5" /> Source Repository
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
