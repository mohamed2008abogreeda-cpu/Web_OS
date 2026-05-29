'use client';
import React, { useState } from 'react';
import { useOSStore } from '@/store/useOSStore';
import { ShieldAlert, Activity, Wifi, HardDrive, Users, Eye } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ControlPanel({ windowId }: { windowId: string }) {
  const isAdminAuthenticated = useOSStore(s => s.isAdminAuthenticated);
  const initSpectator = useOSStore(s => s.initSpectator);
  
  // Dummy active sessions
  const [activeSessions] = useState(['sess_alpha_92X', 'sess_beta_41Y']);

  if (!isAdminAuthenticated) {
    return (
      <div className="w-full h-full bg-black flex flex-col items-center justify-center text-red-500 font-mono relative overflow-hidden select-none">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 0, 0.5, 1], x: [-5, 5, -5, 5, 0] }}
          transition={{ duration: 0.5, repeat: Infinity, repeatType: "mirror" }}
          className="flex flex-col items-center gap-4 z-10"
        >
          <ShieldAlert className="w-24 h-24 text-red-600 animate-pulse" />
          <h1 className="text-4xl font-extrabold tracking-widest drop-shadow-[0_0_15px_rgba(220,38,38,0.8)] uppercase">Access Denied</h1>
          <p className="text-sm tracking-[0.2em] text-red-400">Unauthorized Personnel Detected</p>
        </motion.div>
        
        {/* CRT Scanline effect */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%] z-20 pointer-events-none opacity-20" />
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-zinc-950/60 backdrop-blur-2xl text-emerald-400 font-mono p-6 flex flex-col gap-6 overflow-y-auto select-none">
      <div className="flex items-center justify-between border-b border-emerald-500/20 pb-4">
        <div className="flex items-center gap-3">
          <Activity className="w-8 h-8 text-emerald-500 animate-pulse" />
          <h2 className="text-2xl font-black tracking-tight text-white drop-shadow-[0_0_10px_rgba(16,185,129,0.5)]">COMMAND CENTER</h2>
        </div>
        <div className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 rounded-full text-xs font-bold flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,1)] animate-pulse" />
          EDGE SECURE
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Metrics */}
        <div className="bg-black/40 border border-white/5 rounded-2xl p-5 flex flex-col gap-2 relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-colors" />
          <div className="flex items-center gap-2 text-zinc-400 text-xs font-bold tracking-wider mb-2">
            <Wifi className="w-4 h-4 text-emerald-500" /> Edge Latency
          </div>
          <div className="text-3xl font-black text-white">12<span className="text-lg text-emerald-500/50">ms</span></div>
          <div className="text-[10px] text-emerald-500">Cloudflare FRA-1</div>
        </div>

        <div className="bg-black/40 border border-white/5 rounded-2xl p-5 flex flex-col gap-2 relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl group-hover:bg-blue-500/10 transition-colors" />
          <div className="flex items-center gap-2 text-zinc-400 text-xs font-bold tracking-wider mb-2">
            <Users className="w-4 h-4 text-blue-500" /> Active WebSockets
          </div>
          <div className="text-3xl font-black text-white">1,402</div>
          <div className="text-[10px] text-blue-500">Pusher Global Cluster</div>
        </div>

        <div className="bg-black/40 border border-white/5 rounded-2xl p-5 flex flex-col gap-2 relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl group-hover:bg-amber-500/10 transition-colors" />
          <div className="flex items-center gap-2 text-zinc-400 text-xs font-bold tracking-wider mb-2">
            <HardDrive className="w-4 h-4 text-amber-500" /> R2 Storage
          </div>
          <div className="text-3xl font-black text-white">42<span className="text-lg text-amber-500/50">%</span></div>
          <div className="text-[10px] text-amber-500">2.1TB / 5.0TB Used</div>
        </div>
      </div>

      <div className="flex-1 bg-black/40 border border-white/5 rounded-2xl p-6 flex flex-col gap-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Users className="w-5 h-5 text-emerald-500" /> Active Guest Sessions
        </h3>
        
        <div className="flex flex-col gap-3">
          {activeSessions.map((sess) => (
            <div key={sess} className="flex items-center justify-between p-4 bg-zinc-900/50 border border-white/5 rounded-xl hover:border-emerald-500/30 transition-colors group">
              <div className="flex flex-col gap-1">
                <span className="text-white font-bold tracking-wide">{sess}</span>
                <span className="text-xs text-zinc-500">Connected 4 mins ago • IP: 104.28.***.***</span>
              </div>
              <button 
                onClick={() => initSpectator(sess)}
                className="px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 font-bold text-sm rounded-lg border border-emerald-500/20 transition-all flex items-center gap-2 hover:shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:scale-105 active:scale-95 cursor-pointer"
              >
                <Eye className="w-4 h-4" /> Live Spectate
              </button>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
