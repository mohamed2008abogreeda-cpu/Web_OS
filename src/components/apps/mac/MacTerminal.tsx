'use client';
import React, { useState, useEffect, useRef } from 'react';

export default function MacTerminal() {
  const [history, setHistory] = useState<string[]>([
    'Last login: ' + new Date().toString().slice(0, 15) + ' on ttys001',
    'Restored session: ' + new Date().toString().slice(0, 24),
    ''
  ]);
  const [input, setInput] = useState('');
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && input.trim()) {
      if (input.trim() === 'neofetch') {
        setHistory([
           ...history,
           `moamen@MacBook-Pro ~ % ${input}`,
           `                    'c.`,
           `                 ,xNMM.`,
           `               .OMMMMo`,
           `               OMMM0,`,
           `     .;loddo:' loolloddol;.`,
           `   cKMMMMMMMMMMNWMMMMMMMMMM0:`,
           ` .KMMMMMMMMMMMMMMMMMMMMMMMWd.`,
           ` XMMMMMMMMMMMMMMMMMMMMMMMX.`,
           `;MMMMMMMMMMMMMMMMMMMMMMMM:`,
           `:MMMMMMMMMMMMMMMMMMMMMMMM:`,
           `.MMMMMMMMMMMMMMMMMMMMMMMMX.`,
           ` kMMMMMMMMMMMMMMMMMMMMMMMMWd.`,
           ` .XMMMMMMMMMMMMMMMMMMMMMMMMMMk`,
           `  .XMMMMMMMMMMMMMMMMMMMMMMMMK.`,
           `    kMMMMMMMMMMMMMMMMMMMMMMd`,
           `      ;KMMMMMMMWXXWMMMMMMMk.`,
           `        .cooc,.    .,coo:.`,
           ''
        ]);
      } else {
        setHistory([...history, `moamen@MacBook-Pro ~ % ${input}`, `zsh: command not found: ${input}`]);
      }
      setInput('');
    }
  };

  return (
    <div 
      className="w-full h-full bg-black/60 backdrop-blur-2xl text-zinc-100 font-mono text-[13px] p-4 overflow-y-auto cursor-text"
      style={{ fontFamily: '"Menlo", "Monaco", "Courier New", monospace' }}
      onClick={() => document.getElementById('mac-term-input')?.focus()}
    >
      <div className="flex flex-col gap-1">
        {history.map((line, idx) => (
          <div key={idx} className="whitespace-pre-wrap break-all">
            {line.startsWith('moamen@MacBook-Pro ~ %') ? (
              <span>
                <span className="text-zinc-400">moamen@MacBook-Pro ~ </span>
                <span className="text-cyan-400">% </span>
                <span className="text-white ml-1">{line.split('% ')[1]}</span>
              </span>
            ) : (
              <span className="text-zinc-300">{line}</span>
            )}
          </div>
        ))}
      </div>
      <div className="flex items-center gap-2 mt-1">
        <span>
          <span className="text-zinc-400">moamen@MacBook-Pro ~ </span>
          <span className="text-cyan-400">% </span>
        </span>
        <input
          id="mac-term-input"
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
