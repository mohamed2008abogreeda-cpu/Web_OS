'use client';
// ============================================================
// Main Page — OS Orchestrator & Spectator Guard
// ============================================================
import { Suspense, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useOSStore } from '@/store/useOSStore';
import BootScreen from '@/components/BootScreen';
import LoginScreen from '@/components/LoginScreen';
import Desktop from '@/components/Desktop';
import { AnimatePresence } from 'framer-motion';

function SpectatorGuard() {
  const searchParams = useSearchParams();
  const initSpectator = useOSStore(s => s.initSpectator);

  useEffect(() => {
    const spectateSession = searchParams.get('spectate');
    if (spectateSession) {
      initSpectator(spectateSession);
    }
  }, [searchParams, initSpectator]);

  return null;
}

export default function Home() {
  const bootPhase = useOSStore((s) => s.bootPhase);

  return (
    <main className="w-screen h-screen overflow-hidden bg-black select-none">
      <Suspense fallback={null}>
        <SpectatorGuard />
      </Suspense>
      
      <AnimatePresence mode="wait">
        {bootPhase === 'booting' && <BootScreen key="boot" />}
        {bootPhase === 'login' && <LoginScreen key="login" />}
        {bootPhase === 'desktop' && <Desktop key="desktop" />}
      </AnimatePresence>
    </main>
  );
}
