'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useOSStore } from '@/store/useOSStore';
import type { UserName } from '@/types';
import { User, ArrowRight } from 'lucide-react';

const OS_USERS = [
  { id: 'Mohammed', name: 'Mohamed Mahmoud Abo Greada', env: 'Foggy (Linux)' },
  { id: 'Moamen', name: 'Moamen', env: 'Larvil (macOS)' },
  { id: 'Team', name: 'Team', env: 'Windows 11' },
] as const;

export default function LoginScreen() {
  const loginUser = useOSStore(s => s.loginUser);
  const [time, setTime] = useState<Date | null>(null);
  const [selectedUser, setSelectedUser] = useState<typeof OS_USERS[number] | null>(null);
  const [password, setPassword] = useState('');

  useEffect(() => {
    setTime(new Date());
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const handleLogin = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (selectedUser) {
      // In a real app we'd verify the password here.
      // For now, any password works.
      loginUser(selectedUser.id as UserName);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-black text-white select-none overflow-hidden font-sans">
      {/* Blurred Wallpaper */}
      <div 
        className="absolute inset-0 bg-cover bg-center transition-all duration-700"
        style={{ 
          backgroundImage: "url('/wallpapers/lockscreen-rain.jpg')",
          filter: selectedUser ? 'blur(20px) brightness(0.4)' : 'blur(5px) brightness(0.8)',
          transform: selectedUser ? 'scale(1.05)' : 'scale(1)'
        }}
      />

      <div className="relative z-10 w-full h-full flex flex-col items-center justify-between py-24">
        
        {/* Clock & Date (Top) */}
        <motion.div 
          className="flex flex-col items-center drop-shadow-lg"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="text-[6rem] leading-none font-light tracking-tight">
            {time ? time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '00:00'}
          </div>
          <div className="text-xl font-medium mt-2">
            {time ? time.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' }) : 'Loading...'}
          </div>
        </motion.div>

        {/* Users / Login Form (Center-Bottom) */}
        <div className="flex flex-col items-center w-full max-w-md">
          <AnimatePresence mode="wait">
            {!selectedUser ? (
              /* User Selection */
              <motion.div 
                key="user-select"
                className="flex flex-col gap-4 w-full"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
              >
                {OS_USERS.map(user => (
                  <button
                    key={user.id}
                    onClick={() => setSelectedUser(user)}
                    className="flex items-center gap-4 p-4 rounded-xl hover:bg-white/10 transition-colors group cursor-default text-left"
                  >
                    <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center shrink-0 border border-white/10 group-hover:border-white/30 transition-colors overflow-hidden">
                      <User className="w-6 h-6 text-white/80" />
                    </div>
                    <div>
                      <div className="text-xl font-semibold">{user.name}</div>
                      <div className="text-sm text-white/60">{user.env}</div>
                    </div>
                  </button>
                ))}
              </motion.div>
            ) : (
              /* Password Input */
              <motion.div
                key="password-input"
                className="flex flex-col items-center w-full"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <div className="w-24 h-24 rounded-full bg-white/20 flex items-center justify-center mb-6 shadow-xl border border-white/10">
                  <User className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-2xl font-semibold mb-8 text-center">{selectedUser.name}</h2>
                
                <form onSubmit={handleLogin} className="w-full relative">
                  <input
                    type="password"
                    placeholder="PIN or Password"
                    autoFocus
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-black/40 border border-white/20 rounded-lg px-4 py-3 text-lg outline-none focus:border-white/50 focus:bg-black/60 transition-all backdrop-blur-md placeholder:text-white/30"
                  />
                  <button 
                    type="submit"
                    disabled={password.length === 0}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-md bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:hover:bg-white/10 transition-colors"
                  >
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </form>

                <button 
                  onClick={() => { setSelectedUser(null); setPassword(''); }}
                  className="mt-8 text-sm text-white/60 hover:text-white transition-colors"
                >
                  Sign-in options
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Bottom Network/Power Mock icons */}
        <div className="fixed bottom-6 right-8 flex gap-6 text-white/80">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" /></svg>
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
        </div>

      </div>
    </div>
  );
}
