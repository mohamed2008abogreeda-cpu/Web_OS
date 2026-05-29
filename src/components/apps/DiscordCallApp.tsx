'use client';
import { useOSStore } from '@/store/useOSStore';
import LinuxComms from './linux/LinuxComms';
import MacFaceTime from './mac/MacFaceTime';
import WinTeams from './windows/WinTeams';

export default function DiscordCallApp() {
  const { currentUser } = useOSStore();

  if (currentUser?.id === 'user-1') {
    return <LinuxComms />;
  }
  
  if (currentUser?.id === 'user-2') {
    return <MacFaceTime />;
  }

  // user-team or fallback
  return <WinTeams />;
}
