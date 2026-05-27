'use client';
// ============================================================
// ProjectViewer — Project display with Lucide icons
// ============================================================
import { useState, useEffect } from 'react';
import { useOSStore } from '@/store/useOSStore';
import { USERS, getProjectsForUser } from '@/lib/mockData';
import { PROJECT_ICONS, ChevronLeft, ExternalLink, Activity, CheckCircle2, FolderOpen } from '@/lib/icons';
import type { Project, LiveStats } from '@/types';

function LiveStatusWidget({ endpoint }: { endpoint: string }) {
  const [stats, setStats] = useState<LiveStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setStats({
        status: 'online',
        uptime: '99.97%',
        ping: Math.floor(Math.random() * 20) + 8,
        lastChecked: new Date().toLocaleTimeString(),
      });
      setLoading(false);
    }, 1200);

    const interval = setInterval(() => {
      setStats((prev) => prev ? {
        ...prev,
        ping: Math.floor(Math.random() * 20) + 8,
        lastChecked: new Date().toLocaleTimeString(),
      } : null);
    }, 15000);

    return () => { clearTimeout(timer); clearInterval(interval); };
  }, [endpoint]);

  if (loading) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 card-surface">
        <div className="w-2 h-2 rounded-full bg-[var(--text-muted)] animate-pulse" />
        <span className="text-[var(--text-muted)] text-xs">Checking status...</span>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="flex items-center gap-4 px-4 py-2.5 rounded-xl bg-emerald-500/[0.06] border border-emerald-500/[0.15]">
      <div className="flex items-center gap-2">
        <div className="status-dot status-dot-online" />
        <span className="text-emerald-300 text-xs font-semibold uppercase tracking-wider">
          {stats.status}
        </span>
      </div>
      <div className="h-3 w-px bg-emerald-500/20" />
      <div className="flex items-center gap-1 text-[var(--text-tertiary)] text-[11px]">
        <Activity className="w-3 h-3" strokeWidth={1.5} />
        Uptime: {stats.uptime}
      </div>
      <span className="text-[var(--text-tertiary)] text-[11px]">Ping: {stats.ping}ms</span>
      <span className="text-[var(--text-muted)] text-[10px] ml-auto">{stats.lastChecked}</span>
    </div>
  );
}

function ProjectCard({ project, onSelect, accentColor }: { project: Project; onSelect: (p: Project) => void; accentColor: string }) {
  const ProjIcon = PROJECT_ICONS[project.id];

  return (
    <button
      onClick={() => onSelect(project)}
      className="w-full flex items-center gap-3 p-3 card-surface text-left group"
    >
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0
                   group-hover:scale-105 transition-transform"
        style={{
          background: `linear-gradient(135deg, ${accentColor}12, ${accentColor}05)`,
          border: `1px solid ${accentColor}18`,
        }}
      >
        {ProjIcon ? (
          <ProjIcon className="w-4.5 h-4.5" style={{ color: accentColor }} strokeWidth={1.5} />
        ) : (
          <FolderOpen className="w-4.5 h-4.5" style={{ color: accentColor }} strokeWidth={1.5} />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="text-[var(--text-primary)] text-sm font-medium truncate">{project.title}</h3>
        <div className="flex gap-1.5 mt-1 flex-wrap">
          {project.tags.slice(0, 3).map((tag) => (
            <span key={tag} className="text-[9px] px-1.5 py-0.5 rounded-md bg-[var(--bg-card)] border border-[var(--border-subtle)] text-[var(--text-muted)]">
              {tag}
            </span>
          ))}
        </div>
      </div>
      {project.liveApiEndpoint && (
        <div className="status-dot status-dot-online shrink-0" />
      )}
    </button>
  );
}

function ProjectDetail({ project, onBack, accentColor }: { project: Project; onBack: () => void; accentColor: string }) {
  const [iframeError, setIframeError] = useState(false);
  const ProjIcon = PROJECT_ICONS[project.id];

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="shrink-0 p-4 border-b border-[var(--border-subtle)]">
        <div className="flex items-center gap-3 mb-3">
          <button
            onClick={onBack}
            className="p-1.5 rounded-lg hover:bg-[var(--bg-card-hover)] text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors"
          >
            <ChevronLeft className="w-4 h-4" strokeWidth={2} />
          </button>
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{
              background: `linear-gradient(135deg, ${accentColor}15, ${accentColor}05)`,
              border: `1px solid ${accentColor}20`,
            }}
          >
            {ProjIcon ? (
              <ProjIcon className="w-5 h-5" style={{ color: accentColor }} strokeWidth={1.5} />
            ) : (
              <FolderOpen className="w-5 h-5" style={{ color: accentColor }} strokeWidth={1.5} />
            )}
          </div>
          <div>
            <h2 className="text-[var(--text-primary)] text-lg font-semibold">{project.title}</h2>
            <div className="flex gap-1.5 mt-0.5">
              {project.tags.map((tag) => (
                <span key={tag} className="text-[9px] px-1.5 py-0.5 rounded-md bg-[var(--bg-card)] border border-[var(--border-subtle)] text-[var(--text-muted)]">
                  {tag}
                </span>
              ))}
            </div>
          </div>
          <div className="ml-auto flex gap-2">
            <a
              href={project.projectUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-ghost text-xs"
            >
              <ExternalLink className="w-3.5 h-3.5" strokeWidth={1.5} />
              Open
            </a>
          </div>
        </div>
        {project.liveApiEndpoint && (
          <LiveStatusWidget endpoint={project.liveApiEndpoint} />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        {project.hasIframe && !iframeError ? (
          <div className="relative w-full h-full">
            <iframe
              src={project.projectUrl}
              sandbox="allow-scripts allow-same-origin allow-popups"
              className="w-full h-full border-0"
              onError={() => setIframeError(true)}
              title={project.title}
            />
            <div className="absolute bottom-3 right-3">
              <a
                href={project.projectUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-ghost text-xs"
              >
                <ExternalLink className="w-3 h-3" strokeWidth={1.5} />
                New tab
              </a>
            </div>
          </div>
        ) : (
          <div className="p-6">
            {project.description.split('\n').map((line, i) => {
              if (line.startsWith('## ')) {
                return <h2 key={i} className="text-xl font-bold text-[var(--text-primary)] mt-6 mb-3">{line.slice(3)}</h2>;
              }
              if (line.startsWith('### ')) {
                return <h3 key={i} className="text-base font-semibold text-[var(--text-secondary)] mt-4 mb-2">{line.slice(4)}</h3>;
              }
              if (line.startsWith('- **')) {
                const match = line.match(/- \*\*(.+?)\*\*:?\s*(.*)/);
                if (match) {
                  return (
                    <div key={i} className="flex gap-2 py-0.5 text-[var(--text-tertiary)] text-sm">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500/50 shrink-0 mt-0.5" strokeWidth={1.5} />
                      <span><strong className="text-[var(--text-secondary)]">{match[1]}:</strong> {match[2]}</span>
                    </div>
                  );
                }
              }
              if (line.startsWith('- ')) {
                return (
                  <div key={i} className="flex gap-2 py-0.5 text-[var(--text-tertiary)] text-sm">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500/50 shrink-0 mt-0.5" strokeWidth={1.5} />
                    <span>{line.slice(2)}</span>
                  </div>
                );
              }
              if (line.trim() === '') return <div key={i} className="h-2" />;
              return <p key={i} className="text-[var(--text-tertiary)] text-sm leading-relaxed">{line}</p>;
            })}
          </div>
        )}
      </div>
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
    <div className="flex flex-col h-full bg-[var(--bg-base)]" data-testid="project-viewer">
      <div className="shrink-0 p-4 border-b border-[var(--border-subtle)]">
        <h2 className="text-[var(--text-primary)] text-base font-semibold">
          {currentUser === 'Team' ? 'All Projects' : `${currentUser}'s Projects`}
        </h2>
        <p className="text-[var(--text-muted)] text-xs mt-0.5">{projects.length} projects</p>
      </div>
      <div className="flex-1 overflow-y-auto p-3 space-y-2 scrollbar-hide">
        {projects.map((project) => (
          <ProjectCard key={project.id} project={project} onSelect={setSelectedProject} accentColor={user?.accentColor || '#6366f1'} />
        ))}
      </div>
    </div>
  );
}
