'use client';
// ============================================================
// BootScreen — Strict BIOS/Kernel terminal boot animation
// ============================================================
import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BOOT_LOGS } from '@/lib/mockData';
import { useOSStore } from '@/store/useOSStore';

export default function BootScreen() {
  const [visibleLines, setVisibleLines] = useState<string[]>([]);
  const [isDone, setIsDone] = useState(false);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const setBootPhase = useOSStore((s) => s.setBootPhase);

  useEffect(() => {
    let lineIndex = 0;
    // Generate text at a fast pace (~40 lines * 60ms = ~2.4 seconds)
    const interval = setInterval(() => {
      if (lineIndex < BOOT_LOGS.length) {
        const currentLine = BOOT_LOGS[lineIndex];
        lineIndex++;
        setVisibleLines((prev) => [...prev, currentLine]);
      } else {
        clearInterval(interval);
        setTimeout(() => {
          // Sequence finished
          setIsDone(true);
          setIsFadingOut(true);
          setTimeout(() => {
            setBootPhase('login');
          }, 500);
        }, 500); // Short pause after printing before fading out
      }
    }, 60);

    return () => clearInterval(interval);
  }, [setBootPhase]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [visibleLines]);

  return (
    <AnimatePresence>
      {!isFadingOut ? (
        <motion.div
          className="fixed inset-0 z-[9999] bg-black flex flex-col overflow-hidden"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          data-testid="boot-screen"
        >
          {/* Terminal output */}
          <div
            ref={containerRef}
            className="flex-1 overflow-y-auto p-4 font-mono text-[13px] leading-relaxed scrollbar-hide text-zinc-300"
          >
            {visibleLines.map((line, i) => {
              if (line == null) return null;
              const l = String(line);
              return (
                <div
                  key={i}
                  className={`
                    ${l.startsWith('[  OK  ]') || l.startsWith('[  OK') ? 'text-emerald-400 font-bold' : ''}
                    ${l.startsWith('[INIT]') || l.startsWith('[USERS]') || l.startsWith('[STACK]') || l.startsWith('[APPS ]') || l.startsWith('[FINAL]') ? 'text-white font-bold' : ''}
                    ${l.startsWith('[  ]') || l.startsWith('         ') ? 'text-zinc-500' : ''}
                    ${l.startsWith('═') ? 'text-zinc-700' : ''}
                    ${l.startsWith('  WEB-OS') || l.startsWith('  Workspace') || l.startsWith('  Runtime') ? 'text-zinc-100' : ''}
                    ${l.startsWith('Starting') ? 'text-zinc-300' : ''}
                    ${l.startsWith('POST:') || l.startsWith('CPU:') || l.startsWith('RAM:') || l.startsWith('GPU:') || l.startsWith('NVMe:') ? 'text-zinc-400' : ''}
                    ${l.startsWith('BIOS') ? 'text-zinc-400' : ''}
                  `}
                >
                  {l || '\u00A0'}
                </div>
              );
            })}

            {/* Blinking cursor */}
            {!isDone && (
              <span className="inline-block w-2.5 h-4 bg-zinc-300 animate-blink align-middle ml-1" />
            )}
          </div>

          {/* Skip hint */}
          <div className="absolute bottom-6 right-6 text-zinc-600 text-xs font-mono">
            <button
              onClick={() => {
                setBootPhase('login');
              }}
              className="hover:text-white transition-colors cursor-pointer"
              data-testid="skip-boot"
            >
              Press to skip →
            </button>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
