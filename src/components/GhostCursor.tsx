'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { MousePointer2 } from 'lucide-react';
import { useOSStore } from '@/store/useOSStore';

export default function GhostCursor() {
  const ghostCursor = useOSStore((s) => s.ghostCursor);
  const isSpectating = useOSStore((s) => s.isSpectating);
  const isAdminAuthenticated = useOSStore((s) => s.isAdminAuthenticated);

  if (!isSpectating || !isAdminAuthenticated || !ghostCursor) {
    return null;
  }

  return (
    <motion.div
      initial={false}
      animate={{ x: ghostCursor.x, y: ghostCursor.y }}
      transition={{ type: "spring", damping: 30, stiffness: 200, mass: 0.5 }}
      className="absolute top-0 left-0 z-[9999] pointer-events-none drop-shadow-[0_0_15px_rgba(16,185,129,0.8)]"
    >
      <MousePointer2 className="w-8 h-8 text-emerald-400 fill-emerald-500/20" />
      <div className="absolute top-8 left-6 bg-zinc-900 border border-emerald-500/50 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded shadow-lg whitespace-nowrap">
        Guest Session
      </div>
    </motion.div>
  );
}
