'use client';
// ============================================================
// Main Page — OS Orchestrator
// ============================================================
import { useOSStore } from '@/store/useOSStore';
import BootScreen from '@/components/BootScreen';
import LoginScreen from '@/components/LoginScreen';
import Desktop from '@/components/Desktop';
import { AnimatePresence } from 'framer-motion';

export default function Home() {
  const bootPhase = useOSStore((s) => s.bootPhase);

  return (
    <main className="w-screen h-screen overflow-hidden bg-black select-none">
      <AnimatePresence mode="wait">
        {bootPhase === 'booting' && <BootScreen key="boot" />}
        {bootPhase === 'login' && <LoginScreen key="login" />}
        {bootPhase === 'desktop' && <Desktop key="desktop" />}
      </AnimatePresence>
    </main>
  );
}
