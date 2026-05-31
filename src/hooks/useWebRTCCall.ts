/**
 * useWebRTCCall — Peer-to-peer voice & video call hook (Native Durable Object WebSocket Signaling)
 *
 * Signaling: Durable Object WebSockets for real-time WebRTC SDP exchange
 * Media:     Native WebRTC with STUN (Google + Twilio)
 */
import { useEffect, useRef, useState, useCallback } from 'react';

// ─── Types ───────────────────────────────────────────────────
type CallStatus = 'idle' | 'connecting' | 'ready' | 'ringing' | 'active' | 'ended' | 'error';

// ─── ICE Servers ─────────────────────────────────────────────
const ICE_SERVERS: RTCIceServer[] = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
  { urls: 'global.stun.twilio.com:3478' },
];

export function useWebRTCCall(roomId: string, isAdmin: boolean) {
  const [callStatus, setCallStatus] = useState<CallStatus>('idle');
  const [connected, setConnected] = useState(false);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [messages, setMessages] = useState<{ sender: 'admin' | 'visitor'; text: string; timestamp: number }[]>([]);

  const localStreamRef = useRef<MediaStream | null>(null);
  const remoteStreamRef = useRef<MediaStream | null>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const mountedRef = useRef(true);
  const iceQueue = useRef<RTCIceCandidateInit[]>([]);
  const remoteDescReady = useRef(false);
  const socketRef = useRef<WebSocket | null>(null);

  const myRole = isAdmin ? 'admin' : 'visitor';

  // ─── Send signal to peer ─────────────────────────────────
  const send = useCallback((type: string, payload?: unknown) => {
    const socket = socketRef.current;
    if (socket && socket.readyState === WebSocket.OPEN) {
      // Send signal instantly over active WebSocket with zero latency
      socket.send(JSON.stringify({
        type: 'signal',
        signalType: type,
        payload
      }));
    } else {
      // Fallback: send signaling payload to REST endpoint if WebSocket is offline
      fetch('/api/call/signal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomId, role: myRole, type, payload }),
      }).catch((err) => console.warn('[WebRTC Fallback] Signal send failed:', err));
    }
  }, [roomId, myRole]);

  // ─── Cleanup WebRTC ──────────────────────────────────────
  const cleanupRTC = useCallback(() => {
    pcRef.current?.close();
    pcRef.current = null;
    localStreamRef.current?.getTracks().forEach((t) => t.stop());
    localStreamRef.current = null;
    setLocalStream(null);
    remoteStreamRef.current = null;
    setRemoteStream(null);
    iceQueue.current = [];
    remoteDescReady.current = false;
  }, []);

  // ─── Create PeerConnection ───────────────────────────────
  const makePeerConnection = useCallback(() => {
    if (pcRef.current) pcRef.current.close();

    const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });

    pc.onicecandidate = (e) => {
      if (e.candidate) {
        send('candidate', e.candidate.toJSON());
      }
    };

    pc.ontrack = (e) => {
      if (!mountedRef.current) return;
      console.log('[WebRTC] Remote track received:', e.track.kind, e.track.id);

      if (!remoteStreamRef.current) {
        remoteStreamRef.current = new MediaStream();
      }

      const exists = remoteStreamRef.current.getTracks().find((t) => t.id === e.track.id);
      if (!exists) {
        remoteStreamRef.current.addTrack(e.track);
      }

      setRemoteStream(new MediaStream(remoteStreamRef.current.getTracks()));
      setConnected(true);
      setCallStatus('active');
    };

    pc.oniceconnectionstatechange = () => {
      if (!mountedRef.current) return;
      const s = pc.iceConnectionState;
      if (s === 'disconnected' || s === 'failed' || s === 'closed') {
        setConnected(false);
        setCallStatus('ended');
      }
    };

    pcRef.current = pc;
    return pc;
  }, [send]);

  // ─── Drain queued ICE candidates ─────────────────────────
  const drainIce = useCallback(async () => {
    const pc = pcRef.current;
    if (!pc || !pc.remoteDescription) return;
    const queued = [...iceQueue.current];
    iceQueue.current = [];
    for (const c of queued) {
      try {
        await pc.addIceCandidate(new RTCIceCandidate(c));
      } catch (e) {
        console.warn('[WebRTC] Failed to drain ICE candidate:', e);
      }
    }
  }, []);

  // ─── Handle signaling message ────────────────────────────
  const handleSignal = useCallback(
    async (msg: { role: string; type: string; payload?: unknown }) => {
      if (!mountedRef.current) return;

      try {
        if (msg.type === 'join') {
          const pc = pcRef.current;
          if (pc && isAdmin) {
            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);
            send('offer', offer);
          }
        } else if (msg.type === 'offer') {
          if (!localStreamRef.current) {
            try {
              const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
              localStreamRef.current = stream;
              setLocalStream(stream);
            } catch {
              setCallStatus('error');
              return;
            }
          }
          const pc = pcRef.current || makePeerConnection();
          localStreamRef.current!.getTracks().forEach((t) => {
            if (!pc.getSenders().find((s) => s.track === t)) {
              pc.addTrack(t, localStreamRef.current!);
            }
          });
          await pc.setRemoteDescription(new RTCSessionDescription(msg.payload as RTCSessionDescriptionInit));
          remoteDescReady.current = true;
          await drainIce();
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          send('answer', answer);
          
          setCallStatus((prev) => (prev === 'active' ? 'active' : 'ringing'));
        } else if (msg.type === 'answer') {
          const pc = pcRef.current;
          if (pc && pc.signalingState === 'have-local-offer') {
            await pc.setRemoteDescription(new RTCSessionDescription(msg.payload as RTCSessionDescriptionInit));
            remoteDescReady.current = true;
            await drainIce();
          }
        } else if (msg.type === 'candidate') {
          const pc = pcRef.current;
          if (pc?.remoteDescription && remoteDescReady.current) {
            try {
              await pc.addIceCandidate(new RTCIceCandidate(msg.payload as RTCIceCandidateInit));
            } catch (e) {
              console.warn('[WebRTC] Failed to add ICE candidate:', e);
            }
          } else {
            iceQueue.current.push(msg.payload as RTCIceCandidateInit);
          }
        } else if (msg.type === 'leave') {
          cleanupRTC();
          setConnected(false);
          setRemoteStream(null);
          setCallStatus('ended');
        }
      } catch (err) {
        console.error('[WebRTC] Signal error:', err);
      }
    },
    [isAdmin, makePeerConnection, drainIce, send, cleanupRTC]
  );

  const sendChatMessage = useCallback((text: string) => {
    const socket = socketRef.current;
    if (!text.trim()) return;

    const chatMsg: { sender: 'admin' | 'visitor'; text: string; timestamp: number } = {
      sender: myRole as 'admin' | 'visitor',
      text: text.trim(),
      timestamp: Date.now()
    };

    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({
        type: 'CHAT_MESSAGE',
        payload: chatMsg
      }));
      
      // Add own message locally
      setMessages((prev) => [...prev, chatMsg]);
    }
  }, [myRole]);

  // ─── Subscribe to signaling on mount ─────────────────────
  useEffect(() => {
    if (!roomId) return;
    mountedRef.current = true;
    setCallStatus('connecting');

    let reconnectDelay = 1000;
    let isCleanup = false;

    // Establish dynamic WebSocket connection directly to the Durable Object signaling server
    const connect = () => {
      if (isCleanup) return;

      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const host = window.location.host;
      const wsUrl = `${protocol}//${host}/api/sync?role=${myRole}&roomId=${roomId}`;

      const ws = new WebSocket(wsUrl);
      socketRef.current = ws;

      ws.onopen = () => {
        console.log(`[WebRTCCall WS] Connected to call room ${roomId} as ${myRole}`);
        if (mountedRef.current) setCallStatus('ready');
        reconnectDelay = 1000; // Reset
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          // Parse signals received from other peers in the room
          if (data.type === 'signal') {
            if (data.role === myRole) return;
            handleSignal({
              role: data.role,
              type: data.signalType,
              payload: data.payload
            });
          } else if (data.type === 'CHAT_MESSAGE') {
            // Receive chat message from peer in the same room
            if (data.payload && data.payload.sender !== myRole) {
              setMessages((prev) => [...prev, data.payload]);
            }
          }
        } catch (err) {
          console.warn('[WebRTCCall WS] Message parsing failed:', err);
        }
      };

      ws.onclose = () => {
        if (isCleanup) return;
        console.log(`[WebRTCCall WS] Disconnected. Reconnecting in ${reconnectDelay}ms...`);
        setTimeout(connect, reconnectDelay);
        reconnectDelay = Math.min(reconnectDelay * 2, 30000);
      };

      ws.onerror = (err) => {
        console.error('[WebRTCCall WS] Socket error:', err);
        ws.close();
      };
    };

    connect();

    return () => {
      isCleanup = true;
      mountedRef.current = false;
      if (socketRef.current) {
        socketRef.current.close();
      }
      cleanupRTC();
    };
  }, [roomId, myRole, handleSignal, cleanupRTC]);

  // ─── Public: join the call ───────────────────────────────
  const joinCall = useCallback(async () => {
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        setCallStatus('error');
        return;
      }

      setCallStatus('ringing');
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      
      localStreamRef.current = stream;
      setLocalStream(stream);

      const pc = makePeerConnection();
      stream.getTracks().forEach((t) => pc.addTrack(t, stream));

      if (isAdmin) {
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        send('offer', offer);
      } else {
        send('join');
      }
    } catch (err) {
      console.error('[WebRTC] Join error:', err);
      setCallStatus('error');
    }
  }, [isAdmin, makePeerConnection, send]);

  // ─── Public: end the call ────────────────────────────────
  const endCall = useCallback(() => {
    send('leave');
    cleanupRTC();
    setConnected(false);
    setRemoteStream(null);
    setCallStatus('ended');
  }, [send, cleanupRTC]);

  // ─── Public: toggle mic ──────────────────────────────────
  const toggleMic = useCallback((): boolean => {
    const track = localStreamRef.current?.getAudioTracks()[0];
    if (track) {
      track.enabled = !track.enabled;
      return track.enabled;
    }
    return false;
  }, []);

  // ─── Public: toggle video ────────────────────────
  const toggleVideo = useCallback(async (): Promise<boolean> => {
    const pc = pcRef.current;
    const stream = localStreamRef.current;
    if (!stream) return false;

    let videoTrack = stream.getVideoTracks()[0];

    if (!videoTrack) {
      try {
        console.log('[WebRTC] Upgrading stream to include camera on-demand...');
        
        const oldAudioTrack = stream.getAudioTracks()[0];
        if (oldAudioTrack) {
          oldAudioTrack.stop();
        }

        const unifiedStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
        
        localStreamRef.current = unifiedStream;
        setLocalStream(unifiedStream);

        const newAudioTrack = unifiedStream.getAudioTracks()[0];
        const newVideoTrack = unifiedStream.getVideoTracks()[0];

        if (pc) {
          const audioSender = pc.getSenders().find(s => s.track?.kind === 'audio');
          if (audioSender && newAudioTrack) {
            await audioSender.replaceTrack(newAudioTrack);
          }

          if (newVideoTrack) {
            pc.addTrack(newVideoTrack, unifiedStream);
            
            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);
            send('offer', offer);
          }
        }
        return true;
      } catch (e) {
        console.error('[WebRTC] Failed to upgrade stream for camera on-demand:', e);
        
        try {
          const fallbackStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
          localStreamRef.current = fallbackStream;
          setLocalStream(fallbackStream);
          if (pc) {
            const audioSender = pc.getSenders().find(s => s.track?.kind === 'audio');
            const newAudio = fallbackStream.getAudioTracks()[0];
            if (audioSender && newAudio) {
              await audioSender.replaceTrack(newAudio);
            }
          }
        } catch (fallbackError) {
          console.error('[WebRTC] Fallback stream recovery failed:', fallbackError);
        }
        return false;
      }
    } else {
      videoTrack.enabled = !videoTrack.enabled;
      return videoTrack.enabled;
    }
  }, [send]);

  // ─── Connection Timeout Guard ───────────────────
  useEffect(() => {
    if (callStatus === 'ringing' && !connected) {
      const timeoutMs = isAdmin ? 15000 : 60000;
      const timer = setTimeout(() => {
        if (mountedRef.current && !connected) {
          console.warn('[WebRTC] Connection timed out: Peer is offline.');
          setCallStatus('error');
          cleanupRTC();
        }
      }, timeoutMs);

      return () => clearTimeout(timer);
    }
  }, [callStatus, connected, isAdmin, cleanupRTC]);

  const statusText: Record<CallStatus, string> = {
    idle: 'Initializing...',
    connecting: 'Connecting to Cloudflare Edge...',
    ready: 'Ready. Press to join.',
    ringing: isAdmin ? 'Ringing visitor...' : 'Waiting for admin...',
    active: 'Connected securely.',
    ended: 'Call ended.',
    error: isAdmin 
      ? 'Connection failed. Visitor may have disconnected or gone offline.' 
      : 'Connection error. Check devices or secure context.',
  };

  return {
    status: statusText[callStatus],
    callStatus,
    connected,
    isReady: callStatus === 'ready',
    isWaiting: callStatus === 'ringing',
    localStream,
    remoteStream,
    joinCall,
    endCall,
    toggleMic,
    toggleVideo,
    messages,
    sendChatMessage
  };
}
