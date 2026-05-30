'use client';
import React, { useState, useEffect, useRef } from 'react';
import { Phone, Video, Users, Search, MoreHorizontal, PhoneOff, MicOff, Mic, VideoOff } from 'lucide-react';
import { useWebRTCCall } from '@/hooks/useWebRTCCall';

export default function WinTeams() {
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
        console.warn('[Teams] Autoplay blocked for audio stream, waiting for user interaction:', err);
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
          caller: 'Team (Teams)',
          environment: 'Windows 11',
          roomId
        }),
        signal: controller.signal
      });
      clearTimeout(timeoutId);
    } catch (e) {
      clearTimeout(timeoutId);
      console.warn('[Teams] Signaling alert failed:', e);
    }
  };

  const showVideo = connected || callStatus === 'active';
  const isRinging = activeRoomId && !showVideo && callStatus !== 'error';

  return (
    <div className="flex w-full h-full bg-[#f5f5f5] text-[#242424] font-sans select-none overflow-hidden rounded-lg border border-[#e0e0e0] shadow-2xl relative">
      
      {/* App Bar (Leftmost narrow strip) */}
      <div className="w-14 bg-[#ebebeb] flex flex-col items-center py-4 gap-6 border-r border-[#e0e0e0] z-10">
        <div className="w-8 h-8 rounded bg-[#5b5fc7] flex items-center justify-center text-white font-bold text-xs">TW</div>
        <div className="flex flex-col gap-6 w-full items-center text-[#616161]">
          <button className="flex flex-col items-center gap-1 hover:text-[#5b5fc7] cursor-pointer"><Users className="w-5 h-5" /></button>
          <button className="flex flex-col items-center gap-1 text-[#5b5fc7] border-l-2 border-[#5b5fc7] w-full cursor-pointer"><Phone className="w-5 h-5" /></button>
          <button className="flex flex-col items-center gap-1 hover:text-[#5b5fc7] cursor-pointer"><MoreHorizontal className="w-5 h-5" /></button>
        </div>
      </div>

      {/* Main Container */}
      <div className="flex-1 flex flex-col bg-white z-10 relative">
        
        {/* Header */}
        <div className="h-12 bg-white flex items-center justify-between px-4 border-b border-[#e0e0e0]">
          <h1 className="font-semibold text-[15px]">Calls</h1>
          <div className="flex items-center bg-[#f5f5f5] rounded-md px-2 py-1 border border-[#e0e0e0] w-64">
            <Search className="w-4 h-4 text-[#616161] mr-2" />
            <input type="text" placeholder="Type a name or number" className="bg-transparent border-none outline-none text-sm w-full" />
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 flex overflow-hidden relative">
          
          {/* History List */}
          <div className="w-72 border-r border-[#e0e0e0] flex flex-col overflow-y-auto bg-white">
            <div className="p-4 border-b border-[#e0e0e0]">
              <h2 className="text-xs font-semibold text-[#616161] uppercase">Recent</h2>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-[#f5f5f5] cursor-pointer">
              <div className="w-10 h-10 bg-[#008272] rounded-full flex items-center justify-center text-white font-semibold">WC</div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-[#242424]">WebOS Creator</span>
                <span className="text-xs text-[#616161]">Missed</span>
              </div>
            </div>
          </div>

          {/* Contact Details / Call Area */}
          <div className="flex-1 flex flex-col items-center justify-center bg-[#fafafa] relative">
            
            {showVideo ? (
              <div className="absolute inset-0 z-20 flex flex-col bg-[#1f1f1f] text-white">
                {/* Teams Grid Area */}
                <div className="flex-1 flex gap-4 p-6 items-center justify-center">
                  
                  {/* Remote Participant Box */}
                  <div className="relative w-[45%] aspect-video bg-[#111] border border-[#3d3d3d] rounded-lg overflow-hidden flex items-center justify-center shadow-lg">
                    <video
                      ref={remoteVideoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover scale-x-[-1]"
                    />
                    <div className="absolute bottom-3 left-3 bg-[#242424]/85 backdrop-blur-sm text-white text-xs px-2.5 py-1 rounded border border-white/5 font-semibold">
                      WebOS Creator
                    </div>
                  </div>

                  {/* Local Participant Box */}
                  <div className="relative w-[45%] aspect-video bg-[#111] border border-[#3d3d3d] rounded-lg overflow-hidden flex items-center justify-center shadow-lg">
                    <video
                      ref={localVideoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover scale-x-[-1]"
                    />
                    {videoMuted && (
                      <div className="absolute inset-0 flex items-center justify-center bg-[#111] z-10">
                        <div className="w-16 h-16 rounded-full bg-[#5b5fc7] flex items-center justify-center text-white text-2xl font-bold shadow-md">
                          T
                        </div>
                      </div>
                    )}
                    <div className="absolute bottom-3 left-3 bg-[#242424]/85 backdrop-blur-sm text-white text-xs px-2.5 py-1 rounded border border-white/5 font-semibold">
                      You
                    </div>
                  </div>

                </div>

                {/* Teams Bottom Action Bar Overlay */}
                <div className="h-16 bg-[#292929] border-t border-[#3d3d3d] flex items-center justify-center gap-4 px-6 relative">
                  <button
                    onClick={() => {
                      const enabled = toggleMic();
                      setMicMuted(!enabled);
                    }}
                    className={`w-10 h-10 rounded hover:bg-[#3d3d3d] flex items-center justify-center text-white transition-colors cursor-pointer ${
                      micMuted ? 'text-red-400 bg-red-500/10' : ''
                    }`}
                    title={micMuted ? 'Unmute Microphone' : 'Mute Microphone'}
                  >
                    {micMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                  </button>

                  <button
                    onClick={async () => {
                      const enabled = await toggleVideo();
                      setVideoMuted(!enabled);
                    }}
                    className={`w-10 h-10 rounded hover:bg-[#3d3d3d] flex items-center justify-center text-white transition-colors cursor-pointer ${
                      videoMuted ? 'text-red-400 bg-red-500/10' : ''
                    }`}
                    title={videoMuted ? 'Turn Camera On' : 'Turn Camera Off'}
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
                    className="w-14 h-10 rounded bg-[#c4314b] hover:bg-[#a1283d] flex items-center justify-center text-white transition-all active:scale-95 ml-2 cursor-pointer shadow-md"
                    title="Hang Up Teams Call"
                  >
                    <PhoneOff className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ) : isRinging ? (
              <div className="flex flex-col items-center">
                <p className="text-[#5b5fc7] font-semibold mb-8 animate-pulse">Calling...</p>
                <div className="flex items-center gap-3 bg-[#242424] px-6 py-3 rounded-lg shadow-xl">
                  <button 
                    onClick={() => {
                      endCall();
                      setActiveRoomId('');
                    }}
                    className="w-12 h-10 rounded bg-[#c4314b] hover:bg-[#a1283d] flex items-center justify-center text-white transition-colors cursor-pointer"
                    title="Cancel Call"
                  >
                    <PhoneOff className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ) : callStatus === 'error' ? (
              <div className="flex flex-col items-center p-6 text-center max-w-sm z-20">
                <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mb-6 border border-red-500/30">
                  <PhoneOff className="w-7 h-7 text-red-400" />
                </div>
                <h2 className="text-xl font-semibold mb-2 text-red-400">Connection Failed</h2>
                <p className="text-zinc-500 text-xs mb-8 leading-relaxed">
                  Security handshake timed out. The system operator could not be reached or went offline.
                </p>
                <button
                  onClick={() => {
                    endCall();
                    setActiveRoomId('');
                  }}
                  className="px-6 py-2 rounded bg-[#5b5fc7] hover:bg-[#4f52b2] text-white transition-colors font-semibold text-sm cursor-pointer shadow-sm"
                >
                  Back to Teams
                </button>
              </div>
            ) : (
              <>
                <div className="w-32 h-32 bg-[#008272] rounded-full flex items-center justify-center text-white text-5xl font-semibold mb-6 shadow-sm">
                  WC
                </div>
                <h2 className="text-2xl font-semibold text-[#242424] mb-1">WebOS Creator</h2>
                <p className="text-sm text-[#616161] mb-8">Software Engineer</p>

                <div className="flex items-center gap-4">
                  <button 
                    onClick={handleCall}
                    className="px-6 py-2 bg-[#5b5fc7] hover:bg-[#4f52b2] text-white font-semibold rounded-md shadow-sm transition-colors flex items-center gap-2 cursor-pointer"
                  >
                    <Video className="w-4 h-4" />
                    Video call
                  </button>
                  <button 
                    onClick={handleCall}
                    className="px-6 py-2 bg-white hover:bg-[#f5f5f5] text-[#242424] border border-[#d1d1d1] font-semibold rounded-md shadow-sm transition-colors flex items-center gap-2 cursor-pointer"
                  >
                    <Phone className="w-4 h-4" />
                    Audio call
                  </button>
                </div>
              </>
            )}

          </div>
        </div>
      </div>
      
      {/* Hidden Audio element for remote audio stream to bypass autoplay policy */}
      <audio ref={remoteAudioRef} autoPlay className="hidden" />
    </div>
  );
}
