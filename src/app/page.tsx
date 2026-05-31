'use client';
// ============================================================
// Main Page — OS Orchestrator & Spectator Guard
// ============================================================
import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useOSStore } from '@/store/useOSStore';
import { useSpectatorSync } from '@/hooks/useSpectatorSync';
import { useHydration } from '@/hooks/useHydration';
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

function BSODScreen() {
  const [percent, setPercent] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setPercent((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            window.location.reload();
          }, 1500);
          return 100;
        }
        return prev + Math.floor(Math.random() * 15) + 5;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 z-[999999] bg-[#0078d7] text-white p-10 md:p-24 flex flex-col justify-between font-sans select-text select-none cursor-default">
      <div className="flex flex-col gap-6 max-w-[800px]">
        <div className="text-[120px] font-light leading-none select-none">:(</div>
        <h1 className="text-2xl md:text-3xl font-light leading-snug mt-6">
          Your device ran into a problem and needs to restart. We're just collecting some error info, and then we'll restart for you.
        </h1>
        <div className="text-xl md:text-2xl font-light mt-4">
          {Math.min(percent, 100)}% complete
        </div>
      </div>

      <div className="flex flex-col md:flex-row items-start md:items-center gap-6 mt-12">
        <div className="w-24 h-24 bg-white p-1 flex items-center justify-center rounded shrink-0 shadow-lg select-none">
          <div className="w-full h-full bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0.85)_0%,rgba(0,0,0,0.1)_100%)] flex items-center justify-center text-[10px] text-zinc-950 font-bold select-none">QR_CODE</div>
        </div>
        <div className="flex flex-col gap-1.5 text-xs text-blue-100 font-mono">
          <div>For more information about this issue and possible fixes, visit https://windows.com/stopcode</div>
          <div className="mt-2 text-white font-bold">If you call a support person, give them this info:</div>
          <div>Stop code: SPECTOR_GOD_MODE_INTERVENTION</div>
          <div>Session ID: {useOSStore.getState().sessionId}</div>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const hydrated = useHydration();
  const bootPhase = useOSStore((s) => s.bootPhase);
  const setMobile = useOSStore((s) => s.setMobile);
  const isBsod = useOSStore((s) => s.isBsod);

  // Initialize spectator broadcaster & command listener for visitors
  useSpectatorSync();

  useEffect(() => {
    const check = () => {
      setMobile(window.innerWidth < 1024);
    };
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, [setMobile]);

  // Pre-hydration SSR fallback to match original HTML
  if (!hydrated) {
    return (
      <main className="w-full h-screen overflow-hidden bg-black select-none">
        <BootScreen />
      </main>
    );
  }

  return (
    <main className="w-full h-screen overflow-hidden bg-black select-none">
      {isBsod && <BSODScreen />}
      
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

