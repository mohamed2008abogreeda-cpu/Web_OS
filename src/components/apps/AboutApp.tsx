'use client';
// ============================================================
// AboutApp — User profile with Lucide icons
// ============================================================
import { useOSStore } from '@/store/useOSStore';
import { USERS } from '@/lib/mockData';
import { USER_ICONS, Globe, Zap, Activity, Monitor, Code2, Palette } from '@/lib/icons';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function AboutApp({ windowId }: { windowId: string }) {
  const currentUser = useOSStore((s) => s.currentUser);
  const user = currentUser ? USERS[currentUser] : null;

  if (!user) return null;

  const usersToShow = currentUser === 'Team'
    ? [USERS.Mohammed, USERS.Moamen]
    : [user];

  return (
    <ScrollArea className="h-full bg-[var(--bg-base)]" data-testid="about-app">
      <div className="flex flex-col p-6 gap-8">
        {usersToShow.map((u) => {
          const UserIcon = USER_ICONS[u.name];
          return (
            <div key={u.id} className="flex flex-col last:mb-0">
              {/* Header */}
              <div className="flex items-start gap-4 mb-6">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center
                             shrink-0 icon-container shadow-md"
                  style={{
                    background: `linear-gradient(135deg, ${u.accentColor}18, ${u.accentColor}06)`,
                    borderColor: `${u.accentColor}25`,
                  }}
                >
                  {UserIcon && (
                    <UserIcon
                      className="w-6 h-6"
                      style={{ color: u.accentColor }}
                      strokeWidth={1.5}
                    />
                  )}
                </div>
                <div>
                  <h2 className="text-[var(--text-primary)] text-xl font-bold">{u.name}</h2>
                  <p className="text-[var(--text-tertiary)] text-sm mt-0.5">{u.role}</p>
                  <div className="flex items-center gap-1.5 mt-2">
                    <div className="status-dot status-dot-online" />
                    <span className="text-[10px] text-emerald-400/80 font-bold uppercase tracking-wider">Available</span>
                  </div>
                </div>
              </div>

              {/* Bio */}
              <div className="card-surface p-4 mb-4 border border-[var(--border-subtle)] bg-[var(--bg-elevated)]/40 rounded-2xl">
                <p className="text-[var(--text-secondary)] text-sm leading-relaxed">{u.bio}</p>
              </div>

              {/* Stats grid */}
              <div className="grid grid-cols-2 gap-3.5">
                {u.name === 'Mohammed' ? (
                  <>
                    <StatCard icon={<Code2 className="w-4 h-4" strokeWidth={1.6} />} label="Stack" value="Node.js / Discord.js" accent={u.accentColor} />
                    <StatCard icon={<Activity className="w-4 h-4" strokeWidth={1.6} />} label="Bots Active" value="3 (24/7)" accent={u.accentColor} />
                    <StatCard icon={<Globe className="w-4 h-4" strokeWidth={1.6} />} label="Servers" value="150+" accent={u.accentColor} />
                    <StatCard icon={<Zap className="w-4 h-4" strokeWidth={1.6} />} label="Infra" value="Cloudflare Edge" accent={u.accentColor} />
                  </>
                ) : (
                  <>
                    <StatCard icon={<Palette className="w-4 h-4" strokeWidth={1.6} />} label="Stack" value="React / Next.js" accent={u.accentColor} />
                    <StatCard icon={<Activity className="w-4 h-4" strokeWidth={1.6} />} label="Open Source" value="3.2k ⭐" accent={u.accentColor} />
                    <StatCard icon={<Globe className="w-4 h-4" strokeWidth={1.6} />} label="NPM Downloads" value="18k/week" accent={u.accentColor} />
                    <StatCard icon={<Monitor className="w-4 h-4" strokeWidth={1.6} />} label="Design" value="Framer Motion" accent={u.accentColor} />
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </ScrollArea>
  );
}

function StatCard({ icon, label, value, accent }: { icon: React.ReactNode; label: string; value: string; accent: string }) {
  return (
    <div className="card-surface p-4 flex items-start gap-3 border border-[var(--border-subtle)] bg-[var(--bg-elevated)]/30 rounded-2xl">
      <div
        className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
        style={{
          background: `linear-gradient(135deg, ${accent}12, ${accent}06)`,
          color: accent,
        }}
      >
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-[var(--text-muted)] text-[10px] font-bold uppercase tracking-wider mb-1">{label}</p>
        <p className="text-[var(--text-secondary)] text-xs sm:text-sm font-semibold truncate">{value}</p>
      </div>
    </div>
  );
}

