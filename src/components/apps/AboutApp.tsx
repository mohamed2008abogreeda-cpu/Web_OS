'use client';
// ============================================================
// AboutApp — User profile card
// ============================================================
import { useOSStore } from '@/store/useOSStore';
import { USERS } from '@/lib/mockData';

export default function AboutApp({ windowId }: { windowId: string }) {
  const currentUser = useOSStore((s) => s.currentUser);
  const user = currentUser ? USERS[currentUser] : null;

  if (!user) return null;

  // For Team mode, show both users
  const usersToShow = currentUser === 'Team'
    ? [USERS.Mohammed, USERS.Moamen]
    : [user];

  return (
    <div className="flex flex-col h-full bg-gray-950/50 overflow-y-auto p-6 scrollbar-hide"
      data-testid="about-app">

      {usersToShow.map((u) => (
        <div key={u.id} className="mb-8 last:mb-0">
          {/* Header */}
          <div className="flex items-start gap-4 mb-6">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl
                       border border-white/[0.1] shrink-0"
              style={{
                background: `linear-gradient(135deg, ${u.accentColor}25, ${u.accentColor}08)`,
              }}
            >
              {u.emoji}
            </div>
            <div>
              <h2 className="text-white text-xl font-bold">{u.name}</h2>
              <p className="text-gray-400 text-sm mt-0.5">{u.role}</p>
              <div
                className="inline-flex items-center gap-1.5 mt-2 px-2.5 py-0.5 rounded-full text-[10px] font-medium"
                style={{
                  color: u.accentColor,
                  backgroundColor: `${u.accentColor}12`,
                }}
              >
                <div className="w-1.5 h-1.5 rounded-full animate-pulse"
                  style={{ backgroundColor: u.accentColor }} />
                Available
              </div>
            </div>
          </div>

          {/* Bio */}
          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] mb-4">
            <p className="text-gray-400 text-sm leading-relaxed">{u.bio}</p>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 gap-2">
            {u.name === 'Mohammed' ? (
              <>
                <StatCard label="Stack" value="Node.js / Discord.js" />
                <StatCard label="Bots Active" value="3 (24/7)" />
                <StatCard label="Servers" value="150+" />
                <StatCard label="Infra" value="Cloudflare Edge" />
              </>
            ) : (
              <>
                <StatCard label="Stack" value="React / Next.js" />
                <StatCard label="Open Source" value="3.2k ⭐" />
                <StatCard label="NPM Downloads" value="18k/week" />
                <StatCard label="Design" value="Framer Motion" />
              </>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06]">
      <p className="text-gray-600 text-[10px] uppercase tracking-wider mb-0.5">{label}</p>
      <p className="text-gray-300 text-sm font-medium">{value}</p>
    </div>
  );
}
