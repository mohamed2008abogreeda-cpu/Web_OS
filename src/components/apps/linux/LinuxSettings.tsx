'use client';
import React, { useState } from 'react';
import { Network, Bluetooth, Image as ImageIcon, ShieldAlert, Monitor, Server, Lock } from 'lucide-react';

export default function LinuxSettings() {
  const [activeTab, setActiveTab] = useState('network');
  const [toggles, setToggles] = useState<Record<string, boolean>>({
    wifi: true,
    vpn: false,
    bluetooth: true,
    firewall: true,
    stealth: false
  });

  const handleToggle = (key: string) => {
    setToggles(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const SIDEBAR_ITEMS = [
    { id: 'network', label: 'Network', icon: Network },
    { id: 'bluetooth', label: 'Bluetooth', icon: Bluetooth },
    { id: 'background', label: 'Background', icon: ImageIcon },
    { id: 'cyber', label: 'Cyber-Sec Tools', icon: ShieldAlert },
    { id: 'privacy', label: 'Privacy', icon: Lock },
  ];

  return (
    <div className="flex w-full h-full bg-[#121212] text-zinc-300 font-sans select-none rounded-none">
      
      {/* Sidebar */}
      <div className="w-56 bg-[#1a1a1a] border-r border-[#333] flex flex-col pt-4">
        <div className="px-4 pb-4 mb-2 border-b border-[#333]">
          <h2 className="text-sm font-bold text-white tracking-widest uppercase">Settings</h2>
        </div>
        <div className="flex flex-col">
          {SIDEBAR_ITEMS.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-3 px-4 py-3 border-l-2 transition-all ${
                  isActive 
                    ? 'border-emerald-500 bg-[#252526] text-white' 
                    : 'border-transparent hover:bg-[#202020] hover:text-zinc-100 text-zinc-400'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-[13px] font-medium">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col bg-[#121212] overflow-y-auto">
        <div className="px-8 py-6 border-b border-[#333] bg-[#1a1a1a]">
          <h1 className="text-2xl font-bold text-white">
            {SIDEBAR_ITEMS.find(i => i.id === activeTab)?.label}
          </h1>
        </div>

        <div className="p-8 max-w-2xl">
          {activeTab === 'network' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 border border-[#333] bg-[#1a1a1a]">
                <div className="flex items-center gap-4">
                  <Network className="w-6 h-6 text-zinc-400" />
                  <div>
                    <h3 className="font-bold text-white text-[14px]">Wi-Fi Network</h3>
                    <p className="text-[12px] text-zinc-500">Connected to wlan0</p>
                  </div>
                </div>
                <button 
                  onClick={() => handleToggle('wifi')}
                  className={`w-10 h-5 flex items-center p-1 rounded-none border border-[#333] transition-colors ${
                    toggles.wifi ? 'bg-emerald-600 justify-end' : 'bg-[#222] justify-start'
                  }`}
                >
                  <div className={`w-3 h-3 bg-white rounded-none shadow-sm`} />
                </button>
              </div>

              <div className="flex items-center justify-between p-4 border border-[#333] bg-[#1a1a1a]">
                <div className="flex items-center gap-4">
                  <Server className="w-6 h-6 text-zinc-400" />
                  <div>
                    <h3 className="font-bold text-white text-[14px]">VPN Connection</h3>
                    <p className="text-[12px] text-zinc-500">tun0 interface</p>
                  </div>
                </div>
                <button 
                  onClick={() => handleToggle('vpn')}
                  className={`w-10 h-5 flex items-center p-1 rounded-none border border-[#333] transition-colors ${
                    toggles.vpn ? 'bg-emerald-600 justify-end' : 'bg-[#222] justify-start'
                  }`}
                >
                  <div className={`w-3 h-3 bg-white rounded-none shadow-sm`} />
                </button>
              </div>
            </div>
          )}

          {activeTab === 'cyber' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 border border-[#333] bg-[#1a1a1a]">
                <div className="flex items-center gap-4">
                  <ShieldAlert className="w-6 h-6 text-zinc-400" />
                  <div>
                    <h3 className="font-bold text-white text-[14px]">UFW Firewall</h3>
                    <p className="text-[12px] text-zinc-500">Default deny incoming</p>
                  </div>
                </div>
                <button 
                  onClick={() => handleToggle('firewall')}
                  className={`w-10 h-5 flex items-center p-1 rounded-none border border-[#333] transition-colors ${
                    toggles.firewall ? 'bg-emerald-600 justify-end' : 'bg-[#222] justify-start'
                  }`}
                >
                  <div className={`w-3 h-3 bg-white rounded-none shadow-sm`} />
                </button>
              </div>

              <div className="flex items-center justify-between p-4 border border-[#333] bg-[#1a1a1a]">
                <div className="flex items-center gap-4">
                  <Monitor className="w-6 h-6 text-zinc-400" />
                  <div>
                    <h3 className="font-bold text-white text-[14px]">Stealth Mode</h3>
                    <p className="text-[12px] text-zinc-500">Drop ICMP Ping requests</p>
                  </div>
                </div>
                <button 
                  onClick={() => handleToggle('stealth')}
                  className={`w-10 h-5 flex items-center p-1 rounded-none border border-[#333] transition-colors ${
                    toggles.stealth ? 'bg-emerald-600 justify-end' : 'bg-[#222] justify-start'
                  }`}
                >
                  <div className={`w-3 h-3 bg-white rounded-none shadow-sm`} />
                </button>
              </div>
            </div>
          )}

          {['bluetooth', 'background', 'privacy'].includes(activeTab) && (
            <div className="p-8 text-center text-zinc-500 text-[13px] border border-[#333] bg-[#1a1a1a]">
              Configuration modules for {activeTab} are currently unavailable in this session.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
