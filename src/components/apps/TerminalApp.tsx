'use client';
// ============================================================
// TerminalApp — Cute Pink Retro CRT Bash Terminal
// ============================================================
import { useState, useRef, useEffect, useCallback } from 'react';
import { useOSStore } from '@/store/useOSStore';
import { USERS, ADMIN_PASSWORD, getProjectsForUser } from '@/lib/mockData';
import type { AppDefinition } from '@/types';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';

interface TermLine {
  type: 'input' | 'output' | 'error' | 'success' | 'system';
  content: string;
}

const CONTROL_PANEL_APP: AppDefinition = {
  id: 'app-control-panel',
  title: 'Control Panel',
  icon: '🔒',
  component: 'ControlPanel',
  defaultWidth: 680,
  defaultHeight: 520,
};

const INITIAL_LINES: TermLine[] = [
  { type: 'success', content: `       /\\          *** Arch Linux` },
  { type: 'success', content: `      /  \\         --------------` },
  { type: 'success', content: `     /\\   \\        OS: Arch Linux` },
  { type: 'success', content: `    /  __  \\       Kernel: 6.9.0-zen1-1-zen` },
  { type: 'success', content: `   /  (  )  \\      Uptime: 10 mins` },
  { type: 'success', content: `  /  /    \\  \\     Shell: bash 5.1.16` },
  { type: 'success', content: ` /  /      \\  \\    DE: GNOME` },
  { type: 'success', content: `/_ /________\\ _\\   CPU: Ryzen 7 5800H with Radeon Graphics (16)` },
  { type: 'success', content: `                   Memory: 2623MiB / 15302MiB` },
  { type: 'output', content: '' },
  { type: 'system', content: '~ /home/demeter' },
];

export default function TerminalApp({ windowId }: { windowId: string }) {
  const [lines, setLines] = useState<TermLine[]>(INITIAL_LINES);
  const [input, setInput] = useState('');
  const [awaitingPassword, setAwaitingPassword] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const currentUser = useOSStore((s) => s.currentUser);
  const openWindow = useOSStore((s) => s.openWindow);
  const setAdminAuthenticated = useOSStore((s) => s.setAdminAuthenticated);

  const user = currentUser ? USERS[currentUser] : null;

  const addLine = useCallback((type: TermLine['type'], content: string) => {
    setLines((prev) => [...prev, { type, content }]);
  }, []);

  const addLines = useCallback((newLines: TermLine[]) => {
    setLines((prev) => [...prev, ...newLines]);
  }, []);

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) {
      const scrollContainer = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [lines]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const generateNeofetch = (): TermLine[] => {
    return [
      { type: 'success', content: `       /\\          *** Arch Linux` },
      { type: 'success', content: `      /  \\         --------------` },
      { type: 'success', content: `     /\\   \\        OS: Arch Linux` },
      { type: 'success', content: `    /  __  \\       Kernel: 6.9.0-zen1-1-zen` },
      { type: 'success', content: `   /  (  )  \\      Uptime: 10 mins` },
      { type: 'success', content: `  /  /    \\  \\     Shell: bash 5.1.16` },
      { type: 'success', content: ` /  /      \\  \\    DE: GNOME` },
      { type: 'success', content: `/_ /________\\ _\\   CPU: Ryzen 7 5800H with Radeon Graphics (16)` },
      { type: 'success', content: `                   Memory: 2623MiB / 15302MiB` },
      { type: 'output', content: '' },
    ];
  };

  const processCommand = (cmd: string) => {
    const trimmed = cmd.trim().toLowerCase();

    // Password mode
    if (awaitingPassword) {
      setAwaitingPassword(false);
      if (cmd.trim() === ADMIN_PASSWORD) {
        addLine('success', '✓ Authentication successful. Opening Control Panel...');
        toast.success('Admin authentication verified!', {
          description: 'Access granted to Control Panel.',
        });
        setAdminAuthenticated(true);
        setTimeout(() => openWindow(CONTROL_PANEL_APP), 500);
      } else {
        addLine('error', '✗ Authentication failed. Access denied.');
        toast.error('Authentication Failed', {
          description: 'Incorrect admin password.',
        });
      }
      return;
    }

    // Add to history
    setHistory((prev) => [cmd, ...prev].slice(0, 50));
    setHistoryIndex(-1);
    
    addLine('input', `-> % ${cmd}`);

    if (trimmed === '') {
      addLine('system', `~ /home/demeter`);
      return;
    }

    // Command routing
    switch (true) {
      case trimmed === 'help':
        addLines([
          { type: 'output', content: '' },
          { type: 'system', content: '  Available Commands:' },
          { type: 'output', content: '  ──────────────────────────────────────' },
          { type: 'output', content: '  help          Show this help message' },
          { type: 'output', content: '  clear         Clear the terminal' },
          { type: 'output', content: '  date          Show current date/time' },
          { type: 'output', content: '  whoami        Show current user info' },
          { type: 'output', content: '  neofetch      System information' },
          { type: 'output', content: '  projects      List your projects' },
          { type: 'output', content: '  echo <text>   Echo text back' },
          { type: 'output', content: '  uname -a      System details' },
          { type: 'output', content: '  uptime        System uptime' },
          { type: 'output', content: '  sudo login    Elevated control panel access' },
          { type: 'output', content: '  sudo watch session  Activate Spectator Mode' },
          { type: 'output', content: '' },
        ]);
        break;

      case trimmed === 'clear':
        setLines([]);
        break;

      case trimmed === 'date':
        addLine('output', `  ${new Date().toString()}`);
        break;

      case trimmed === 'whoami':
        addLines([
          { type: 'output', content: '' },
          { type: 'output', content: `  User:  ${currentUser || 'demeter'}` },
          { type: 'output', content: `  Role:  ${user?.role || 'Developer'}` },
          { type: 'output', content: `  ID:    ${user?.id || 'user-default'}` },
          { type: 'output', content: '' },
        ]);
        break;

      case trimmed === 'neofetch':
        addLines(generateNeofetch());
        break;

      case trimmed === 'projects': {
        const userId = user?.id || '';
        const projs = getProjectsForUser(userId);
        addLines([
          { type: 'output', content: '' },
          { type: 'system', content: `  Projects for ${currentUser || 'demeter'}: (${projs.length})` },
          { type: 'output', content: '  ──────────────────────────────────────' },
          ...projs.map((p) => ({
            type: 'output' as const,
            content: `  ${p.iconUrl}  ${p.title.padEnd(22)} ${p.tags.join(', ')}`,
          })),
          { type: 'output', content: '' },
        ]);
        break;
      }

      case trimmed.startsWith('echo '):
        addLine('output', `  ${cmd.slice(5)}`);
        break;

      case trimmed === 'uname -a':
        addLine('output', '  Arch Linux 6.9.0-zen1-1-zen x86_64 GNOME bash');
        break;

      case trimmed === 'uptime':
        addLine('output', '  uptime: 10 mins');
        break;

      case trimmed === 'sudo login admin':
        addLines([
          { type: 'output', content: '' },
          { type: 'system', content: '  ⚠ Elevated access requested' },
          { type: 'system', content: '  Enter admin password:' },
        ]);
        setAwaitingPassword(true);
        return;
        
      case trimmed === 'sudo watch session':
        useOSStore.getState().setSpectating(true);
        addLine('success', '✓ Spectator Mode initialized. Mirroring guest state...');
        toast.success('Spectator Mode Active', {
          description: 'You are now watching the live session.',
        });
        break;

      case trimmed.startsWith('sudo'):
        addLine('error', '  Usage: sudo login admin OR sudo watch session');
        break;

      default:
        addLine('error', `  command not found: ${trimmed.split(' ')[0]}`);
        break;
    }

    addLine('system', `~ /home/demeter`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      processCommand(input);
      setInput('');
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (history.length > 0) {
        const newIdx = Math.min(historyIndex + 1, history.length - 1);
        setHistoryIndex(newIdx);
        setInput(history[newIdx]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        const newIdx = historyIndex - 1;
        setHistoryIndex(newIdx);
        setInput(history[newIdx]);
      } else {
        setHistoryIndex(-1);
        setInput('');
      }
    }
  };

  return (
    <div
      className="flex flex-col h-full bg-[#fdf2f8] font-mono text-sm select-none relative overflow-hidden"
      onClick={() => inputRef.current?.focus()}
      data-testid="terminal-app"
    >
      {/* Pink CRT Scanline Overlay */}
      <div 
        className="pointer-events-none absolute inset-0 z-20 opacity-[0.035]"
        style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(236,72,153,0.06) 2px, rgba(236,72,153,0.06) 4px)',
        }}
      />

      {/* CRT Screen Glow */}
      <div className="pointer-events-none absolute inset-0 z-20"
        style={{
          boxShadow: 'inset 0 0 40px rgba(236, 72, 153, 0.04)',
        }}
      />

      {/* Terminal output */}
      <ScrollArea ref={scrollRef} className="flex-1 relative z-10">
        <div className="p-5 flex flex-col gap-1">
          {lines.map((line, i) => (
            <div
              key={i}
              className={`whitespace-pre-wrap leading-relaxed transition-all duration-150 ${
                line.type === 'input' ? 'text-pink-600 font-bold' :
                line.type === 'error' ? 'text-rose-500 font-bold' :
                line.type === 'success' ? 'text-pink-500 font-bold' :
                line.type === 'system' ? 'text-purple-600 font-extrabold' :
                'text-slate-700 font-medium'
              }`}
            >
              {line.content || '\u00A0'}
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Input line */}
      <div className="flex items-center px-5 py-3.5 border-t border-purple-200/40 bg-white/60 backdrop-blur-md shrink-0 relative z-10">
        <span className="text-pink-600 shrink-0 mr-2 font-bold">
          {awaitingPassword ? '🔒 password:' : '-> %'}
        </span>
        <input
          ref={inputRef}
          type={awaitingPassword ? 'password' : 'text'}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1 bg-transparent text-slate-800 outline-none caret-pink-600
                     placeholder:text-purple-400/50 font-mono text-sm font-semibold"
          placeholder={awaitingPassword ? '••••••••' : 'Type a command...'}
          autoComplete="off"
          spellCheck={false}
          data-testid="terminal-input"
        />
      </div>
    </div>
  );
}
