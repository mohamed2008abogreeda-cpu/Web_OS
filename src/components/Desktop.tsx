"use client";
import React from 'react';
import { useOSStore } from '@/store/useOSStore';
import WindowManager from './WindowManager';
import Taskbar from './Taskbar';
import GhostCursor from './GhostCursor';
import { Toaster } from 'sonner';

const Desktop = () => {
  const currentUser = useOSStore((state) => state.currentUser);

  if (!currentUser) return null;

  return (
    <main className="relative w-screen h-screen overflow-hidden text-white selection:bg-os-accent/30">
      {/* The background is handled globally by ThemeProvider/globals.css */}
      
      <div className="absolute inset-0 z-10">
        <WindowManager />
      </div>

      <Taskbar />
      <GhostCursor />
      <Toaster theme="dark" />
    </main>
  );
};

export default Desktop;
