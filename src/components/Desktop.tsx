'use client';
import { useOSStore } from '@/store/useOSStore';
import dynamic from 'next/dynamic';

const LinuxEnvironment = dynamic(() => import('./desktops/linux/LinuxDesktop'), { ssr: false });
const MacEnvironment = dynamic(() => import('./desktops/mac/MacDesktop'), { ssr: false });
const WinEnvironment = dynamic(() => import('./desktops/windows/WinDesktop'), { ssr: false });

import { useEffect, useState } from 'react';
import { AnimatePresence } from 'framer-motion';

export default function Desktop() {
  const currentUser = useOSStore(s => s.currentUser);
  const [activeUser, setActiveUser] = useState(currentUser);

  useEffect(() => {
    if (currentUser) {
      setActiveUser(currentUser);
    }
  }, [currentUser]);

  return (
    <AnimatePresence mode="wait">
      {activeUser === 'Mohammed' && <LinuxEnvironment key="linux" />}
      {activeUser === 'Moamen' && <MacEnvironment key="mac" />}
      {activeUser === 'Team' && <WinEnvironment key="win" />}
    </AnimatePresence>
  );
}
