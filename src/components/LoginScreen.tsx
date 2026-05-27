'use client';
// ============================================================
// LoginScreen — User selection with neumorphic card design
// ============================================================
import { motion } from 'framer-motion';
import { useOSStore } from '@/store/useOSStore';
import { USERS } from '@/lib/mockData';
import { USER_ICONS } from '@/lib/icons';
import type { UserName } from '@/types';
import { toast } from 'sonner';

const userOrder: UserName[] = ['Mohammed', 'Moamen', 'Team'];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.1 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.93 },
  visible: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: { type: 'spring' as const, stiffness: 260, damping: 25 }
  },
};

export default function LoginScreen() {
  const loginUser = useOSStore((s) => s.loginUser);

  const handleLogin = (name: UserName) => {
    loginUser(name);
    toast.success(`Welcome back, ${name}! Booting your workspace...`, {
      description: USERS[name].role,
      duration: 3500,
    });
  };

  return (
    <motion.div
      className="fixed inset-0 z-[9998] bg-[var(--bg-base)] flex flex-col items-center justify-center px-6 select-none"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
      data-testid="login-screen"
    >
      {/* Background wallpaper subtle underlay */}
      <div className="absolute inset-0 select-none pointer-events-none z-0">
        <img
          src="/wallpaper.jpg"
          alt="Wallpaper background"
          className="w-full h-full object-cover object-center scale-105 filter brightness-[0.25] blur-[8px]"
        />
        <div className="absolute inset-0 bg-black/60" />
      </div>

      {/* Ambient background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-10">
        <div className="absolute top-1/4 left-1/4 w-[450px] h-[450px] rounded-full opacity-[0.05] filter blur-[80px]"
          style={{ background: 'radial-gradient(circle, #6366f1, transparent 70%)' }}
        />
        <div className="absolute bottom-1/4 right-1/4 w-[450px] h-[450px] rounded-full opacity-[0.04] filter blur-[80px]"
          style={{ background: 'radial-gradient(circle, #06b6d4, transparent 70%)' }}
        />
      </div>

      {/* Header */}
      <motion.div
        className="text-center mb-14 relative z-20"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 25 }}
      >
        <h1 className="text-[var(--text-primary)] text-3xl sm:text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-zinc-100 via-zinc-300 to-zinc-400">
          Web OS Portfolio
        </h1>
        <p className="text-[var(--text-secondary)] text-sm sm:text-base mt-3 opacity-80 font-medium">Select a profile context to launch the OS</p>
      </motion.div>

      {/* User Cards (Tactile & neumorphic visual hierarchy with touch targets optimized) */}
      <motion.div
        className="flex flex-col sm:flex-row gap-5 sm:gap-6 relative z-20 w-full max-w-md sm:max-w-none sm:w-auto"
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
              whileHover={{ y: -6, scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => handleLogin(name)}
              className="group relative flex sm:flex-col items-center gap-4 sm:gap-0
                         sm:w-52 p-6 sm:p-7 sm:pt-9
                         rounded-3xl border border-[var(--border-subtle)]
                         bg-[var(--bg-elevated)]/80 backdrop-blur-2xl
                         hover:border-[var(--border-default)]
                         transition-all duration-350
                         focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50"
              data-testid={`login-${name.toLowerCase()}`}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.boxShadow = `0 16px 40px ${user.accentColor}12, 0 0 0 1.5px ${user.accentColor}25`;
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.boxShadow = 'none';
              }}
            >
              {/* Icon container */}
              <div
                className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl flex items-center justify-center
                           shrink-0 sm:mb-5 transition-all duration-300
                           group-hover:scale-105 group-hover:rotate-2 shadow-lg"
                style={{
                  background: `linear-gradient(135deg, ${user.accentColor}18, ${user.accentColor}08)`,
                  border: `1.5px solid ${user.accentColor}25`,
                }}
              >
                <IconComponent
                  className="w-8 h-8 sm:w-9 sm:h-9 transition-colors duration-300"
                  style={{ color: user.accentColor }}
                  strokeWidth={1.5}
                />
              </div>

              {/* Info */}
              <div className="text-left sm:text-center flex-1 sm:flex-initial min-w-0">
                <h3 className="text-[var(--text-primary)] text-base sm:text-lg font-bold tracking-tight">
                  {user.name}
                </h3>
                <p className="text-[var(--text-secondary)] text-[11px] sm:text-xs mt-1.5 leading-snug line-clamp-2 sm:line-clamp-none opacity-80">
                  {user.role}
                </p>
              </div>

              {/* Status dot */}
              <div className="flex items-center gap-1.5 sm:mt-5 shrink-0">
                <div className="status-dot status-dot-online" />
                <span className="text-[10px] text-emerald-400/80 font-bold uppercase tracking-wider">Online</span>
              </div>
            </motion.button>
          );
        })}
      </motion.div>

      {/* Footer */}
      <motion.p
        className="text-[var(--text-muted)] text-[11px] mt-12 font-mono relative z-20 tracking-wider"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        v2.0.0 — NEXT.JS 16 + TAILWIND V4 + EDGE ENGINE
      </motion.p>
    </motion.div>
  );
}

