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
  const setMobile = useOSStore((s) => s.setMobile);

  useEffect(() => {
    const check = () => {
      setMobile(window.innerWidth < 1024);
    };
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, [setMobile]);

  return (
    <main className="w-full h-screen overflow-hidden bg-black select-none">
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
