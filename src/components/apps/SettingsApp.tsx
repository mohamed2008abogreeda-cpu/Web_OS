'use client';
import { useOSStore } from '@/store/useOSStore';
import LinuxSettings from './linux/LinuxSettings';
import MacSettings from './mac/MacSettings';
import WinSettings from './windows/WinSettings';

export default function SettingsApp() {
  const { currentUser } = useOSStore();

  if (currentUser?.id === 'user-1') {
    return <LinuxSettings />;
  }
  
  if (currentUser?.id === 'user-2') {
    return <MacSettings />;
  }

  // user-team or fallback
  return <WinSettings />;
}
