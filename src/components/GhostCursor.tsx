'use client';
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MousePointer2 } from 'lucide-react';
import { useOSStore } from '@/store/useOSStore';

/**
 * GhostCursor — Renders the visitor's cursor position on the admin's screen.
 * 
 * FIX 1: Denormalizes 0.0–1.0 ratio coordinates by multiplying against
 *        the admin's own viewport dimensions. This means the cursor appears
 *        in the correct proportional position regardless of screen size differences.
 */
export default function GhostCursor() {
  const ghostCursor = useOSStore((s) => s.ghostCursor);
  const isSpectating = useOSStore((s) => s.isSpectating);
  const isAdminAuthenticated = useOSStore((s) => s.isAdminAuthenticated);

  // Track the admin's own viewport size for denormalization
  const [viewportSize, setViewportSize] = useState({ w: 1920, h: 1080 });

  useEffect(() => {
    const updateSize = () => {
      setViewportSize({ w: window.innerWidth, h: window.innerHeight });
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  if (!isSpectating || !isAdminAuthenticated || !ghostCursor) {
    return null;
  }

  // Denormalize: convert 0.0–1.0 ratios to pixel coordinates on this screen
  const pixelX = ghostCursor.x * viewportSize.w;
  const pixelY = ghostCursor.y * viewportSize.h;

  return (
    <motion.div
      initial={false}
      animate={{ x: pixelX, y: pixelY }}
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
