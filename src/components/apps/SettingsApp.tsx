'use client';
// ============================================================
// SettingsApp — System settings with Lucide icons
// ============================================================
import { useOSStore } from '@/store/useOSStore';
import { USERS } from '@/lib/mockData';
import { USER_ICONS, Monitor, Zap, RotateCcw, Trash2, ArrowLeftRight, LogOut } from '@/lib/icons';

export default function SettingsApp({ windowId }: { windowId: string }) {
  const { currentUser, switchUser, logoutUser, isMobile } = useOSStore();
  const user = currentUser ? USERS[currentUser] : null;
  const UserIcon = currentUser ? USER_ICONS[currentUser] : null;

  const resetBoot = () => {
    localStorage.removeItem('boot-done');
    window.location.reload();
  };

  return (
    <div className="flex flex-col h-full bg-[var(--bg-base)] overflow-y-auto p-5 scrollbar-hide"
      data-testid="settings-app">

      <h2 className="text-[var(--text-primary)] text-base font-semibold mb-5">Settings</h2>

      {/* User section */}
      <div className="mb-6">
        <h3 className="text-[var(--text-muted)] text-[10px] uppercase tracking-wider mb-3 font-medium">Account</h3>
        <div className="card-surface p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[var(--text-tertiary)] text-sm">Current User</span>
            <span className="text-[var(--text-primary)] text-sm font-medium flex items-center gap-2">
              {UserIcon && (
                <UserIcon className="w-3.5 h-3.5" style={{ color: user?.accentColor }} strokeWidth={1.5} />
              )}
              {currentUser}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[var(--text-tertiary)] text-sm">Role</span>
            <span className="text-[var(--text-secondary)] text-xs">{user?.role}</span>
          </div>
          <div className="flex gap-2 pt-1">
            <button
              onClick={switchUser}
              className="btn-ghost flex-1 text-xs"
            >
              <ArrowLeftRight className="w-3.5 h-3.5" strokeWidth={1.5} />
              Switch User
            </button>
            <button
              onClick={logoutUser}
              className="px-4 py-2 rounded-xl bg-rose-500/10 border border-rose-500/20
                       text-rose-400 text-xs hover:bg-rose-500/20 transition-colors
                       flex items-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" strokeWidth={1.5} />
              Sign Out
            </button>
          </div>
        </div>
      </div>

      {/* System section */}
      <div className="mb-6">
        <h3 className="text-[var(--text-muted)] text-[10px] uppercase tracking-wider mb-3 font-medium">System</h3>
        <div className="card-surface p-4 space-y-3">
          <SettingRow icon={<Zap className="w-3.5 h-3.5" strokeWidth={1.5} />} label="Version" value="v1.0.0" />
          <SettingRow icon={<Zap className="w-3.5 h-3.5" strokeWidth={1.5} />} label="Runtime" value="Next.js 15" />
          <SettingRow icon={<Zap className="w-3.5 h-3.5" strokeWidth={1.5} />} label="State" value="Zustand 5.x" />
          <SettingRow
            icon={<Monitor className="w-3.5 h-3.5" strokeWidth={1.5} />}
            label="Display Mode"
            value={isMobile ? 'Mobile Launcher' : 'Desktop'}
          />
          <div className="flex items-center justify-between">
            <span className="text-[var(--text-tertiary)] text-sm">Accent Color</span>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full border border-[var(--border-default)]"
                style={{ backgroundColor: user?.accentColor }}
              />
              <span className="text-[var(--text-tertiary)] text-xs font-mono">{user?.accentColor}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div>
        <h3 className="text-[var(--text-muted)] text-[10px] uppercase tracking-wider mb-3 font-medium">Actions</h3>
        <div className="space-y-2">
          <button
            onClick={resetBoot}
            className="btn-ghost w-full justify-start text-sm"
          >
            <RotateCcw className="w-4 h-4" strokeWidth={1.5} />
            Replay Boot Sequence
          </button>
          <button
            onClick={() => localStorage.clear()}
            className="btn-ghost w-full justify-start text-sm"
          >
            <Trash2 className="w-4 h-4" strokeWidth={1.5} />
            Clear Local Storage
          </button>
        </div>
      </div>
    </div>
  );
}

function SettingRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[var(--text-tertiary)] text-sm flex items-center gap-2">
        <span className="text-[var(--text-muted)]">{icon}</span>
        {label}
      </span>
      <span className="text-[var(--text-secondary)] text-xs font-mono">{value}</span>
    </div>
  );
}
