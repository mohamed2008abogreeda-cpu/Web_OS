'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Terminal, Shield, Lock, Radio } from 'lucide-react';
import { useWebRTCCall } from '@/hooks/useWebRTCCall';

type ConnectionPhase = 'idle' | 'handshaking' | 'pinging' | 'connected';

export default function LinuxComms() {
  const [phase, setPhase] = useState<ConnectionPhase>('idle');
  const [logs, setLogs] = useState<string[]>([]);
  const [hexCodes, setHexCodes] = useState<string[]>([]);

  // ─── WebRTC integration state ───
  const [activeRoomId, setActiveRoomId] = useState<string>('');
  
  const {
    status,
    callStatus,
    connected,
    localStream,
    remoteStream,
    joinCall,
    endCall,
  } = useWebRTCCall(activeRoomId, false);

  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);

  // Attach stream objects safely to HTML5 Video elements once hooks emit them
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  // Automatically request peer-to-peer connection when signaling channel gets ready
  useEffect(() => {
    if (activeRoomId && callStatus === 'ready') {
      joinCall();
    }
  }, [activeRoomId, callStatus, joinCall]);

  // Continuous background hex generation stream for hacking aesthetics
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
    }, 250);
    return () => clearInterval(interval);
  }, []);

  const handleCall = async () => {
    if (phase !== 'idle') return;

    const roomId = crypto.randomUUID();
    setPhase('handshaking');
    setLogs(['> Initiating 256-bit RSA handshake...']);

    setTimeout(() => {
      setLogs(prev => [...prev, '> Bypassing local firewalls... [OK]']);
      
      setTimeout(() => {
        setPhase('pinging');
        setLogs(prev => [...prev, '> Pinging secure relay...']);

        setTimeout(async () => {
          try {
            const res = await fetch('/api/notify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                caller: 'Visitor',
                environment: 'Linux/Kali',
                roomId
              })
            });

            if (res.ok) {
              setLogs(prev => [...prev, '> LINK SECURED. ADMIN DEVICE PINGED.', '> Awaiting admin intercept...']);
              setPhase('connected');
              // Initialize room connection hook to start Pusher signaling
              setActiveRoomId(roomId);
            } else {
              const data = await res.json().catch(() => ({}));
              setLogs(prev => [...prev, `> ERROR: ${data.error || 'Negotiation failed'}`]);
              setPhase('idle');
            }
          } catch (err) {
            setLogs(prev => [...prev, '> ERROR: Security handshake timeout. Network route lost.']);
            setPhase('idle');
          }
        }, 1000);
      }, 1000);
    }, 1000);
  };

  const showVideo = connected || callStatus === 'active';

  return (
    <div className="w-full h-full bg-[#0c0c0c] text-emerald-500 font-mono p-6 flex flex-col relative overflow-hidden select-none">
      
      {/* Radar scanning line overlay */}
      <div className="absolute inset-0 pointer-events-none bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSJ0cmFuc3BhcmVudCIvPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSIxIiBmaWxsPSJyZ2JhKDE2LCAxODUsIDEyOSwgMC4wNCkiLz4KPC9zdmc+')] opacity-50 z-10" />

      {/* Protocol status bar */}
      <div className="flex items-center justify-between border-b border-emerald-900 pb-4 mb-6 relative z-20">
        <div className="flex items-center gap-3">
          <Shield className="w-6 h-6 text-emerald-400 animate-pulse" />
          <h2 className="text-xl font-bold tracking-widest text-emerald-400">SECURE_LINK_PROTOCOL</h2>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="text-emerald-700">STATUS:</span>
          <span className={`font-bold animate-pulse ${
            showVideo ? 'text-emerald-400' : phase !== 'idle' ? 'text-yellow-500' : 'text-emerald-600'
          }`}>
            {showVideo ? 'LINK_ESTABLISHED' : phase === 'idle' ? 'AWAITING_HANDSHAKE' : 'NEGOTIATING_ROUTE'}
          </span>
        </div>
      </div>

      {/* Main interactive area */}
      {showVideo ? (
        <div className="flex-1 grid grid-cols-2 gap-4 mb-6 relative z-20">
          {/* Local Camera stream */}
          <div className="bg-black border border-emerald-900 rounded p-2 flex flex-col relative shadow-[0_0_20px_rgba(16,185,129,0.05)]">
            <div className="text-[10px] text-emerald-400 font-bold mb-2 flex items-center justify-between">
              <span>[KALI_CAM_01] LOCAL_FEED</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
            </div>
            <div className="flex-1 bg-zinc-900/40 rounded overflow-hidden relative">
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover grayscale sepia contrast-125 brightness-90"
              />
              <div className="absolute inset-0 pointer-events-none border border-emerald-500/20" />
            </div>
          </div>

          {/* Remote Camera stream */}
          <div className="bg-black border border-emerald-900 rounded p-2 flex flex-col relative shadow-[0_0_20px_rgba(16,185,129,0.05)]">
            <div className="text-[10px] text-emerald-400 font-bold mb-2 flex items-center justify-between">
              <span>[COMMAND_CENTER_CAM] REMOTE_FEED</span>
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
            </div>
            <div className="flex-1 bg-zinc-900/40 rounded overflow-hidden relative">
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover grayscale sepia contrast-125 brightness-90"
              />
              <div className="absolute inset-0 pointer-events-none border border-emerald-500/20" />
            </div>
          </div>
        </div>
      ) : (
        /* Code generator screen during connecting phases */
        <div className="flex-1 bg-black border border-emerald-900 p-4 mb-6 font-mono text-xs text-emerald-700 flex flex-col justify-between overflow-hidden relative z-20 shadow-[inset_0_0_20px_rgba(16,185,129,0.1)]">
          <div className="flex items-center gap-2 mb-2 text-emerald-500 border-b border-emerald-950 pb-2">
            <Terminal className="w-4 h-4" />
            <span className="font-bold tracking-wider">SYSTEM LOGS & ENCRYPTION STREAM</span>
          </div>

          <div className="flex-1 flex flex-col justify-end opacity-20 font-mono text-[10px] select-none pointer-events-none mb-4 overflow-hidden">
            {hexCodes.map((code, idx) => (
              <div key={idx} className="truncate">{`0x${(Math.random() * 9999).toFixed(0).padStart(4, '0')} ${code}`}</div>
            ))}
          </div>
        </div>
      )}

      {/* Visual progress log terminal */}
      <div className="bg-zinc-950 border border-emerald-900/40 p-4 rounded flex flex-col gap-2 font-mono text-xs relative z-20 mb-6 max-h-[140px] overflow-y-auto">
        <div className="text-emerald-500 font-bold border-b border-emerald-950 pb-1 flex justify-between">
          <span>&gt;_ LOGS</span>
          <span className="text-zinc-600 text-[10px]">ROOM_ID: {activeRoomId || 'N/A'}</span>
        </div>
        {logs.length === 0 ? (
          <div className="text-emerald-800 italic animate-pulse">&gt; Terminal idle. Awaiting secure pager signal activation...</div>
        ) : (
          logs.map((log, idx) => {
            let colorClass = 'text-emerald-600';
            if (log.includes('Initiating')) colorClass = 'text-emerald-400';
            if (log.includes('[OK]')) colorClass = 'text-yellow-400';
            if (log.includes('Pinging')) colorClass = 'text-sky-400 animate-pulse';
            if (log.includes('LINK SECURED')) colorClass = 'text-emerald-400 font-bold';
            if (log.includes('ERROR')) colorClass = 'text-red-500 font-bold';
            return (
              <div key={idx} className={`${colorClass} tracking-wide`}>
                {log}
              </div>
            );
          })
        )}
      </div>

      {/* Secure link activation buttons */}
      <div className="flex items-center justify-center relative z-20 mt-auto">
        {showVideo ? (
          <button
            onClick={() => {
              endCall();
              setActiveRoomId('');
              setPhase('idle');
              setLogs([]);
            }}
            className="px-6 py-4 font-bold tracking-[0.2em] transition-all flex items-center gap-3 border border-red-500 text-red-500 hover:bg-red-500/10 cursor-pointer shadow-[0_0_15px_rgba(239,68,68,0.2)]"
          >
            <Radio className="w-5 h-5 text-red-400" />
            [ SEVER SECURE LINK ]
          </button>
        ) : (
          <button
            onClick={handleCall}
            disabled={phase !== 'idle'}
            className={`px-6 py-4 font-bold tracking-[0.2em] transition-all flex items-center gap-3 border ${
              phase === 'connected'
                ? 'border-emerald-500 text-emerald-500 bg-emerald-500/10 cursor-default shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                : phase !== 'idle'
                ? 'border-yellow-500 text-yellow-500 bg-yellow-500/10 cursor-not-allowed'
                : 'border-emerald-500 text-emerald-500 hover:bg-emerald-500/10 hover:shadow-[0_0_15px_rgba(16,185,129,0.4)] cursor-pointer'
            }`}
          >
            {phase === 'connected' ? (
              <>
                <Radio className="w-5 h-5 text-emerald-400" />
                [ PING SENT... ]
              </>
            ) : phase !== 'idle' ? (
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
        )}
      </div>
    </div>
  );
}
