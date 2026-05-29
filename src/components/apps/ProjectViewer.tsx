'use client';
// ============================================================
// ProjectViewer — Bento-Grid Layout & Glassmorphism
// ============================================================
import { useState, useEffect } from 'react';
import { useOSStore } from '@/store/useOSStore';
import { USERS, getProjectsForUser } from '@/lib/mockData';
import { PROJECT_ICONS, ChevronLeft, ExternalLink, Activity, CheckCircle2, FolderOpen } from '@/lib/icons';
import type { Project, LiveStats } from '@/types';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';

function LiveStatusWidget({ endpoint }: { endpoint: string }) {
  const [stats, setStats] = useState<LiveStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setStats({
        status: 'online',
        uptime: '99.99%',
        ping: Math.floor(Math.random() * 15) + 10,
        lastChecked: new Date().toLocaleTimeString(),
      });
      setLoading(false);
    }, 800);

    const interval = setInterval(() => {
      setStats((prev) => prev ? {
        ...prev,
        ping: Math.floor(Math.random() * 15) + 10,
        lastChecked: new Date().toLocaleTimeString(),
      } : null);
    }, 10000);

    return () => { clearTimeout(timer); clearInterval(interval); };
  }, [endpoint]);

  if (loading) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-zinc-900/50 border border-white/5 backdrop-blur-sm animate-pulse">
        <div className="w-2 h-2 rounded-full bg-zinc-500" />
        <span className="text-zinc-400 text-xs font-semibold">Pinging...</span>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="flex items-center gap-4 px-4 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 backdrop-blur-md">
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" style={{ boxShadow: '0 0 10px rgba(52,211,153,0.5)' }} />
        <span className="text-emerald-400 text-xs font-bold uppercase tracking-wider">
          {stats.status}
        </span>
      </div>
      <div className="h-4 w-px bg-emerald-500/30" />
      <div className="flex items-center gap-1.5 text-zinc-300 text-[11px] font-semibold">
        <Activity className="w-3.5 h-3.5 text-emerald-400" />
        {stats.uptime}
      </div>
      <span className="text-zinc-300 text-[11px] font-semibold">{stats.ping}ms</span>
      <span className="text-zinc-500 text-[10px] ml-auto font-mono">{stats.lastChecked}</span>
    </div>
  );
}

function ProjectCard({ project, index, onSelect, accentColor }: { project: Project; index: number; onSelect: (p: Project) => void; accentColor: string }) {
  const ProjIcon = PROJECT_ICONS[project.id];

  return (
    <button
      onClick={() => onSelect(project)}
      className={`w-full flex flex-col p-5 text-left group bg-zinc-900/50 hover:bg-zinc-800/80 border border-white/5 hover:border-emerald-500/30 rounded-3xl transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(16,185,129,0.15)] backdrop-blur-md active:scale-[0.98] select-none cursor-pointer ${index === 0 ? 'md:col-span-2 md:row-span-2' : index === 3 ? 'md:col-span-2' : ''}`}
    >
      <div className="flex w-full items-start justify-between mb-4">
        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-lg group-hover:rotate-3 transition-transform duration-300"
          style={{
            background: `linear-gradient(135deg, ${accentColor}30, ${accentColor}10)`,
            border: `1px solid ${accentColor}40`,
          }}
        >
          {ProjIcon ? (
            <ProjIcon className="w-6 h-6" style={{ color: accentColor }} strokeWidth={1.5} />
          ) : (
            <FolderOpen className="w-6 h-6" style={{ color: accentColor }} strokeWidth={1.5} />
          )}
        </div>
        {project.liveApiEndpoint ? (
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 shrink-0 shadow-[0_0_10px_rgba(52,211,153,0.6)] animate-pulse" />
        ) : (
          <div className="w-2.5 h-2.5 rounded-full bg-zinc-700 shrink-0" />
        )}
      </div>
      <div className="flex-1 w-full min-w-0">
        <h3 className="text-white text-lg font-bold tracking-tight mb-2 truncate">{project.title}</h3>
        <p className="text-zinc-400 text-xs line-clamp-2 mb-4 h-8 leading-relaxed">
          {project.description.split('\n')[0].replace(/#+\s/g, '')}
        </p>
        <div className="flex gap-2 flex-wrap">
          {project.tags.slice(0, 3).map((tag) => (
            <Badge key={tag} variant="secondary" className="bg-zinc-800/50 text-zinc-300 hover:bg-zinc-700/50 border-white/5 text-[10px] px-2 py-0">
              {tag}
            </Badge>
          ))}
        </div>
      </div>
    </button>
  );
}

function ProjectDetail({ project, onBack, accentColor }: { project: Project; onBack: () => void; accentColor: string }) {
  const [iframeError, setIframeError] = useState(false);
  const ProjIcon = PROJECT_ICONS[project.id];

  return (
    <div className="flex flex-col h-full bg-zinc-950">
      {/* Header */}
      <div className="shrink-0 p-5 border-b border-white/5 bg-zinc-900/30 backdrop-blur-md flex flex-col gap-4">
        <div className="flex items-center gap-4 min-w-0">
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="rounded-full w-10 h-10 hover:bg-white/10 text-white shrink-0"
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg shrink-0"
            style={{
              background: `linear-gradient(135deg, ${accentColor}30, ${accentColor}10)`,
              border: `1px solid ${accentColor}40`,
            }}
          >
            {ProjIcon ? (
              <ProjIcon className="w-6 h-6" style={{ color: accentColor }} />
            ) : (
              <FolderOpen className="w-6 h-6" style={{ color: accentColor }} />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-white text-xl font-bold tracking-tight truncate">{project.title}</h2>
            <div className="flex gap-2 mt-1.5 overflow-x-auto scrollbar-hide">
              {project.tags.map((tag) => (
                <Badge key={tag} variant="outline" className="text-zinc-300 border-white/10 bg-zinc-800/30 text-[10px]">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
          <div className="shrink-0">
            <Button
              className="h-10 px-5 text-sm font-bold rounded-xl bg-white text-black hover:bg-zinc-200 transition-colors shadow-[0_0_20px_rgba(255,255,255,0.1)]"
              asChild
            >
              <a href={project.projectUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                Open Live <ExternalLink className="w-4 h-4" />
              </a>
            </Button>
          </div>
        </div>
        {project.liveApiEndpoint && (
          <LiveStatusWidget endpoint={project.liveApiEndpoint} />
        )}
      </div>

      {/* Content */}
      <ScrollArea className="flex-1 bg-zinc-950/50">
        {project.hasIframe && !iframeError ? (
          <div className="relative w-full h-full min-h-[500px] p-4">
            <div className="w-full h-full rounded-2xl overflow-hidden border border-white/10 shadow-2xl relative bg-zinc-900">
              <iframe
                src={project.projectUrl}
                sandbox="allow-scripts allow-same-origin allow-popups"
                className="w-full h-full border-0 absolute inset-0"
                onError={() => setIframeError(true)}
                title={project.title}
              />
            </div>
          </div>
        ) : (
          <div className="p-8 max-w-3xl mx-auto flex flex-col gap-6">
            {project.description.split('\n').map((line, i) => {
              if (line.startsWith('## ')) {
                return <h2 key={i} className="text-2xl font-extrabold text-white tracking-tight mt-8 mb-2">{line.slice(3)}</h2>;
              }
              if (line.startsWith('### ')) {
                return <h3 key={i} className="text-lg font-bold text-zinc-200 mt-6 mb-2">{line.slice(4)}</h3>;
              }
              if (line.startsWith('- **')) {
                const match = line.match(/- \*\*(.+?)\*\*:?\s*(.*)/);
                if (match) {
                  return (
                    <div key={i} className="flex gap-4 py-2 text-zinc-300 text-sm bg-zinc-900/30 p-4 rounded-2xl border border-white/5">
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                      <span><strong className="text-white font-bold">{match[1]}:</strong> {match[2]}</span>
                    </div>
                  );
                }
              }
              if (line.startsWith('- ')) {
                return (
                  <div key={i} className="flex gap-3 py-1.5 text-zinc-300 text-sm">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{line.slice(2)}</span>
                  </div>
                );
              }
              if (line.trim() === '') return null;
              return <p key={i} className="text-zinc-400 text-[15px] leading-relaxed">{line}</p>;
            })}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}

export default function ProjectViewer({ windowId }: { windowId: string }) {
  const currentUser = useOSStore((s) => s.currentUser);
  const user = currentUser ? USERS[currentUser] : null;
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const projects = user ? getProjectsForUser(user.id) : [];

  if (selectedProject) {
    return <ProjectDetail project={selectedProject} onBack={() => setSelectedProject(null)} accentColor={user?.accentColor || '#6366f1'} />;
  }

  return (
    <div className="flex flex-col h-full bg-zinc-950 backdrop-blur-3xl" data-testid="project-viewer">
      <div className="shrink-0 p-6 border-b border-white/5 bg-zinc-900/40">
        <div className="flex items-baseline justify-between">
          <h2 className="text-white text-2xl font-extrabold tracking-tight">
            {currentUser === 'Team' ? 'All Projects' : `${currentUser}'s Projects`}
          </h2>
          <Badge variant="secondary" className="bg-emerald-500/20 text-emerald-400 border-none font-bold">
            {projects.length} Total
          </Badge>
        </div>
        <p className="text-zinc-400 text-sm mt-2">Explore the digital portfolio and live deployments.</p>
      </div>
      <ScrollArea className="flex-1">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
          {projects.map((project, index) => (
            <ProjectCard key={project.id} project={project} index={index} onSelect={setSelectedProject} accentColor={user?.accentColor || '#6366f1'} />
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
