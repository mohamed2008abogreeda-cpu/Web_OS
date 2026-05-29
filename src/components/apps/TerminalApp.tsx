'use client';
import { useOSStore } from '@/store/useOSStore';
import LinuxTerminal from './linux/LinuxTerminal';
import MacTerminal from './mac/MacTerminal';
import WinTerminal from './windows/WinTerminal';

export default function TerminalApp() {
  const { currentUser } = useOSStore();

  if (currentUser?.id === 'user-1') {
    return <LinuxTerminal />;
  }
  
  if (currentUser?.id === 'user-2') {
    return <MacTerminal />;
  }

  // user-team or fallback
  return <WinTerminal />;
}
