'use client';

/**
 * AdminComms — Admin-side secure E2E comms center & Live Radar Map
 *
 * URL: /admin/comms?room=<uuid>
 * Integrates WebRTC bidirectional secure audio/video relay with spectator visitor tracking.
 * Theme: Brutalist Dark Hacking console + Sleek glassmorphic call controls.
 */
import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useWebRTCCall } from '@/hooks/useWebRTCCall';
import { 
  PhoneOff, 
  Mic, 
  MicOff, 
  PhoneCall, 
  Users, 
  ShieldCheck, 
  Loader2, 
  Terminal, 
  MousePointer2 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Pusher from 'pusher-js';
import { useOSStore } from '@/store/useOSStore';
import GhostCursor from '@/components/GhostCursor';

function AdminComms() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Read dynamic room parameter sent via the click action of the ntfy.sh notification
  const roomId = searchParams.get('room');

  const [micMuted, setMicMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // ─── Live Spectator tracking state (God Mode) ───
  const [visitorX, setVisitorX] = useState<number>(0);
  const [visitorY, setVisitorY] = useState<number>(0);
  const [visitorWindows, setVisitorWindows] = useState<any[]>([]);

  // Initialize WebRTC secure P2P media hook
  const {
    status,
    callStatus,
    connected,
    isReady,
    isWaiting,
    localStream,
    remoteStream,
    joinCall,
    endCall,
    toggleMic,
  } = useWebRTCCall(roomId || '', true);

  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);

  // Safely attach stream objects to raw HTML5 Video nodes on mount
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

  // Play remote audio elements
  useEffect(() => {
    if (remoteStream && audioRef.current) {
      audioRef.current.srcObject = remoteStream;
      audioRef.current.play().catch(() => {});
    }
  }, [remoteStream]);

  // ─── Real-time Pusher Receiver subscription ───
  useEffect(() => {
    // Enable state spectator flags for GhostCursor rendering compatibility
    useOSStore.setState({ isSpectating: true, isAdminAuthenticated: true });

    const key = process.env.NEXT_PUBLIC_PUSHER_KEY || 'app-key';
    const cluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER || 'us2';

    const pusher = new Pusher(key, {
      cluster,
      forceTLS: true,
    });

    const channel = pusher.subscribe('os-sync-channel');

    channel.bind('os-state-update', (data: { x: number; y: number; activeWindows: any[] }) => {
      if (data) {
        setVisitorX(data.x ?? 0);
        setVisitorY(data.y ?? 0);
        setVisitorWindows(data.activeWindows || []);

        // Sync directly to the Zustand store for full system component sync
        useOSStore.setState({
          ghostCursor: { x: data.x ?? 0, y: data.y ?? 0 }
        });
      }
    });

    // Cleanup subscription, bindings and state variables on unmount to avoid memory leaks
    return () => {
      channel.unbind_all();
      channel.unsubscribe();
      pusher.disconnect();
      useOSStore.setState({ isSpectating: false, isAdminAuthenticated: false, ghostCursor: null });
    };
  }, []);

  if (!roomId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#080808] text-red-500 font-mono">
        <p className="font-bold text-lg">&gt;_ INVALID_CALL_LINK</p>
        <p className="text-zinc-500 text-sm mt-2">Error: No room payload detected in URL.</p>
      </div>
    );
  }

  const handleToggleMic = () => {
    const enabled = toggleMic();
    setMicMuted(!enabled);
  };

  const handleEndCall = () => {
    endCall();
    router.push('/admin');
  };

  const showVideo = connected || callStatus === 'active';

  return (
    <div className="min-h-screen bg-[#080808] text-zinc-300 font-mono p-6 relative overflow-hidden flex flex-col lg:flex-row gap-6 justify-center items-center">
      
      {/* ─── absolute visual Ghost Cursor tracking overlay ─── */}
      {visitorX !== 0 && visitorY !== 0 && (
        <div
          style={{
            position: 'fixed',
            left: visitorX,
            top: visitorY,
            pointerEvents: 'none',
            zIndex: 99999,
          }}
          className="transition-all duration-75 ease-out drop-shadow-[0_0_15px_rgba(16,185,129,0.8)]"
        >
          <MousePointer2 className="w-8 h-8 text-emerald-400 fill-emerald-500/20" />
          <div className="absolute top-8 left-6 bg-black border border-emerald-500/50 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded shadow-lg whitespace-nowrap">
            Guest Session ({visitorX}, {visitorY})
          </div>
        </div>
      )}

      {/* Renders global GhostCursor component */}
      <GhostCursor />

      {/* LEFT COMPONENT: Secure E2E Call Console */}
      <div className="w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-lg p-8 shadow-2xl flex flex-col relative overflow-hidden min-h-[480px]">
        {/* Security badge */}
        <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1 bg-emerald-500/10 rounded-full border border-emerald-500/20">
          <ShieldCheck className="w-4 h-4 text-emerald-400 animate-pulse" />
          <span className="text-[10px] text-emerald-400 tracking-wider font-bold">SECURE CHANNEL</span>
        </div>

        {/* Video Feeds displayed inside left comms panel upon interception */}
        {showVideo ? (
          <div className="flex-1 grid grid-cols-2 gap-3 mb-6 mt-10">
            {/* Local Command camera feed */}
            <div className="bg-black border border-emerald-950 rounded p-1.5 flex flex-col relative">
              <div className="text-[9px] text-emerald-400 font-bold mb-1.5 flex items-center justify-between">
                <span>[COMMAND_CENTER_CAM]</span>
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

            {/* Remote visitor camera feed */}
            <div className="bg-black border border-emerald-950 rounded p-1.5 flex flex-col relative">
              <div className="text-[9px] text-emerald-400 font-bold mb-1.5 flex items-center justify-between">
                <span>[KALI_CAM_01] REMOTE</span>
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
          /* Status Call Glow */
          <div className="flex items-center justify-center w-24 h-24 bg-gradient-to-br from-emerald-950 to-zinc-900 rounded-full mx-auto mb-6 mt-10 border border-emerald-900/40 shadow-[0_0_30px_rgba(16,185,129,0.15)]">
            <PhoneCall className="w-10 h-10 text-zinc-600" />
          </div>
        )}

        <h1 className="text-xl font-bold text-center mb-1 tracking-tight text-white">&gt;_ COMMS_CENTER</h1>
        <p className="text-center text-xs text-zinc-500 mb-6">{status}</p>

        {/* Active connection button state control */}
        <div className="flex-grow flex flex-col justify-end">
          {!connected && !isWaiting && (
            <div className="flex flex-col gap-3 w-full">
              <Button
                onClick={joinCall}
                disabled={callStatus === 'connecting'}
                className="bg-emerald-950 hover:bg-emerald-900 text-emerald-400 border border-emerald-800 rounded py-5 text-sm font-bold shadow-[0_0_20px_rgba(16,185,129,0.1)] transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {callStatus === 'connecting' ? (
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                ) : (
                  <PhoneCall className="w-5 h-5 mr-2" />
                )}
                [ INTERCEPT INCOMING CALL ]
              </Button>

              <Button
                onClick={() => router.push('/admin')}
                className="bg-red-950/60 hover:bg-red-900/60 text-red-400 border border-red-900 rounded py-3 text-xs font-bold"
              >
                [ SEVER SECURE LINK ]
              </Button>
            </div>
          )}

          {!connected && isWaiting && (
            <div className="flex flex-col items-center gap-3 mb-6">
              <div className="w-8 h-8 border-2 border-emerald-950 border-t-emerald-400 rounded-full animate-spin" />
              <span className="text-xs text-zinc-500 font-medium">Waiting for visitor connection...</span>
            </div>
          )}

          {connected && (
            <div className="text-center space-y-6">
              <div className="bg-zinc-900/60 p-4 rounded border border-emerald-950 flex items-center justify-between shadow-inner">
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-emerald-400" />
                  <span className="text-zinc-300 font-bold text-xs">AUDIO/VIDEO ENCRYPTED</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                  <span className="text-[10px] font-bold text-emerald-400">ACTIVE</span>
                </div>
              </div>

              <div className="flex justify-center gap-6 pt-2">
                <Button
                  onClick={handleToggleMic}
                  className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 ${
                    micMuted
                      ? 'bg-amber-600 hover:bg-amber-700 text-white shadow-[0_0_20px_rgba(245,158,11,0.2)]'
                      : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800'
                  }`}
                >
                  {micMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                </Button>

                <Button
                  onClick={handleEndCall}
                  className="w-14 h-14 rounded-full bg-red-950 hover:bg-red-900 border border-red-800 flex items-center justify-center text-red-400 shadow-[0_0_20px_rgba(239,68,68,0.2)] transition-all duration-300"
                >
                  <PhoneOff className="w-5 h-5" />
                </Button>
              </div>
            </div>
          )}

          {callStatus === 'error' && (
            <div className="text-center mb-6">
              <p className="text-red-500 text-xs">
                LINK_FAILURE: Verify device media access and secure routing parameters.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* RIGHT COMPONENT: BRUTALIST RADAR UI (MINI-MAP) */}
      <div className="w-full max-w-md bg-black border-2 border-emerald-950 rounded-lg p-6 flex flex-col gap-4 shadow-[0_0_30px_rgba(16,185,129,0.05)] relative overflow-hidden min-h-[480px]">
        {/* Radar Scanning Line Animation overlay */}
        <div className="absolute inset-0 pointer-events-none bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSJ0cmFuc3BhcmVudCIvPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSIxIiBmaWxsPSJyZ2JhKDE2LCAxODUsIDEyOSwgMC4wNCkiLz4KPC9zdmc+')] z-10" />

        <div className="flex items-center justify-between border-b border-emerald-900/60 pb-3 relative z-20">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <h2 className="text-sm font-bold text-emerald-400 tracking-wider">LIVE_RADAR_MAP</h2>
          </div>
          <span className="text-[10px] bg-emerald-950/60 border border-emerald-800/40 text-emerald-400 px-2 py-0.5 rounded uppercase font-bold animate-pulse">
            TRACKING ACTIVE
          </span>
        </div>

        {/* Live Coordinates tracking block */}
        <div className="bg-zinc-950 border border-emerald-900/40 p-4 rounded flex flex-col gap-1 text-xs relative z-20">
          <div className="text-zinc-500 font-bold">&gt; TARGET_COORDINATES:</div>
          <div className="flex items-center gap-4 text-emerald-400 font-bold text-sm">
            <span>X: {visitorX}px</span>
            <span>Y: {visitorY}px</span>
          </div>
        </div>

        {/* Live target status report terminal */}
        <div className="flex-1 bg-zinc-950 border border-emerald-900/40 p-4 rounded flex flex-col gap-3 min-h-[220px] relative z-20">
          <div className="text-emerald-400 font-bold text-xs border-b border-emerald-950 pb-2 flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Terminal className="w-4 h-4" />
              <span>TARGET_STATUS_REPORT</span>
            </span>
            <span className="text-zinc-600 text-[10px]">PING: ~45ms</span>
          </div>
          
          <div className="flex-1 text-xs overflow-y-auto space-y-2 font-mono scrollbar-thin max-h-[170px]">
            <div className="text-zinc-500">&gt; Establishing relay stream... [OK]</div>
            <div className="text-zinc-500">&gt; Intercepting OS window configurations...</div>
            
            {visitorWindows.length === 0 ? (
              <div className="text-zinc-500 italic py-2">&gt; No active windows currently open. Target is idle on desktop.</div>
            ) : (
              <div className="space-y-2 pt-1">
                <div className="text-emerald-400 font-bold">&gt; Active Visitor Windows detected:</div>
                {visitorWindows.map((win, idx) => (
                  <div key={win.id || idx} className="pl-3 border-l border-emerald-900/40 py-0.5 flex flex-col gap-0.5">
                    <div className="text-zinc-300 font-bold">
                      [{idx + 1}] App: <span className="text-emerald-400">{win.title || win.appId || 'Unknown'}</span>
                    </div>
                    <div className="text-zinc-500 text-[10px]">
                      Coords: ({win.x}, {win.y}) | Size: {win.width}x{win.height}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Technical metadata footer */}
        <div className="text-[9px] text-zinc-600 flex justify-between relative z-20">
          <span>PORT: 8771</span>
          <span>ROUTING: WEBOS-E2E</span>
        </div>
      </div>

      <audio ref={audioRef} autoPlay />
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#080808]" />}>
      <AdminComms />
    </Suspense>
  );
}
