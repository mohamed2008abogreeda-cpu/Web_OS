'use client';
import { motion } from 'framer-motion';
import { useOSStore } from '@/store/useOSStore';
import { Code2, Palette, TerminalSquare } from 'lucide-react';
import type { UserName } from '@/types';

const PROFILES = [
  {
    id: 'Mohammed' as UserName,
    role: 'Backend Engineer',
    icon: Code2,
    theme: 'emerald',
    glow: 'from-emerald-500/20 to-emerald-900/20',
    border: 'group-hover:border-emerald-500/50',
    text: 'group-hover:text-emerald-400',
    shadow: 'hover:shadow-[0_0_40px_-10px_rgba(16,185,129,0.3)]'
  },
  {
    id: 'Moamen' as UserName,
    role: 'Creative Developer',
    icon: Palette,
    theme: 'violet',
    glow: 'from-violet-500/20 to-violet-900/20',
    border: 'group-hover:border-violet-500/50',
    text: 'group-hover:text-violet-400',
    shadow: 'hover:shadow-[0_0_40px_-10px_rgba(139,92,246,0.3)]'
  },
  {
    id: 'Team' as UserName,
    role: 'Full-Stack',
    icon: TerminalSquare,
    theme: 'rose',
    glow: 'from-rose-500/20 to-rose-900/20',
    border: 'group-hover:border-rose-500/50',
    text: 'group-hover:text-rose-400',
    shadow: 'hover:shadow-[0_0_40px_-10px_rgba(225,29,72,0.3)]'
  }
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.2 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: { type: 'spring', stiffness: 200, damping: 20 }
  },
};

export default function LoginScreen() {
  const loginUser = useOSStore((s) => s.loginUser);

  return (
    <motion.div
      className="fixed inset-0 z-[9999] bg-zinc-950 flex flex-col items-center justify-center px-4 overflow-hidden selection:bg-white/10"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, filter: 'blur(10px)', scale: 1.05 }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Ambient Deep Glow Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vw] max-w-[800px] max-h-[800px] bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-emerald-500/10 blur-[100px] rounded-full" />
      </div>

      {/* Grid Pattern Overlay */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-[0.15]" 
        style={{ 
          backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)`,
          backgroundSize: '40px 40px' 
        }} 
      />

      <motion.div
        className="relative z-10 text-center mb-16"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 150, damping: 20, delay: 0.1 }}
      >
        <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-white mb-3 drop-shadow-2xl">
          INITIATE <span className="text-zinc-500">SEQUENCE</span>
        </h1>
        <p className="text-sm font-mono text-zinc-400 uppercase tracking-[0.2em]">
          Select Neural Profile
        </p>
      </motion.div>

      <motion.div
        className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {PROFILES.map((profile) => {
          const Icon = profile.icon;
          return (
            <motion.button
              key={profile.id}
              variants={cardVariants}
              whileHover={{ y: -8, scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => loginUser(profile.id)}
              className={`group relative flex flex-col items-center justify-center p-8 rounded-3xl bg-zinc-900/50 backdrop-blur-xl border border-white/5 transition-all duration-500 cursor-pointer overflow-hidden ${profile.shadow} ${profile.border}`}
            >
              {/* Card Internal Glow */}
              <div className={`absolute inset-0 bg-gradient-to-b ${profile.glow} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
              
              <div className="relative z-10 p-4 rounded-2xl bg-black/40 border border-white/5 mb-6 group-hover:scale-110 transition-transform duration-500">
                <Icon className={`w-8 h-8 text-zinc-400 transition-colors duration-500 ${profile.text}`} strokeWidth={1.5} />
              </div>

              <div className="relative z-10 text-center">
                <h3 className="text-xl font-bold text-white mb-1 tracking-tight">
                  {profile.id}
                </h3>
                <p className="text-xs font-mono text-zinc-500 uppercase tracking-widest">
                  {profile.role}
                </p>
              </div>

              {/* Minimalist status indicator */}
              <div className="absolute top-4 right-4 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-zinc-600 opacity-20 group-hover:opacity-75 transition-opacity" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-zinc-700 group-hover:bg-zinc-400 transition-colors" />
              </div>
            </motion.button>
          );
        })}
      </motion.div>

      <motion.div
        className="fixed bottom-8 text-zinc-600 font-mono text-[10px] uppercase tracking-[0.3em]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        System Version 2.0.1 // Secured Connection
      </motion.div>
    </motion.div>
  );
}
