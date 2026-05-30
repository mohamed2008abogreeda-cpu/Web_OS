'use client';
import React, { useState, useEffect, useRef } from 'react';
import { Video, Phone, MicOff, Mic, PhoneOff, User, Plus, VideoOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWebRTCCall } from '@/hooks/useWebRTCCall';

export default function MacFaceTime() {
  const [activeRoomId, setActiveRoomId] = useState<string>('');
  const [micMuted, setMicMuted] = useState(false);
  const [videoMuted, setVideoMuted] = useState(true);

  const {
    callStatus,
    connected,
    localStream,
    remoteStream,
    joinCall,
    endCall,
    toggleMic,
    toggleVideo,
  } = useWebRTCCall(activeRoomId, false);

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
        console.warn('[FaceTime] Autoplay blocked for audio stream, waiting for user interaction:', err);
      });
    }
  }, [remoteStream]);

  // Automatically request peer-to-peer connection when signaling channel gets ready
  useEffect(() => {
    if (activeRoomId && callStatus === 'ready') {
      joinCall();
    }
  }, [activeRoomId, callStatus, joinCall]);

  const handleCall = async () => {
    if (activeRoomId) return;

    const roomId = crypto.randomUUID();
    setActiveRoomId(roomId);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    try {
      await fetch('/api/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          caller: 'Moamen (FaceTime)',
          environment: 'macOS/Mojave',
          roomId
        }),
        signal: controller.signal
      });
      clearTimeout(timeoutId);
    } catch (e) {
      clearTimeout(timeoutId);
      console.warn('[FaceTime] Signaling alert failed:', e);
    }
  };

  const showVideo = connected || callStatus === 'active';
  const isRinging = activeRoomId && !showVideo && callStatus !== 'error';

  return (
    <div className="w-full h-full bg-black/60 backdrop-blur-3xl text-white font-sans flex overflow-hidden rounded-xl border border-white/20 shadow-2xl select-none relative">
      
      {/* Sidebar */}
      <div className="w-64 bg-white/5 border-r border-white/10 flex flex-col pt-10">
        <div className="px-4 mb-4 flex justify-between items-center">
          <h2 className="text-[13px] font-semibold text-white/80">FaceTime</h2>
          <button className="p-1 rounded-md bg-white/10 hover:bg-white/20 transition-colors">
            <Plus className="w-4 h-4 text-white" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-2">
          <div className="flex items-center gap-3 p-2 rounded-lg bg-white/10 cursor-pointer">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center shadow-inner border border-white/20">
              <User className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-[13px] font-semibold">WebOS Creator</span>
              <span className="text-[11px] text-white/50">FaceTime Video</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main View Area */}
      <div className="flex-1 relative flex flex-col items-center justify-center overflow-hidden">
        
        {/* Background "Camera" blur simulation */}
        <div className="absolute inset-0 bg-gradient-to-tr from-blue-900/40 via-purple-900/40 to-black pointer-events-none" />

        <AnimatePresence mode="wait">
          {showVideo ? (
            <motion.div
              key="active-call"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 w-full h-full z-10 flex flex-col justify-end overflow-hidden"
            >
              {/* Remote Feed (Fullscreen) */}
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                muted
                className="absolute inset-0 w-full h-full object-cover filter brightness-105 contrast-95 scale-x-[-1]"
              />

              {/* Local Feed (PIP floating in top-right) */}
              <div className="absolute top-4 right-4 w-32 h-44 rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/20 z-30 transition-all hover:scale-105 bg-black/80">
                <video
                  ref={localVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover scale-x-[-1]"
                />
                {videoMuted && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-10">
                    <VideoOff className="w-6 h-6 text-white/50" />
                  </div>
                )}
              </div>

              {/* Glass FaceTime Controls Floating Overlay */}
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white/10 backdrop-blur-2xl px-6 py-3 rounded-full border border-white/25 shadow-2xl flex items-center gap-4 z-30 transition-all">
                <button
                  onClick={() => {
                    const enabled = toggleMic();
                    setMicMuted(!enabled);
                  }}
                  className={`w-12 h-12 rounded-full flex items-center justify-center transition-all hover:scale-110 active:scale-95 cursor-pointer ${
                    micMuted ? 'bg-red-500/80 text-white border border-red-500/50' : 'bg-white/10 hover:bg-white/20 text-white'
                  }`}
                  title="Toggle Microphone"
                >
                  {micMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                </button>

                <button
                  onClick={async () => {
                    const enabled = await toggleVideo();
                    setVideoMuted(!enabled);
                  }}
                  className={`w-12 h-12 rounded-full flex items-center justify-center transition-all hover:scale-110 active:scale-95 cursor-pointer ${
                    videoMuted ? 'bg-red-500/80 text-white border border-red-500/50' : 'bg-white/10 hover:bg-white/20 text-white'
                  }`}
                  title="Toggle Camera"
                >
                  {videoMuted ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
                </button>

                <button
                  onClick={() => {
                    endCall();
                    setActiveRoomId('');
                    setMicMuted(false);
                    setVideoMuted(true);
                  }}
                  className="w-12 h-12 rounded-full bg-red-600 hover:bg-red-500 flex items-center justify-center shadow-lg transition-all hover:scale-110 active:scale-95 text-white cursor-pointer"
                  title="End FaceTime Call"
                >
                  <PhoneOff className="w-5 h-5" fill="currentColor" />
                </button>
              </div>
            </motion.div>
          ) : isRinging ? (
            <motion.div 
              key="calling"
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col items-center z-10"
            >
              <h2 className="text-4xl font-light mb-2">WebOS Creator</h2>
              <p className="text-white/60 text-sm mb-16 animate-pulse">Calling...</p>
              
              <div className="flex items-center gap-6 mt-32 bg-black/40 backdrop-blur-3xl px-8 py-4 rounded-[2rem] border border-white/10 shadow-2xl">
                <button 
                  onClick={() => {
                    endCall();
                    setActiveRoomId('');
                  }}
                  className="w-14 h-14 rounded-full bg-red-500 hover:bg-red-400 flex items-center justify-center shadow-lg transition-transform hover:scale-105 active:scale-95 cursor-pointer"
                >
                  <PhoneOff className="w-6 h-6 text-white" fill="currentColor" />
                </button>
              </div>
            </motion.div>
          ) : callStatus === 'error' ? (
            <motion.div
              key="error-state"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex flex-col items-center z-10 p-6 text-center max-w-sm"
            >
              <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mb-6 border border-red-500/30">
                <PhoneOff className="w-7 h-7 text-red-400" />
              </div>
              <h2 className="text-2xl font-semibold mb-2 text-red-400">Connection Failed</h2>
              <p className="text-white/50 text-xs mb-8 leading-relaxed">
                Security handshake timed out. The system operator could not be reached or went offline.
              </p>
              <button
                onClick={() => {
                  endCall();
                  setActiveRoomId('');
                }}
                className="px-6 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors font-medium text-sm cursor-pointer"
              >
                Back to FaceTime
              </button>
            </motion.div>
          ) : (
            <motion.div 
              key="idle"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col items-center z-10"
            >
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center mb-6 shadow-2xl border-2 border-white/20">
                <User className="w-16 h-16 text-white" />
              </div>
              <h2 className="text-3xl font-semibold mb-2 tracking-tight">WebOS Creator</h2>
              <p className="text-white/50 text-sm mb-12">FaceTime Video</p>

              <div className="flex items-center gap-6">
                <button 
                  onClick={handleCall}
                  className="w-16 h-16 rounded-full bg-emerald-500 hover:bg-emerald-400 flex items-center justify-center shadow-lg transition-all hover:scale-105 active:scale-95 cursor-pointer"
                  title="FaceTime Video Call"
                >
                  <Video className="w-7 h-7 text-white" fill="currentColor" />
                </button>
                <button 
                  onClick={handleCall}
                  className="w-16 h-16 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md flex items-center justify-center shadow-lg transition-all hover:scale-105 active:scale-95 cursor-pointer"
                  title="FaceTime Audio Call"
                >
                  <Phone className="w-7 h-7 text-white" fill="currentColor" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {/* Hidden Audio element for remote audio stream to bypass autoplay policy */}
      <audio ref={remoteAudioRef} autoPlay className="hidden" />
    </div>
  );
}
