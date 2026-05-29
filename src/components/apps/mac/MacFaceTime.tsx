'use client';
import React, { useState } from 'react';
import { Video, Phone, MicOff, PhoneOff, User, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function MacFaceTime() {
  const [isRinging, setIsRinging] = useState(false);

  const handleCall = async () => {
    setIsRinging(true);
    try {
      await fetch('/api/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: 'Incoming FaceTime Call from WebOS Portfolio!' })
      });
      setTimeout(() => setIsRinging(false), 5000);
    } catch (e) {
      setIsRinging(false);
    }
  };

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
          {!isRinging ? (
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
                  className="w-16 h-16 rounded-full bg-emerald-500 hover:bg-emerald-400 flex items-center justify-center shadow-lg transition-all hover:scale-105 active:scale-95"
                >
                  <Video className="w-7 h-7 text-white" fill="currentColor" />
                </button>
                <button className="w-16 h-16 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md flex items-center justify-center shadow-lg transition-all hover:scale-105 active:scale-95">
                  <Phone className="w-7 h-7 text-white" fill="currentColor" />
                </button>
              </div>
            </motion.div>
          ) : (
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
                <button className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
                  <MicOff className="w-5 h-5 text-white" />
                </button>
                <button 
                  className="w-14 h-14 rounded-full bg-red-500 hover:bg-red-400 flex items-center justify-center shadow-lg transition-transform hover:scale-105 active:scale-95"
                >
                  <PhoneOff className="w-6 h-6 text-white" fill="currentColor" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
