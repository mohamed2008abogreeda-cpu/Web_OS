'use client';
import React, { useState, useEffect, useRef } from 'react';

export default function LinuxTerminal() {
  const [history, setHistory] = useState<string[]>([
    'Linux kali 6.1.0-kali5-amd64 #1 SMP PREEMPT_DYNAMIC Kali 6.1.12-1 (2023-03-02) x86_64',
    'The programs included with the Kali GNU/Linux system are free software.',
    'System Diagnostics: OK',
    'Kernel modules loaded: 142',
    ' '
  ]);
  const [input, setInput] = useState('');
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && input.trim()) {
      setHistory([...history, `root@kali:~# ${input}`, `bash: ${input}: command not found`]);
      setInput('');
    }
  };

  return (
    <div 
      className="w-full h-full bg-[#0c0c0c] text-[#00ff00] font-mono text-[13px] p-4 overflow-y-auto selection:bg-[#00ff00] selection:text-black cursor-text"
      onClick={() => document.getElementById('linux-term-input')?.focus()}
    >
      <div className="flex flex-col gap-1">
        {history.map((line, idx) => (
          <div key={idx} className="whitespace-pre-wrap break-all">
            {line.startsWith('root@kali:~#') ? (
              <span>
                <span className="text-red-500 font-bold">root</span>
                <span className="text-white">@kali</span>
                <span className="text-cyan-400 font-bold">:~#</span>
                <span className="text-white ml-2">{line.slice(12)}</span>
              </span>
            ) : (
              <span>{line}</span>
            )}
          </div>
        ))}
      </div>
      <div className="flex items-center gap-2 mt-1">
        <span>
          <span className="text-red-500 font-bold">root</span>
          <span className="text-white">@kali</span>
          <span className="text-cyan-400 font-bold">:~#</span>
        </span>
        <input
          id="linux-term-input"
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1 bg-transparent text-white outline-none caret-white"
          autoComplete="off"
          spellCheck="false"
          autoFocus
        />
      </div>
      <div ref={endRef} />
    </div>
  );
}
