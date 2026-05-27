'use client';
// ============================================================
// SettingsApp — OS settings panel
// ============================================================
import { useOSStore } from '@/store/useOSStore';
import { USERS } from '@/lib/mockData';

export default function SettingsApp({ windowId }: { windowId: string }) {
  const { currentUser, switchUser, logoutUser, isMobile } = useOSStore();
  const user = currentUser ? USERS[currentUser] : null;

  const resetBoot = () => {
    localStorage.removeItem('boot-done');
    window.location.reload();
  };

  return (
    <div className="flex flex-col h-full bg-gray-950/50 overflow-y-auto p-5 scrollbar-hide"
      data-testid="settings-app">

      <h2 className="text-white text-base font-semibold mb-4">Settings</h2>

      {/* User section */}
      <div className="mb-6">
        <h3 className="text-gray-500 text-[10px] uppercase tracking-wider mb-3">Account</h3>
        <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-gray-400 text-sm">Current User</span>
            <span className="text-white text-sm font-medium flex items-center gap-2">
              <span>{user?.emoji}</span> {currentUser}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-400 text-sm">Role</span>
            <span className="text-gray-300 text-xs">{user?.role}</span>
          </div>
          <div className="flex gap-2 pt-1">
            <button
              onClick={switchUser}
              className="flex-1 py-2 rounded-lg bg-white/[0.04] border border-white/[0.08]
                       text-gray-300 text-xs hover:bg-white/[0.08] transition-colors"
            >
              Switch User
            </button>
            <button
              onClick={logoutUser}
              className="px-4 py-2 rounded-lg bg-red-500/10 border border-red-500/20
                       text-red-400 text-xs hover:bg-red-500/20 transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>

      {/* System section */}
      <div className="mb-6">
        <h3 className="text-gray-500 text-[10px] uppercase tracking-wider mb-3">System</h3>
        <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-gray-400 text-sm">Version</span>
            <span className="text-gray-300 text-xs font-mono">v1.0.0</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-400 text-sm">Runtime</span>
            <span className="text-gray-300 text-xs font-mono">Next.js 15</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-400 text-sm">State</span>
            <span className="text-gray-300 text-xs font-mono">Zustand 5.x</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-400 text-sm">Display Mode</span>
            <span className="text-gray-300 text-xs font-mono">{isMobile ? 'Mobile Launcher' : 'Desktop'}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-400 text-sm">Accent Color</span>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full border border-white/[0.1]"
                style={{ backgroundColor: user?.accentColor }}
              />
              <span className="text-gray-400 text-xs font-mono">{user?.accentColor}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div>
        <h3 className="text-gray-500 text-[10px] uppercase tracking-wider mb-3">Actions</h3>
        <div className="space-y-2">
          <button
            onClick={resetBoot}
            className="w-full py-2.5 rounded-lg bg-white/[0.03] border border-white/[0.06]
                     text-gray-400 text-sm hover:bg-white/[0.06] hover:text-gray-300 transition-colors text-left px-4"
          >
            🔄 Replay Boot Sequence
          </button>
          <button
            onClick={() => localStorage.clear()}
            className="w-full py-2.5 rounded-lg bg-white/[0.03] border border-white/[0.06]
                     text-gray-400 text-sm hover:bg-white/[0.06] hover:text-gray-300 transition-colors text-left px-4"
          >
            🗑️ Clear Local Storage
          </button>
        </div>
      </div>
    </div>
  );
}
