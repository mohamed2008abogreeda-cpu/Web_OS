'use client';
// ============================================================
// SettingsApp — System settings with Lucide icons
// ============================================================
import { useOSStore } from '@/store/useOSStore';
import { USERS } from '@/lib/mockData';
import { USER_ICONS, Monitor, Zap, RotateCcw, Trash2, ArrowLeftRight, LogOut } from '@/lib/icons';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';

export default function SettingsApp({ windowId }: { windowId: string }) {
  const { currentUser, switchUser, logoutUser, isMobile } = useOSStore();
  const user = currentUser ? USERS[currentUser] : null;
  const UserIcon = currentUser ? USER_ICONS[currentUser] : null;

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

  return (
    <ScrollArea className="h-full bg-[var(--bg-base)]" data-testid="settings-app">
      <div className="flex flex-col p-6 gap-6">
        <h2 className="text-[var(--text-primary)] text-lg font-bold tracking-tight">Settings</h2>

        {/* User section */}
        <div>
          <h3 className="text-[var(--text-muted)] text-[10px] uppercase font-bold tracking-wider mb-3">Profile</h3>
          <div className="card-surface p-4 flex flex-col gap-4 border border-[var(--border-subtle)] bg-[var(--bg-elevated)]/40 rounded-2xl">
            <div className="flex items-center justify-between">
              <span className="text-[var(--text-secondary)] text-xs sm:text-sm">Current Profile</span>
              <span className="text-[var(--text-primary)] text-xs sm:text-sm font-semibold flex items-center gap-2">
                {UserIcon && (
                  <UserIcon className="w-4 h-4" style={{ color: user?.accentColor }} strokeWidth={1.6} />
                )}
                {currentUser}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[var(--text-secondary)] text-xs sm:text-sm">Role</span>
              <span className="text-[var(--text-tertiary)] text-xs font-medium">{user?.role}</span>
            </div>
            <div className="flex gap-2.5 pt-1.5">
              <Button
                variant="neumorphic"
                onClick={() => {
                  const prevUser = currentUser;
                  switchUser();
                  toast.info(`Switched user context from ${prevUser}`);
                }}
                className="flex-1 text-xs"
              >
                <ArrowLeftRight className="w-3.5 h-3.5" strokeWidth={1.6} />
                Switch User
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  logoutUser();
                  toast.success('Logged out successfully');
                }}
                className="flex-1 text-xs"
              >
                <LogOut className="w-3.5 h-3.5" strokeWidth={1.6} />
                Sign Out
              </Button>
            </div>
          </div>
        </div>

        {/* System section */}
        <div>
          <h3 className="text-[var(--text-muted)] text-[10px] uppercase font-bold tracking-wider mb-3">System Specifications</h3>
          <div className="card-surface p-4 flex flex-col gap-3.5 border border-[var(--border-subtle)] bg-[var(--bg-elevated)]/40 rounded-2xl">
            <SettingRow icon={<Zap className="w-4 h-4" strokeWidth={1.6} />} label="System Version" value="v2.0.0" />
            <SettingRow icon={<Zap className="w-4 h-4" strokeWidth={1.6} />} label="Framework" value="Next.js 16.2" />
            <SettingRow icon={<Zap className="w-4 h-4" strokeWidth={1.6} />} label="State Engine" value="Zustand 5.x" />
            <SettingRow
              icon={<Monitor className="w-4 h-4" strokeWidth={1.6} />}
              label="Active Workspace"
              value={isMobile ? 'Mobile Desktop' : 'Standard Window Manager'}
            />
            <div className="flex items-center justify-between">
              <span className="text-[var(--text-secondary)] text-xs sm:text-sm flex items-center gap-2">
                <span className="text-[var(--text-muted)]"><Monitor className="w-4 h-4" strokeWidth={1.6} /></span>
                Profile Accent
              </span>
              <div className="flex items-center gap-2">
                <div className="w-4.5 h-4.5 rounded-full border border-white/10 shadow-sm"
                  style={{ backgroundColor: user?.accentColor }}
                />
                <span className="text-[var(--text-tertiary)] text-xs font-mono">{user?.accentColor}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div>
          <h3 className="text-[var(--text-muted)] text-[10px] uppercase font-bold tracking-wider mb-3">Developer Operations</h3>
          <div className="flex flex-col gap-2.5">
            <Button
              variant="neumorphic"
              onClick={resetBoot}
              className="w-full justify-start text-xs sm:text-sm h-12"
            >
              <RotateCcw className="w-4.5 h-4.5 text-[var(--text-tertiary)]" strokeWidth={1.6} />
              Replay Boot Sequence
            </Button>
            <Button
              variant="neumorphic"
              onClick={clearStorage}
              className="w-full justify-start text-xs sm:text-sm h-12"
            >
              <Trash2 className="w-4.5 h-4.5 text-rose-400" strokeWidth={1.6} />
              Clear Local Cache & Storage
            </Button>
          </div>
        </div>
      </div>
    </ScrollArea>
  );
}

function SettingRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[var(--text-secondary)] text-xs sm:text-sm flex items-center gap-2">
        <span className="text-[var(--text-muted)]">{icon}</span>
        {label}
      </span>
      <span className="text-[var(--text-tertiary)] text-xs font-semibold font-mono">{value}</span>
    </div>
  );
}

