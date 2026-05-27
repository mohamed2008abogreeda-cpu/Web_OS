'use client';
// ============================================================
// MusicApp — Interactive "new playing" tracklist & media player
// ============================================================
import { useState, useEffect } from 'react';
import { Play, Pause, SkipForward, SkipBack, Volume2 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Track {
  id: number;
  title: string;
  artist: string;
  duration: string;
}

const STILL_WOOZY_TRACKS: Track[] = [
  { id: 1, title: 'Kenny', artist: 'Still Woozy', duration: '3:14' },
  { id: 2, title: 'Get Down', artist: 'Still Woozy', duration: '2:51' },
  { id: 3, title: 'All Along', artist: 'Still Woozy', duration: '2:36' },
  { id: 4, title: 'WTF', artist: 'Still Woozy', duration: '3:13' },
  { id: 5, title: 'These Days', artist: 'Still Woozy', duration: '2:23' },
  { id: 6, title: 'Kenny', artist: 'Still Woozy', duration: '3:14' },
  { id: 7, title: 'Rocky', artist: 'Still Woozy', duration: '2:45' },
  { id: 8, title: 'BS', artist: 'Still Woozy', duration: '2:13' },
  { id: 9, title: 'Window', artist: 'Still Woozy', duration: '2:19' },
  { id: 10, title: 'Habit', artist: 'Still Woozy', duration: '2:32' },
];

export default function MusicApp({ windowId }: { windowId: string }) {
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(38);
  const [volume, setVolume] = useState(75);

  const currentTrack = STILL_WOOZY_TRACKS[currentTrackIndex];

  // Simulating time progress
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        setProgress((p) => (p >= 100 ? 0 : p + 1));
      }, 1200);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  const handleTrackSelect = (index: number) => {
    setCurrentTrackIndex(index);
    setIsPlaying(true);
    setProgress(0);
  };

  const handleNext = () => {
    setCurrentTrackIndex((prev) => (prev + 1) % STILL_WOOZY_TRACKS.length);
    setProgress(0);
  };

  const handlePrev = () => {
    setCurrentTrackIndex((prev) => (prev - 1 + STILL_WOOZY_TRACKS.length) % STILL_WOOZY_TRACKS.length);
    setProgress(0);
  };

  return (
    <div className="flex flex-col h-full bg-[#fdf2f8]/70 backdrop-blur-2xl font-sans select-none overflow-hidden">
      {/* Scrollable Tracklist */}
      <ScrollArea className="flex-1 w-full">
        <div className="p-4 flex flex-col gap-1.5">
          {STILL_WOOZY_TRACKS.map((track, index) => {
            const isCurrent = index === currentTrackIndex;
            return (
              <button
                key={`${track.id}-${index}`}
                onClick={() => handleTrackSelect(index)}
                className={`w-full flex items-center justify-between p-2.5 rounded-2xl border transition-all duration-200 text-left cursor-pointer
                  ${isCurrent
                    ? 'bg-purple-100/60 border-purple-300/40 text-purple-700 shadow-sm scale-[1.01]'
                    : 'bg-white/40 border-transparent hover:bg-white/80 hover:border-slate-200/30 text-slate-700 hover:text-slate-900'
                  }`}
              >
                <div className="flex items-center gap-3">
                  {/* Avatar/Thumbnail wrapper */}
                  <div className={`w-9 h-9 rounded-xl overflow-hidden shrink-0 border border-white bg-slate-100 flex items-center justify-center relative
                    ${isCurrent && isPlaying ? 'animate-spin' : ''}`}
                    style={{ animationDuration: '8s' }}
                  >
                    <img src="/wallpaper.jpg" alt="Track Art" className="w-full h-full object-cover" />
                    {isCurrent && (
                      <div className="absolute inset-0 bg-purple-500/20 flex items-center justify-center">
                        {isPlaying ? <Pause className="w-4 h-4 text-white" /> : <Play className="w-4 h-4 text-white" fill="white" />}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-extrabold truncate">{track.title}</span>
                    <span className="text-[10px] text-slate-400 font-semibold">{track.artist}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-400 font-mono font-bold">{track.duration}</span>
                </div>
              </button>
            );
          })}
        </div>
      </ScrollArea>

      {/* Control Player Deck */}
      <div className="p-4 bg-white/70 border-t border-white/60 flex flex-col gap-3.5 shrink-0 shadow-lg">
        <div className="flex items-center gap-3.5">
          <div className={`w-11 h-11 rounded-2xl overflow-hidden shrink-0 border-2 border-white shadow-md bg-slate-100 flex items-center justify-center
            ${isPlaying ? 'animate-spin' : ''}`}
            style={{ animationDuration: '10s' }}
          >
            <img src="/wallpaper.jpg" alt="Playing Art" className="w-full h-full object-cover" />
          </div>
          <div className="flex-1 min-w-0 flex flex-col">
            <span className="text-xs font-extrabold text-slate-800 truncate">{currentTrack.title}</span>
            <span className="text-[10px] font-bold text-indigo-500 mt-0.5">{currentTrack.artist}</span>
          </div>
        </div>

        {/* Playback timeline slider */}
        <div className="flex flex-col gap-1">
          <div className="w-full bg-slate-200/80 h-1.5 rounded-full overflow-hidden relative">
            <div className="bg-purple-600 h-full rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
          </div>
          <div className="flex justify-between text-[8px] font-bold font-mono text-slate-400">
            <span>0:00</span>
            <span>{currentTrack.duration}</span>
          </div>
        </div>

        {/* Row Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-slate-500">
            <button onClick={handlePrev} className="hover:text-purple-600 active:scale-90 transition-colors cursor-pointer">
              <SkipBack className="w-4.5 h-4.5" />
            </button>
            <button onClick={() => setIsPlaying(!isPlaying)} className="hover:text-purple-600 active:scale-90 transition-all cursor-pointer bg-white p-2.5 rounded-2xl border border-slate-200/30 shadow-md text-slate-800">
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" fill="currentColor" />}
            </button>
            <button onClick={handleNext} className="hover:text-purple-600 active:scale-90 transition-colors cursor-pointer">
              <SkipForward className="w-4.5 h-4.5" />
            </button>
          </div>

          {/* Volume Control */}
          <div className="flex items-center gap-2 text-slate-400">
            <Volume2 className="w-4 h-4 text-slate-500" />
            <input
              type="range"
              min="0"
              max="100"
              value={volume}
              onChange={(e) => setVolume(parseInt(e.target.value))}
              className="w-16 bg-transparent h-1 rounded-full appearance-none cursor-pointer focus:outline-none"
              style={{
                accentColor: '#9333ea',
                background: `linear-gradient(to right, #9333ea 0%, #9333ea ${volume}%, rgba(0,0,0,0.06) ${volume}%, rgba(0,0,0,0.06) 100%)`,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
