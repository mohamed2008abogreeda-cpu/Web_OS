import React from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, Database, Server, Component, Terminal, Layout } from 'lucide-react';
import { useOSStore } from '@/store/useOSStore';
import { getProjectsForUser } from '@/lib/mockData';

// Helper to assign colors based on tags/index
function getProjectStyles(index: number) {
  const styles = [
    { colSpan: 'md:col-span-2 md:row-span-2', color: 'from-emerald-500/20 to-emerald-900/10', accent: 'text-emerald-400' },
    { colSpan: 'md:col-span-1 md:row-span-2', color: 'from-violet-500/20 to-violet-900/10', accent: 'text-violet-400' },
    { colSpan: 'md:col-span-1 md:row-span-1', color: 'from-orange-500/20 to-orange-900/10', accent: 'text-orange-400' },
    { colSpan: 'md:col-span-2 md:row-span-1', color: 'from-blue-500/20 to-blue-900/10', accent: 'text-blue-400' },
    { colSpan: 'md:col-span-1 md:row-span-1', color: 'from-pink-500/20 to-pink-900/10', accent: 'text-pink-400' },
    { colSpan: 'md:col-span-2 md:row-span-1', color: 'from-cyan-500/20 to-cyan-900/10', accent: 'text-cyan-400' },
  ];
  return styles[index % styles.length];
}

// Icon mapping helper
function getProjectIcon(iconStr: string) {
  switch (iconStr) {
    case '🏰': return Server;
    case '🤖': return Terminal;
    case '🗄️': return Database;
    case '🎨': return Layout;
    case '🖼️': return Component;
    case '📋': return Layout;
    case '🧪': return Server;
    default: return Terminal;
  }
}

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
  const { currentUser } = useOSStore();
  const userProjects = currentUser ? getProjectsForUser(currentUser.id) : [];

  return (
    <div className="w-full h-full overflow-y-auto overflow-x-hidden p-6 md:p-8 bg-black/60 text-white scrollbar-hide select-none">
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
        {userProjects.map((project, idx) => {
          const Icon = getProjectIcon(project.iconUrl);
          const style = getProjectStyles(idx);
          // Extract first paragraph from markdown description for preview
          const previewDesc = project.description.split('\n').find(line => line.length > 20 && !line.startsWith('#')) || project.description;

          return (
            <motion.div
              key={project.id}
              variants={itemVariants}
              whileHover={{ scale: 1.01, y: -2 }}
              className={`group relative overflow-hidden rounded-2xl bg-zinc-900/50 backdrop-blur-md border border-white/10 shadow-[0_5px_20px_rgba(0,0,0,0.3)] hover:shadow-2xl transition-all duration-300 p-6 flex flex-col justify-between ${style.colSpan}`}
            >
              {/* Subtle Gradient Background */}
              <div className={`absolute inset-0 bg-gradient-to-br ${style.color} opacity-40 group-hover:opacity-60 transition-opacity duration-500`} />
              
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-4">
                  <div className={`p-3 rounded-xl bg-black/40 border border-white/5 shadow-inner ${style.accent}`}>
                    <Icon className="w-6 h-6" strokeWidth={1.5} />
                  </div>
                  {project.projectUrl && (
                    <motion.button 
                      whileHover={{ scale: 1.1, rotate: 10 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => window.open(project.projectUrl, '_blank')}
                      className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors text-zinc-400 hover:text-white"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </motion.button>
                  )}
                </div>
                
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-xl font-bold tracking-tight text-white group-hover:text-blue-300 transition-colors">
                    {project.title}
                  </h3>
                  {project.liveApiEndpoint && (
                    <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold tracking-wider">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      LIVE
                    </span>
                  )}
                </div>
                <p className="text-sm text-zinc-400 leading-relaxed font-medium line-clamp-4">
                  {previewDesc}
                </p>
              </div>

              <div className="relative z-10 flex flex-wrap gap-2 mt-6">
                {project.tags.map((tag, i) => (
                  <span 
                    key={i} 
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
