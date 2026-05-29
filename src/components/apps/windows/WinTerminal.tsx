'use client';
import React, { useState, useEffect, useRef } from 'react';

export default function WinTerminal() {
  const [history, setHistory] = useState<string[]>([
    'Windows PowerShell',
    'Copyright (C) Microsoft Corporation. All rights reserved.',
    '',
    'Install the latest PowerShell for new features and improvements! https://aka.ms/PSWindows',
    ''
  ]);
  const [input, setInput] = useState('');
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && input.trim()) {
      setHistory([
        ...history, 
        `PS C:\\Users\\Team> ${input}`, 
        `${input} : The term '${input}' is not recognized as the name of a cmdlet, function, script file, or operable program. Check the spelling of the name, or if a path was included, verify that the path is correct and try again.`,
        `At line:1 char:1`,
        `+ ${input}`,
        `+ ~~~~`,
        `    + CategoryInfo          : ObjectNotFound: (${input}:String) [], CommandNotFoundException`,
        `    + FullyQualifiedErrorId : CommandNotFoundException`,
        ''
      ]);
      setInput('');
    }
  };

  return (
    <div 
      className="w-full h-full bg-[#012456] text-[#cccccc] font-mono text-[14px] p-2 overflow-y-auto cursor-text"
      style={{ fontFamily: 'Consolas, "Courier New", monospace' }}
      onClick={() => document.getElementById('win-term-input')?.focus()}
    >
      <div className="flex flex-col gap-1">
        {history.map((line, idx) => (
          <div key={idx} className="whitespace-pre-wrap break-all">
            {line.startsWith('PS C:\\Users\\Team>') ? (
              <span>
                <span className="text-yellow-400">PS </span>
                <span className="text-white">C:\Users\Team&gt;</span>
                <span className="text-white ml-2">{line.split('> ')[1]}</span>
              </span>
            ) : line.includes('CategoryInfo') || line.includes('FullyQualifiedErrorId') || line.includes('CommandNotFoundException') || line.startsWith('+') || line.includes('is not recognized') ? (
              <span className="text-red-500">{line}</span>
            ) : (
              <span>{line}</span>
            )}
          </div>
        ))}
      </div>
      <div className="flex items-center gap-2 mt-1">
        <span>
          <span className="text-yellow-400">PS </span>
          <span className="text-white">C:\Users\Team&gt;</span>
        </span>
        <input
          id="win-term-input"
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
