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
  const [micMuted, setMicMuted] = useState(false);
  const [videoMuted, setVideoMuted] = useState(true);
  const [turnstileToken, setTurnstileToken] = useState<string>('');

  const turnstileContainerRef = useRef<HTMLDivElement | null>(null);
  const widgetIdRef = useRef<string | null>(null);
  
  const [chatInput, setChatInput] = useState('');
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  const {
    status,
    callStatus,
    connected,
    localStream,
    remoteStream,
    joinCall,
    endCall,
    toggleMic,
    toggleVideo,
    messages,
    sendChatMessage
  } = useWebRTCCall(activeRoomId, false);

  // Auto-scroll chat viewports to stay centered on incoming/outgoing text payloads
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    sendChatMessage(chatInput);
    setChatInput('');
  };

  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteAudioRef = useRef<HTMLAudioElement | null>(null);

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
    if (remoteAudioRef.current && remoteStream) {
      remoteAudioRef.current.srcObject = remoteStream;
      remoteAudioRef.current.play().catch((err) => {
        console.warn('[LinuxComms] Autoplay blocked for audio stream, waiting for user interaction:', err);
      });
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

  // Load and mount Cloudflare Turnstile CAPTCHA explicitly with clean React lifecycle management
  useEffect(() => {
    if (phase !== 'idle') return;

    let isMounted = true;
    let checkInterval: NodeJS.Timeout;

    // 1. Check and inject the Turnstile script dynamically if not present
    if (typeof window !== 'undefined' && !document.getElementById('cloudflare-turnstile-script')) {
      const script = document.createElement('script');
      script.id = 'cloudflare-turnstile-script';
      script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
      script.async = true;
      script.defer = true;
      document.body.appendChild(script);
    }

    // 2. Render Widget explicitly once Turnstile is present using the useRef container
    const renderWidget = () => {
      const ts = (window as any).turnstile;
      if (ts && turnstileContainerRef.current && isMounted) {
        // If a widget was already rendered, clean it up first to avoid duplicates
        if (widgetIdRef.current) {
          try {
            ts.remove(widgetIdRef.current);
          } catch (e) {}
          widgetIdRef.current = null;
        }

        try {
          const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || '1x0000000000000000000000000000000AA';
          const widgetId = ts.render(turnstileContainerRef.current, {
            sitekey: siteKey,
            callback: (token: string) => {
              if (isMounted) setTurnstileToken(token);
            },
            'expired-callback': () => {
              if (isMounted) setTurnstileToken('');
            },
            'error-callback': () => {
              if (isMounted) setTurnstileToken('');
            }
          });
          widgetIdRef.current = widgetId;
        } catch (err) {
          console.warn('[Turnstile Mount Error]:', err);
        }
      }
    };

    if (typeof window !== 'undefined') {
      if ((window as any).turnstile) {
        renderWidget();
      } else {
        checkInterval = setInterval(() => {
          if ((window as any).turnstile) {
            renderWidget();
            clearInterval(checkInterval);
          }
        }, 100);
      }
    }

    // 3. Return clean unmount handler
    return () => {
      isMounted = false;
      if (checkInterval) clearInterval(checkInterval);
      if (widgetIdRef.current && (window as any).turnstile) {
        try {
          (window as any).turnstile.remove(widgetIdRef.current);
        } catch (e) {}
        widgetIdRef.current = null;
      }
    };
  }, [phase]);

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
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 8000);
          try {
            const res = await fetch('/api/notify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                caller: 'Visitor',
                environment: 'Linux/Kali',
                roomId,
                'cf-turnstile-response': turnstileToken
              }),
              signal: controller.signal
            });
            clearTimeout(timeoutId);

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
            clearTimeout(timeoutId);
            setLogs(prev => [...prev, '> ERROR: Security handshake timeout. Network route lost.']);
            setPhase('idle');
          }
        }, 1000);
      }, 1000);
    }, 1000);
  };

  const showVideo = connected || callStatus === 'active';

  return (
    <div className="w-full h-full bg-[#0c0c0c] text-emerald-500 font-mono p-4 flex flex-col relative overflow-hidden select-none">
      
      {/* Radar scanning line overlay */}
      <div className="absolute inset-0 pointer-events-none bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSJ0cmFuc3BhcmVudCIvPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSIxIiBmaWxsPSJyZ2JhKDE2LCAxODUsIDEyOSwgMC4wNCkiLz4KPC9zdmc+')] opacity-50 z-10" />

      {/* Protocol status bar */}
      <div className="flex items-center justify-between border-b border-emerald-900 pb-3 mb-4 relative z-20">
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
        <div className="flex-grow flex gap-4 min-h-0 relative z-20 mb-4">
          {/* Left Column: Stacked Videos */}
          <div className="flex-[2] flex flex-col gap-4 min-h-0">
            {/* Local Camera stream */}
            <div className="flex-1 bg-black border border-emerald-900 rounded p-2 flex flex-col relative shadow-[0_0_20px_rgba(16,185,129,0.05)] min-h-0 h-[140px]">
              <div className="text-[10px] text-emerald-400 font-bold mb-2 flex items-center justify-between shrink-0">
                <span>[KALI_CAM_01] LOCAL_FEED</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
              </div>
              <div className="flex-1 bg-zinc-900/40 rounded overflow-hidden relative min-h-0">
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
            <div className="flex-1 bg-black border border-emerald-900 rounded p-2 flex flex-col relative shadow-[0_0_20px_rgba(16,185,129,0.05)] min-h-0 h-[140px]">
              <div className="text-[10px] text-emerald-400 font-bold mb-2 flex items-center justify-between shrink-0">
                <span>[COMMAND_CENTER_CAM] REMOTE_FEED</span>
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
              </div>
              <div className="flex-1 bg-zinc-900/40 rounded overflow-hidden relative min-h-0">
                <video
                  ref={remoteVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover grayscale sepia contrast-125 brightness-90"
                />
                <div className="absolute inset-0 pointer-events-none border border-emerald-500/20" />
              </div>
            </div>
          </div>

          {/* Right Column: Brutalist Secure Chat UI Panel */}
          <div className="flex-[1.5] bg-black border border-emerald-900 rounded p-3 flex flex-col min-h-0 shadow-[0_0_20px_rgba(16,185,129,0.05)] h-[320px]">
            <div className="text-[10px] text-emerald-400 font-bold mb-2 pb-1 border-b border-emerald-900/60 flex items-center justify-between shrink-0">
              <span>[SECURE_COMS_CHAT] READY_FOR_TX</span>
              <span className="text-zinc-500 text-[8px]">LOGS: {messages.length}</span>
            </div>
            
            {/* Chat history list */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1 scrollbar-thin mb-2 min-h-0">
              {messages.length === 0 ? (
                <div className="text-[10px] text-emerald-800 italic p-2">&gt; Encrypted channel quiet. No traffic detected.</div>
              ) : (
                messages.map((msg, idx) => (
                  <div key={idx} className={`text-[10px] p-2 border rounded ${
                    msg.sender === 'visitor' 
                      ? 'border-emerald-900/60 bg-emerald-950/5 text-emerald-400' 
                      : 'border-amber-900/60 bg-amber-950/5 text-amber-400'
                  }`}>
                    <div className="flex justify-between items-center text-[7px] text-zinc-500 font-bold mb-1">
                      <span>[{msg.sender.toUpperCase()}]</span>
                      <span>{new Date(msg.timestamp).toLocaleTimeString()}</span>
                    </div>
                    <div className="break-all whitespace-pre-wrap">{msg.text}</div>
                  </div>
                ))
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Chat input form */}
            <form onSubmit={handleSendChat} className="mt-auto flex gap-2 pt-2 border-t border-emerald-900/40 shrink-0">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Enter payload message..."
                className="flex-grow bg-black text-emerald-400 border border-emerald-900/60 px-3 py-2 rounded text-[10px] focus:outline-none focus:border-emerald-500 font-mono"
              />
              <button
                type="submit"
                className="bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-400 border border-emerald-900 px-3 py-2 rounded text-[10px] font-bold cursor-pointer transition-colors"
              >
                [ TRANSMIT ]
              </button>
            </form>
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

      {/* Visual progress log terminal - only render when call is not active to save layout height */}
      {!showVideo && (
        <div className="bg-zinc-950 border border-emerald-900/40 p-4 rounded flex flex-col gap-2 font-mono text-xs relative z-20 mb-4 max-h-[120px] overflow-y-auto">
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
      )}

      {/* Secure link activation buttons */}
      <div className="flex items-center justify-center gap-4 relative z-20 mt-auto w-full px-4">
        {showVideo ? (
          <>
            <button
              onClick={() => {
                const enabled = toggleMic();
                setMicMuted(!enabled);
              }}
              className={`px-4 py-3 font-bold tracking-wider transition-all flex items-center gap-2 border text-xs cursor-pointer ${
                micMuted 
                  ? 'border-red-500/60 text-red-400 bg-red-500/5' 
                  : 'border-emerald-500/60 text-emerald-400 hover:bg-emerald-500/10'
              }`}
            >
              {micMuted ? '[ AUDIO_MUTED ]' : '[ AUDIO_ACTIVE ]'}
            </button>

            <button
              onClick={async () => {
                const enabled = await toggleVideo();
                setVideoMuted(!enabled);
              }}
              className={`px-4 py-3 font-bold tracking-wider transition-all flex items-center gap-2 border text-xs cursor-pointer ${
                videoMuted 
                  ? 'border-red-500/60 text-red-400 bg-red-500/5' 
                  : 'border-emerald-500/60 text-emerald-400 hover:bg-emerald-500/10'
              }`}
            >
              {videoMuted ? '[ CAMERA_MUTED ]' : '[ CAMERA_ACTIVE ]'}
            </button>

            <button
              onClick={() => {
                endCall();
                setActiveRoomId('');
                setPhase('idle');
                setLogs([]);
                setMicMuted(false);
                setVideoMuted(true);
              }}
              className="px-6 py-3 font-bold tracking-[0.2em] transition-all flex items-center gap-3 border border-red-500 text-red-500 hover:bg-red-500/10 cursor-pointer shadow-[0_0_15px_rgba(239,68,68,0.2)] text-xs"
            >
              <Radio className="w-4 h-4 text-red-400" />
              [ SEVER SECURE LINK ]
            </button>
          </>
        ) : (
          <div className="flex flex-col items-center gap-4 w-full">
            {/* Turnstile Security Challenge */}
            {phase === 'idle' && (
              <div className="flex flex-col items-center justify-center p-3 mb-2 bg-black border border-emerald-950/80 rounded relative z-20 w-full shadow-inner max-w-sm">
                <div className="text-[9px] text-emerald-400 font-bold mb-2 flex items-center gap-1.5 uppercase tracking-wider">
                  <Shield className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                  <span>SOLVE SECURITY CHALLENGE TO PING ADMIN</span>
                </div>
                <div ref={turnstileContainerRef} className="min-h-[65px] flex items-center justify-center"></div>
              </div>
            )}

            <button
              onClick={handleCall}
              disabled={phase !== 'idle' || !turnstileToken}
            className={`px-6 py-4 font-bold tracking-[0.2em] transition-all flex items-center gap-3 border ${
              phase === 'connected'
                ? 'border-emerald-500 text-emerald-500 bg-emerald-500/10 cursor-default shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                : phase !== 'idle'
                ? 'border-yellow-500 text-yellow-500 bg-yellow-500/10 cursor-not-allowed'
                : 'border-emerald-500 text-emerald-500 hover:bg-emerald-500/10 hover:shadow-[0_0_15px_rgba(16,185,129,0.4)] cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed'
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
        </div>
      )}
      </div>

      {/* Hidden Audio element for remote audio stream to bypass autoplay policy */}
      <audio ref={remoteAudioRef} autoPlay className="hidden" />
    </div>
  );
}
