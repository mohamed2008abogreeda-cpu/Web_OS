'use client';
import { useOSStore } from '@/store/useOSStore';
import LinuxFiles from './linux/LinuxFiles';
import MacFinder from './mac/MacFinder';
import WinExplorer from './windows/WinExplorer';

export default function ProjectViewer() {
  const { currentUser } = useOSStore();

  if (currentUser?.id === 'user-1') {
    return <LinuxFiles />;
  }
  
  if (currentUser?.id === 'user-2') {
    return <MacFinder />;
  }

  // user-team or fallback
  return <WinExplorer />;
}
