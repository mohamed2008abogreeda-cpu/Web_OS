'use client';

/**
 * AdminComms — Admin-side secure E2E comms center & Live Normalized Radar Map
 *
 * URL: /admin/comms?room=<uuid>
 * Integrates WebRTC bidirectional secure audio/video relay with mathematically normalized spectator tracking.
 * Theme: Brutalist Dark Hacking console + Sleek glassmorphic call controls.
 */
import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useOSStore } from '@/store/useOSStore';
import { useWebRTCCall } from '@/hooks/useWebRTCCall';
import { 
  PhoneOff, 
  Mic, 
  MicOff, 
  Video,
  VideoOff,
  PhoneCall, 
  Users, 
  ShieldCheck, 
  Loader2, 
  Terminal, 
  MousePointer2,
  Flame,
  RotateCcw,
  FileText,
  Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface VisitorSession {
  sessionId: string;
  x: number;
  y: number;
  viewportWidth: number;
  viewportHeight: number;
  activeWindows: any[];
  lastSeen: number;
}

function AdminComms() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Read dynamic room parameter sent via the click action of the ntfy.sh notification
  const roomId = searchParams.get('room');

  const [micMuted, setMicMuted] = useState(false);
  const [videoMuted, setVideoMuted] = useState(true);
  const [showPlayOverlay, setShowPlayOverlay] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // ─── Multi-Session Spectator Tracking State (God Mode) ───
  const [sessions, setSessions] = useState<Record<string, VisitorSession>>({});
  const [activeSessionId, setActiveSessionId] = useState<string>('');
  const [broadcastingSessions, setBroadcastingSessions] = useState<Record<string, boolean>>({});
  const [logs, setLogs] = useState<string[]>([
    `> [${new Date().toLocaleTimeString()}] INTERVENTION TERMINAL INITIALIZED. READY FOR COMMAND DISPATCH.`
  ]);
  const [isDispatching, setIsDispatching] = useState<boolean>(false);
  const [chatInput, setChatInput] = useState('');
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  const chatMessages = useOSStore((s) => s.chatMessages);

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
    toggleVideo,
    sendChatMessage
  } = useWebRTCCall(roomId || '', true);

  // Auto-scroll chat viewports to stay centered on incoming/outgoing text payloads
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    sendChatMessage(chatInput);
    setChatInput('');
  };

  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);

  // Safely attach stream objects to raw HTML5 Video nodes on mount
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  // Autoplay policy handling — attempt play and show overlay if blocked
  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
      remoteVideoRef.current.play().catch(() => {
        setShowPlayOverlay(true);
      });
    }
  }, [remoteStream]);

  // Play remote audio elements
  useEffect(() => {
    if (remoteStream && audioRef.current) {
      audioRef.current.srcObject = remoteStream;
      audioRef.current.play().catch(() => {});
    }
  }, [remoteStream]);

  const socketRef = useRef<WebSocket | null>(null);

  // ─── Real-time Durable Object WebSocket Receiver Subscription ───
  useEffect(() => {
    // Enable state spectator flags for GhostCursor rendering compatibility
    useOSStore.setState({ isSpectating: true, isAdminAuthenticated: true });

    let reconnectDelay = 1000;
    let isCleanup = false;

    const connect = () => {
      if (isCleanup) return;

      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const host = window.location.host;
      const wsUrl = `${protocol}//${host}/api/sync?role=admin`;

      const ws = new WebSocket(wsUrl);
      socketRef.current = ws;

      ws.onopen = () => {
        console.log('[AdminComms WS] Connected to Durable Object as admin');
        reconnectDelay = 1000; // Reset reconnection delay
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          // Handle incoming state/coordinates sync updates from visitors
          if (data.type === 'os-state-update' && data.sessionId) {
            const vWidth = data.viewportWidth || 1920;
            const vHeight = data.viewportHeight || 1080;

            setSessions(prev => {
              const updated = {
                ...prev,
                [data.sessionId]: {
                  sessionId: data.sessionId,
                  x: data.x,
                  y: data.y,
                  viewportWidth: vWidth,
                  viewportHeight: vHeight,
                  activeWindows: data.activeWindows || [],
                  lastSeen: Date.now()
                }
              };
              return updated;
            });

            // Auto-select session if none is currently active
            setActiveSessionId(current => current || data.sessionId);
          }
        } catch (err) {
          console.warn('[AdminComms WS] Error parsing message:', err);
        }
      };

      ws.onclose = () => {
        if (isCleanup) return;
        console.log(`[AdminComms WS] Disconnected. Reconnecting in ${reconnectDelay}ms...`);
        setTimeout(connect, reconnectDelay);
        reconnectDelay = Math.min(reconnectDelay * 2, 30000); // Backoff up to 30s
      };

      ws.onerror = (err) => {
        console.error('[AdminComms WS] Socket error:', err);
        ws.close();
      };
    };

    connect();

    // Cleanup subscription and state variables on unmount to avoid memory leaks
    return () => {
      isCleanup = true;
      if (socketRef.current) {
        socketRef.current.close();
      }
      useOSStore.setState({ isSpectating: false, isAdminAuthenticated: false, ghostCursor: null });
    };
  }, []);

  // Prune stale sessions (inactive for more than 10 seconds)
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      setSessions(prev => {
        const cleaned: Record<string, VisitorSession> = {};
        let changed = false;
        Object.entries(prev).forEach(([id, s]) => {
          if (now - s.lastSeen < 10000) {
            cleaned[id] = s;
          } else {
            changed = true;
          }
        });
        if (changed) {
          if (activeSessionId && !cleaned[activeSessionId]) {
            const nextActive = Object.keys(cleaned)[0] || '';
            setActiveSessionId(nextActive);
          }
          return cleaned;
        }
        return prev;
      });
    }, 3000);
    return () => clearInterval(interval);
  }, [activeSessionId]);

  // Sync active session coordinate status to global Zustand store for custom radar cursor rendering
  useEffect(() => {
    const active = sessions[activeSessionId];
    if (active) {
      useOSStore.setState({
        ghostCursor: { x: active.x / active.viewportWidth, y: active.y / active.viewportHeight }
      });
    } else {
      useOSStore.setState({ ghostCursor: null });
    }
  }, [sessions, activeSessionId]);

  // Dispatch Remote Active Intervention commands to the visitor
  const triggerIntervention = async (type: string, payload?: any) => {
    if (!activeSessionId) {
      setLogs(prev => [...prev, `> [${new Date().toLocaleTimeString()}] [WARN] NO ACTIVE SESSION CHOSEN FOR INTERVENTION.`]);
      return;
    }

    setIsDispatching(true);
    const targetSession = activeSessionId;
    setLogs(prev => [...prev, `> [${new Date().toLocaleTimeString()}] [PENDING] DISPATCHING COMMAND: ${type} TO SESSION: ${targetSession.slice(0, 8)}...`]);

    const socket = socketRef.current;
    if (socket && socket.readyState === WebSocket.OPEN) {
      try {
        // Fast path: send over active WebSocket connection with zero latency
        socket.send(JSON.stringify({
          type: 'intervene',
          payload: {
            sessionId: targetSession,
            type,
            payload
          }
        }));
        setLogs(prev => [...prev, `> [${new Date().toLocaleTimeString()}] [OK] INTERVENTION ${type} TRANSMITTED TO GUEST (WS).`]);
      } catch (err: any) {
        setLogs(prev => [...prev, `> [${new Date().toLocaleTimeString()}] [FAIL] WS TRANSMISSION ERROR: ${err.message || err}`]);
      } finally {
        setIsDispatching(false);
      }
    } else {
      // Fallback: make POST request to HTTP API route if WebSocket is establishing or offline
      try {
        const response = await fetch('/api/intervene', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId: targetSession,
            type,
            payload
          })
        });

        const resData = await response.json();

        if (response.ok && resData.success) {
          setLogs(prev => [...prev, `> [${new Date().toLocaleTimeString()}] [OK] INTERVENTION ${type} TRANSMITTED TO GUEST (HTTP FALLBACK).`]);
        } else {
          throw new Error(resData.error || 'Server rejected transaction payload');
        }
      } catch (err: any) {
        setLogs(prev => [...prev, `> [${new Date().toLocaleTimeString()}] [FAIL] INTERVENTION DESYNC ERROR: ${err.message || err}`]);
      } finally {
        setIsDispatching(false);
      }
    }
  };

  // Dispatch SPECTATE_COMMAND over dynamic DO WebSockets
  const toggleSpectatorUplink = () => {
    if (!activeSessionId) {
      setLogs(prev => [...prev, `> [${new Date().toLocaleTimeString()}] [WARN] NO ACTIVE SESSION CHOSEN FOR UPLINK.`]);
      return;
    }

    const socket = socketRef.current;
    if (!socket || socket.readyState !== WebSocket.OPEN) {
      setLogs(prev => [...prev, `> [${new Date().toLocaleTimeString()}] [FAIL] WS CONNECTION OFFLINE. CANNOT TOGGLE UPLINK.`]);
      return;
    }

    const targetSession = activeSessionId;
    const isCurrentlyBroadcasting = !!broadcastingSessions[targetSession];
    const newAction = isCurrentlyBroadcasting ? 'STOP' : 'START';

    try {
      socket.send(JSON.stringify({
        type: 'SPECTATE_COMMAND',
        targetSessionId: targetSession,
        action: newAction
      }));

      setBroadcastingSessions(prev => ({
        ...prev,
        [targetSession]: !isCurrentlyBroadcasting
      }));

      setLogs(prev => [
        ...prev,
        `> [${new Date().toLocaleTimeString()}] [OK] SPECTATOR UPLINK ${newAction === 'START' ? 'INITIATED' : 'SEVERED'} FOR SESSION: ${targetSession.slice(0, 8)}.`
      ]);
    } catch (err: any) {
      setLogs(prev => [...prev, `> [${new Date().toLocaleTimeString()}] [FAIL] WS UPLINK SEND ERROR: ${err.message || err}`]);
    }
  };

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

  const handleToggleVideo = async () => {
    const enabled = await toggleVideo();
    setVideoMuted(!enabled);
  };

  const handleEndCall = () => {
    endCall();
    router.push('/admin');
  };

  const showVideo = connected || callStatus === 'active';
  const activeSession = sessions[activeSessionId];

  return (
    <div className="min-h-screen bg-[#040404] text-zinc-300 font-mono p-6 relative overflow-hidden flex flex-col lg:flex-row gap-6 justify-center items-start">
      
      {/* Visual background grid overlay for the brutalist hacking room */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0c0c0c_1px,transparent_1px),linear-gradient(to_bottom,#0c0c0c_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none z-0" />

      {/* Autoplay policy — click-to-play overlay */}
      {showPlayOverlay && (
        <div
          onClick={() => {
            remoteVideoRef.current?.play();
            audioRef.current?.play();
            setShowPlayOverlay(false);
          }}
          className="fixed inset-0 z-[99998] bg-black/95 flex items-center justify-center cursor-pointer"
        >
          <div className="text-center">
            <div className="text-emerald-400 text-4xl mb-4 animate-ping">▶</div>
            <p className="text-emerald-400 text-sm font-bold tracking-wider font-mono">CLICK TO INTERCEPT INCOMING MEDIA</p>
            <p className="text-zinc-500 text-xs mt-2">Browser security restrictions require direct admin confirmation</p>
          </div>
        </div>
      )}

      {/* LEFT COMPONENT: Secure E2E Call Console */}
      <div className="w-full lg:w-[400px] bg-zinc-950 border border-zinc-900 rounded-lg p-6 shadow-2xl flex flex-col relative overflow-hidden min-h-[500px] shrink-0 z-10">
        <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1 bg-emerald-500/10 rounded-full border border-emerald-500/20">
          <ShieldCheck className="w-4 h-4 text-emerald-400 animate-pulse" />
          <span className="text-[10px] text-emerald-400 tracking-wider font-bold">SECURE CHANNEL</span>
        </div>

        {/* Video Feeds displayed inside left comms panel upon interception */}
        {showVideo ? (
          <div className="flex-grow flex flex-col min-h-0 mt-10 overflow-hidden">
            <div className="grid grid-cols-2 gap-3 mb-4 shrink-0">
              {/* Local Command camera feed */}
              <div className="bg-black border border-emerald-950/60 rounded p-1 flex flex-col relative h-[100px]">
                <div className="text-[8px] text-emerald-400 font-bold mb-0.5 flex items-center justify-between">
                  <span>[COMMAND_CAM]</span>
                  <span className="w-1 h-1 rounded-full bg-emerald-500 animate-ping" />
                </div>
                <div className="flex-grow bg-zinc-900/40 rounded overflow-hidden relative">
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
              <div className="bg-black border border-emerald-950/60 rounded p-1 flex flex-col relative h-[100px]">
                <div className="text-[8px] text-emerald-400 font-bold mb-0.5 flex items-center justify-between">
                  <span>[GUEST_CAM]</span>
                  <span className="w-1 h-1 rounded-full bg-red-500 animate-ping" />
                </div>
                <div className="flex-grow bg-zinc-900/40 rounded overflow-hidden relative">
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

            {/* Brutalist Secure Chat UI Panel */}
            <div className="flex-grow flex flex-col bg-black border border-zinc-900 rounded p-3 mb-4 min-h-[220px] max-h-[300px] overflow-hidden">
              <div className="text-[9px] text-emerald-400 font-bold mb-2 pb-1 border-b border-emerald-950/60 flex items-center justify-between shrink-0">
                <span>[COMMAND_COMS_CHAT] UPLINK_ACTIVE</span>
                <span className="text-zinc-500 text-[8px]">LOGS: {chatMessages.length}</span>
              </div>
              
              {/* Chat history list */}
              <div className="flex-grow overflow-y-auto space-y-2 pr-1 scrollbar-thin min-h-0 mb-2">
                {chatMessages.length === 0 ? (
                  <div className="text-[9px] text-emerald-800 italic p-2">&gt; Secure room established. Encrypted channel quiet.</div>
                ) : (
                  chatMessages.map((msg, idx) => (
                    <div key={idx} className={`text-[9px] p-2 border rounded ${
                      msg.sender === 'admin' 
                        ? 'border-amber-900/60 bg-amber-950/5 text-amber-400' 
                        : 'border-emerald-900/60 bg-emerald-950/5 text-emerald-400'
                    }`}>
                      <div className="flex justify-between items-center text-[6px] text-zinc-500 font-bold mb-1">
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
              <form onSubmit={handleSendChat} className="mt-auto flex gap-2 pt-2 border-t border-emerald-950/40 shrink-0">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Enter payload message..."
                  className="flex-grow bg-black text-emerald-400 border border-emerald-900/60 px-3 py-1.5 rounded text-[9px] focus:outline-none focus:border-emerald-500 font-mono"
                />
                <button
                  type="submit"
                  className="bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-400 border border-emerald-900 px-3 py-1.5 rounded text-[9px] font-bold cursor-pointer transition-colors"
                >
                  [ TRANSMIT ]
                </button>
              </form>
            </div>
          </div>
        ) : (
          <div className="flex-grow flex flex-col items-center justify-center py-16">
            <div className="flex items-center justify-center w-24 h-24 bg-gradient-to-br from-emerald-950 to-zinc-900 rounded-full mb-6 border border-emerald-900/40 shadow-[0_0_30px_rgba(16,185,129,0.15)] animate-pulse">
              <PhoneCall className="w-10 h-10 text-emerald-400" />
            </div>
            <h1 className="text-xl font-bold text-center mb-1 tracking-tight text-white">&gt;_ COMMS_CENTER</h1>
            <p className="text-center text-xs text-zinc-500">{status}</p>
          </div>
        )}

        {/* Active connection button state control */}
        <div className="flex flex-col justify-end mt-4">
          {!connected && !isWaiting && (
            <div className="flex flex-col gap-3 w-full">
              <Button
                onClick={joinCall}
                disabled={callStatus === 'connecting'}
                className="bg-emerald-950 hover:bg-emerald-900 text-emerald-400 border border-emerald-800 rounded py-5 text-sm font-bold shadow-[0_0_20px_rgba(16,185,129,0.1)] transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50"
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
            <div className="flex flex-col items-center gap-3 py-6">
              <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
              <span className="text-xs text-zinc-500 font-medium">Waiting for visitor connection...</span>
            </div>
          )}

          {connected && (
            <div className="text-center space-y-6">
              <div className="bg-zinc-900/60 p-4 rounded border border-emerald-950 flex items-center justify-between shadow-inner">
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-emerald-400" />
                  <span className="text-zinc-300 font-bold text-xs">AUDIO/VIDEO ACTIVE</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                  <span className="text-[10px] font-bold text-emerald-400">ACTIVE</span>
                </div>
              </div>

              <div className="flex justify-center gap-6 pt-2">
                <Button
                  onClick={handleToggleMic}
                  className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                    micMuted
                      ? 'bg-amber-600 hover:bg-amber-700 text-white shadow-[0_0_20px_rgba(245,158,11,0.2)]'
                      : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800'
                  }`}
                >
                  {micMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                </Button>

                <Button
                  onClick={handleToggleVideo}
                  className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                    videoMuted
                      ? 'bg-amber-600 hover:bg-amber-700 text-white shadow-[0_0_20px_rgba(245,158,11,0.2)]'
                      : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800'
                  }`}
                >
                  {videoMuted ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
                </Button>

                <Button
                  onClick={handleEndCall}
                  className="w-12 h-12 rounded-full bg-red-950 hover:bg-red-900 border border-red-800 flex items-center justify-center text-red-400 shadow-[0_0_20px_rgba(239,68,68,0.2)]"
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

      {/* RIGHT COMPONENT: INTERACTIVE ASPECT-VIDEO SPECTATOR RADAR VIEWPORT */}
      <div className="flex-1 w-full bg-zinc-950 border border-zinc-900 rounded-lg p-6 shadow-2xl flex flex-col gap-6 z-10">
        
        {/* Radar Map Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-emerald-950 pb-4 gap-4">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
            <h2 className="text-md font-bold text-white tracking-wider flex items-center gap-1.5">
              <Terminal className="w-4 h-4 text-emerald-400" />
              <span>GUEST_SPECTATOR_RADAR</span>
            </h2>
          </div>

          {/* Active Target Session Dropdown Selector */}
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <span className="text-xs text-zinc-500 uppercase tracking-widest font-bold">TARGET:</span>
            <select
              value={activeSessionId}
              onChange={(e) => setActiveSessionId(e.target.value)}
              className="bg-black text-emerald-400 border border-emerald-950 px-3 py-1.5 rounded font-mono text-xs focus:outline-none focus:border-emerald-800 max-w-[200px]"
            >
              <option value="">-- [ SELECT SESSION ] --</option>
              {Object.keys(sessions).map(id => (
                <option key={id} value={id}>
                  {id.slice(0, 8)}... ({sessions[id].viewportWidth}x{sessions[id].viewportHeight})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 16:9 Aspect Video Normalized Viewport Container */}
        <div className="w-full relative aspect-video bg-black border border-emerald-950 rounded-lg overflow-hidden shadow-inner flex items-center justify-center">
          
          {/* Brutalist Grid and Radar Sweeper Line Animation overlay */}
          <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_40%,rgba(0,0,0,0.8)_100%)] z-20" />
          <div className="absolute inset-0 pointer-events-none bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSJ0cmFuc3BhcmVudCIvPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSIxIiBmaWxsPSJyZ2JhKDE2LCAxODUsIDEyOSwgMC4wNCkiLz4KPC9zdmc+')] z-20" />
          
          {/* Pulsing scanning radar line */}
          <div className="absolute top-0 left-0 w-full h-[2px] bg-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.8)] z-10 animate-[bounce_6s_infinite_linear]" />

          {activeSession ? (
            <div className="w-full h-full relative z-10">
              
              {/* Scaled representations of visitor's open windows */}
              {activeSession.activeWindows && activeSession.activeWindows.map((win, idx) => {
                const wLeft = (win.x / activeSession.viewportWidth) * 100;
                const wTop = (win.y / activeSession.viewportHeight) * 100;
                const wWidth = (win.width / activeSession.viewportWidth) * 100;
                const wHeight = (win.height / activeSession.viewportHeight) * 100;

                return (
                  <div
                    key={win.id || idx}
                    style={{
                      left: `${wLeft}%`,
                      top: `${wTop}%`,
                      width: `${wWidth}%`,
                      height: `${wHeight}%`,
                    }}
                    className="absolute border border-emerald-500/30 bg-emerald-950/10 text-emerald-400 font-mono p-1.5 pointer-events-none rounded shadow-[0_0_10px_rgba(16,185,129,0.05)] transition-all duration-300"
                  >
                    <div className="text-[8px] font-bold border-b border-emerald-950 pb-1 mb-1 truncate flex items-center justify-between">
                      <span className="truncate max-w-[85%]">{win.title || win.appId}</span>
                      <span className="text-[6px] text-emerald-500/70 shrink-0">
                        {Math.round(wWidth)}%x{Math.round(wHeight)}%
                      </span>
                    </div>
                    {win.isMinimized && (
                      <span className="text-[6px] bg-amber-500/10 text-amber-500 border border-amber-500/20 px-1 py-0.5 rounded font-bold uppercase scale-75 block w-max">
                        MIN
                      </span>
                    )}
                  </div>
                );
              })}

              {/* Absolute mathematically normalized Visitor Cursor */}
              <div
                style={{
                  left: `${(activeSession.x / activeSession.viewportWidth) * 100}%`,
                  top: `${(activeSession.y / activeSession.viewportHeight) * 100}%`,
                }}
                className="absolute pointer-events-none z-30 transition-all duration-75 ease-out -ml-1 -mt-1"
              >
                <MousePointer2 className="w-5 h-5 text-emerald-400 fill-emerald-500/30 drop-shadow-[0_0_8px_rgba(16,185,129,0.9)]" />
                <div className="absolute top-4 left-3 bg-black/95 border border-emerald-500/40 text-emerald-400 text-[8px] font-bold px-2 py-0.5 rounded shadow-2xl whitespace-nowrap">
                  GUEST_PITCH ({Math.round((activeSession.x / activeSession.viewportWidth) * 100)}%, {Math.round((activeSession.y / activeSession.viewportHeight) * 100)}%)
                </div>
              </div>

              {/* Technical Watermark */}
              <div className="absolute bottom-3 right-3 text-[9px] text-emerald-500/30 font-bold font-mono tracking-widest pointer-events-none select-none z-0">
                RADAR_VIEW_ACTIVE // {activeSession.viewportWidth}x{activeSession.viewportHeight}
              </div>

            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-6 text-center select-none">
              <Loader2 className="w-8 h-8 text-emerald-950/80 animate-spin mb-3" />
              <p className="text-zinc-600 text-xs font-bold uppercase tracking-widest">&gt; AWAITING CLIENT HANDSHAKE PINGS...</p>
              <p className="text-zinc-700 text-[10px] mt-1 max-w-xs">Spectator sync commands require at least one visitor to be actively traversing the portfolio landing page.</p>
            </div>
          )}
        </div>

        {/* BOTTOM SECTION: TWO-COLUMN INTERVENTIONS PANEL & LOG TERMINAL */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
          
          {/* Active Command Intervention Buttons Panel */}
          <div className="bg-zinc-950 border border-zinc-900 rounded-lg p-5 flex flex-col gap-4">
            <h3 className="text-xs font-bold text-white tracking-widest uppercase border-b border-emerald-950/60 pb-2 flex items-center gap-2">
              <Flame className="w-4 h-4 text-emerald-400" />
              <span>ACTIVE_INTERVENTION_SYSTEM</span>
            </h3>

            <div className="grid grid-cols-2 gap-3 flex-grow justify-start">
              
              <Button
                onClick={() => triggerIntervention('FORCE_BSOD')}
                disabled={!activeSessionId || isDispatching}
                className="bg-red-950/60 hover:bg-red-900/80 text-red-400 border border-red-900 rounded py-5 text-xs font-bold flex flex-col items-center justify-center gap-1.5 shadow-[0_0_15px_rgba(239,68,68,0.05)] transition-all hover:scale-[1.03] disabled:opacity-30 disabled:hover:scale-100"
              >
                <Flame className="w-4 h-4" />
                <span>[ FORCE_BSOD ]</span>
              </Button>

              <Button
                onClick={() => triggerIntervention('OPEN_MODAL', { appId: 'app-about' })}
                disabled={!activeSessionId || isDispatching}
                className="bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-400 border border-emerald-900 rounded py-5 text-xs font-bold flex flex-col items-center justify-center gap-1.5 shadow-[0_0_15px_rgba(16,185,129,0.05)] transition-all hover:scale-[1.03] disabled:opacity-30 disabled:hover:scale-100"
              >
                <Sparkles className="w-4 h-4" />
                <span>[ PORTFOLIO_INFO ]</span>
              </Button>

              <Button
                onClick={() => triggerIntervention('OPEN_MODAL', { appId: 'app-terminal' })}
                disabled={!activeSessionId || isDispatching}
                className="bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-400 border border-emerald-900 rounded py-5 text-xs font-bold flex flex-col items-center justify-center gap-1.5 shadow-[0_0_15px_rgba(16,185,129,0.05)] transition-all hover:scale-[1.03] disabled:opacity-30 disabled:hover:scale-100"
              >
                <Terminal className="w-4 h-4" />
                <span>[ REMOTE_SHELL ]</span>
              </Button>

              <Button
                onClick={() => triggerIntervention('SWITCH_USER')}
                disabled={!activeSessionId || isDispatching}
                className="bg-amber-950/60 hover:bg-amber-900/80 text-amber-400 border border-amber-900 rounded py-5 text-xs font-bold flex flex-col items-center justify-center gap-1.5 shadow-[0_0_15px_rgba(245,158,11,0.05)] transition-all hover:scale-[1.03] disabled:opacity-30 disabled:hover:scale-100"
              >
                <RotateCcw className="w-4 h-4" />
                <span>[ SWITCH_USER ]</span>
              </Button>

              <Button
                onClick={toggleSpectatorUplink}
                disabled={!activeSessionId}
                className={`col-span-2 border rounded py-4 text-xs font-bold flex flex-col items-center justify-center gap-1.5 transition-all hover:scale-[1.01] disabled:opacity-30 disabled:hover:scale-100 ${
                  broadcastingSessions[activeSessionId]
                    ? 'bg-amber-950/60 hover:bg-amber-900/80 text-amber-400 border-amber-900 shadow-[0_0_15px_rgba(245,158,11,0.05)]'
                    : 'bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-400 border-emerald-900 shadow-[0_0_15px_rgba(16,185,129,0.05)]'
                }`}
              >
                {broadcastingSessions[activeSessionId] ? (
                  <>
                    <PhoneOff className="w-4 h-4 animate-pulse" />
                    <span>[ SEVER SPECTATOR UPLINK ]</span>
                  </>
                ) : (
                  <>
                    <MousePointer2 className="w-4 h-4" />
                    <span>[ INITIATE SPECTATOR UPLINK ]</span>
                  </>
                )}
              </Button>

            </div>
          </div>

          {/* Intervention Dispatched Status Log Terminal */}
          <div className="bg-zinc-950 border border-zinc-900 rounded-lg p-5 flex flex-col gap-3 min-h-[180px]">
            <h3 className="text-xs font-bold text-white tracking-widest uppercase border-b border-emerald-950/60 pb-2 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-emerald-400" />
                <span>INTERVENTION_STATUS_LOGS</span>
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            </h3>

            <div className="flex-1 overflow-y-auto space-y-1.5 font-mono text-[10px] text-zinc-500 max-h-[140px] scrollbar-thin">
              {logs.map((log, idx) => (
                <div key={idx} className={
                  log.includes('[FAIL]') ? 'text-red-500 font-bold' :
                  log.includes('[OK]') ? 'text-emerald-400 font-bold' :
                  log.includes('[WARN]') ? 'text-amber-500' : 
                  log.includes('[PENDING]') ? 'text-blue-400 animate-pulse' : 'text-zinc-500'
                }>
                  {log}
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

      <audio ref={audioRef} autoPlay />
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#040404]" />}>
      <AdminComms />
    </Suspense>
  );
}
