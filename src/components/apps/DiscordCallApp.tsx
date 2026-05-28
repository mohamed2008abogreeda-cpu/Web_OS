/**
 * DiscordCallApp — Visitor-side voice call (embedded in the WebOS window)
 *
 * This component receives a `windowId` prop from the WindowManager.
 * It generates a stable roomId, calls the /api/call/create-room endpoint
 * to notify the admin via ntfy, then uses useWebRTCCall to manage the call.
 */
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { PhoneOff, Mic, MicOff, PhoneCall, Volume2, ShieldCheck, User, Loader2, Eye } from 'lucide-react';
import { useWebRTCCall } from '@/hooks/useWebRTCCall';
import { useOSStore } from '@/store/useOSStore';
import { toast } from 'sonner';

// Generate a stable room ID per session
function makeRoomId(): string {
  if (typeof window !== 'undefined') {
    const stored = sessionStorage.getItem('webos-call-room');
    if (stored) return stored;
    const id = crypto.randomUUID();
    sessionStorage.setItem('webos-call-room', id);
    return id;
  }
  return crypto.randomUUID();
}

export default function DiscordCallApp({ windowId }: { windowId: string }) {
  const roomId = useMemo(() => makeRoomId(), []);
  const [micMuted, setMicMuted] = useState(false);
  const [notified, setNotified] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const { isSpectating, setSpectating } = useOSStore();

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
  } = useWebRTCCall(roomId, false);

  // Play remote audio
  useEffect(() => {
    if (remoteStream && audioRef.current) {
      audioRef.current.srcObject = remoteStream;
      audioRef.current.play().catch(() => {});
    }
  }, [remoteStream]);

  // Notify admin when visitor joins the call
  const handleJoinCall = async () => {
    // First, notify admin (send push notification)
    if (!notified) {
      try {
        await fetch('/api/call/create-room', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ visitorName: 'Visitor', roomId }),
        });
        setNotified(true);
      } catch (err) {
        console.warn('Failed to notify admin:', err);
      }
    }
    // Then join the WebRTC call
    joinCall();
  };

  const handleToggleMic = () => {
    const enabled = toggleMic();
    setMicMuted(!enabled);
  };

  const handleWatchSession = () => {
    setSpectating(true);
    toast.success('Spectator Mode Active', {
      description: 'You are now watching the live session.',
    });
  };

  // ─── Status indicator color ────────────────────────────
  const dotColor = connected
    ? 'bg-emerald-500 animate-pulse'
    : isWaiting
      ? 'bg-purple-500 animate-pulse'
      : callStatus === 'error'
        ? 'bg-red-500'
        : 'bg-amber-500';

  const avatarBorder = connected
    ? 'border-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.2)]'
    : isWaiting
      ? 'border-purple-500/50 shadow-[0_0_20px_rgba(168,85,247,0.2)]'
      : 'border-white/10';

  return (
    <div className="flex flex-col h-full bg-[#1e1f22] text-white">
      {/* ─── Header ──────────────────────────────────────── */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#2b2d31] border-b border-[#1e1f22] shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#5865F2]/20 flex items-center justify-center">
            <Volume2 className="w-4 h-4 text-[#5865F2]" />
          </div>
          <div>
            <h3 className="font-semibold text-[15px] leading-none text-gray-100">Voice Channel</h3>
            <span className="text-[11px] font-medium text-emerald-400 mt-1 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" /> End-to-End Encrypted
            </span>
          </div>
        </div>

        {/* Watch Live Button in Header */}
        {!isSpectating && (
          <button
            onClick={handleWatchSession}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 hover:text-indigo-300 transition-colors border border-indigo-500/20 text-xs font-semibold"
          >
            <Eye className="w-3.5 h-3.5" /> Watch Screen
          </button>
        )}
        {isSpectating && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold">
            <Eye className="w-3.5 h-3.5 animate-pulse" /> Spectating...
          </div>
        )}
      </div>

      {/* ─── Main ────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 relative overflow-hidden bg-gradient-to-b from-[#1e1f22] to-[#111214]">
        {/* Background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-[#5865F2]/10 rounded-full blur-[80px] pointer-events-none" />

        <div className="flex flex-col items-center gap-6 relative z-10 w-full max-w-sm">
          {/* Status pill */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#2b2d31] rounded-full border border-white/5">
            <span className={`w-2 h-2 rounded-full ${dotColor}`} />
            <span className="text-xs font-medium text-gray-300">{status}</span>
          </div>

          {/* Avatar */}
          <div className="relative mt-2">
            <div className={`w-24 h-24 rounded-full bg-[#2b2d31] border-4 flex items-center justify-center transition-all duration-300 ${avatarBorder}`}>
              <User className="w-10 h-10 text-gray-400" />
            </div>
            <div className="absolute -bottom-2 -right-2 bg-[#232428] px-2 py-1 rounded-md text-[10px] font-bold text-gray-300 border border-white/5">
              Admin
            </div>
          </div>

          {/* ─── Action Area ─────────────────────────────── */}
          <div className="mt-6 w-full flex flex-col justify-center min-h-[80px] items-center gap-3">
            {/* State: IDLE / CONNECTING / READY → Show join button */}
            {!connected && !isWaiting && (
              <button
                onClick={handleJoinCall}
                disabled={callStatus === 'connecting'}
                className="w-full sm:w-auto px-8 py-3.5 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-full font-bold flex items-center justify-center gap-3 transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:shadow-[0_0_25px_rgba(16,185,129,0.5)] transform hover:-translate-y-0.5"
              >
                {callStatus === 'connecting' ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <PhoneCall className="w-5 h-5" />
                )}
                {callStatus === 'connecting' ? 'Connecting...' : 'Join Voice Channel'}
              </button>
            )}

            {/* State: RINGING → Show spinner */}
            {!connected && isWaiting && (
              <div className="flex flex-col items-center gap-3">
                <div className="w-10 h-10 border-4 border-white/10 border-t-[#5865F2] rounded-full animate-spin" />
                <span className="text-xs text-gray-400 font-medium">Waiting for the other party...</span>
              </div>
            )}

            {/* State: ACTIVE → Show call controls */}
            {connected && (
              <div className="flex items-center justify-center gap-4 p-4 bg-[#2b2d31] rounded-2xl w-full border border-white/5 shadow-xl animate-in fade-in slide-in-from-bottom-4 duration-500">
                <button
                  onClick={handleToggleMic}
                  className={`flex flex-col items-center justify-center w-16 h-16 rounded-xl transition-all duration-200 ${
                    micMuted
                      ? 'bg-amber-500/10 text-amber-500 hover:bg-amber-500/20'
                      : 'bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <div className={`p-2 rounded-full ${micMuted ? 'bg-amber-500/20' : ''}`}>
                    {micMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
                  </div>
                  <span className="text-[10px] font-medium mt-1">{micMuted ? 'Unmute' : 'Mute'}</span>
                </button>

                <div className="w-px h-10 bg-white/10" />

                <button
                  onClick={endCall}
                  className="flex flex-col items-center justify-center w-16 h-16 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all duration-200 group"
                >
                  <div className="p-2 rounded-full bg-red-500/20 group-hover:bg-white/20 transition-colors">
                    <PhoneOff className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-medium mt-1">Disconnect</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <audio ref={audioRef} autoPlay />
    </div>
  );
}
