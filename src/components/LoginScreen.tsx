'use client';
// ============================================================
// LoginScreen — User selection with premium tactile card design
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
    transition: { staggerChildren: 0.18, delayChildren: 0.1 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 36, scale: 0.94 },
  visible: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: { type: 'spring' as const, stiffness: 220, damping: 22 }
  },
};

export default function LoginScreen() {
  const loginUser = useOSStore((s) => s.loginUser);

  const handleLogin = (name: UserName) => {
    loginUser(name);
    toast.success(`Welcome back, ${name}!`, {
      description: `Launching workspace context for ${USERS[name].role}...`,
      duration: 4000,
    });
  };

  return (
    <motion.div
      className="fixed inset-0 z-[9998] bg-[var(--bg-base)] flex flex-col items-center justify-center px-6 select-none overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.7 }}
      data-testid="login-screen"
    >
      {/* Background wallpaper cinematic blur */}
      <div className="absolute inset-0 select-none pointer-events-none z-0">
        <img
          src="/wallpaper.jpg"
          alt="Wallpaper background"
          className="w-full h-full object-cover object-center scale-105 filter brightness-[0.22] blur-[12px] contrast-[1.05]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-base)] via-black/40 to-transparent" />
      </div>

      {/* Cyberpunk grid overlay */}
      <div className="absolute inset-0 opacity-[0.015] z-10 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.08) 1.5px, transparent 1.5px),
            linear-gradient(90deg, rgba(255,255,255,0.08) 1.5px, transparent 1.5px)
          `,
          backgroundSize: '40px 40px',
        }}
      />

      {/* Ambient glowing spotlight spotlights */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-10">
        <div className="absolute top-[-10%] left-[20%] w-[600px] h-[600px] rounded-full opacity-[0.06] filter blur-[100px]"
          style={{ background: 'radial-gradient(circle, #4f46e5, transparent 75%)' }}
        />
        <div className="absolute bottom-[-10%] right-[20%] w-[600px] h-[600px] rounded-full opacity-[0.04] filter blur-[100px]"
          style={{ background: 'radial-gradient(circle, #0891b2, transparent 75%)' }}
        />
      </div>

      {/* Header */}
      <motion.div
        className="text-center mb-16 relative z-20"
        initial={{ opacity: 0, y: -24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 180, damping: 24 }}
      >
        <h1 className="text-[var(--text-primary)] text-3xl sm:text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-white via-zinc-200 to-zinc-400">
          Web OS Portfolio
        </h1>
        <p className="text-[var(--text-secondary)] text-sm sm:text-base mt-3.5 opacity-80 font-semibold tracking-wide uppercase text-zinc-400">
          Select developer profile to bootstrap workspace
        </p>
      </motion.div>

      {/* User Profiles Grid */}
      <motion.div
        className="flex flex-col sm:flex-row gap-6 sm:gap-7 relative z-20 w-full max-w-md sm:max-w-none sm:w-auto"
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
              whileHover={{ y: -8, scale: 1.03 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => handleLogin(name)}
              className="group relative flex sm:flex-col items-center gap-4 sm:gap-0
                         sm:w-56 p-6 sm:p-8 sm:pt-10
                         rounded-[32px] border border-white/[0.04]
                         bg-[#0b0f19]/70 backdrop-blur-3xl shadow-2xl
                         hover:border-white/[0.08]
                         transition-all duration-350
                         focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50 overflow-hidden"
              data-testid={`login-${name.toLowerCase()}`}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.boxShadow = `0 24px 48px ${user.accentColor}18, inset 0 1px 0 rgba(255,255,255,0.08)`;
                (e.currentTarget as HTMLElement).style.borderColor = `${user.accentColor}40`;
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.boxShadow = 'none';
                (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.04)';
              }}
            >
              {/* Glossy sweep light effect */}
              <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/[0.04] to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out pointer-events-none" />

              {/* Spinning Glow Halo Avatar Frame */}
              <div className="relative shrink-0 sm:mb-6">
                {/* Neon Ring Halo */}
                <div
                  className="absolute inset-[-4px] rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-neon-spin"
                  style={{
                    padding: '2px',
                    background: `linear-gradient(135deg, ${user.accentColor}, transparent 80%)`,
                  }}
                />
                
                <div
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center
                             relative z-10 transition-all duration-300 shadow-md group-hover:scale-105"
                  style={{
                    background: `linear-gradient(135deg, ${user.accentColor}18, ${user.accentColor}06)`,
                    border: `1.5px solid ${user.accentColor}25`,
                  }}
                >
                  <IconComponent
                    className="w-8 h-8 sm:w-10 sm:h-10 transition-colors duration-300 group-hover:rotate-6"
                    style={{ color: user.accentColor }}
                    strokeWidth={1.5}
                  />
                </div>
              </div>

              {/* Profile Details */}
              <div className="text-left sm:text-center flex-1 sm:flex-initial min-w-0">
                <h3 className="text-[var(--text-primary)] text-base sm:text-lg font-bold tracking-tight">
                  {user.name}
                </h3>
                <p className="text-[var(--text-secondary)] text-[11px] sm:text-xs mt-2 leading-relaxed opacity-75 font-medium">
                  {user.role}
                </p>
              </div>

              {/* Tactile active status bubble */}
              <div className="flex items-center gap-2 sm:mt-6 shrink-0 bg-emerald-500/5 px-2.5 py-1 rounded-full border border-emerald-500/10">
                <div className="status-dot status-dot-online" />
                <span className="text-[9px] text-emerald-400 font-bold uppercase tracking-widest">Active</span>
              </div>
            </motion.button>
          );
        })}
      </motion.div>

      {/* Footer System Specs */}
      <motion.p
        className="text-[var(--text-muted)] text-[10px] sm:text-xs mt-16 font-mono relative z-20 tracking-widest opacity-60 flex items-center gap-1.5"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9 }}
      >
        <span>WEBOS CORE v3.0.0</span>
        <span className="w-1 h-1 rounded-full bg-zinc-700" />
        <span>NEXTJS 16</span>
        <span className="w-1 h-1 rounded-full bg-zinc-700" />
        <span>TAILWIND V4</span>
      </motion.p>
    </motion.div>
  );
}
