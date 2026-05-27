'use client';
// ============================================================
// LoginScreen — User selection with neumorphic card design
// ============================================================
import { motion } from 'framer-motion';
import { useOSStore } from '@/store/useOSStore';
import { USERS } from '@/lib/mockData';
import { USER_ICONS } from '@/lib/icons';
import type { UserName } from '@/types';

const userOrder: UserName[] = ['Mohammed', 'Moamen', 'Team'];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.2 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 24, scale: 0.96 },
  visible: { opacity: 1, y: 0, scale: 1 },
};

export default function LoginScreen() {
  const loginUser = useOSStore((s) => s.loginUser);

  return (
    <motion.div
      className="fixed inset-0 z-[9998] bg-[var(--bg-base)] flex flex-col items-center justify-center px-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      data-testid="login-screen"
    >
      {/* Ambient background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-[0.04]"
          style={{ background: 'radial-gradient(circle, #6366f1, transparent 70%)' }}
        />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full opacity-[0.03]"
          style={{ background: 'radial-gradient(circle, #06b6d4, transparent 70%)' }}
        />
      </div>

      {/* Header */}
      <motion.div
        className="text-center mb-12 relative z-10"
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.6 }}
      >
        <h1 className="text-[var(--text-primary)] text-2xl sm:text-3xl font-bold tracking-tight">
          Web OS Portfolio
        </h1>
        <p className="text-[var(--text-tertiary)] text-sm mt-2">Select a profile to continue</p>
      </motion.div>

      {/* User Cards */}
      <motion.div
        className="flex flex-col sm:flex-row gap-4 sm:gap-5 relative z-10 w-full max-w-lg sm:max-w-none sm:w-auto"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {userOrder.map((name) => {
          const user = USERS[name];
          const IconComponent = USER_ICONS[name];

          return (
            <motion.button
              key={name}
              variants={cardVariants}
              whileHover={{ y: -4, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => loginUser(name)}
              className="group relative flex sm:flex-col items-center gap-4 sm:gap-0
                         sm:w-48 p-5 sm:p-6 sm:pt-8
                         rounded-2xl border border-[var(--border-subtle)]
                         bg-[var(--bg-card)] backdrop-blur-xl
                         hover:border-[var(--border-default)]
                         transition-all duration-300
                         focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50"
              data-testid={`login-${name.toLowerCase()}`}
              style={{
                boxShadow: `0 0 0 0px ${user.accentColor}00`,
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.boxShadow = `0 8px 32px ${user.accentColor}15, 0 0 0 1px ${user.accentColor}20`;
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.boxShadow = `0 0 0 0px ${user.accentColor}00`;
              }}
            >
              {/* Icon container */}
              <div
                className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center
                           shrink-0 sm:mb-4 transition-transform duration-300
                           group-hover:scale-105"
                style={{
                  background: `linear-gradient(135deg, ${user.accentColor}18, ${user.accentColor}08)`,
                  border: `1px solid ${user.accentColor}25`,
                }}
              >
                <IconComponent
                  className="w-7 h-7 sm:w-8 sm:h-8 transition-colors duration-300"
                  style={{ color: user.accentColor }}
                  strokeWidth={1.5}
                />
              </div>

              {/* Info */}
              <div className="text-left sm:text-center flex-1 sm:flex-initial">
                <h3 className="text-[var(--text-primary)] text-base font-semibold">
                  {user.name}
                </h3>
                <p className="text-[var(--text-muted)] text-[11px] mt-1 leading-snug line-clamp-2 sm:line-clamp-none">
                  {user.role}
                </p>
              </div>

              {/* Status dot */}
              <div className="flex items-center gap-1.5 sm:mt-4">
                <div className="status-dot status-dot-online" />
                <span className="text-[10px] text-emerald-400/70 font-medium">Online</span>
              </div>
            </motion.button>
          );
        })}
      </motion.div>

      {/* Footer */}
      <motion.p
        className="text-[var(--text-muted)] text-[11px] mt-10 font-mono relative z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        v1.0.0 — Next.js 15 + Cloudflare Edge
      </motion.p>
    </motion.div>
  );
}
