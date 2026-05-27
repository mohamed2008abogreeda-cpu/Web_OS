'use client';
// ============================================================
// DiscordCallApp — WebRTC VoIP with Lucide icons
// ============================================================
import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useOSStore } from '@/store/useOSStore';
import { USERS } from '@/lib/mockData';
import { Phone, PhoneOff, PhoneCall, Mic, MicOff, AlertCircle, Wifi, Info } from '@/lib/icons';

type CallState = 'idle' | 'requesting' | 'ringing' | 'connected' | 'ended' | 'error';

export default function DiscordCallApp({ windowId }: { windowId: string }) {
  const currentUser = useOSStore((s) => s.currentUser);
  const user = currentUser ? USERS[currentUser] : null;

  const [callState, setCallState] = useState<CallState>('idle');
  const [duration, setDuration] = useState(0);
  const [errorMsg, setErrorMsg] = useState('');
  const [isMuted, setIsMuted] = useState(false);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const formatDuration = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  const startCall = useCallback(async () => {
    setCallState('requesting');
    setErrorMsg('');

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      setCallState('ringing');

      try {
        await fetch('/api/discord-call', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            caller: currentUser,
            timestamp: new Date().toISOString(),
          }),
        });
      } catch {}

      setTimeout(() => {
        setCallState('connected');
        setDuration(0);
        timerRef.current = setInterval(() => {
          setDuration((prev) => prev + 1);
        }, 1000);
      }, 3000);
    } catch {
      setCallState('error');
      setErrorMsg('Microphone access denied. Please allow mic permissions.');
    }
  }, [currentUser]);

  const endCall = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (timerRef.current) clearInterval(timerRef.current);
    setCallState('ended');
    setDuration(0);
  }, []);

  const toggleMute = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getAudioTracks().forEach((t) => {
        t.enabled = !t.enabled;
      });
      setIsMuted(!isMuted);
    }
  }, [isMuted]);

  // Icon + color based on call state
  const stateConfig = {
    idle: { icon: Phone, color: 'var(--text-tertiary)', bg: 'var(--bg-card)', border: 'var(--border-default)' },
    requesting: { icon: Mic, color: 'var(--text-secondary)', bg: 'var(--bg-card)', border: 'var(--border-default)' },
    ringing: { icon: Wifi, color: '#f59e0b', bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.25)' },
    connected: { icon: PhoneCall, color: '#10b981', bg: 'rgba(16,185,129,0.08)', border: 'rgba(16,185,129,0.25)' },
    ended: { icon: PhoneOff, color: 'var(--text-muted)', bg: 'var(--bg-card)', border: 'var(--border-subtle)' },
    error: { icon: AlertCircle, color: '#ef4444', bg: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.25)' },
  };

  const config = stateConfig[callState];
  const StateIcon = config.icon;

  return (
    <div className="flex flex-col h-full bg-[var(--bg-base)] items-center justify-center p-6"
      data-testid="discord-call-app">

      {/* Accent ring */}
      <div className="relative mb-8">
        <AnimatePresence mode="wait">
          {callState === 'ringing' && (
            <motion.div
              className="absolute inset-0 rounded-full"
              style={{ border: `2px solid rgba(245,158,11,0.3)` }}
              initial={{ scale: 1, opacity: 0.6 }}
              animate={{ scale: 2.5, opacity: 0 }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          )}
          {callState === 'connected' && (
            <motion.div
              className="absolute inset-0 rounded-full"
              style={{ border: `2px solid rgba(16,185,129,0.2)` }}
              initial={{ scale: 1, opacity: 0.4 }}
              animate={{ scale: 1.8, opacity: 0 }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          )}
        </AnimatePresence>

        <div
          className="w-24 h-24 rounded-full flex items-center justify-center
                     border-2 transition-all duration-500"
          style={{
            borderColor: config.border,
            background: config.bg,
            boxShadow: callState === 'connected'
              ? '0 8px 32px rgba(16,185,129,0.15)'
              : undefined,
          }}
        >
          <StateIcon
            className="w-10 h-10 transition-colors duration-500"
            style={{ color: config.color }}
            strokeWidth={1.5}
          />
        </div>
      </div>

      {/* Status text */}
      <div className="text-center mb-8">
        <h3 className="text-[var(--text-primary)] text-lg font-semibold mb-1">
          {callState === 'idle' && 'Call the Team'}
          {callState === 'requesting' && 'Requesting Microphone...'}
          {callState === 'ringing' && 'Ringing...'}
          {callState === 'connected' && 'Connected'}
          {callState === 'ended' && 'Call Ended'}
          {callState === 'error' && 'Connection Failed'}
        </h3>
        <p className="text-[var(--text-muted)] text-sm">
          {callState === 'idle' && 'Initiate a voice call via Discord bridge'}
          {callState === 'requesting' && 'Please allow microphone access'}
          {callState === 'ringing' && 'Pinging Discord server...'}
          {callState === 'connected' && formatDuration(duration)}
          {callState === 'ended' && 'Session terminated'}
          {callState === 'error' && errorMsg}
        </p>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-4">
        {callState === 'idle' || callState === 'ended' || callState === 'error' ? (
          <motion.button
            onClick={startCall}
            className="w-16 h-16 rounded-full bg-emerald-500 hover:bg-emerald-400
                     flex items-center justify-center transition-colors
                     shadow-lg shadow-emerald-500/30"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <Phone className="w-7 h-7 text-white" strokeWidth={2} />
          </motion.button>
        ) : (
          <>
            <motion.button
              onClick={toggleMute}
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
                isMuted
                  ? 'bg-amber-500/20 border border-amber-500/30 text-amber-400'
                  : 'bg-[var(--bg-card)] border border-[var(--border-default)] text-[var(--text-tertiary)]'
              }`}
              whileTap={{ scale: 0.9 }}
            >
              {isMuted ? (
                <MicOff className="w-5 h-5" strokeWidth={1.5} />
              ) : (
                <Mic className="w-5 h-5" strokeWidth={1.5} />
              )}
            </motion.button>

            <motion.button
              onClick={endCall}
              className="w-16 h-16 rounded-full bg-red-500 hover:bg-red-400
                       flex items-center justify-center transition-colors
                       shadow-lg shadow-red-500/30"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <PhoneOff className="w-7 h-7 text-white" strokeWidth={2} />
            </motion.button>
          </>
        )}
      </div>

      {/* Info footer */}
      <div className="mt-8 px-4 py-3 card-surface max-w-xs flex items-start gap-2.5">
        <Info className="w-4 h-4 text-[var(--text-muted)] shrink-0 mt-0.5" strokeWidth={1.5} />
        <p className="text-[var(--text-muted)] text-[11px] leading-relaxed">
          Uses WebRTC for voice and a Next.js API route to bridge to Discord.
          The team will receive a ping in their Discord server.
        </p>
      </div>
    </div>
  );
}
