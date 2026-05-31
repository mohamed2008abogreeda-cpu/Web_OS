'use client';
import { useOSStore } from '@/store/useOSStore';
import { useShallow } from 'zustand/react/shallow';
import dynamic from 'next/dynamic';

const LinuxEnvironment = dynamic(() => import('./desktops/linux/LinuxDesktop'), { ssr: false });
const MacEnvironment = dynamic(() => import('./desktops/mac/MacDesktop'), { ssr: false });
const WinEnvironment = dynamic(() => import('./desktops/windows/WinDesktop'), { ssr: false });
const MobileEnvironment = dynamic(() => import('./desktops/MobileDesktop'), { ssr: false });

import { useEffect, useState } from 'react';
import { AnimatePresence } from 'framer-motion';

export default function Desktop() {
  const { currentUser, isMobile } = useOSStore(
    useShallow((s) => ({
      currentUser: s.currentUser,
      isMobile: s.isMobile,
    }))
  );
  const [activeUser, setActiveUser] = useState(currentUser);

  useEffect(() => {
    setActiveUser(currentUser);
  }, [currentUser]);

  if (isMobile) {
    return <MobileEnvironment />;
  }

  return (
    <AnimatePresence mode="wait">
      {activeUser === 'Mohammed' && <LinuxEnvironment key="linux" />}
      {activeUser === 'Moamen' && <MacEnvironment key="mac" />}
      {activeUser === 'Team' && <WinEnvironment key="win" />}
    </AnimatePresence>
  );
}

