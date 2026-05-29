import React, { useState, useRef, useEffect } from 'react';
import { useOSStore } from '@/store/useOSStore';

export default function TerminalApp() {
  const currentUser = useOSStore(s => s.currentUser) || 'guest';
  const [history, setHistory] = useState([
    { type: 'system', text: `WebOS Kernel v2.0.1 initialized for [${currentUser}].` },
    { type: 'system', text: 'Type "help" for a list of available commands.' }
  ]);
  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  const handleCommand = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && input.trim()) {
      const cmd = input.trim().toLowerCase();
      const newHistory = [...history, { type: 'user', text: `${currentUser}@WebOS:~$ ${input}` }];
      
      if (cmd === 'help') {
        newHistory.push({ type: 'system', text: 'Available commands: help, clear, whoami, date, sudo' });
      } else if (cmd === 'clear') {
        setHistory([]);
        setInput('');
        return;
      } else if (cmd === 'whoami') {
        newHistory.push({ type: 'system', text: `Current active profile: ${currentUser}` });
      } else if (cmd === 'sudo') {
        newHistory.push({ type: 'system', text: 'Access denied: This incident will be reported.' });
      } else if (cmd === 'date') {
        newHistory.push({ type: 'system', text: new Date().toString() });
      } else {
        newHistory.push({ type: 'system', text: `Command not found: ${cmd}` });
      }
      
      setHistory(newHistory);
      setInput('');
    }
  };

  return (
    <div className="w-full h-full bg-black/90 text-os-accent font-mono p-4 text-sm overflow-hidden flex flex-col select-none">
      <div className="flex-1 overflow-y-auto flex flex-col gap-1 pb-4">
        {history.map((line, i) => (
          <div key={i} className={line.type === 'user' ? 'text-white' : 'text-os-accent/80'}>
            {line.text}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      <div className="flex items-center gap-2 mt-auto pt-2 border-t border-os-border/30">
        <span className="text-white font-bold">{currentUser}@WebOS:~$</span>
        <input 
          type="text" 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleCommand}
          className="flex-1 bg-transparent outline-none border-none text-os-accent shadow-none"
          autoFocus
          spellCheck={false}
          autoComplete="off"
        />
      </div>
    </div>
  );
}
