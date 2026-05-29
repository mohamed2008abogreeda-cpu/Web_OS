import React from 'react';
import { motion } from 'framer-motion';
import { User, MapPin, Briefcase, GraduationCap, Code2, Database, Terminal, Cpu } from 'lucide-react';

const SKILLS = [
  { name: 'Node.js', icon: Database },
  { name: 'Discord.js', icon: BotIcon },
  { name: 'React', icon: Code2 },
  { name: 'Linux Sysadmin', icon: Terminal },
  { name: 'Architecture', icon: Cpu }
];

// Helper icon
function BotIcon(props: any) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/>
    </svg>
  );
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 120, damping: 14 } },
};

import { useOSStore } from '@/store/useOSStore';
import { USERS } from '@/lib/mockData';

export default function AboutApp() {
  const { currentUser } = useOSStore();
  const user = currentUser ? USERS[currentUser] : null;

  return (
    <div className="w-full h-full overflow-y-auto p-6 md:p-8 bg-black/60 text-white select-none">
      
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="flex flex-col lg:flex-row gap-6 h-full"
      >
        {/* Left Column: Digital ID Card */}
        <motion.div 
          variants={itemVariants}
          className="w-full lg:w-1/3 flex flex-col gap-6"
        >
          <div className="relative overflow-hidden rounded-2xl bg-zinc-900/60 backdrop-blur-xl border border-os-border shadow-os p-6 flex flex-col items-center text-center">
            {/* Holographic ID Glow */}
            <div className="absolute top-0 w-full h-1 bg-gradient-to-r from-transparent via-os-accent to-transparent opacity-50" />
            <div className="absolute -top-20 -left-20 w-40 h-40 bg-os-accent/20 blur-[50px] rounded-full pointer-events-none" />

            <div className="relative w-28 h-28 rounded-full bg-black/50 border-2 border-os-border flex items-center justify-center mb-4 shadow-xl overflow-hidden group">
              {user?.avatarUrl ? (
                // Using an img tag for SVG avatars is standard, or just icon fallback
                <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                <User className="w-12 h-12 text-zinc-500 group-hover:text-os-accent transition-colors duration-500" />
              )}
              <div className="absolute inset-0 bg-gradient-to-tr from-os-accent/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </div>

            <h2 className="text-2xl font-black tracking-tight text-white drop-shadow-md">
              {user?.name || 'Developer'}
            </h2>
            <p className="text-os-accent font-mono text-sm uppercase tracking-widest mt-1 mb-4 font-bold">
              {user?.role || 'Full-Stack Developer'}
            </p>

            <div className="flex items-center gap-2 text-zinc-400 text-sm font-medium bg-black/30 px-4 py-2 rounded-lg border border-white/5 w-full justify-center">
              <MapPin className="w-4 h-4 text-rose-400" />
              <span>Damanhur, Egypt</span>
            </div>
          </div>

          <div className="rounded-2xl bg-zinc-900/60 backdrop-blur-xl border border-os-border shadow-os p-6">
            <h3 className="text-xs font-mono text-zinc-500 uppercase tracking-widest mb-4 flex items-center gap-2">
              <GraduationCap className="w-4 h-4" /> Current Focus
            </h3>
            <p className="text-sm text-zinc-300 leading-relaxed font-medium">
              Preparing for <span className="text-white font-bold border-b border-os-accent/50">Diploma of Science and Work</span> exams. Expanding architectural knowledge and systems engineering.
            </p>
          </div>
        </motion.div>

        {/* Right Column: Terminal Bio & Skill Matrix */}
        <motion.div 
          variants={itemVariants}
          className="w-full lg:w-2/3 flex flex-col gap-6"
        >
          {/* Glassy Terminal Bio */}
          <div className="flex-1 rounded-2xl bg-[#09090b]/80 backdrop-blur-xl border border-os-border shadow-os overflow-hidden flex flex-col">
            <div className="h-10 bg-black/40 border-b border-white/5 flex items-center px-4 gap-2">
              <div className="w-3 h-3 rounded-full bg-rose-500/80" />
              <div className="w-3 h-3 rounded-full bg-amber-500/80" />
              <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
              <span className="ml-2 text-xs font-mono text-zinc-500">identity.sh</span>
            </div>
            <div className="p-6 font-mono text-sm leading-relaxed text-zinc-300">
              <p className="mb-4">
                <span className="text-os-accent font-bold">~</span> <span className="text-blue-400">./execute_persona</span> <span className="text-emerald-400">--user</span> {user?.name.toLowerCase().replace(' ', '_') || 'guest'}
              </p>
              <p className="mb-4">
                <span className="text-zinc-500"># SYSTEM ARCHITECTURE & CREATIVE DESIGN IN HARMONY</span><br />
                {user?.bio || 'Operating with a unique persona approach to engineering.'}
              </p>
              {user?.id === 'user-team' && (
                <ul className="space-y-3 pl-4 border-l-2 border-white/10 ml-2 mt-4">
                  <li>
                    <span className="text-emerald-400 font-bold">{"[MOHAMMED]"}</span> - The Backend Architect.<br/>
                    <span className="text-zinc-400">Specializing in Node.js, Systems Engineering, Linux Administration, and crafting robust API infrastructures.</span>
                  </li>
                  <li>
                    <span className="text-violet-400 font-bold">{"[MOAMEN]"}</span> - The Creative Visionary.<br/>
                    <span className="text-zinc-400">Focused on UI/UX, Framer Motion physics, Glassmorphism aesthetics, and bringing interfaces to life.</span>
                  </li>
                </ul>
              )}
              <p className="mt-6 animate-pulse text-os-accent">_</p>
            </div>
          </div>

          {/* Skill Matrix */}
          <div className="rounded-2xl bg-zinc-900/60 backdrop-blur-xl border border-os-border shadow-os p-6">
            <h3 className="text-xs font-mono text-zinc-500 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Briefcase className="w-4 h-4" /> Core Stack Matrix
            </h3>
            <div className="flex flex-wrap gap-3">
              {SKILLS.map((skill, idx) => {
                const Icon = skill.icon;
                return (
                  <motion.div
                    key={idx}
                    whileHover={{ scale: 1.05, y: -2 }}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 hover:border-os-accent/50 hover:bg-os-accent/10 transition-colors cursor-default"
                  >
                    <Icon className="w-4 h-4 text-zinc-400" />
                    <span className="text-sm font-bold text-zinc-200">{skill.name}</span>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </motion.div>

      </motion.div>
    </div>
  );
}
