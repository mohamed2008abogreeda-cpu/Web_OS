'use client';
// ============================================================
// SettingsApp — macOS/Win11 Hybrid System Preferences
// ============================================================
import { useState } from 'react';
import { useOSStore } from '@/store/useOSStore';
import { USERS } from '@/lib/mockData';
import { USER_ICONS, Monitor, Zap, RotateCcw, Trash2, ArrowLeftRight, LogOut, Settings, Wifi, Battery, Fingerprint, Lock } from '@/lib/icons';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function SettingsApp({ windowId }: { windowId: string }) {
  const { currentUser, switchUser, logoutUser, isMobile } = useOSStore();
  const user = currentUser ? USERS[currentUser] : null;
  const UserIcon = currentUser ? USER_ICONS[currentUser] : null;
  
  const [activeTab, setActiveTab] = useState('general');

  const resetBoot = () => {
    toast.loading('Resetting boot sequence...', { duration: 1500 });
    setTimeout(() => {
      localStorage.removeItem('boot-done');
      window.location.reload();
    }, 1500);
  };

  const clearStorage = () => {
    localStorage.clear();
    toast.success('Local Storage cleared successfully! Rebooting...', { duration: 2000 });
    setTimeout(() => {
      window.location.reload();
    }, 2000);
  };

  const navItems = [
    { id: 'general', label: 'General', icon: Settings },
    { id: 'profile', label: 'Profile', icon: Fingerprint },
    { id: 'network', label: 'Network', icon: Wifi },
    { id: 'security', label: 'Security', icon: Lock },
  ];

  return (
    <div className="flex h-full bg-zinc-950/60 backdrop-blur-2xl text-white select-none">
      {/* Sidebar */}
      <div className="w-48 shrink-0 bg-black/40 border-r border-white/10 p-4 flex flex-col gap-2">
        <div className="mb-4 px-2">
          <h2 className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Settings</h2>
        </div>
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === item.id ? 'bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.4)]' : 'text-zinc-400 hover:bg-white/10 hover:text-zinc-200'
            }`}
          >
            <item.icon className="w-4 h-4" />
            {item.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-2xl">
          {activeTab === 'general' && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
              <h1 className="text-3xl font-extrabold tracking-tight mb-8">General</h1>
              
              <div className="flex flex-col gap-6">
                <div className="bg-white/5 border border-white/10 rounded-2xl p-5 flex flex-col gap-4">
                  <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest">System Info</h3>
                  <SettingRow icon={<Monitor />} label="Operating System" value="WebOS v2.0" />
                  <SettingRow icon={<Zap />} label="Framework" value="Next.js 16.2 Turbopack" />
                  <SettingRow icon={<Battery />} label="Power Mode" value="High Performance" />
                </div>

                <div className="bg-white/5 border border-white/10 rounded-2xl p-5 flex flex-col gap-4">
                  <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Developer Actions</h3>
                  <Button variant="outline" onClick={resetBoot} className="justify-start gap-3 bg-black/50 border-white/10 hover:bg-white/10 h-12 rounded-xl">
                    <RotateCcw className="w-4 h-4 text-emerald-400" /> Replay Boot Sequence
                  </Button>
                  <Button variant="outline" onClick={clearStorage} className="justify-start gap-3 bg-black/50 border-white/10 hover:bg-rose-500/20 hover:border-rose-500/50 h-12 rounded-xl">
                    <Trash2 className="w-4 h-4 text-rose-400" /> Clear Local Cache & Restart
                  </Button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'profile' && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
              <h1 className="text-3xl font-extrabold tracking-tight mb-8">Profile</h1>
              
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex items-center gap-6 mb-6">
                <div 
                  className="w-20 h-20 rounded-full flex items-center justify-center border-2 shadow-[0_0_30px_rgba(255,255,255,0.1)]"
                  style={{ borderColor: user?.accentColor || '#10b981', background: `${user?.accentColor}20` }}
                >
                  {UserIcon && <UserIcon className="w-10 h-10" style={{ color: user?.accentColor }} />}
                </div>
                <div>
                  <h2 className="text-2xl font-bold">{currentUser}</h2>
                  <p className="text-zinc-400">{user?.role}</p>
                </div>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-2xl p-5 flex flex-col gap-4">
                <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Session Control</h3>
                <div className="grid grid-cols-2 gap-4">
                  <Button onClick={() => switchUser()} className="bg-zinc-800 hover:bg-zinc-700 text-white h-12 rounded-xl">
                    <ArrowLeftRight className="w-4 h-4 mr-2" /> Switch User
                  </Button>
                  <Button onClick={() => logoutUser()} className="bg-rose-500/20 text-rose-400 hover:bg-rose-500/30 h-12 rounded-xl border border-rose-500/50">
                    <LogOut className="w-4 h-4 mr-2" /> Sign Out
                  </Button>
                </div>
              </div>
            </div>
          )}

          {(activeTab === 'network' || activeTab === 'security') && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 flex flex-col items-center justify-center py-20 text-center gap-4">
              <Lock className="w-16 h-16 text-zinc-700" />
              <h2 className="text-xl font-bold text-zinc-400">Settings Locked</h2>
              <p className="text-zinc-500 text-sm">You need root privileges to modify {activeTab} settings.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function SettingRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-1">
      <div className="flex items-center gap-3 text-sm text-zinc-300">
        <div className="text-emerald-400">{icon}</div>
        {label}
      </div>
      <span className="text-sm font-mono text-zinc-500 bg-black/40 px-3 py-1 rounded-md">{value}</span>
    </div>
  );
}
