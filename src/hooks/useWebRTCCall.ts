/**
 * useWebRTCCall — Peer-to-peer voice call hook (100% serverless)
 *
 * Signaling: ntfy.sh over HTTPS/SSE (standard port 443 — impossible to block)
 * Media:     Native WebRTC with STUN (Google + Twilio)
 *
 * States:  idle → connecting → ready → ringing → active → ended | error
 */
import { useEffect, useRef, useState, useCallback } from 'react';

// ─── Types ───────────────────────────────────────────────────
type CallStatus = 'idle' | 'connecting' | 'ready' | 'ringing' | 'active' | 'ended' | 'error';

// ─── ICE Servers ─────────────────────────────────────────────
const ICE_SERVERS: RTCIceServer[] = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
  { urls: 'stun:global.stun.twilio.com:3478' },
];

// ─── ntfy.sh signaling helpers ───────────────────────────────
// Each side publishes to the OTHER side's topic and listens on its OWN topic.
// This uses standard HTTPS (port 443) so it cannot be blocked by ISPs.

function makeTopic(roomId: string, role: 'admin' | 'visitor') {
  // Create a unique topic name to avoid collisions
  return `webos-rtc-${roomId.slice(0, 12)}-${role}`;
}

async function ntfyPublish(topic: string, data: object) {
  try {
    await fetch(`https://ntfy.sh/${topic}`, {
      method: 'POST',
      body: JSON.stringify(data),
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.warn('[Signal] Publish failed:', err);
  }
}

function ntfySubscribe(
  topic: string,
  onMessage: (data: any) => void,
  onError?: () => void
): () => void {
  // Use Server-Sent Events (EventSource) — plain HTTPS, zero chance of being blocked
  const url = `https://ntfy.sh/${topic}/sse`;
  const es = new EventSource(url);

  es.onmessage = (event) => {
    try {
      // ntfy wraps the message in a JSON envelope
      const envelope = JSON.parse(event.data);
      if (envelope.message) {
        const data = JSON.parse(envelope.message);
        onMessage(data);
      }
    } catch {}
  };

  es.onerror = () => {
    onError?.();
  };

  return () => es.close();
}

// ═══════════════════════════════════════════════════════════════
export function useWebRTCCall(roomId: string, isAdmin: boolean) {
  const [callStatus, setCallStatus] = useState<CallStatus>('idle');
  const [connected, setConnected] = useState(false);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);

  const localStreamRef = useRef<MediaStream | null>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const mountedRef = useRef(true);
  const iceQueue = useRef<RTCIceCandidateInit[]>([]);
  const unsubRef = useRef<(() => void) | null>(null);

  const myRole = isAdmin ? 'admin' : 'visitor';
  const peerRole = isAdmin ? 'visitor' : 'admin';
  const myTopic = makeTopic(roomId, myRole as any);
  const peerTopic = makeTopic(roomId, peerRole as any);

  // ─── Send signal to peer ─────────────────────────────────
  const send = useCallback((type: string, payload?: any) => {
    ntfyPublish(peerTopic, { type, payload });
  }, [peerTopic]);

  // ─── Cleanup WebRTC ──────────────────────────────────────
  const cleanupRTC = useCallback(() => {
    pcRef.current?.close();
    pcRef.current = null;
    localStreamRef.current?.getTracks().forEach(t => t.stop());
    localStreamRef.current = null;
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
      try { await pc.addIceCandidate(new RTCIceCandidate(c)); } catch {}
    }
    iceQueue.current = [];
  }, []);

  // ─── Handle signaling message ────────────────────────────
  const handleSignal = useCallback(async (msg: { type: string; payload?: any }) => {
    if (!mountedRef.current) return;

    try {
      if (msg.type === 'join') {
        // Peer joined — if we are admin and already ringing, send offer
        const pc = pcRef.current;
        if (pc && isAdmin) {
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          send('offer', offer);
        }
      }

      else if (msg.type === 'offer') {
        // Got an offer — get mic if needed, then answer
        if (!localStreamRef.current) {
          try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
            localStreamRef.current = stream;
          } catch {
            setCallStatus('error');
            return;
          }
        }
        const pc = pcRef.current || makePeerConnection();
        // Add local tracks
        localStreamRef.current!.getTracks().forEach(t => {
          if (!pc.getSenders().find(s => s.track === t)) {
            pc.addTrack(t, localStreamRef.current!);
          }
        });
        await pc.setRemoteDescription(new RTCSessionDescription(msg.payload));
        await drainIce();
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        send('answer', answer);
        setCallStatus('ringing');
      }

      else if (msg.type === 'answer') {
        const pc = pcRef.current;
        if (pc && pc.signalingState === 'have-local-offer') {
          await pc.setRemoteDescription(new RTCSessionDescription(msg.payload));
          await drainIce();
        }
      }

      else if (msg.type === 'candidate') {
        const pc = pcRef.current;
        if (pc?.remoteDescription) {
          try { await pc.addIceCandidate(new RTCIceCandidate(msg.payload)); } catch {}
        } else {
          iceQueue.current.push(msg.payload);
        }
      }

      else if (msg.type === 'leave') {
        cleanupRTC();
        setConnected(false);
        setRemoteStream(null);
        setCallStatus('ended');
      }
    } catch (err) {
      console.error('[WebRTC] Signal error:', err);
    }
  }, [isAdmin, makePeerConnection, drainIce, send, cleanupRTC]);

  // ─── Subscribe to signaling on mount ─────────────────────
  useEffect(() => {
    if (!roomId) return;
    mountedRef.current = true;
    setCallStatus('connecting');

    // Subscribe to our own topic (listen for messages from peer)
    const unsub = ntfySubscribe(
      myTopic,
      (data) => handleSignal(data),
      () => {
        // SSE error — but it auto-reconnects, so just log
        console.warn('[Signal] SSE reconnecting...');
      }
    );
    unsubRef.current = unsub;

    // Give SSE a moment to connect, then mark as ready
    const timer = setTimeout(() => {
      if (mountedRef.current) setCallStatus('ready');
    }, 1500);

    return () => {
      clearTimeout(timer);
      mountedRef.current = false;
      unsub();
      unsubRef.current = null;
      cleanupRTC();
    };
  }, [roomId]); // eslint-disable-line react-hooks/exhaustive-deps

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

      const pc = makePeerConnection();
      stream.getTracks().forEach(t => pc.addTrack(t, stream));

      // Tell the peer we're here
      send('join');

      // Admin always initiates the offer
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

  // ─── Status text ─────────────────────────────────────────
  const statusText: Record<CallStatus, string> = {
    idle: 'Initializing...',
    connecting: 'Connecting...',
    ready: 'Ready. Press to join.',
    ringing: isAdmin ? 'Ringing visitor...' : 'Waiting for admin...',
    active: 'Connected securely.',
    ended: 'Call ended.',
    error: 'Connection error. Try refreshing.',
  };

  return {
    status: statusText[callStatus],
    callStatus,
    connected,
    isReady: callStatus === 'ready',
    isWaiting: callStatus === 'ringing',
    remoteStream,
    joinCall,
    endCall,
    toggleMic,
  };
}
