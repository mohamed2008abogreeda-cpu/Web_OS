'use client';
import { useOSStore } from '@/store/useOSStore';
import dynamic from 'next/dynamic';

const LinuxEnvironment = dynamic(() => import('./desktops/linux/LinuxDesktop'), { ssr: false });
const MacEnvironment = dynamic(() => import('./desktops/mac/MacDesktop'), { ssr: false });
const WinEnvironment = dynamic(() => import('./desktops/windows/WinDesktop'), { ssr: false });

export default function Desktop() {
  const currentUser = useOSStore(s => s.currentUser);
  
  if (currentUser === 'Mohammed') return <LinuxEnvironment />;
  if (currentUser === 'Moamen') return <MacEnvironment />;
  if (currentUser === 'Team') return <WinEnvironment />;
  return null;
}
