'use client';

/**
 * AdminComms — Admin-side voice call page (opened from ntfy notification)
 *
 * URL: /admin/comms?roomId=<uuid>
 * Uses the same useWebRTCCall hook as the visitor side.
 * Theme: Pink/Purple to match the BootScreen aesthetic.
 */
import React, { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useWebRTCCall } from '@/hooks/useWebRTCCall';
import { Suspense } from 'react';
import { PhoneOff, Mic, MicOff, PhoneCall, Users, ShieldCheck, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

function AdminComms() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const roomId = searchParams.get('roomId');

  const [micMuted, setMicMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const {
    status,
    callStatus,
    connected,
    isReady,
    isWaiting,
    remoteStream,
    joinCall,
    endCall,
    toggleMic,
  } = useWebRTCCall(roomId || '', true);

  // Play remote audio
  useEffect(() => {
    if (remoteStream && audioRef.current) {
      audioRef.current.srcObject = remoteStream;
      audioRef.current.play().catch(() => {});
    }
  }, [remoteStream]);

  // ─── No roomId → error ──────────────────────────────────
  if (!roomId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#fdf2f8] text-slate-700">
        <p className="text-red-500 font-bold text-lg">Invalid Call Link</p>
        <p className="text-slate-400 text-sm mt-2">No roomId found in URL.</p>
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

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#fdf2f8] text-slate-700 p-6 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-300/30 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-md w-full bg-white/80 backdrop-blur-xl border border-pink-200 rounded-3xl p-8 shadow-[0_20px_60px_-15px_rgba(236,72,153,0.15)] z-10 relative">
        {/* Security badge */}
        <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1 bg-purple-500/10 rounded-full border border-purple-500/20">
          <ShieldCheck className="w-4 h-4 text-purple-600" />
          <span className="text-[10px] text-purple-700 font-mono tracking-wider font-bold">SECURE E2E</span>
        </div>

        {/* Phone icon */}
        <div className="flex items-center justify-center w-24 h-24 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full mx-auto mb-6 mt-4 border border-pink-200 shadow-[0_0_30px_rgba(236,72,153,0.1)]">
          <PhoneCall className={`w-10 h-10 transition-colors duration-300 ${connected ? 'text-purple-600' : 'text-slate-400'}`} />
        </div>

        <h1 className="text-2xl font-bold text-center mb-1 tracking-tight text-slate-800">Admin Console</h1>
        <p className="text-center text-sm text-slate-500 font-mono mb-8 font-medium">{status}</p>

        {/* ─── Action Area ─────────────────────────────── */}

        {/* State: IDLE / CONNECTING / READY → Show join button */}
        {!connected && !isWaiting && (
          <div className="flex justify-center mb-6">
            <Button
              onClick={joinCall}
              disabled={callStatus === 'connecting'}
              className="bg-purple-600 text-white rounded-full px-8 py-6 text-lg font-bold shadow-[0_0_20px_rgba(147,51,234,0.3)] transition-all hover:bg-purple-700 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {callStatus === 'connecting' ? (
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              ) : (
                <PhoneCall className="w-5 h-5 mr-2" />
              )}
              {callStatus === 'connecting' ? 'Connecting...' : 'Join Secure Call'}
            </Button>
          </div>
        )}

        {/* State: RINGING → Show spinner */}
        {!connected && isWaiting && (
          <div className="flex flex-col items-center gap-3 mb-6">
            <div className="w-10 h-10 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin" />
            <span className="text-xs text-slate-400 font-medium">Waiting for visitor...</span>
          </div>
        )}

        {/* State: ACTIVE → Show call controls */}
        {connected && (
          <div className="text-center space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-slate-50 p-5 rounded-2xl border border-pink-100 flex items-center justify-between shadow-inner">
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-purple-600" />
                <span className="text-slate-700 font-bold">Session Active</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-pink-500 animate-pulse" />
                <span className="text-sm font-mono font-bold text-pink-600">LIVE</span>
              </div>
            </div>

            <div className="flex justify-center gap-6 pt-2">
              <Button
                onClick={handleToggleMic}
                className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 ${
                  micMuted
                    ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-[0_0_20px_rgba(245,158,11,0.3)]'
                    : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 shadow-md'
                }`}
              >
                {micMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
              </Button>

              <Button
                onClick={handleEndCall}
                className="w-16 h-16 rounded-full bg-pink-500 hover:bg-pink-600 flex items-center justify-center text-white shadow-[0_0_20px_rgba(236,72,153,0.4)] transition-all duration-300"
              >
                <PhoneOff className="w-6 h-6" />
              </Button>
            </div>
          </div>
        )}

        {/* State: ERROR → Show error message */}
        {callStatus === 'error' && (
          <div className="text-center mb-6">
            <p className="text-red-500 text-sm font-medium">
              Failed to connect. Make sure you&apos;re using HTTPS and allow microphone access.
            </p>
          </div>
        )}
      </div>

      <audio ref={audioRef} autoPlay />
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#fdf2f8]" />}>
      <AdminComms />
    </Suspense>
  );
}
