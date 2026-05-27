'use client';
// ============================================================
// DiscordCallApp — WebRTC VoIP interface (Comms)
// ============================================================
import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useOSStore } from '@/store/useOSStore';
import { USERS } from '@/lib/mockData';

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

  // Cleanup on unmount
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
      // Request mic permissions
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      setCallState('ringing');

      // Simulate Discord bridge API call
      try {
        await fetch('/api/discord-call', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            caller: currentUser,
            timestamp: new Date().toISOString(),
          }),
        });
      } catch {
        // API might not exist yet in dev — continue with mock
      }

      // Simulate ringing → connected
      setTimeout(() => {
        setCallState('connected');
        setDuration(0);
        timerRef.current = setInterval(() => {
          setDuration((prev) => prev + 1);
        }, 1000);
      }, 3000);
    } catch (err) {
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

  return (
    <div className="flex flex-col h-full bg-gray-950/50 items-center justify-center p-6"
      data-testid="discord-call-app">

      {/* Accent ring */}
      <div className="relative mb-8">
        <AnimatePresence mode="wait">
          {callState === 'ringing' && (
            <motion.div
              className="absolute inset-0 rounded-full"
              style={{ border: `2px solid ${user?.accentColor}40` }}
              initial={{ scale: 1, opacity: 0.6 }}
              animate={{ scale: 2.5, opacity: 0 }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          )}
        </AnimatePresence>

        <div
          className={`w-24 h-24 rounded-full flex items-center justify-center text-4xl
                     border-2 transition-all duration-500 ${
                       callState === 'connected'
                         ? 'border-emerald-500/40 bg-emerald-500/10 shadow-lg shadow-emerald-500/20'
                         : callState === 'ringing'
                         ? 'border-amber-500/40 bg-amber-500/10 animate-pulse'
                         : callState === 'error'
                         ? 'border-red-500/40 bg-red-500/10'
                         : 'border-white/[0.1] bg-white/[0.03]'
                     }`}
        >
          {callState === 'error' ? '❌' :
           callState === 'connected' ? '🎙️' :
           callState === 'ringing' ? '📡' : '📞'}
        </div>
      </div>

      {/* Status text */}
      <div className="text-center mb-8">
        <h3 className="text-white text-lg font-semibold mb-1">
          {callState === 'idle' && 'Call the Team'}
          {callState === 'requesting' && 'Requesting Microphone...'}
          {callState === 'ringing' && 'Ringing...'}
          {callState === 'connected' && 'Connected'}
          {callState === 'ended' && 'Call Ended'}
          {callState === 'error' && 'Connection Failed'}
        </h3>
        <p className="text-gray-500 text-sm">
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
            <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" />
            </svg>
          </motion.button>
        ) : (
          <>
            {/* Mute button */}
            <motion.button
              onClick={toggleMute}
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
                isMuted
                  ? 'bg-amber-500/20 border border-amber-500/30 text-amber-400'
                  : 'bg-white/[0.06] border border-white/[0.1] text-gray-400'
              }`}
              whileTap={{ scale: 0.9 }}
            >
              {isMuted ? (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 11h-1.7c0 .74-.16 1.43-.43 2.05l1.23 1.23c.56-.98.9-2.09.9-3.28zm-4.02.17c0-.06.02-.11.02-.17V5c0-1.66-1.34-3-3-3S9 3.34 9 5v.18l5.98 5.99zM4.27 3L3 4.27l6.01 6.01V11c0 1.66 1.33 3 2.99 3 .22 0 .44-.03.65-.08l1.66 1.66c-.71.33-1.5.52-2.31.52-2.76 0-5.3-2.1-5.3-5.1H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c.91-.13 1.77-.45 2.54-.9L19.73 21 21 19.73 4.27 3z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 14c1.66 0 2.99-1.34 2.99-3L15 5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z" />
                </svg>
              )}
            </motion.button>

            {/* End call */}
            <motion.button
              onClick={endCall}
              className="w-16 h-16 rounded-full bg-red-500 hover:bg-red-400
                       flex items-center justify-center transition-colors
                       shadow-lg shadow-red-500/30"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <svg className="w-7 h-7 text-white rotate-[135deg]" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" />
              </svg>
            </motion.button>
          </>
        )}
      </div>

      {/* Info footer */}
      <div className="mt-8 px-4 py-2.5 rounded-xl bg-white/[0.02] border border-white/[0.06] max-w-xs">
        <p className="text-gray-500 text-[10px] text-center leading-relaxed">
          Uses WebRTC for voice and a Next.js API route to bridge to Discord.
          The team will receive a ping in their Discord server.
        </p>
      </div>
    </div>
  );
}
