'use client';
import { motion } from 'framer-motion';
import { useOSStore } from '@/store/useOSStore';
import { SYSTEM_APPS, USERS } from '@/lib/mockData';
import { APP_ICONS } from '@/lib/icons';
import Win11Taskbar from './Win11Taskbar';
import Win11Widgets from './Win11Widgets';

export default function Win11Desktop() {
  const { openWindow, currentUser } = useOSStore();
  const user = currentUser ? USERS[currentUser] : null;

  return (
    <motion.div
      className="fixed inset-0 flex flex-col overflow-hidden select-none"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      data-testid="desktop"
    >
      {/* Windows 11 Wallpaper */}
      <div className="absolute inset-0 z-0">
        <img
          src={user?.wallpaper || "/wallpaper.jpg"}
          alt="Windows 11 Wallpaper"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/40" />
      </div>

      {/* Desktop Content (Grid of Icons on the left) */}
      <div className="flex-1 relative z-10 p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 content-start justify-items-start max-w-sm">
          {SYSTEM_APPS.map((app) => {
            const IconComponent = APP_ICONS[app.id];
            return (
              <div 
                key={app.id} 
                className="w-24 h-28 flex flex-col items-center justify-start gap-2 p-3 rounded-xl cursor-pointer hover:bg-white/10 active:bg-white/20 border border-transparent hover:border-white/10 transition-colors group"
                onClick={() => openWindow(app)}
              >
                {IconComponent && <IconComponent className="w-12 h-12 text-white drop-shadow-md" />}
                <span className="text-white text-xs font-medium text-center drop-shadow-md leading-tight line-clamp-2">
                  {app.title}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Desktop Widgets */}
      <Win11Widgets />

      {/* Taskbar */}
      <Win11Taskbar />
    </motion.div>
  );
}
