'use client';
import { useOSStore } from '@/store/useOSStore';
import LinuxComms from './linux/LinuxComms';
import MacFaceTime from './mac/MacFaceTime';
import WinTeams from './windows/WinTeams';

export default function DiscordCallApp() {
  const { currentUser } = useOSStore();

  if (currentUser === 'Mohammed') {
    return <LinuxComms />;
  }
  
  if (currentUser === 'Moamen') {
    return <MacFaceTime />;
  }

  // user-team or fallback
  return <WinTeams />;
}
