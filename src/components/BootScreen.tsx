'use client';
// ============================================================
// BootScreen — Terminal-style boot animation
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
    // Check if boot was already completed
    if (typeof window !== 'undefined' && localStorage.getItem('boot-done')) {
      setBootPhase('login');
      return;
    }

    let lineIndex = 0;
    const interval = setInterval(() => {
      if (lineIndex < BOOT_LOGS.length) {
        const currentLine = BOOT_LOGS[lineIndex];
        lineIndex++;
        setVisibleLines((prev) => [...prev, currentLine]);
      } else {
        clearInterval(interval);
        setTimeout(() => {
          // Play startup sound
          try {
            const audio = new Audio('/sounds/startup.mp3');
            audio.volume = 0.3;
            audio.play().catch(() => {});
          } catch {}
          setIsDone(true);
          setTimeout(() => {
            setIsFadingOut(true);
            setTimeout(() => {
              localStorage.setItem('boot-done', 'true');
              setBootPhase('login');
            }, 800);
          }, 1200);
        }, 600);
      }
    }, 65);

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
          transition={{ duration: 0.8 }}
          data-testid="boot-screen"
        >
          {/* Scanline overlay */}
          <div className="pointer-events-none absolute inset-0 z-10 opacity-[0.03]"
            style={{
              backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,255,0,0.03) 2px, rgba(0,255,0,0.03) 4px)',
            }}
          />

          {/* CRT glow */}
          <div className="pointer-events-none absolute inset-0 z-10"
            style={{
              boxShadow: 'inset 0 0 120px rgba(0, 255, 65, 0.05)',
            }}
          />

          {/* Terminal output */}
          <div
            ref={containerRef}
            className="flex-1 overflow-y-auto p-6 font-mono text-sm leading-relaxed scrollbar-hide"
          >
            {visibleLines.map((line, i) => {
              if (line == null) return null;
              const l = String(line);
              return (
              <div
                key={i}
                className={`
                  ${l.startsWith('[  OK  ]') || l.startsWith('[  OK') ? 'text-green-400' : ''}
                  ${l.startsWith('[INIT]') || l.startsWith('[USERS]') || l.startsWith('[STACK]') || l.startsWith('[APPS ]') || l.startsWith('[FINAL]') ? 'text-cyan-400' : ''}
                  ${l.startsWith('[  ]') || l.startsWith('         ') ? 'text-gray-500' : ''}
                  ${l.startsWith('═') ? 'text-emerald-300 font-bold' : ''}
                  ${l.startsWith('  WEB-OS') || l.startsWith('  Workspace') || l.startsWith('  Runtime') ? 'text-emerald-200 font-bold' : ''}
                  ${l.startsWith('Starting') ? 'text-cyan-400 animate-pulse' : ''}
                  ${l.startsWith('POST:') || l.startsWith('CPU:') || l.startsWith('RAM:') || l.startsWith('GPU:') || l.startsWith('NVMe:') ? 'text-amber-400' : ''}
                  ${l.startsWith('BIOS') ? 'text-amber-300 font-bold' : ''}
                  ${!l.startsWith('[') && !l.startsWith('═') && !l.startsWith('  ') && !l.startsWith('Starting') && !l.startsWith('POST') && !l.startsWith('CPU') && !l.startsWith('RAM') && !l.startsWith('GPU') && !l.startsWith('NVMe') && !l.startsWith('BIOS') && l.trim() !== '' ? 'text-gray-600' : ''}
                `}
              >
                {l || '\u00A0'}
              </div>
              );
            })}

            {/* Blinking cursor */}
            {!isDone && (
              <span className="inline-block w-2.5 h-5 bg-green-400 animate-blink ml-1" />
            )}
          </div>

          {/* Skip hint */}
          <div className="absolute bottom-6 right-6 text-gray-600 text-xs font-mono">
            <button
              onClick={() => {
                localStorage.setItem('boot-done', 'true');
                setBootPhase('login');
              }}
              className="hover:text-gray-400 transition-colors"
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
