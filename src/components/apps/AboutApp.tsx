'use client';
// ============================================================
// AboutApp — Glassmorphism System Profiles
// ============================================================
import { useState } from 'react';
import { useOSStore } from '@/store/useOSStore';
import { USERS } from '@/lib/mockData';
import { USER_ICONS, Globe, Zap, Activity, Monitor, Code2, Palette, Info } from '@/lib/icons';

export default function AboutApp({ windowId }: { windowId: string }) {
  const currentUser = useOSStore((s) => s.currentUser);
  const user = currentUser ? USERS[currentUser] : null;

  const usersToShow = currentUser === 'Team'
    ? [USERS.Mohammed, USERS.Moamen]
    : user ? [user] : [];

  const [activeTab, setActiveTab] = useState(usersToShow[0]?.id || 'system');

  if (usersToShow.length === 0) return null;

  return (
    <div className="flex h-full bg-zinc-950/60 backdrop-blur-2xl text-white select-none" data-testid="about-app">
      {/* Sidebar */}
      <div className="w-48 shrink-0 bg-black/40 border-r border-white/10 p-4 flex flex-col gap-2">
        <div className="mb-4 px-2">
          <h2 className="text-xs font-bold text-zinc-500 uppercase tracking-widest">About</h2>
        </div>
        {usersToShow.map((u) => {
          const UserIcon = USER_ICONS[u.name];
          return (
            <button
              key={u.id}
              onClick={() => setActiveTab(u.id)}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === u.id ? 'bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.4)]' : 'text-zinc-400 hover:bg-white/10 hover:text-zinc-200'
              }`}
            >
              {UserIcon && <UserIcon className="w-4 h-4" />}
              {u.name}
            </button>
          );
        })}
        <button
          onClick={() => setActiveTab('system')}
          className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors mt-4 ${
            activeTab === 'system' ? 'bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.4)]' : 'text-zinc-400 hover:bg-white/10 hover:text-zinc-200'
          }`}
        >
          <Info className="w-4 h-4" />
          System OS
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-2xl">
          {activeTab === 'system' ? (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 flex flex-col items-center justify-center py-20 text-center gap-4">
              <Monitor className="w-16 h-16 text-emerald-400" />
              <h1 className="text-4xl font-extrabold tracking-tight mt-4">WebOS v2.0</h1>
              <p className="text-zinc-400 max-w-md mx-auto">
                A highly interactive, glassmorphic portfolio operating system built with Next.js, Tailwind CSS, and Zustand. 
                Features zero-click spectator mode and native window management.
              </p>
            </div>
          ) : (
            usersToShow.map((u) => {
              if (u.id !== activeTab) return null;
              const UserIcon = USER_ICONS[u.name];
              return (
                <div key={u.id} className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                  {/* Header */}
                  <div className="flex items-center gap-6 mb-8">
                    <div
                      className="w-24 h-24 rounded-3xl flex items-center justify-center shadow-[0_0_40px_rgba(255,255,255,0.1)] border border-white/20"
                      style={{
                        background: `linear-gradient(135deg, ${u.accentColor}30, ${u.accentColor}10)`,
                      }}
                    >
                      {UserIcon && <UserIcon className="w-12 h-12" style={{ color: u.accentColor }} />}
                    </div>
                    <div>
                      <h1 className="text-4xl font-extrabold tracking-tight">{u.name}</h1>
                      <p className="text-xl text-zinc-400 mt-1">{u.role}</p>
                      <div className="flex items-center gap-2 mt-3">
                        <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.8)] animate-pulse" />
                        <span className="text-emerald-400 text-xs font-bold uppercase tracking-wider">Available</span>
                      </div>
                    </div>
                  </div>

                  {/* Bio */}
                  <div className="bg-zinc-900/50 border border-white/10 rounded-2xl p-6 mb-6 backdrop-blur-md">
                    <p className="text-zinc-300 leading-relaxed text-lg">{u.bio}</p>
                  </div>

                  {/* Stats grid */}
                  <div className="grid grid-cols-2 gap-4">
                    {u.name === 'Mohammed' ? (
                      <>
                        <StatCard icon={<Code2 />} label="Stack" value="Node.js / Discord.js" accent={u.accentColor} />
                        <StatCard icon={<Activity />} label="Bots Active" value="3 (24/7)" accent={u.accentColor} />
                        <StatCard icon={<Globe />} label="Servers" value="150+" accent={u.accentColor} />
                        <StatCard icon={<Zap />} label="Infra" value="Cloudflare Edge" accent={u.accentColor} />
                      </>
                    ) : (
                      <>
                        <StatCard icon={<Palette />} label="Stack" value="React / Next.js" accent={u.accentColor} />
                        <StatCard icon={<Activity />} label="Open Source" value="3.2k ⭐" accent={u.accentColor} />
                        <StatCard icon={<Globe />} label="NPM Downloads" value="18k/week" accent={u.accentColor} />
                        <StatCard icon={<Monitor />} label="Design" value="Framer Motion" accent={u.accentColor} />
                      </>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, accent }: { icon: React.ReactNode; label: string; value: string; accent: string }) {
  return (
    <div className="bg-white/5 border border-white/10 hover:border-white/20 p-5 rounded-2xl flex items-start gap-4 transition-all duration-300 hover:bg-white/10 hover:scale-[1.02]">
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
        style={{ background: `linear-gradient(135deg, ${accent}20, ${accent}05)`, color: accent }}
      >
        <div className="w-5 h-5">{icon}</div>
      </div>
      <div>
        <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mb-1">{label}</p>
        <p className="text-white font-semibold text-lg">{value}</p>
      </div>
    </div>
  );
}
