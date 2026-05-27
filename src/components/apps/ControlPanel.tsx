'use client';
// ============================================================
// ControlPanel — Secret admin panel for project CRUD
// ============================================================
import { useState } from 'react';
import { useOSStore } from '@/store/useOSStore';
import { PROJECTS } from '@/lib/mockData';
import type { Project } from '@/types';

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

  const inputClass = `w-full px-3 py-2 rounded-lg bg-white/[0.04] border border-white/[0.08]
                      text-gray-200 text-sm outline-none focus:border-white/[0.2]
                      placeholder:text-gray-600 transition-colors`;

  return (
    <form onSubmit={handleSubmit} className="p-4 space-y-4 overflow-y-auto flex-1">
      <div>
        <label className="text-gray-400 text-xs mb-1 block">Title</label>
        <input
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          className={inputClass}
          placeholder="Project name"
          required
        />
      </div>

      <div>
        <label className="text-gray-400 text-xs mb-1 block">Icon (emoji)</label>
        <input
          value={form.iconUrl}
          onChange={(e) => setForm({ ...form, iconUrl: e.target.value })}
          className={inputClass}
          placeholder="📦"
        />
      </div>

      <div>
        <label className="text-gray-400 text-xs mb-1 block">Project URL</label>
        <input
          value={form.projectUrl}
          onChange={(e) => setForm({ ...form, projectUrl: e.target.value })}
          className={inputClass}
          placeholder="https://..."
          required
        />
      </div>

      <div className="flex items-center gap-3">
        <label className="text-gray-400 text-xs">Has iframe preview?</label>
        <button
          type="button"
          onClick={() => setForm({ ...form, hasIframe: !form.hasIframe })}
          className={`w-10 h-5 rounded-full transition-colors relative ${
            form.hasIframe ? 'bg-emerald-500' : 'bg-white/[0.1]'
          }`}
        >
          <div
            className={`w-4 h-4 rounded-full bg-white absolute top-0.5 transition-transform ${
              form.hasIframe ? 'translate-x-5' : 'translate-x-0.5'
            }`}
          />
        </button>
      </div>

      <div>
        <label className="text-gray-400 text-xs mb-1 block">Live API Endpoint (optional)</label>
        <input
          value={form.liveApiEndpoint}
          onChange={(e) => setForm({ ...form, liveApiEndpoint: e.target.value })}
          className={inputClass}
          placeholder="https://api.example.com/health"
        />
      </div>

      <div>
        <label className="text-gray-400 text-xs mb-1 block">Tags (comma-separated)</label>
        <input
          value={form.tags}
          onChange={(e) => setForm({ ...form, tags: e.target.value })}
          className={inputClass}
          placeholder="React, Node.js, Discord"
        />
      </div>

      <div>
        <label className="text-gray-400 text-xs mb-1 block">Description (Markdown)</label>
        <textarea
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          className={`${inputClass} h-32 resize-none font-mono text-xs`}
          placeholder="## Project Title&#10;&#10;Description..."
        />
      </div>

      <div className="flex gap-2 pt-2">
        <button
          type="submit"
          className="flex-1 py-2 rounded-lg bg-emerald-500/20 border border-emerald-500/30
                   text-emerald-300 text-sm font-medium hover:bg-emerald-500/30 transition-colors"
        >
          {project ? 'Update' : 'Create'} Project
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 rounded-lg bg-white/[0.04] border border-white/[0.08]
                   text-gray-400 text-sm hover:bg-white/[0.08] transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

export default function ControlPanel({ windowId }: { windowId: string }) {
  const isAdmin = useOSStore((s) => s.isAdminAuthenticated);
  const [tab, setTab] = useState<Tab>('list');
  const [editProject, setEditProject] = useState<Project | undefined>();
  const [notification, setNotification] = useState('');

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-950/50">
        <div className="text-center">
          <div className="text-4xl mb-3">🔒</div>
          <p className="text-gray-400 text-sm">Access denied</p>
          <p className="text-gray-600 text-xs mt-1">
            Use <code className="text-cyan-400">sudo login admin</code> in Terminal
          </p>
        </div>
      </div>
    );
  }

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(''), 3000);
  };

  return (
    <div className="flex flex-col h-full bg-gray-950/50" data-testid="control-panel">
      {/* Notification toast */}
      {notification && (
        <div className="absolute top-12 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-lg
                      bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-medium">
          {notification}
        </div>
      )}

      {/* Tab bar */}
      <div className="shrink-0 flex items-center gap-1 p-2 border-b border-white/[0.06]">
        <div className="flex items-center gap-1 px-2">
          <span className="text-amber-400 text-xs">🔒</span>
          <span className="text-amber-400 text-xs font-semibold">Admin</span>
        </div>
        <div className="h-4 w-px bg-white/[0.06] mx-1" />
        {(['list', 'add'] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => { setTab(t); setEditProject(undefined); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              tab === t ? 'bg-white/[0.08] text-white' : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            {t === 'list' ? 'Projects' : 'Add New'}
          </button>
        ))}
      </div>

      {/* Content */}
      {tab === 'list' && !editProject && (
        <div className="flex-1 overflow-y-auto p-3 space-y-2 scrollbar-hide">
          {/* D1 Schema comment */}
          <div className="p-3 rounded-lg bg-cyan-500/[0.04] border border-cyan-500/[0.1] mb-3">
            <p className="text-cyan-400 text-[10px] font-mono">
              {`/* Drizzle ORM — D1 Schema */`}
            </p>
            <p className="text-cyan-400/60 text-[10px] font-mono mt-0.5">
              {`-- projects(id, user, title, desc, url, has_iframe, live_api_endpoint)`}
            </p>
          </div>

          {PROJECTS.map((p) => (
            <div
              key={p.id}
              className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.06]"
            >
              <span className="text-xl">{p.iconUrl}</span>
              <div className="flex-1 min-w-0">
                <h4 className="text-white text-sm font-medium truncate">{p.title}</h4>
                <p className="text-gray-600 text-[10px]">{p.userId}</p>
              </div>
              <button
                onClick={() => { setEditProject(p); setTab('edit'); }}
                className="px-2.5 py-1 rounded-lg bg-white/[0.04] text-gray-400 text-xs
                         hover:bg-white/[0.08] hover:text-white transition-colors"
              >
                Edit
              </button>
            </div>
          ))}
        </div>
      )}

      {(tab === 'add' || tab === 'edit') && (
        <ProjectForm
          project={editProject}
          onSave={(data) => {
            showNotification(editProject ? '✓ Project updated (mock)' : '✓ Project created (mock)');
            setTab('list');
            setEditProject(undefined);
          }}
          onCancel={() => { setTab('list'); setEditProject(undefined); }}
        />
      )}
    </div>
  );
}
