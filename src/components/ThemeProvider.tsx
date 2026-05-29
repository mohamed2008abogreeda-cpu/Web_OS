'use client';

import React, { useEffect } from 'react';
import { useOSStore } from '@/store/useOSStore';

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const currentUser = useOSStore(s => s.currentUser) || 'Mohammed';

  useEffect(() => {
    // Instantly apply the matching data-theme to the <html> tag
    document.documentElement.setAttribute('data-theme', currentUser);
  }, [currentUser]);

  return (
    <>
      <div 
        className="fixed inset-0 z-[9999] pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />
      {children}
    </>
  );
}
