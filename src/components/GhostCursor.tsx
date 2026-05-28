'use client';
import { motion } from 'framer-motion';
import { useOSStore } from '@/store/useOSStore';
import { MousePointer2 } from 'lucide-react';

export default function GhostCursor() {
  const { isSpectating, ghostCursor } = useOSStore();

  if (!isSpectating || !ghostCursor) return null;

  return (
    <motion.div
      className="fixed z-[9999] pointer-events-none drop-shadow-xl"
      animate={{ x: ghostCursor.x, y: ghostCursor.y }}
      transition={{ type: 'spring', damping: 25, stiffness: 300, mass: 0.5 }}
    >
      <MousePointer2 className="w-6 h-6 text-emerald-400 fill-emerald-950/80 -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute top-5 left-3 bg-emerald-500/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-full backdrop-blur-md border border-emerald-300/30 whitespace-nowrap">
        Guest
      </div>
    </motion.div>
  );
}
