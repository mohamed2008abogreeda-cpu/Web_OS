'use client';
import { motion } from 'framer-motion';
import { Cloud, Sun, MoreHorizontal, CheckCircle2, Circle, Calendar as CalendarIcon, ArrowUpRight, ArrowDownRight, Search, Plus } from 'lucide-react';

export default function Win11Widgets() {
  return (
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[60%] w-full max-w-6xl px-8 z-0">
      <div className="flex flex-wrap lg:flex-nowrap items-stretch justify-center gap-4">
        
        {/* Weather Widget */}
        <motion.div 
          className="w-full sm:w-[280px] bg-black/40 backdrop-blur-2xl border border-white/10 rounded-[28px] p-6 shadow-2xl flex flex-col relative overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          {/* Subtle gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-transparent pointer-events-none" />
          
          <div className="flex justify-between items-start relative z-10">
            <div className="flex items-center gap-2 text-white/70">
              <Cloud className="w-4 h-4 text-yellow-400" />
              <span className="text-xs font-medium">Weather</span>
            </div>
            <MoreHorizontal className="w-5 h-5 text-white/50" />
          </div>
          
          <div className="mt-4 relative z-10 flex flex-col items-center">
            <div className="text-white/80 text-sm mb-2">Eskişehir</div>
            <div className="flex items-center gap-4">
              <Sun className="w-12 h-12 text-yellow-400" />
              <div>
                <div className="text-5xl font-light text-white tracking-tighter">24°<span className="text-3xl text-white/60">C</span></div>
              </div>
            </div>
            <div className="text-right w-full text-white/70 text-xs mt-2">
              Partly sunny<br/>💧 2%
            </div>
          </div>
          
          <div className="mt-auto pt-6 flex justify-between text-white/80 text-xs relative z-10">
            <div className="flex flex-col items-center gap-1">
              <span className="text-white/50">Today</span>
              <Cloud className="w-5 h-5 text-gray-300" />
              <span>25°</span>
              <span className="text-white/50">9°</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <span className="text-white/50">Sun</span>
              <Sun className="w-5 h-5 text-yellow-400" />
              <span>22°</span>
              <span className="text-white/50">11°</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <span className="text-white/50">Mon</span>
              <Cloud className="w-5 h-5 text-gray-300" />
              <span>18°</span>
              <span className="text-white/50">7°</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <span className="text-white/50">Tue</span>
              <Sun className="w-5 h-5 text-yellow-400" />
              <span>21°</span>
              <span className="text-white/50">12°</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <span className="text-white/50">Wed</span>
              <Cloud className="w-5 h-5 text-gray-300" />
              <span>17°</span>
              <span className="text-white/50">6°</span>
            </div>
          </div>
          <div className="mt-4 text-center text-xs text-white/50 hover:text-white/80 cursor-pointer transition-colors relative z-10">
            See full forecast
          </div>
        </motion.div>

        {/* Watchlist Widget */}
        <motion.div 
          className="w-full sm:w-[280px] bg-black/40 backdrop-blur-2xl border border-white/10 rounded-[28px] p-6 shadow-2xl flex flex-col relative overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent pointer-events-none" />
          
          <div className="flex justify-between items-start relative z-10 mb-6">
            <div className="flex items-center gap-2 text-white/70">
              <span className="w-4 h-4 flex items-center justify-center">📊</span>
              <span className="text-xs font-medium">Watchlist</span>
            </div>
            <MoreHorizontal className="w-5 h-5 text-white/50" />
          </div>
          
          <div className="flex flex-col gap-5 relative z-10 flex-1">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-white text-sm font-medium">MSFT</div>
                <div className="text-white/50 text-[11px]">Microsoft Corporation</div>
              </div>
              <div className="text-right">
                <div className="text-white text-sm">241.22</div>
                <div className="text-emerald-400 text-xs flex items-center justify-end gap-1">
                  <ArrowUpRight className="w-3 h-3" />
                  +0.46
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-white text-sm font-medium">TSLA</div>
                <div className="text-white/50 text-[11px]">Tesla, Inc.</div>
              </div>
              <div className="text-right">
                <div className="text-white text-sm">180.19</div>
                <div className="text-rose-400 text-xs flex items-center justify-end gap-1">
                  <ArrowDownRight className="w-3 h-3" />
                  -1.63
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-white text-sm font-medium">AAPL</div>
                <div className="text-white/50 text-[11px]">Apple Inc.</div>
              </div>
              <div className="text-right">
                <div className="text-white text-sm">151.29</div>
                <div className="text-rose-400 text-xs flex items-center justify-end gap-1">
                  <ArrowDownRight className="w-3 h-3" />
                  -0.38
                </div>
              </div>
            </div>
          </div>
          
          {/* Mock app row */}
          <div className="mt-6 flex justify-between items-center relative z-10 pt-4 border-t border-white/10">
             {['Edge', 'Photos', 'After Effects', 'Illustrator', 'Photoshop', 'Netflix', 'Disney+'].map((app, i) => (
               <div key={app} className="w-6 h-6 bg-white/10 rounded-md flex items-center justify-center text-[10px] text-white/70 overflow-hidden" title={app}>
                 {app.charAt(0)}
               </div>
             ))}
          </div>
        </motion.div>

        {/* To Do Widget */}
        <motion.div 
          className="w-full sm:w-[280px] bg-black/40 backdrop-blur-2xl border border-white/10 rounded-[28px] p-6 shadow-2xl flex flex-col relative overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent pointer-events-none" />
          
          <div className="flex justify-between items-start relative z-10 mb-6">
            <div className="flex items-center gap-2 text-white/70">
              <CheckCircle2 className="w-4 h-4 text-blue-400" />
              <span className="text-xs font-medium">To Do</span>
            </div>
            <MoreHorizontal className="w-5 h-5 text-white/50" />
          </div>

          <div className="text-white text-sm font-medium flex items-center gap-2 mb-4 relative z-10">
            <Sun className="w-4 h-4 text-white/70" />
            My Day
            <span className="text-white/50 text-xs ml-1">v</span>
          </div>
          
          <div className="flex flex-col gap-3 relative z-10">
            <div className="bg-white/5 hover:bg-white/10 transition-colors rounded-xl p-3 flex items-start gap-3 border border-white/5">
              <Circle className="w-5 h-5 text-white/40 shrink-0 mt-0.5" />
              <div className="flex-1">
                <div className="text-white text-sm">Send invites for review</div>
                <div className="text-white/50 text-xs">Q4 planning</div>
              </div>
              <div className="text-white/30 text-xs">☆</div>
            </div>
            <div className="bg-white/5 hover:bg-white/10 transition-colors rounded-xl p-3 flex items-start gap-3 border border-white/5">
              <Circle className="w-5 h-5 text-white/40 shrink-0 mt-0.5" />
              <div className="flex-1">
                <div className="text-white text-sm">Buy groceries</div>
                <div className="text-white/50 text-xs">Tasks</div>
              </div>
              <div className="text-white/30 text-xs">☆</div>
            </div>
          </div>
        </motion.div>

        {/* Calendar Widget */}
        <motion.div 
          className="w-full sm:w-[280px] bg-black/40 backdrop-blur-2xl border border-white/10 rounded-[28px] p-6 shadow-2xl flex flex-col relative overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent pointer-events-none" />
          
          <div className="flex justify-between items-start relative z-10 mb-6">
            <div className="flex items-center gap-2 text-white/70">
              <CalendarIcon className="w-4 h-4 text-gray-300" />
              <span className="text-xs font-medium">Calendar</span>
            </div>
            <MoreHorizontal className="w-5 h-5 text-white/50" />
          </div>

          <div className="flex justify-between items-center mb-4 relative z-10">
            <div className="text-white text-sm font-medium">November</div>
            <div className="flex items-center gap-3 text-xs text-white/50">
              <span className="bg-blue-500 text-white w-5 h-5 rounded-full flex items-center justify-center">12</span>
              <span>13</span>
              <span>14</span>
              <span>15</span>
              <span>v</span>
            </div>
          </div>
          
          <div className="flex flex-col gap-2 relative z-10 flex-1">
            <div className="flex items-stretch gap-3 group cursor-pointer">
              <div className="w-1 bg-blue-400 rounded-full" />
              <div className="flex-1 py-1">
                <div className="flex justify-between items-start">
                  <div className="text-white text-sm font-medium">Lunch</div>
                  <div className="text-white/60 text-xs text-right">
                    14:00<br/>30 min
                  </div>
                </div>
                <div className="text-white/50 text-xs mt-0.5">Selim Kestel</div>
              </div>
            </div>
            
            <div className="flex items-stretch gap-3 group cursor-pointer mt-2">
              <div className="w-1 bg-purple-400 rounded-full" />
              <div className="flex-1 py-1">
                <div className="flex justify-between items-start">
                  <div className="text-white text-sm font-medium">Team Presentation</div>
                  <div className="text-white/60 text-xs text-right">
                    15:00<br/>1h
                  </div>
                </div>
                <div className="text-white/50 text-xs mt-0.5">Skype meeting</div>
              </div>
            </div>

            <div className="flex items-stretch gap-3 group cursor-pointer mt-2">
              <div className="w-1 bg-emerald-400 rounded-full" />
              <div className="flex-1 py-1">
                <div className="flex justify-between items-start">
                  <div className="text-white text-sm font-medium">Portfolio work session</div>
                  <div className="text-white/60 text-xs text-right">
                    17:00<br/>1h
                  </div>
                </div>
                <div className="text-white/50 text-xs mt-0.5">Skype meeting</div>
              </div>
            </div>
          </div>
          
          <div className="mt-4 flex justify-between items-center pt-4 border-t border-white/10 text-white/50 relative z-10">
            <CalendarIcon className="w-4 h-4 cursor-pointer hover:text-white" />
            <Plus className="w-4 h-4 cursor-pointer hover:text-white" />
            <Search className="w-4 h-4 cursor-pointer hover:text-white" />
          </div>
        </motion.div>

      </div>
    </div>
  );
}
