'use client';
import { useOSStore } from '@/store/useOSStore';
import LinuxTerminal from './linux/LinuxTerminal';
import MacTerminal from './mac/MacTerminal';
import WinTerminal from './windows/WinTerminal';

export default function TerminalApp() {
  const { currentUser } = useOSStore();

  if (currentUser === 'Mohammed') {
    return <LinuxTerminal />;
  }
  
  if (currentUser === 'Moamen') {
    return <MacTerminal />;
  }

  // user-team or fallback
  return <WinTerminal />;
}
