'use client';
import React, { useState } from 'react';
import { User, Wifi, Bluetooth, Settings, Paintbrush, Bell, Moon } from 'lucide-react';

export default function MacSettings() {
  const [activeTab, setActiveTab] = useState('wifi');
  const [toggles, setToggles] = useState<Record<string, boolean>>({
    wifi: true,
    bluetooth: true,
    doNotDisturb: false,
    dark: true
  });

  const handleToggle = (key: string) => {
    setToggles(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const SIDEBAR_ITEMS = [
    { id: 'wifi', label: 'Wi-Fi', icon: Wifi, color: 'bg-blue-500' },
    { id: 'bluetooth', label: 'Bluetooth', icon: Bluetooth, color: 'bg-blue-500' },
    { id: 'notifications', label: 'Notifications', icon: Bell, color: 'bg-red-500' },
    { id: 'focus', label: 'Focus', icon: Moon, color: 'bg-indigo-500' },
    { id: 'general', label: 'General', icon: Settings, color: 'bg-gray-500' },
    { id: 'appearance', label: 'Appearance', icon: Paintbrush, color: 'bg-zinc-800 border border-white/20' },
  ];

  return (
    <div className="flex w-full h-full bg-transparent text-white font-sans select-none rounded-xl overflow-hidden">
      
      {/* Sidebar */}
      <div className="w-60 bg-white/10 backdrop-blur-3xl border-r border-white/10 flex flex-col p-3">
        {/* Apple ID Section */}
        <div className="flex items-center gap-3 p-2 mb-4 rounded-xl hover:bg-white/10 transition-colors cursor-pointer">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-400 to-purple-500 flex items-center justify-center shadow-lg">
            <User className="w-5 h-5 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-[13px] font-bold">Moamen</span>
            <span className="text-[11px] text-zinc-400">Apple ID, iCloud+</span>
          </div>
        </div>

        <div className="flex flex-col gap-1">
          {SIDEBAR_ITEMS.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-3 px-3 py-1.5 rounded-lg transition-colors ${
                  isActive 
                    ? 'bg-blue-500 text-white' 
                    : 'hover:bg-white/10 text-zinc-200'
                }`}
              >
                <div className={`w-6 h-6 rounded flex items-center justify-center ${isActive ? 'bg-white text-blue-500' : item.color}`}>
                  <Icon className={`w-4 h-4 ${isActive ? 'text-blue-500' : 'text-white'}`} />
                </div>
                <span className="text-[13px] font-medium">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col bg-black/40 backdrop-blur-2xl overflow-y-auto">
        <div className="px-10 py-8">
          <h1 className="text-2xl font-bold mb-6">
            {SIDEBAR_ITEMS.find(i => i.id === activeTab)?.label}
          </h1>

          <div className="max-w-xl">
            {activeTab === 'wifi' && (
              <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden backdrop-blur-md">
                <div className="flex items-center justify-between p-4 border-b border-white/10">
                  <span className="text-[14px] font-medium">Wi-Fi</span>
                  <button 
                    onClick={() => handleToggle('wifi')}
                    className={`w-11 h-6 flex items-center p-0.5 rounded-full transition-colors ${
                      toggles.wifi ? 'bg-emerald-500 justify-end' : 'bg-zinc-600 justify-start'
                    }`}
                  >
                    <div className="w-5 h-5 bg-white rounded-full shadow-md" />
                  </button>
                </div>
                {toggles.wifi && (
                  <div className="p-4 flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="text-[14px] font-medium">Home_Network_5G</span>
                      <span className="text-[12px] text-zinc-400">Connected</span>
                    </div>
                    <Wifi className="w-5 h-5 text-emerald-400" />
                  </div>
                )}
              </div>
            )}

            {activeTab === 'appearance' && (
              <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden backdrop-blur-md">
                <div className="flex items-center justify-between p-4 border-b border-white/10">
                  <span className="text-[14px] font-medium">Dark Mode</span>
                  <button 
                    onClick={() => handleToggle('dark')}
                    className={`w-11 h-6 flex items-center p-0.5 rounded-full transition-colors ${
                      toggles.dark ? 'bg-emerald-500 justify-end' : 'bg-zinc-600 justify-start'
                    }`}
                  >
                    <div className="w-5 h-5 bg-white rounded-full shadow-md" />
                  </button>
                </div>
                <div className="p-4">
                  <p className="text-[12px] text-zinc-400">
                    Dark mode makes the display easier on your eyes in low light conditions.
                  </p>
                </div>
              </div>
            )}

            {['bluetooth', 'notifications', 'focus', 'general'].includes(activeTab) && (
              <div className="bg-white/5 border border-white/10 rounded-xl p-6 text-center backdrop-blur-md text-sm text-zinc-400">
                These settings are currently managed by the Principal Architect.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
