'use client';
import React, { useState, useEffect } from 'react';
import { Terminal, Shield, Lock, Radio } from 'lucide-react';

export default function LinuxComms() {
  const [isRinging, setIsRinging] = useState(false);
  const [hexCodes, setHexCodes] = useState<string[]>([]);

  useEffect(() => {
    const generateHex = () => {
      const arr = [];
      for (let i = 0; i < 8; i++) {
        arr.push(Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0').toUpperCase());
      }
      return arr.join(' ');
    };

    const interval = setInterval(() => {
      setHexCodes(prev => {
        const newArr = [generateHex(), ...prev];
        return newArr.slice(0, 5);
      });
    }, 200);
    return () => clearInterval(interval);
  }, []);

  const handleCall = async () => {
    setIsRinging(true);
    try {
      await fetch('/api/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: 'Incoming Secure P2P Link requested!' })
      });
      setTimeout(() => setIsRinging(false), 5000);
    } catch (e) {
      setIsRinging(false);
    }
  };

  return (
    <div className="w-full h-full bg-[#0c0c0c] text-emerald-500 font-mono p-6 flex flex-col relative overflow-hidden select-none">
      
      {/* Scanline Effect Overlay */}
      <div className="absolute inset-0 pointer-events-none bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSJ0cmFuc3BhcmVudCIvPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSIxIiBmaWxsPSJyZ2JhKDI1NSwgMjU1LCAyNTUsIDAuMDUpIi8+Cjwvc3ZnPg==')] opacity-50 z-10" />

      {/* Header */}
      <div className="flex items-center justify-between border-b border-emerald-900 pb-4 mb-6 relative z-20">
        <div className="flex items-center gap-3">
          <Shield className="w-6 h-6 text-emerald-400" />
          <h2 className="text-xl font-bold tracking-widest text-emerald-400">SECURE_LINK_PROTOCOL</h2>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="text-emerald-700">STATUS:</span>
          <span className="text-emerald-400 animate-pulse">AWAITING_HANDSHAKE</span>
        </div>
      </div>

      {/* Hex Stream Console */}
      <div className="flex-1 bg-black border border-emerald-900 p-4 mb-6 font-mono text-xs text-emerald-700 flex flex-col justify-end overflow-hidden relative z-20 shadow-[inset_0_0_20px_rgba(16,185,129,0.1)]">
        <div className="flex items-center gap-2 mb-4 text-emerald-500">
          <Terminal className="w-4 h-4" />
          <span>GENERATING ENCRYPTION KEYS...</span>
        </div>
        {hexCodes.map((code, idx) => (
          <div key={idx} className="opacity-70">{`0x${(Math.random() * 9999).toFixed(0).padStart(4, '0')} ${code}`}</div>
        ))}
      </div>

      {/* Control Panel */}
      <div className="flex items-center justify-center relative z-20 mt-auto">
        <button
          onClick={handleCall}
          disabled={isRinging}
          className={`px-6 py-4 font-bold tracking-[0.2em] transition-all flex items-center gap-3 border ${
            isRinging 
              ? 'border-yellow-500 text-yellow-500 bg-yellow-500/10' 
              : 'border-emerald-500 text-emerald-500 hover:bg-emerald-500/10 hover:shadow-[0_0_15px_rgba(16,185,129,0.5)] cursor-pointer'
          }`}
        >
          {isRinging ? (
            <>
              <Radio className="w-5 h-5 animate-spin text-yellow-500" />
              [ NEGOTIATING_LINK... ]
            </>
          ) : (
            <>
              <Lock className="w-5 h-5" />
              [ INITIATE SECURE LINK ]
            </>
          )}
        </button>
      </div>
    </div>
  );
}
