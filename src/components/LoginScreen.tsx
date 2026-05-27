'use client';
// ============================================================
// LoginScreen — Triple-user selection (Mohammed, Moamen, Team)
// ============================================================
import { motion } from 'framer-motion';
import { useOSStore } from '@/store/useOSStore';
import { USERS } from '@/lib/mockData';
import type { UserName } from '@/types';

function UserCard({ name, delay }: { name: UserName; delay: number }) {
  const user = USERS[name];
  const loginUser = useOSStore((s) => s.loginUser);

  return (
    <motion.button
      className="group flex flex-col items-center gap-4 p-6 sm:p-8 rounded-2xl sm:rounded-3xl
                 bg-white/[0.03] border border-white/[0.06]
                 hover:bg-white/[0.07] hover:border-white/[0.15]
                 backdrop-blur-xl transition-all duration-500 cursor-pointer
                 focus:outline-none focus:ring-2 focus:ring-white/20
                 w-44 sm:w-56"
      onClick={() => loginUser(name)}
      whileHover={{ scale: 1.04, y: -4 }}
      whileTap={{ scale: 0.96 }}
      data-testid={`login-${name.toLowerCase()}`}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay, ease: 'easeOut' }}
    >
      {/* Avatar */}
      <div
        className="w-20 h-20 sm:w-28 sm:h-28 rounded-full flex items-center justify-center text-4xl sm:text-5xl
                   border-2 border-white/10 group-hover:border-white/25 transition-all duration-500
                   shadow-lg"
        style={{
          background: `radial-gradient(circle at 30% 30%, ${user.accentColor}40, ${user.accentColor}15)`,
          boxShadow: `0 0 40px ${user.accentColor}20`,
        }}
      >
        <span className="select-none">{user.emoji}</span>
      </div>

      {/* Name + Role */}
      <div className="text-center">
        <h2 className="text-white text-lg sm:text-xl font-semibold tracking-tight">
          {name}
        </h2>
        <p className="text-gray-500 text-[11px] sm:text-xs mt-1 font-light leading-tight max-w-[180px]">
          {user.role}
        </p>
      </div>

      {/* Login CTA */}
      <div
        className="flex items-center gap-2 text-[10px] sm:text-xs font-medium px-3 py-1 rounded-full
                   transition-all duration-300 opacity-0 group-hover:opacity-100
                   translate-y-2 group-hover:translate-y-0"
        style={{
          color: user.accentColor,
          backgroundColor: `${user.accentColor}15`,
        }}
      >
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
        </svg>
        Log In
      </div>
    </motion.button>
  );
}

export default function LoginScreen() {
  return (
    <motion.div
      className="fixed inset-0 z-[9000] bg-black flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      data-testid="login-screen"
    >
      {/* Ambient gradients — Samsung Internet safe (no mix-blend-mode) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute w-[600px] h-[600px] rounded-full blur-[160px] opacity-20"
          style={{
            top: '-20%', left: '-15%',
            background: `radial-gradient(circle, ${USERS.Mohammed.accentColor}, transparent 70%)`,
          }}
        />
        <div
          className="absolute w-[600px] h-[600px] rounded-full blur-[160px] opacity-20"
          style={{
            bottom: '-20%', right: '-15%',
            background: `radial-gradient(circle, ${USERS.Moamen.accentColor}, transparent 70%)`,
          }}
        />
        <div
          className="absolute w-[400px] h-[400px] rounded-full blur-[120px] opacity-15"
          style={{
            top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
            background: `radial-gradient(circle, ${USERS.Team.accentColor}, transparent 70%)`,
          }}
        />
      </div>

      {/* Dot grid (Samsung-safe, no complex background-image) */}
      <div className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.3) 1px, transparent 1px)',
          backgroundSize: '30px 30px',
        }}
      />

      <div className="relative z-10 flex flex-col items-center gap-10 sm:gap-14">
        {/* Logo */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.8 }}
        >
          <div className="flex items-center justify-center gap-3 mb-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-purple-500/20">
              <span className="text-white text-lg sm:text-xl font-black">W</span>
            </div>
            <h1 className="text-white text-2xl sm:text-3xl font-bold tracking-tight">
              Web<span className="text-gray-500 font-light">OS</span>
            </h1>
          </div>
          <p className="text-gray-600 text-xs sm:text-sm font-light tracking-wide">
            Select a profile to continue
          </p>
        </motion.div>

        {/* User Cards */}
        <div className="flex gap-4 sm:gap-6 flex-wrap justify-center">
          <UserCard name="Mohammed" delay={0.3} />
          <UserCard name="Moamen" delay={0.45} />
          <UserCard name="Team" delay={0.6} />
        </div>

        {/* Footer */}
        <motion.p
          className="text-gray-700 text-[10px] sm:text-xs font-mono"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
        >
          v1.0.0 · Next.js 15 · Cloudflare Edge
        </motion.p>
      </div>
    </motion.div>
  );
}
