'use client';
// ============================================================
// TerminalApp — Elite Hacker Interface & Auto-scroll
// ============================================================
import { useState, useRef, useEffect } from 'react';
import { useOSStore } from '@/store/useOSStore';

interface CommandEntry {
  id: string;
  command: string;
  output: React.ReactNode;
}

export default function TerminalApp({ windowId }: { windowId: string }) {
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<CommandEntry[]>([
    {
      id: 'init',
      command: 'sys.boot',
      output: (
        <div className="text-emerald-500 font-bold mb-2">
          [OK] WebOS System Core Initialized.<br/>
          [OK] Spectator Daemon running in background.<br/>
          Type "help" to see available commands.
        </div>
      ),
    },
  ]);
  
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input on click anywhere
  const handleContainerClick = () => {
    inputRef.current?.focus();
  };

  // Auto-scroll on new output
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  const handleCommand = (cmd: string) => {
    const trimmed = cmd.trim();
    if (!trimmed) return;

    const newEntry: CommandEntry = {
      id: Date.now().toString(),
      command: trimmed,
      output: null,
    };

    let outputNode: React.ReactNode = null;

    switch (trimmed.toLowerCase()) {
      case 'help':
        outputNode = (
          <div className="text-emerald-300">
            Available commands:<br/>
            - <span className="text-emerald-100 font-bold">whoami</span>: Display current user<br/>
            - <span className="text-emerald-100 font-bold">date</span>: Display system date<br/>
            - <span className="text-emerald-100 font-bold">clear</span>: Clear terminal<br/>
            - <span className="text-emerald-100 font-bold">echo [text]</span>: Print text<br/>
            - <span className="text-emerald-100 font-bold">sudo status</span>: View OS diagnostics<br/>
          </div>
        );
        break;
      case 'whoami':
        outputNode = <span className="text-emerald-100">Mohammed (Superuser)</span>;
        break;
      case 'date':
        outputNode = <span className="text-emerald-300">{new Date().toString()}</span>;
        break;
      case 'clear':
        setHistory([]);
        return;
      case 'sudo status':
        outputNode = (
          <div className="text-yellow-400">
            [WARNING] Root privileges active.<br/>
            - Memory: 12GB / 16GB used<br/>
            - Uptime: 99.99%<br/>
            - Spectator Architecture: Zero-Click Link
          </div>
        );
        break;
      default:
        if (trimmed.startsWith('echo ')) {
          outputNode = <span className="text-emerald-100">{trimmed.slice(5)}</span>;
        } else {
          outputNode = <span className="text-red-400">Command not found: {trimmed}</span>;
        }
    }

    newEntry.output = outputNode;
    setHistory((prev) => [...prev, newEntry]);
  };

  return (
    <div 
      className="w-full h-full bg-black/95 text-emerald-400 font-mono text-sm sm:text-base p-4 overflow-y-auto cursor-text shadow-inner"
      onClick={handleContainerClick}
      data-testid="terminal-app"
    >
      <div className="max-w-4xl mx-auto flex flex-col gap-1">
        {history.map((entry) => (
          <div key={entry.id} className="flex flex-col gap-1 mb-2">
            <div className="flex items-center gap-2">
              <span className="text-emerald-600 font-bold">Mohammed@WebOS:~$</span>
              <span className="text-emerald-100">{entry.command}</span>
            </div>
            {entry.output && <div className="ml-4">{entry.output}</div>}
          </div>
        ))}
        
        {/* Active Input Line */}
        <div className="flex items-center gap-2 relative mt-2 group">
          <span className="text-emerald-600 font-bold whitespace-nowrap">Mohammed@WebOS:~$</span>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleCommand(input);
                setInput('');
              }
            }}
            className="flex-1 bg-transparent appearance-none outline-none border-none text-emerald-400 focus:ring-0 focus:text-emerald-300 caret-emerald-500 drop-shadow-[0_0_8px_rgba(52,211,153,0.8)]"
            autoFocus
            spellCheck={false}
            autoComplete="off"
            data-testid="terminal-input"
          />
        </div>
        <div ref={bottomRef} className="h-4" />
      </div>
    </div>
  );
}
