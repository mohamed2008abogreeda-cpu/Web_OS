'use client';
import { useOSStore } from '@/store/useOSStore';
import LinuxSettings from './linux/LinuxSettings';
import MacSettings from './mac/MacSettings';
import WinSettings from './windows/WinSettings';

export default function SettingsApp() {
  const { currentUser } = useOSStore();

  if (currentUser === 'Mohammed') {
    return <LinuxSettings />;
  }
  
  if (currentUser === 'Moamen') {
    return <MacSettings />;
  }

  // user-team or fallback
  return <WinSettings />;
}
