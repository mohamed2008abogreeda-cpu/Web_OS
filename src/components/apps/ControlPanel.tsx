'use client';
// ============================================================
// ControlPanel — Secret admin panel for project CRUD
// ============================================================
import { useState } from 'react';
import { useOSStore } from '@/store/useOSStore';
import { PROJECTS } from '@/lib/mockData';
import type { Project } from '@/types';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';

type Tab = 'list' | 'add' | 'edit';

function ProjectForm({
  project,
  onSave,
  onCancel,
}: {
  project?: Project;
  onSave: (data: Partial<Project>) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState({
    title: project?.title || '',
    description: project?.description || '',
    projectUrl: project?.projectUrl || '',
    hasIframe: project?.hasIframe || false,
    liveApiEndpoint: project?.liveApiEndpoint || '',
    tags: project?.tags.join(', ') || '',
    iconUrl: project?.iconUrl || '📦',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...form,
      tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
      liveApiEndpoint: form.liveApiEndpoint || null,
    });
  };

  const inputClass = `w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.08]
                      text-gray-200 text-sm outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/10
                      placeholder:text-gray-600 transition-all duration-200`;

  return (
    <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-5 overflow-y-auto flex-1 select-none">
      <div>
        <label className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-2 block">Project Title</label>
        <input
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          className={inputClass}
          placeholder="Project name"
          required
        />
      </div>

      <div>
        <label className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-2 block">Icon (emoji)</label>
        <input
          value={form.iconUrl}
          onChange={(e) => setForm({ ...form, iconUrl: e.target.value })}
          className={inputClass}
          placeholder="📦"
        />
      </div>

      <div>
        <label className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-2 block">Project URL</label>
        <input
          value={form.projectUrl}
          onChange={(e) => setForm({ ...form, projectUrl: e.target.value })}
          className={inputClass}
          placeholder="https://..."
          required
        />
      </div>

      <div className="flex items-center justify-between p-3.5 card-surface border border-white/5 rounded-2xl">
        <span className="text-gray-300 text-xs sm:text-sm font-semibold">Enable iframe preview?</span>
        <button
          type="button"
          onClick={() => setForm({ ...form, hasIframe: !form.hasIframe })}
          className={`w-12 h-6 rounded-full transition-colors relative flex items-center shrink-0 ${
            form.hasIframe ? 'bg-emerald-500' : 'bg-white/[0.1]'
          }`}
          style={{ cursor: 'pointer' }}
        >
          <div
            className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform ${
              form.hasIframe ? 'translate-x-6' : 'translate-x-0.5'
            }`}
          />
        </button>
      </div>

      <div>
        <label className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-2 block">Live API Endpoint (optional)</label>
        <input
          value={form.liveApiEndpoint}
          onChange={(e) => setForm({ ...form, liveApiEndpoint: e.target.value })}
          className={inputClass}
          placeholder="https://api.example.com/health"
        />
      </div>

      <div>
        <label className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-2 block">Tags (comma-separated)</label>
        <input
          value={form.tags}
          onChange={(e) => setForm({ ...form, tags: e.target.value })}
          className={inputClass}
          placeholder="React, Node.js, Discord"
        />
      </div>

      <div>
        <label className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-2 block">Description (Markdown)</label>
        <textarea
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          className={`${inputClass} h-36 resize-none font-mono text-xs`}
          placeholder="## Project Title&#10;&#10;Description..."
        />
      </div>

      <div className="flex gap-3 pt-3">
        <Button
          type="submit"
          className="flex-1 py-3 font-semibold text-sm rounded-xl h-11"
        >
          {project ? 'Update' : 'Create'} Project context
        </Button>
        <Button
          type="button"
          variant="neumorphic"
          onClick={onCancel}
          className="px-5 font-semibold text-sm rounded-xl h-11"
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}

export default function ControlPanel({ windowId }: { windowId: string }) {
  const isAdmin = useOSStore((s) => s.isAdminAuthenticated);
  const [tab, setTab] = useState<Tab>('list');
  const [editProject, setEditProject] = useState<Project | undefined>();

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-950/50 select-none">
        <div className="text-center p-6 bg-black/30 border border-white/5 backdrop-blur-md rounded-3xl max-w-xs shadow-2xl">
          <div className="text-4xl mb-4">🔒</div>
          <p className="text-gray-200 text-base font-bold">Access Denied</p>
          <p className="text-gray-500 text-xs mt-2 leading-relaxed">
            Please run the elevated <code className="text-cyan-400 font-bold bg-white/5 px-1.5 py-0.5 rounded font-mono">sudo login admin</code> shell command inside the Terminal.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gray-950/30 select-none" data-testid="control-panel">
      {/* Tab bar */}
      <div className="shrink-0 flex items-center justify-between p-3 border-b border-white/[0.06] bg-black/25">
        <div className="flex items-center gap-1.5 px-2">
          <span className="text-amber-400 text-xs">🔒</span>
          <span className="text-amber-400 text-xs font-bold uppercase tracking-wider">D1 Panel</span>
        </div>
        
        <div className="flex items-center gap-2">
          {(['list', 'add'] as Tab[]).map((t) => (
            <Button
              key={t}
              onClick={() => { setTab(t); setEditProject(undefined); }}
              variant={tab === t ? 'default' : 'neumorphic'}
              className="h-8.5 px-3.5 text-xs font-semibold rounded-lg"
            >
              {t === 'list' ? 'Projects' : 'Add New'}
            </Button>
          ))}
        </div>
      </div>

      {/* Content */}
      {tab === 'list' && !editProject && (
        <ScrollArea className="flex-1">
          <div className="flex flex-col p-4 gap-3">
            {/* D1 Schema Drizzle code view */}
            <div className="p-4 rounded-2xl bg-cyan-500/[0.03] border border-cyan-500/[0.1] shadow-inner mb-2">
              <p className="text-cyan-400 text-[10px] font-mono font-bold">
                {`/* Drizzle ORM — D1 SQLite Database Schema */`}
              </p>
              <p className="text-cyan-400/70 text-[10px] font-mono mt-1 leading-relaxed">
                {`-- projects(id, user, title, desc, url, has_iframe, live_api_endpoint)`}
              </p>
            </div>

            {PROJECTS.map((p) => (
              <div
                key={p.id}
                className="flex items-center gap-3.5 p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:border-white/10 transition-colors"
              >
                <span className="text-2xl shadow-sm shrink-0">{p.iconUrl}</span>
                <div className="flex-1 min-w-0">
                  <h4 className="text-white text-sm sm:text-base font-bold truncate tracking-tight">{p.title}</h4>
                  <p className="text-gray-500 text-[10px] font-mono mt-0.5">{p.userId}</p>
                </div>
                <Button
                  onClick={() => { setEditProject(p); setTab('edit'); }}
                  variant="neumorphic"
                  className="h-9 px-3 text-xs font-semibold rounded-xl"
                >
                  Edit
                </Button>
              </div>
            ))}
          </div>
        </ScrollArea>
      )}

      {(tab === 'add' || tab === 'edit') && (
        <ProjectForm
          project={editProject}
          onSave={(data) => {
            toast.success(editProject ? 'Project context updated successfully (mock D1)!' : 'New project context created (mock D1)!');
            setTab('list');
            setEditProject(undefined);
          }}
          onCancel={() => { setTab('list'); setEditProject(undefined); }}
        />
      )}
    </div>
  );
}

