import React from 'react';
import { motion } from 'framer-motion';
import { Server, Bot, Cpu, Terminal, ExternalLink } from 'lucide-react';

const PROJECTS = [
  {
    id: 'guildmarket',
    title: 'GuildMarket',
    description: 'A premium platform and service architecture designed for building, customizing, and selling high-tier Discord servers.',
    icon: Server,
    colSpan: 'md:col-span-2 md:row-span-2',
    color: 'from-emerald-500/20 to-emerald-900/10',
    accent: 'text-emerald-400',
    tags: ['Discord.js', 'Node.js', 'SaaS Architecture']
  },
  {
    id: 'voicecordai',
    title: 'VoiceCordAI',
    description: 'Robust Discord bot repository managed via cloud instances, providing advanced voice and AI integrations.',
    icon: Bot,
    colSpan: 'md:col-span-1 md:row-span-2',
    color: 'from-violet-500/20 to-violet-900/10',
    accent: 'text-violet-400',
    tags: ['Cloud', 'AI', 'Voice']
  },
  {
    id: 'local-ai',
    title: 'Local AI Benchmarking',
    description: 'Integrated and benchmarked high-parameter AI models (DeepSeek-R1 1.5B) running locally on mobile hardware with GPU acceleration.',
    icon: Cpu,
    colSpan: 'md:col-span-1 md:row-span-1',
    color: 'from-orange-500/20 to-orange-900/10',
    accent: 'text-orange-400',
    tags: ['LLM', 'GPU', 'Mobile']
  },
  {
    id: 'universal-dash',
    title: 'Universal Dashboard',
    description: 'Configured a headless server for system administration using SSH, static IPs, and local domains for seamless management.',
    icon: Terminal,
    colSpan: 'md:col-span-2 md:row-span-1',
    color: 'from-blue-500/20 to-blue-900/10',
    accent: 'text-blue-400',
    tags: ['Linux', 'SSH', 'Sysadmin']
  }
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.98 },
  visible: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: { type: 'spring', stiffness: 100, damping: 15 }
  },
};

export default function ProjectViewer() {
  return (
    <div className="w-full h-full overflow-y-auto overflow-x-hidden p-6 md:p-8 bg-transparent text-white scrollbar-hide select-none">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-black tracking-tight drop-shadow-md">
            PROJECT_MATRIX
          </h1>
          <p className="text-sm font-mono text-zinc-400 mt-1 uppercase tracking-widest">
            Deployed Systems & Architectures
          </p>
        </div>
      </motion.div>

      <motion.div 
        className="grid grid-cols-1 md:grid-cols-3 gap-4 auto-rows-[minmax(180px,auto)]"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {PROJECTS.map((project) => {
          const Icon = project.icon;
          return (
            <motion.div
              key={project.id}
              variants={itemVariants}
              whileHover={{ scale: 1.01, y: -2 }}
              className={`group relative overflow-hidden rounded-2xl bg-zinc-900/50 backdrop-blur-md border border-os-border shadow-os hover:shadow-2xl transition-all duration-300 p-6 flex flex-col justify-between ${project.colSpan}`}
            >
              {/* Subtle Gradient Background */}
              <div className={`absolute inset-0 bg-gradient-to-br ${project.color} opacity-40 group-hover:opacity-60 transition-opacity duration-500`} />
              
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-4">
                  <div className={`p-3 rounded-xl bg-black/40 border border-white/5 shadow-inner ${project.accent}`}>
                    <Icon className="w-6 h-6" strokeWidth={1.5} />
                  </div>
                  <motion.button 
                    whileHover={{ scale: 1.1, rotate: 10 }}
                    whileTap={{ scale: 0.9 }}
                    className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors text-zinc-400 hover:text-white"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </motion.button>
                </div>
                
                <h3 className="text-xl font-bold mb-2 tracking-tight text-white group-hover:text-os-accent transition-colors">
                  {project.title}
                </h3>
                <p className="text-sm text-zinc-400 leading-relaxed font-medium">
                  {project.description}
                </p>
              </div>

              <div className="relative z-10 flex flex-wrap gap-2 mt-6">
                {project.tags.map((tag, idx) => (
                  <span 
                    key={idx} 
                    className="px-2.5 py-1 text-[10px] uppercase tracking-wider font-mono font-bold rounded-md bg-black/40 text-zinc-300 border border-white/5"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}
