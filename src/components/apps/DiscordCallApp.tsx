'use client';
// ============================================================
// DiscordCallApp — Premium VoIP Hub & Spectator Magic Link
// ============================================================
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { PhoneOff, Mic, MicOff, PhoneCall, Volume2, ShieldCheck, User, Loader2, Link as LinkIcon, Headphones } from 'lucide-react';
import { useWebRTCCall } from '@/hooks/useWebRTCCall';
import { useOSStore } from '@/store/useOSStore';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

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
  const [deafened, setDeafened] = useState(false);
  const [notified, setNotified] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const { sessionId } = useOSStore();

  const {
    status,
    callStatus,
    connected,
    isWaiting,
    remoteStream,
    joinCall,
    endCall,
    toggleMic,
  } = useWebRTCCall(roomId, false);

  useEffect(() => {
    if (remoteStream && audioRef.current) {
      audioRef.current.srcObject = remoteStream;
      audioRef.current.play().catch(() => {});
    }
  }, [remoteStream]);

  const handleJoinCall = async () => {
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
    joinCall();
  };

  const handleToggleMic = () => {
    const enabled = toggleMic();
    setMicMuted(!enabled);
  };

  const handleGenerateMagicLink = () => {
    const link = `${window.location.origin}/?spectate=${sessionId}`;
    navigator.clipboard.writeText(link);
    toast.success('Magic Link Copied!', {
      description: 'Send this link to the admin for zero-click spectator access.',
    });
  };

  const dotColor = connected
    ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)]'
    : isWaiting
      ? 'bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.8)]'
      : callStatus === 'error'
        ? 'bg-red-500'
        : 'bg-amber-500';

  return (
    <div className="flex flex-col h-full bg-zinc-950/80 backdrop-blur-3xl text-white select-none">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-black/40 shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
            <Volume2 className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h3 className="font-extrabold text-lg leading-none tracking-tight">Secure Comms</h3>
            <span className="text-[11px] font-bold text-emerald-400 mt-1.5 flex items-center gap-1.5 uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5" /> End-to-End Encrypted (WebRTC)
            </span>
          </div>
        </div>

        <button
          onClick={handleGenerateMagicLink}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-all border border-emerald-500/20 text-xs font-bold shadow-lg cursor-pointer"
        >
          <LinkIcon className="w-4 h-4" /> Copy Spectate Link
        </button>
      </div>

      {/* Main VoIP Interface */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 relative overflow-hidden">
        {/* Animated Background Glow */}
        <motion.div
          animate={{ scale: connected ? [1, 1.2, 1] : 1, opacity: connected ? [0.1, 0.2, 0.1] : 0.05 }}
          transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500 rounded-full blur-[100px] pointer-events-none"
        />

        <div className="flex flex-col items-center gap-8 relative z-10 w-full max-w-sm">
          {/* Status Badge */}
          <div className="inline-flex items-center gap-3 px-4 py-2 bg-black/50 rounded-full border border-white/10 backdrop-blur-md">
            <span className={`w-2.5 h-2.5 rounded-full ${dotColor} animate-pulse`} />
            <span className="text-sm font-bold text-zinc-300 uppercase tracking-widest">{status}</span>
          </div>

          {/* Glowing Avatar */}
          <motion.div
            animate={connected ? { scale: [1, 1.05, 1], boxShadow: "0px 0px 30px rgba(16, 185, 129, 0.4)" } : {}}
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            className="relative mt-4 rounded-full"
          >
            <div className={`w-32 h-32 rounded-full bg-zinc-900 flex items-center justify-center shadow-2xl transition-all duration-500 border-4 ${connected ? 'border-emerald-500' : 'border-white/10'}`}>
              <User className={`w-12 h-12 ${connected ? 'text-emerald-400' : 'text-zinc-500'}`} />
            </div>
            <div className="absolute -bottom-2 right-0 bg-zinc-800 px-3 py-1 rounded-lg text-xs font-bold border border-white/10 shadow-lg text-emerald-400">
              Team
            </div>
          </motion.div>

          {/* Action Area */}
          <div className="mt-8 w-full flex flex-col items-center justify-center min-h-[100px] gap-6">
            {!connected && !isWaiting && (
              <button
                onClick={handleJoinCall}
                disabled={callStatus === 'connecting'}
                className="w-full sm:w-auto px-10 py-4 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-black rounded-full font-extrabold text-lg flex items-center justify-center gap-3 transition-all shadow-[0_0_25px_rgba(16,185,129,0.4)] hover:shadow-[0_0_35px_rgba(16,185,129,0.6)] transform hover:scale-105 cursor-pointer"
              >
                {callStatus === 'connecting' ? <Loader2 className="w-6 h-6 animate-spin" /> : <PhoneCall className="w-6 h-6" />}
                {callStatus === 'connecting' ? 'Connecting...' : 'Start Connection'}
              </button>
            )}

            {!connected && isWaiting && (
              <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-white/10 border-t-emerald-500 rounded-full animate-spin" />
                <span className="text-sm text-zinc-400 font-bold uppercase tracking-widest">Awaiting Team...</span>
              </div>
            )}

            {connected && (
              <div className="flex items-center justify-center gap-6 p-6 bg-black/40 rounded-3xl w-full border border-white/10 shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-bottom-4 duration-500">
                
                {/* Mute Button */}
                <button
                  onClick={handleToggleMic}
                  className={`flex flex-col items-center justify-center w-16 h-16 rounded-full transition-all duration-300 cursor-pointer hover:scale-105 ${
                    micMuted
                      ? 'bg-zinc-800 text-rose-400 border-2 border-rose-500/50 shadow-[0_0_20px_rgba(244,63,94,0.2)]'
                      : 'bg-zinc-800 text-emerald-400 hover:bg-zinc-700 border-2 border-transparent'
                  }`}
                >
                  {micMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
                </button>

                {/* Deafen Button */}
                <button
                  onClick={() => setDeafened(!deafened)}
                  className={`flex flex-col items-center justify-center w-16 h-16 rounded-full transition-all duration-300 cursor-pointer hover:scale-105 ${
                    deafened
                      ? 'bg-zinc-800 text-rose-400 border-2 border-rose-500/50 shadow-[0_0_20px_rgba(244,63,94,0.2)]'
                      : 'bg-zinc-800 text-emerald-400 hover:bg-zinc-700 border-2 border-transparent'
                  }`}
                >
                  {deafened ? <Volume2 className="w-6 h-6 line-through opacity-50" /> : <Headphones className="w-6 h-6" />}
                </button>

                {/* End Call Button */}
                <button
                  onClick={endCall}
                  className="flex flex-col items-center justify-center w-20 h-20 rounded-full bg-rose-500 text-white hover:bg-rose-400 cursor-pointer transition-all duration-300 hover:scale-105 shadow-[0_0_30px_rgba(244,63,94,0.5)] hover:shadow-[0_0_40px_rgba(244,63,94,0.7)]"
                >
                  <PhoneOff className="w-8 h-8" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <audio ref={audioRef} autoPlay muted={deafened} />
    </div>
  );
}
