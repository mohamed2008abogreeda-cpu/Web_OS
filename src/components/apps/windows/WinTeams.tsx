'use client';
import React, { useState } from 'react';
import { Phone, Video, Users, Search, MoreHorizontal, UserSquare2, PhoneOff, MicOff, CameraOff } from 'lucide-react';

export default function WinTeams() {
  const [isRinging, setIsRinging] = useState(false);

  const handleCall = async () => {
    setIsRinging(true);
    try {
      await fetch('/api/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: 'Incoming Teams Call from WebOS Portfolio!' })
      });
      setTimeout(() => setIsRinging(false), 5000);
    } catch (e) {
      setIsRinging(false);
    }
  };

  return (
    <div className="flex w-full h-full bg-[#f5f5f5] text-[#242424] font-sans select-none overflow-hidden rounded-lg border border-[#e0e0e0] shadow-2xl">
      
      {/* App Bar (Leftmost narrow strip) */}
      <div className="w-14 bg-[#ebebeb] flex flex-col items-center py-4 gap-6 border-r border-[#e0e0e0]">
        <div className="w-8 h-8 rounded bg-[#5b5fc7] flex items-center justify-center text-white font-bold text-xs">TW</div>
        <div className="flex flex-col gap-6 w-full items-center text-[#616161]">
          <button className="flex flex-col items-center gap-1 hover:text-[#5b5fc7]"><Users className="w-5 h-5" /></button>
          <button className="flex flex-col items-center gap-1 text-[#5b5fc7] border-l-2 border-[#5b5fc7] w-full"><Phone className="w-5 h-5" /></button>
          <button className="flex flex-col items-center gap-1 hover:text-[#5b5fc7]"><MoreHorizontal className="w-5 h-5" /></button>
        </div>
      </div>

      {/* Main Container */}
      <div className="flex-1 flex flex-col bg-white">
        
        {/* Header */}
        <div className="h-12 bg-white flex items-center justify-between px-4 border-b border-[#e0e0e0]">
          <h1 className="font-semibold text-[15px]">Calls</h1>
          <div className="flex items-center bg-[#f5f5f5] rounded-md px-2 py-1 border border-[#e0e0e0] w-64">
            <Search className="w-4 h-4 text-[#616161] mr-2" />
            <input type="text" placeholder="Type a name or number" className="bg-transparent border-none outline-none text-sm w-full" />
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 flex overflow-hidden">
          
          {/* History List */}
          <div className="w-72 border-r border-[#e0e0e0] flex flex-col overflow-y-auto">
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
          <div className="flex-1 flex flex-col items-center justify-center bg-[#fafafa]">
            
            <div className="w-32 h-32 bg-[#008272] rounded-full flex items-center justify-center text-white text-5xl font-semibold mb-6 shadow-sm">
              WC
            </div>
            <h2 className="text-2xl font-semibold text-[#242424] mb-1">WebOS Creator</h2>
            <p className="text-sm text-[#616161] mb-8">Software Engineer</p>

            {!isRinging ? (
              <div className="flex items-center gap-4">
                <button 
                  onClick={handleCall}
                  className="px-6 py-2 bg-[#5b5fc7] hover:bg-[#4f52b2] text-white font-semibold rounded-md shadow-sm transition-colors flex items-center gap-2"
                >
                  <Video className="w-4 h-4" />
                  Video call
                </button>
                <button 
                  onClick={handleCall}
                  className="px-6 py-2 bg-white hover:bg-[#f5f5f5] text-[#242424] border border-[#d1d1d1] font-semibold rounded-md shadow-sm transition-colors flex items-center gap-2"
                >
                  <Phone className="w-4 h-4" />
                  Audio call
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <p className="text-[#5b5fc7] font-semibold mb-8 animate-pulse">Calling...</p>
                <div className="flex items-center gap-3 bg-[#242424] px-6 py-3 rounded-lg shadow-xl">
                  <button className="w-10 h-10 rounded hover:bg-[#3d3d3d] flex items-center justify-center text-white transition-colors">
                    <CameraOff className="w-5 h-5" />
                  </button>
                  <button className="w-10 h-10 rounded hover:bg-[#3d3d3d] flex items-center justify-center text-white transition-colors">
                    <MicOff className="w-5 h-5" />
                  </button>
                  <button className="w-12 h-10 rounded bg-[#c4314b] hover:bg-[#a1283d] flex items-center justify-center text-white transition-colors ml-2">
                    <PhoneOff className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
