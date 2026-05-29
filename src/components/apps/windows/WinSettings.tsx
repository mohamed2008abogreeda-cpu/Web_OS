'use client';
import React, { useState } from 'react';
import { Laptop, Bluetooth, Wifi, Palette, UserCircle2, ChevronRight, ShieldCheck } from 'lucide-react';

export default function WinSettings() {
  const [activeTab, setActiveTab] = useState('system');
  const [toggles, setToggles] = useState<Record<string, boolean>>({
    wifi: true,
    bluetooth: true,
    nightLight: false,
    defender: true
  });

  const handleToggle = (key: string) => {
    setToggles(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const SIDEBAR_ITEMS = [
    { id: 'system', label: 'System', icon: Laptop },
    { id: 'bluetooth', label: 'Bluetooth & devices', icon: Bluetooth },
    { id: 'network', label: 'Network & internet', icon: Wifi },
    { id: 'personalization', label: 'Personalization', icon: Palette },
  ];

  return (
    <div className="flex w-full h-full bg-zinc-900/95 backdrop-blur-3xl text-zinc-100 font-sans select-none rounded-lg overflow-hidden border border-white/10 shadow-2xl">
      
      {/* Sidebar */}
      <div className="w-64 bg-zinc-900/50 flex flex-col pt-8 px-4 border-r border-white/5 relative z-10">
        
        {/* Profile Header */}
        <div className="flex items-center gap-4 mb-8 px-2">
          <div className="w-14 h-14 rounded-full bg-zinc-800 flex items-center justify-center overflow-hidden border border-white/10">
            <UserCircle2 className="w-full h-full text-zinc-500" strokeWidth={1} />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-semibold tracking-tight text-white">Team</span>
            <span className="text-xs text-zinc-400">Local Account</span>
            <span className="text-xs text-zinc-400">Administrator</span>
          </div>
        </div>

        {/* Navigation List */}
        <div className="flex flex-col gap-1">
          {SIDEBAR_ITEMS.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`relative flex items-center gap-4 px-3 py-2.5 rounded-md transition-all group overflow-hidden ${
                  isActive ? 'bg-white/10' : 'hover:bg-white/5'
                }`}
              >
                {/* Accent line on active */}
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-4 bg-blue-400 rounded-r-full" />
                )}
                
                <Icon className={`w-4 h-4 ${isActive ? 'text-blue-400' : 'text-zinc-400 group-hover:text-zinc-200 transition-colors'}`} />
                <span className={`text-sm ${isActive ? 'font-semibold text-white' : 'font-medium text-zinc-300 group-hover:text-zinc-100 transition-colors'}`}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 bg-zinc-950/80 overflow-y-auto">
        <div className="px-12 py-10 max-w-4xl">
          <h1 className="text-3xl font-semibold mb-8 text-white tracking-tight">
            {SIDEBAR_ITEMS.find(i => i.id === activeTab)?.label}
          </h1>

          <div className="space-y-2">
            {activeTab === 'system' && (
              <>
                {/* Card 1 */}
                <div className="group bg-zinc-900/80 hover:bg-zinc-800/80 border border-white/5 hover:border-white/10 rounded-lg p-4 transition-all cursor-pointer flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Laptop className="w-6 h-6 text-blue-400" />
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-white">Display</span>
                      <span className="text-xs text-zinc-400">Monitors, brightness, night light, display profile</span>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-zinc-500 group-hover:text-zinc-300" />
                </div>

                {/* Card 2 */}
                <div className="bg-zinc-900/80 border border-white/5 rounded-lg p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <ShieldCheck className="w-6 h-6 text-emerald-400" />
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-white">Windows Security</span>
                      <span className="text-xs text-zinc-400">Antivirus, firewall, browser control</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleToggle('defender')}
                    className={`relative w-10 h-5 rounded-full transition-colors ${toggles.defender ? 'bg-blue-500' : 'bg-zinc-700'}`}
                  >
                    <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${toggles.defender ? 'left-5' : 'left-0.5'}`} />
                  </button>
                </div>
              </>
            )}

            {activeTab === 'network' && (
              <div className="bg-zinc-900/80 border border-white/5 rounded-lg p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Wifi className="w-6 h-6 text-blue-400" />
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-white">Wi-Fi</span>
                    <span className="text-xs text-zinc-400">Connect, manage known networks</span>
                  </div>
                </div>
                <button 
                  onClick={() => handleToggle('wifi')}
                  className={`relative w-10 h-5 rounded-full transition-colors ${toggles.wifi ? 'bg-blue-500' : 'bg-zinc-700'}`}
                >
                  <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${toggles.wifi ? 'left-5' : 'left-0.5'}`} />
                </button>
              </div>
            )}

            {['bluetooth', 'personalization'].includes(activeTab) && (
              <div className="bg-zinc-900/80 border border-white/5 rounded-lg p-8 text-center text-zinc-400 text-sm">
                These settings pages are currently locked by Group Policy.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
