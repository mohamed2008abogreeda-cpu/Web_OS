'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldAlert, Terminal, Loader2, Key } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function LoginPage() {
  const router = useRouter();
  const [passcode, setPasscode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passcode) return;

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passcode })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        router.push('/admin');
      } else {
        throw new Error(data.error || 'Access Denied: Unauthorized Credentials');
      }
    } catch (err: any) {
      setError(err.message || 'System Authentication Refused');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-300 font-mono p-6 flex items-center justify-center relative overflow-hidden">
      
      {/* Brutalist terminal background grid overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0c0c0c_1px,transparent_1px),linear-gradient(to_bottom,#0c0c0c_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none z-0" />
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_30%,rgba(0,0,0,0.9)_100%)] z-10" />

      {/* Main Terminal Box */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="w-full max-w-md bg-black border-2 border-emerald-950 rounded-lg p-6 md:p-8 shadow-[0_0_50px_rgba(16,185,129,0.03)] relative overflow-hidden z-20"
      >
        {/* Glowing Matrix scanner scanline overlay */}
        <div className="absolute inset-0 pointer-events-none bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSJ0cmFuc3BhcmVudCIvPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSIxIiBmaWxsPSJyZ2JhKDE2LCAxODUsIDEyOSwgMC4wMikiLz4KPC9zdmc+')] z-30" />
        
        {/* Upper Header Status */}
        <div className="flex items-center justify-between border-b border-emerald-950 pb-4 mb-6">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
            <h1 className="text-xs font-bold text-emerald-400 tracking-widest flex items-center gap-1.5 uppercase">
              <Terminal className="w-4 h-4" />
              <span>GATEWAY_AUTH_0x44</span>
            </h1>
          </div>
          <span className="text-[9px] bg-emerald-950/40 border border-emerald-900/30 text-emerald-400 px-2 py-0.5 rounded uppercase font-bold tracking-wider">
            SECURE_PORT_8771
          </span>
        </div>

        {/* Informative terminal warning */}
        <div className="bg-zinc-950/80 border border-emerald-950/60 p-4 rounded mb-6 text-[11px] text-zinc-500 leading-relaxed">
          <div className="text-emerald-400/80 font-bold mb-1.5 flex items-center gap-1.5">
            <ShieldAlert className="w-3.5 h-3.5 text-emerald-400" />
            <span>[SECURITY_DIRECTIVE]</span>
          </div>
          Authorized administrator access only. Any unauthorized traverse attempts will be logged to D1 databases and routed back to telemetry servers.
        </div>

        {/* Error Alert Display */}
        <AnimatePresence>
          {error && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-red-950/20 border border-red-900/40 p-3 rounded mb-6 text-xs text-red-400 font-bold flex items-start gap-2.5 shadow-[0_0_15px_rgba(239,68,68,0.05)]"
            >
              <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5 text-red-500 animate-bounce" />
              <span>{error}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex flex-col gap-2 relative">
            <div className="flex justify-between items-center">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-1">
                <Key className="w-3 h-3 text-emerald-400" />
                <span>ENTER SECURE PASSCODE</span>
              </label>
              <span className="text-[9px] text-zinc-600">LEN: 16+</span>
            </div>
            
            <div className="relative">
              <input
                type="password"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                disabled={loading}
                autoFocus
                className="w-full bg-black/60 border border-emerald-950 focus:border-emerald-700/60 text-emerald-400 focus:outline-none rounded px-4 py-3 text-sm tracking-[0.25em] font-mono shadow-inner focus:shadow-[0_0_15px_rgba(16,185,129,0.05)] transition-all placeholder-emerald-950"
                placeholder="••••••••••••••••"
              />
              {/* Retro Blinking green cursor inside input box */}
              {!passcode && (
                <span className="absolute left-4 top-1/2 -translate-y-1/2 w-1.5 h-4 bg-emerald-500/80 animate-[ping_1.2s_infinite_linear]" />
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !passcode}
            className="w-full h-11 bg-emerald-950 hover:bg-emerald-900 border border-emerald-800 disabled:opacity-40 text-emerald-400 hover:text-white rounded text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_20px_rgba(16,185,129,0.08)] active:scale-[0.99] transition-all hover:scale-[1.01]"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>AUTHORIZING ACCESS KEY...</span>
              </>
            ) : (
              <span>[ EXECUTE AUTHENTICATION ENTRY ]</span>
            )}
          </button>
        </form>

        {/* Footer info */}
        <div className="text-[9px] text-zinc-700 text-center mt-8 uppercase font-bold tracking-widest">
          SYS_ROUTING: WEBOS_EDGE_FIREWALL
        </div>

      </motion.div>
    </div>
  );
}
