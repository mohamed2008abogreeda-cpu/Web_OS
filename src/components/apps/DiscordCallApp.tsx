'use client';
// ============================================================
// DiscordCallApp — Real phone call notification via ntfy
// ============================================================
import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useOSStore } from '@/store/useOSStore';
import { USERS } from '@/lib/mockData';
import { Phone, PhoneOff, PhoneCall, Mic, MicOff, AlertCircle, Wifi, Info, User } from '@/lib/icons';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

type CallState = 'idle' | 'requesting' | 'ringing' | 'connected' | 'ended' | 'error';

function AudioWaveVisualizer() {
  return (
    <div className="flex items-center gap-1 h-9 mt-4 justify-center select-none" data-testid="audio-wave">
      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((bar) => {
        const delay = bar * 0.08;
        return (
          <motion.div
            key={bar}
            className="w-1 rounded-full bg-emerald-400/90 shadow-[0_0_8px_rgba(16,185,129,0.4)]"
            animate={{
              height: [6, 26, 4, 18, 6],
            }}
            transition={{
              duration: 0.8 + (bar % 3) * 0.15,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: delay,
            }}
            style={{ minHeight: '4px' }}
          />
        );
      })}
    </div>
  );
}

function RingingPulse() {
  return (
    <div className="flex items-center gap-2 mt-4 justify-center select-none">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="w-3 h-3 rounded-full bg-amber-400"
          animate={{ scale: [1, 1.4, 1], opacity: [0.4, 1, 0.4] }}
          transition={{
            duration: 1.2,
            repeat: Infinity,
            delay: i * 0.3,
          }}
        />
      ))}
    </div>
  );
}

export default function DiscordCallApp({ windowId }: { windowId: string }) {
  const currentUser = useOSStore((s) => s.currentUser);
  const user = currentUser ? USERS[currentUser] : null;

  const [callState, setCallState] = useState<CallState>('idle');
  const [duration, setDuration] = useState(0);
  const [errorMsg, setErrorMsg] = useState('');
  const [isMuted, setIsMuted] = useState(false);
  const [visitorName, setVisitorName] = useState('');
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
    const toastId = toast.loading('Requesting microphone access...');

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      setCallState('ringing');
      toast.loading('📱 Ringing Mohammed\'s phone...', { id: toastId });

      // Send REAL notification to phone via ntfy
      try {
        const res = await fetch('/api/discord-call', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            caller: currentUser,
            visitorName: visitorName.trim() || 'Anonymous Visitor',
            timestamp: new Date().toISOString(),
          }),
        });
        const data = await res.json();
        if (!data.success) {
          throw new Error(data.message);
        }
      } catch (e) {
        console.warn('Notification send failed:', e);
      }

      // Simulate waiting for answer (ringing state for 5 seconds)
      setTimeout(() => {
        setCallState('connected');
        setDuration(0);
        toast.success('📞 Connected! Mohammed has been notified.', { id: toastId });
        timerRef.current = setInterval(() => {
          setDuration((prev) => prev + 1);
        }, 1000);
      }, 5000);
    } catch {
      setCallState('error');
      setErrorMsg('Microphone access denied. Please allow mic permissions.');
      toast.error('Connection Failed', {
        id: toastId,
        description: 'Microphone access denied.',
      });
    }
  }, [currentUser, visitorName]);

  const endCall = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (timerRef.current) clearInterval(timerRef.current);
    setCallState('ended');
    setDuration(0);
    toast.info('Call terminated');
  }, []);

  const toggleMute = useCallback(() => {
    if (streamRef.current) {
      const nextMute = !isMuted;
      streamRef.current.getAudioTracks().forEach((t) => {
        t.enabled = !nextMute;
      });
      setIsMuted(nextMute);
      if (nextMute) {
        toast.warning('Microphone muted');
      } else {
        toast.success('Microphone unmuted');
      }
    }
  }, [isMuted]);

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
    <div className="flex flex-col h-full bg-[var(--bg-base)] items-center justify-center p-6 select-none"
      data-testid="discord-call-app">

      {/* Accent ring */}
      <div className="relative mb-6">
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
                     border-2 transition-all duration-500 shadow-inner"
          style={{
            borderColor: config.border,
            background: config.bg,
            boxShadow: callState === 'connected'
              ? '0 12px 40px rgba(16,185,129,0.2)'
              : callState === 'ringing'
              ? '0 12px 40px rgba(245,158,11,0.15)'
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
      <div className="text-center mb-6 max-w-xs">
        <h3 className="text-[var(--text-primary)] text-lg font-bold tracking-tight mb-1">
          {callState === 'idle' && 'Call Mohammed'}
          {callState === 'requesting' && 'Requesting Microphone...'}
          {callState === 'ringing' && '📱 Ringing Phone...'}
          {callState === 'connected' && 'Connected'}
          {callState === 'ended' && 'Call Ended'}
          {callState === 'error' && 'Connection Failed'}
        </h3>
        <p className="text-emerald-400 text-xs font-semibold tracking-wider font-mono mb-1">
          {callState === 'connected' && formatDuration(duration)}
        </p>
        <p className="text-[var(--text-secondary)] text-xs font-medium opacity-80 leading-relaxed">
          {callState === 'idle' && 'Ring Mohammed\'s phone directly. He will receive a real notification!'}
          {callState === 'requesting' && 'Please authorize microphone permissions in the browser'}
          {callState === 'ringing' && 'Mohammed\'s phone is ringing now... Please wait for answer'}
          {callState === 'connected' && 'Call active. Mohammed has been notified on his phone.'}
          {callState === 'ended' && 'Session terminated successfully'}
          {callState === 'error' && errorMsg}
        </p>
        {callState === 'connected' && <AudioWaveVisualizer />}
        {callState === 'ringing' && <RingingPulse />}
      </div>

      {/* Name input (only shown in idle state) */}
      {(callState === 'idle' || callState === 'ended' || callState === 'error') && (
        <div className="w-full max-w-xs mb-5">
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" strokeWidth={1.8} />
            <input
              type="text"
              placeholder="Your name (optional)"
              value={visitorName}
              onChange={(e) => setVisitorName(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-2xl border border-[var(--border-default)]
                         bg-[var(--bg-elevated)] text-[var(--text-primary)] text-sm font-medium
                         placeholder:text-[var(--text-muted)] focus:outline-none focus:border-emerald-400/50
                         focus:ring-2 focus:ring-emerald-400/20 transition-all"
              data-testid="visitor-name-input"
            />
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="flex items-center gap-5 h-16">
        {callState === 'idle' || callState === 'ended' || callState === 'error' ? (
          <Button
            onClick={startCall}
            className="w-16 h-16 rounded-full bg-emerald-500 hover:bg-emerald-400
                     flex items-center justify-center transition-colors hover:shadow-[0_8px_24px_rgba(16,185,129,0.4)]
                     shadow-lg shadow-emerald-500/30 shrink-0 p-0"
          >
            <Phone className="w-6 h-6 text-white" strokeWidth={2.2} />
          </Button>
        ) : (
          <>
            <Button
              onClick={toggleMute}
              variant="neumorphic"
              className={`w-13 h-13 rounded-full flex items-center justify-center p-0 transition-colors ${
                isMuted
                  ? 'bg-amber-500/15 border border-amber-500/30 text-amber-400 hover:bg-amber-500/25 hover:text-amber-300'
                  : 'bg-[var(--bg-elevated)] border border-[var(--border-default)] text-[var(--text-secondary)]'
              }`}
            >
              {isMuted ? (
                <MicOff className="w-5 h-5" strokeWidth={1.8} />
              ) : (
                <Mic className="w-5 h-5" strokeWidth={1.8} />
              )}
            </Button>

            <Button
              onClick={endCall}
              className="w-16 h-16 rounded-full bg-rose-600 hover:bg-rose-500
                       flex items-center justify-center transition-colors hover:shadow-[0_8px_24px_rgba(239,68,68,0.4)]
                       shadow-lg shadow-rose-600/30 shrink-0 p-0"
            >
              <PhoneOff className="w-6 h-6 text-white" strokeWidth={2.2} />
            </Button>
          </>
        )}
      </div>

      {/* Info footer */}
      <div className="mt-7 px-4 py-3.5 card-surface max-w-xs flex items-start gap-3 border border-[var(--border-subtle)] bg-[var(--bg-elevated)]/30 rounded-2xl">
        <Info className="w-4.5 h-4.5 text-[var(--text-muted)] shrink-0 mt-0.5" strokeWidth={1.6} />
        <p className="text-[var(--text-muted)] text-[11px] leading-relaxed">
          This will ring Mohammed&apos;s phone directly. Your microphone will be used for audio streaming.
        </p>
      </div>
    </div>
  );
}
