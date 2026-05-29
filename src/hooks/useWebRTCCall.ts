/**
 * useWebRTCCall — Peer-to-peer voice & video call hook (Pusher Signaling)
 *
 * Signaling: Pusher (pusher-js) for real-time WebRTC SDP exchange
 * Media:     Native WebRTC with STUN (Google + Twilio)
 */
import { useEffect, useRef, useState, useCallback } from 'react';
import Pusher from 'pusher-js';

// ─── Types ───────────────────────────────────────────────────
type CallStatus = 'idle' | 'connecting' | 'ready' | 'ringing' | 'active' | 'ended' | 'error';

// ─── ICE Servers ─────────────────────────────────────────────
const ICE_SERVERS: RTCIceServer[] = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
  { urls: 'stun:global.stun.twilio.com:3478' },
];

export function useWebRTCCall(roomId: string, isAdmin: boolean) {
  const [callStatus, setCallStatus] = useState<CallStatus>('idle');
  const [connected, setConnected] = useState(false);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);

  const localStreamRef = useRef<MediaStream | null>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const mountedRef = useRef(true);
  const iceQueue = useRef<RTCIceCandidateInit[]>([]);

  const myRole = isAdmin ? 'admin' : 'visitor';

  // ─── Send signal to peer ─────────────────────────────────
  const send = useCallback((type: string, payload?: any) => {
    fetch('/api/call/signal', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ roomId, role: myRole, type, payload }),
    }).catch(console.warn);
  }, [roomId, myRole]);

  // ─── Cleanup WebRTC ──────────────────────────────────────
  const cleanupRTC = useCallback(() => {
    pcRef.current?.close();
    pcRef.current = null;
    localStreamRef.current?.getTracks().forEach((t) => t.stop());
    localStreamRef.current = null;
    setLocalStream(null);
    iceQueue.current = [];
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
      setRemoteStream(e.streams[0]);
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
    for (const c of iceQueue.current) {
      try {
        await pc.addIceCandidate(new RTCIceCandidate(c));
      } catch {}
    }
    iceQueue.current = [];
  }, []);

  // ─── Handle signaling message ────────────────────────────
  const handleSignal = useCallback(
    async (msg: { role: string; type: string; payload?: any }) => {
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
              const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
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
          await pc.setRemoteDescription(new RTCSessionDescription(msg.payload));
          await drainIce();
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          send('answer', answer);
          setCallStatus('ringing');
        } else if (msg.type === 'answer') {
          const pc = pcRef.current;
          if (pc && pc.signalingState === 'have-local-offer') {
            await pc.setRemoteDescription(new RTCSessionDescription(msg.payload));
            await drainIce();
          }
        } else if (msg.type === 'candidate') {
          const pc = pcRef.current;
          if (pc?.remoteDescription) {
            try {
              await pc.addIceCandidate(new RTCIceCandidate(msg.payload));
            } catch {}
          } else {
            iceQueue.current.push(msg.payload);
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

  // ─── Subscribe to signaling on mount ─────────────────────
  useEffect(() => {
    if (!roomId) return;
    mountedRef.current = true;
    setCallStatus('connecting');

    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY || 'app-key', {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || 'us2',
    });

    const channel = pusher.subscribe(`call-${roomId}`);
    channel.bind('signal', (data: any) => {
      if (data.role === myRole) return;
      handleSignal(data);
    });

    pusher.connection.bind('connected', () => {
      if (mountedRef.current) setCallStatus('ready');
    });

    return () => {
      mountedRef.current = false;
      channel.unbind_all();
      channel.unsubscribe();
      pusher.disconnect();
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
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
      localStreamRef.current = stream;
      setLocalStream(stream);

      const pc = makePeerConnection();
      stream.getTracks().forEach((t) => pc.addTrack(t, stream));

      send('join');

      if (isAdmin) {
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        send('offer', offer);
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

  const statusText: Record<CallStatus, string> = {
    idle: 'Initializing...',
    connecting: 'Connecting to Pusher Edge...',
    ready: 'Ready. Press to join.',
    ringing: isAdmin ? 'Ringing visitor...' : 'Waiting for admin...',
    active: 'Connected securely.',
    ended: 'Call ended.',
    error: 'Connection error. Check devices.',
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
  };
}
