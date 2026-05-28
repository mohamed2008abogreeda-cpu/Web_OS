'use client';
import { useOSStore } from '@/store/useOSStore';
import { SYSTEM_APPS } from '@/lib/mockData';
import { Clock } from 'lucide-react';

export default function MobileLauncher() {
  const { openWindow } = useOSStore();

  return (
    <div className="w-full h-full bg-zinc-950 p-6 pt-16 flex flex-col items-center">
      <div className="mb-12 flex flex-col items-center">
        <span className="text-6xl font-light text-white tracking-tight">
          {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
        <span className="text-zinc-400 mt-2 text-sm">
          {new Date().toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })}
        </span>
      </div>

      <div className="grid grid-cols-4 gap-y-8 gap-x-6 w-full max-w-[400px]">
        {SYSTEM_APPS.map((app) => (
          <button
            key={app.id}
            onClick={() => openWindow(app)}
            className="flex flex-col items-center gap-2 group outline-none"
          >
            <div className="w-16 h-16 rounded-[22%] bg-zinc-900 border border-white/5 flex items-center justify-center 
                          shadow-lg group-active:scale-90 transition-transform duration-200">
              <span className="text-2xl">{app.icon}</span>
            </div>
            <span className="text-xs text-white/80 font-medium truncate w-full text-center group-active:opacity-50">
              {app.title}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
