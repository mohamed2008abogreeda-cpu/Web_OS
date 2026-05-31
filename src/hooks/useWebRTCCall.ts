/**
 * useWebRTCCall — Cloudflare Calls SFU voice & video call hook (Native Durable Object WebSocket Signaling)
 *
 * Media:     Cloudflare Calls SFU (Anycast Routing)
 * Signaling: Durable Object WebSockets for session metadata exchange
 */
import { useEffect, useRef, useState, useCallback } from 'react';
import { useOSStore } from '@/store/useOSStore';

type CallStatus = 'idle' | 'connecting' | 'ready' | 'ringing' | 'active' | 'ended' | 'error';

export function useWebRTCCall(roomId: string, isAdmin: boolean) {
  const [callStatus, setCallStatus] = useState<CallStatus>('idle');
  const [connected, setConnected] = useState(false);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  
  const chatMessages = useOSStore((s) => s.chatMessages);
  const addChatMessage = useOSStore((s) => s.addChatMessage);
  const clearChat = useOSStore((s) => s.clearChat);

  const localStreamRef = useRef<MediaStream | null>(null);
  const remoteStreamRef = useRef<MediaStream | null>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const mountedRef = useRef(true);
  const socketRef = useRef<WebSocket | null>(null);

  const sessionIdRef = useRef<string | null>(null);
  const myRole = isAdmin ? 'admin' : 'visitor';

  // Keep track of the remote peer's details once received via signaling
  const remoteSessionIdRef = useRef<string | null>(null);
  const remoteAudioTrackNameRef = useRef<string | null>(null);
  const remoteVideoTrackNameRef = useRef<string | null>(null);

  // Helper: send DO WebSocket signals to peers in the same room
  const send = useCallback((type: string, payload?: unknown) => {
    const socket = socketRef.current;
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({
        type: 'signal',
        role: myRole,
        signalType: type,
        payload
      }));
    }
  }, [myRole]);

  // Cleanup WebRTC and Media Tracks
  const cleanupRTC = useCallback(() => {
    pcRef.current?.close();
    pcRef.current = null;
    localStreamRef.current?.getTracks().forEach((t) => t.stop());
    localStreamRef.current = null;
    setLocalStream(null);
    remoteStreamRef.current = null;
    setRemoteStream(null);
    sessionIdRef.current = null;
    remoteSessionIdRef.current = null;
    remoteAudioTrackNameRef.current = null;
    remoteVideoTrackNameRef.current = null;
  }, []);

  // Securely call Next.js Cloudflare Calls API reverse proxy
  const callAPI = async (action: string, payload: Record<string, any>) => {
    const res = await fetch('/api/call/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, ...payload }),
    });
    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Cloudflare Calls API relayer error: ${errText}`);
    }
    return res.json();
  };

  // Push local track to Cloudflare Calls SFU
  const pushLocalTrack = async (pc: RTCPeerConnection, track: MediaStreamTrack, stream: MediaStream, trackName: string) => {
    pc.addTrack(track, stream);
    
    // Create new offer negotiating the new track
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);

    const sender = pc.getSenders().find(s => s.track === track);
    const transceiver = pc.getTransceivers().find(t => t.sender === sender);
    const mid = transceiver?.mid || '';

    // Call relayer API to add the track to the session
    const data = await callAPI('addTrack', {
      sessionId: sessionIdRef.current,
      offerSdp: offer.sdp,
      trackName,
      mid,
    });

    // Set the Answer from Cloudflare
    await pc.setRemoteDescription(new RTCSessionDescription({
      type: 'answer',
      sdp: data.sessionDescription.sdp,
    }));
  };

  // Pull remote track from Cloudflare Calls SFU
  const pullRemoteTrack = useCallback(async (remoteSessionId: string, trackName: string, kind: 'audio' | 'video') => {
    const pc = pcRef.current;
    if (!pc || !sessionIdRef.current) return;

    // Add a receive-only transceiver to prepare for the remote track
    pc.addTransceiver(kind, { direction: 'recvonly' });

    // Create a new offer negotiating the subscription to the remote track
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);

    // Call relayer API to pull the track into our session
    const data = await callAPI('pullTrack', {
      sessionId: sessionIdRef.current,
      offerSdp: offer.sdp,
      remoteSessionId,
      trackName,
    });

    // Set the Answer from Cloudflare
    await pc.setRemoteDescription(new RTCSessionDescription({
      type: 'answer',
      sdp: data.sessionDescription.sdp,
    }));
  }, []);

  // Handle incoming DO WebSocket signals (e.g. metadata about remote publisher)
  const handleSignal = useCallback(
    async (msg: { role: string; type: string; payload?: any }) => {
      if (!mountedRef.current) return;

      try {
        if (msg.type === 'join' || msg.type === 'update-tracks') {
          const { sessionId: remoteSessionId, audioTrackName, videoTrackName } = msg.payload;
          if (!remoteSessionId) return;

          remoteSessionIdRef.current = remoteSessionId;
          
          if (audioTrackName) {
            remoteAudioTrackNameRef.current = audioTrackName;
            await pullRemoteTrack(remoteSessionId, audioTrackName, 'audio');
          }
          if (videoTrackName) {
            remoteVideoTrackNameRef.current = videoTrackName;
            await pullRemoteTrack(remoteSessionId, videoTrackName, 'video');
          }

          setCallStatus('active');
          setConnected(true);
        } else if (msg.type === 'leave') {
          cleanupRTC();
          setConnected(false);
          setRemoteStream(null);
          setCallStatus('ended');
        }
      } catch (err) {
        console.error('[Cloudflare Calls SFU] Signal error:', err);
      }
    },
    [pullRemoteTrack, cleanupRTC]
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
      addChatMessage(chatMsg);
    }
  }, [myRole]);

  // Subscribe to room DO WebSockets signaling on mount
  useEffect(() => {
    if (!roomId) return;
    mountedRef.current = true;
    setCallStatus('connecting');

    let retryCount = 0;
    let isCleanup = false;

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
        retryCount = 0; // Reset retryCount on successful connection
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'signal') {
            if (data.role === myRole) return;
            handleSignal({
              role: data.role,
              type: data.signalType,
              payload: data.payload
            });
          } else if (data.type === 'CHAT_MESSAGE') {
            if (data.payload && data.payload.sender !== myRole) {
              addChatMessage(data.payload);
            }
          }
        } catch (err) {
          console.warn('[WebRTCCall WS] Message parsing failed:', err);
        }
      };

      ws.onclose = () => {
        if (isCleanup) return;

        // Thundering Herd Prevention: Jittered Exponential Backoff
        const backoff = Math.min(1000 * (2 ** retryCount), 10000);
        const jitter = Math.floor(Math.random() * 500);
        const totalDelay = backoff + jitter;

        console.log(`[WebRTCCall WS] Disconnected. Reconnecting in ${totalDelay}ms (retryCount: ${retryCount})...`);
        setTimeout(connect, totalDelay);
        retryCount++;
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

  // Join the Call (Initiate session and publish stream to Cloudflare Calls SFU)
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

      // Establish PeerConnection to Cloudflare
      const pc = new RTCPeerConnection({
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
      });

      pc.ontrack = (e) => {
        if (!mountedRef.current) return;
        console.log('[Cloudflare Calls SFU] Remote track received:', e.track.kind, e.track.id);

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

      // 1. Create session with Cloudflare Calls
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      const sessionData = await callAPI('createSession', { offerSdp: offer.sdp });
      sessionIdRef.current = sessionData.sessionId;

      await pc.setRemoteDescription(new RTCSessionDescription({
        type: 'answer',
        sdp: sessionData.sessionDescription.sdp,
      }));

      // 2. Publish local microphone track
      const audioTrackName = `audio-${myRole}-${Date.now()}`;
      await pushLocalTrack(pc, stream.getAudioTracks()[0], stream, audioTrackName);

      // 3. Broadcast join signaling including sessionId and track names
      send('join', {
        sessionId: sessionData.sessionId,
        audioTrackName,
      });

      // If the other peer has already joined, ask them to update or renegotiate
      if (!isAdmin) {
        send('update-tracks', {
          sessionId: sessionData.sessionId,
          audioTrackName,
        });
      }
    } catch (err) {
      console.error('[Cloudflare Calls SFU] Join error:', err);
      setCallStatus('error');
    }
  }, [myRole, send, isAdmin]);

  // End the Call
  const endCall = useCallback(() => {
    send('leave');
    cleanupRTC();
    setConnected(false);
    setRemoteStream(null);
    setCallStatus('ended');
  }, [send, cleanupRTC]);

  // Toggle Microphone
  const toggleMic = useCallback((): boolean => {
    const track = localStreamRef.current?.getAudioTracks()[0];
    if (track) {
      track.enabled = !track.enabled;
      return track.enabled;
    }
    return false;
  }, []);

  // Toggle Video (Camera stream)
  const toggleVideo = useCallback(async (): Promise<boolean> => {
    const pc = pcRef.current;
    const stream = localStreamRef.current;
    if (!stream || !pc || !sessionIdRef.current) return false;

    let videoTrack = stream.getVideoTracks()[0];

    if (!videoTrack) {
      try {
        console.log('[Cloudflare Calls SFU] Upgrading stream to include camera on-demand...');
        
        const oldAudioTrack = stream.getAudioTracks()[0];
        if (oldAudioTrack) {
          oldAudioTrack.stop();
        }

        const unifiedStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
        localStreamRef.current = unifiedStream;
        setLocalStream(unifiedStream);

        // Update audio sender track
        const newAudioTrack = unifiedStream.getAudioTracks()[0];
        const audioSender = pc.getSenders().find(s => s.track?.kind === 'audio');
        if (audioSender && newAudioTrack) {
          await audioSender.replaceTrack(newAudioTrack);
        }

        const newVideoTrack = unifiedStream.getVideoTracks()[0];
        if (newVideoTrack) {
          const videoTrackName = `video-${myRole}-${Date.now()}`;
          await pushLocalTrack(pc, newVideoTrack, unifiedStream, videoTrackName);

          // Broadcast metadata update containing the video track
          send('update-tracks', {
            sessionId: sessionIdRef.current,
            audioTrackName: pc.getSenders().find(s => s.track?.kind === 'audio')?.track?.id || '',
            videoTrackName,
          });
        }
        return true;
      } catch (e) {
        console.error('[Cloudflare Calls SFU] Failed to upgrade stream for camera on-demand:', e);
        return false;
      }
    } else {
      videoTrack.enabled = !videoTrack.enabled;
      return videoTrack.enabled;
    }
  }, [myRole, send]);

  // Connection Timeout Guard
  useEffect(() => {
    if (callStatus === 'ringing' && !connected) {
      const timeoutMs = isAdmin ? 15000 : 60000;
      const timer = setTimeout(() => {
        if (mountedRef.current && !connected) {
          console.warn('[Cloudflare Calls SFU] Connection timed out.');
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
    active: 'Connected securely via SFU.',
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
    messages: chatMessages,
    sendChatMessage
  };
}
