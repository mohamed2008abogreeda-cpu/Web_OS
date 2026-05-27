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
          className="w-full h-full object-cover object-center scale-102 filter brightness-[0.88] blur-[10px] contrast-[1.0]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#fdf2f8]/70 via-transparent to-white/10" />
      </div>

      {/* Aesthetic grid overlay */}
      <div className="absolute inset-0 opacity-[0.25] z-10 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.4) 1.5px, transparent 1.5px),
            linear-gradient(90deg, rgba(255,255,255,0.4) 1.5px, transparent 1.5px)
          `,
          backgroundSize: '40px 40px',
        }}
      />

      {/* Ambient glowing spotlight spotlights */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-10">
        <div className="absolute top-[-10%] left-[20%] w-[600px] h-[600px] rounded-full opacity-[0.2] filter blur-[120px]"
          style={{ background: 'radial-gradient(circle, #f472b6, transparent 75%)' }}
        />
        <div className="absolute bottom-[-10%] right-[20%] w-[600px] h-[600px] rounded-full opacity-[0.25] filter blur-[120px]"
          style={{ background: 'radial-gradient(circle, #a855f7, transparent 75%)' }}
        />
      </div>

      {/* Header */}
      <motion.div
        className="text-center mb-16 relative z-20"
        initial={{ opacity: 0, y: -24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 180, damping: 24 }}
      >
        <h1 className="text-slate-800 text-3xl sm:text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-slate-700 via-slate-800 to-slate-900 drop-shadow-sm">
          Web OS Portfolio
        </h1>
        <p className="text-slate-500 text-xs sm:text-sm mt-4.5 opacity-90 font-extrabold tracking-widest uppercase text-slate-500">
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
                         rounded-[32px] border border-white
                         bg-white/80 backdrop-blur-3xl shadow-xl hover:shadow-2xl
                         hover:border-white
                         transition-all duration-350
                         focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400/40 overflow-hidden cursor-pointer"
              data-testid={`login-${name.toLowerCase()}`}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.boxShadow = `0 24px 48px rgba(168, 85, 247, 0.08), inset 0 1px 0 rgba(255,255,255,0.9)`;
                (e.currentTarget as HTMLElement).style.borderColor = `${user.accentColor}35`;
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.boxShadow = 'none';
                (e.currentTarget as HTMLElement).style.borderColor = 'white';
              }}
            >
              {/* Glossy sweep light effect */}
              <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/[0.4] to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out pointer-events-none" />

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
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center bg-white
                             relative z-10 transition-all duration-300 shadow-sm group-hover:scale-105"
                  style={{
                    border: `1.5px solid ${user.accentColor}25`,
                  }}
                >
                  <IconComponent
                    className="w-8 h-8 sm:w-10 sm:h-10 transition-colors duration-300 group-hover:rotate-6"
                    style={{ color: user.accentColor }}
                    strokeWidth={1.8}
                  />
                </div>
              </div>

              {/* Profile Details */}
              <div className="text-left sm:text-center flex-1 sm:flex-initial min-w-0">
                <h3 className="text-slate-800 text-base sm:text-lg font-extrabold tracking-tight">
                  {user.name}
                </h3>
                <p className="text-slate-500 text-[11px] sm:text-xs mt-2 leading-relaxed opacity-85 font-extrabold uppercase tracking-wide">
                  {user.role}
                </p>
              </div>

              {/* Tactile active status bubble */}
              <div className="flex items-center gap-2 sm:mt-6 shrink-0 bg-emerald-400/10 px-2.5 py-1 rounded-full border border-emerald-400/20">
                <div className="status-dot status-dot-online" />
                <span className="text-[9px] text-emerald-500 font-extrabold uppercase tracking-widest">Active</span>
              </div>
            </motion.button>
          );
        })}
      </motion.div>

      {/* Footer System Specs */}
      <motion.p
        className="text-slate-400 text-[10px] sm:text-xs mt-16 font-mono relative z-20 tracking-widest opacity-80 flex items-center gap-1.5 font-bold"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9 }}
      >
        <span>WEBOS CORE v4.5.0</span>
        <span className="w-1 h-1 rounded-full bg-slate-300" />
        <span>NEXTJS 16</span>
        <span className="w-1 h-1 rounded-full bg-slate-300" />
        <span>TAILWIND V4</span>
      </motion.p>
    </motion.div>
  );
}
