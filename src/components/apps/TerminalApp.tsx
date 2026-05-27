'use client';
// ============================================================
// TerminalApp — CLI with secret admin trigger
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

export default function TerminalApp({ windowId }: { windowId: string }) {
  const [lines, setLines] = useState<TermLine[]>([
    { type: 'system', content: '╔══════════════════════════════════════════════╗' },
    { type: 'system', content: '║  WebOS Terminal v2.0.0                       ║' },
    { type: 'system', content: '║  Type "help" for available commands          ║' },
    { type: 'system', content: '╚══════════════════════════════════════════════╝' },
    { type: 'output', content: '' },
  ]);
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
    const accent = user?.accentColor || '#6366f1';
    return [
      { type: 'success', content: `       ██╗    ██╗ ██████╗ ███████╗` },
      { type: 'success', content: `       ██║    ██║██╔═══██╗██╔════╝` },
      { type: 'success', content: `       ██║ █╗ ██║██║   ██║███████╗` },
      { type: 'success', content: `       ██║███╗██║██║   ██║╚════██║` },
      { type: 'success', content: `       ╚███╔███╔╝╚██████╔╝███████║` },
      { type: 'success', content: `        ╚══╝╚══╝  ╚═════╝ ╚══════╝` },
      { type: 'output', content: '' },
      { type: 'output', content: `  User:     ${currentUser}` },
      { type: 'output', content: `  Role:     ${user?.role}` },
      { type: 'output', content: `  OS:       WebOS Portfolio v2.0.0` },
      { type: 'output', content: `  Shell:    webos-term 2.0` },
      { type: 'output', content: `  Runtime:  Next.js 16 + React 19` },
      { type: 'output', content: `  State:    Zustand 5.x` },
      { type: 'output', content: `  Accent:   ${accent}` },
      { type: 'output', content: `  Backend:  Cloudflare D1 + R2` },
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
    addLine('input', `${currentUser?.toLowerCase()}@webos:~$ ${cmd}`);

    if (trimmed === '') return;

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
          { type: 'output', content: '  sudo          Elevated commands' },
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
          { type: 'output', content: `  User:  ${currentUser}` },
          { type: 'output', content: `  Role:  ${user?.role}` },
          { type: 'output', content: `  ID:    ${user?.id}` },
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
          { type: 'system', content: `  Projects for ${currentUser}: (${projs.length})` },
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
        addLine('output', '  WebOS 2.0.0 x86_64 Next.js/16 React/19 Cloudflare-Edge');
        break;

      case trimmed === 'uptime':
        addLine('output', `  System up since ${new Date(Date.now() - 86400000).toISOString()}`);
        break;

      case trimmed === 'sudo login admin':
        addLines([
          { type: 'output', content: '' },
          { type: 'system', content: '  ⚠ Elevated access requested' },
          { type: 'system', content: '  Enter admin password:' },
        ]);
        setAwaitingPassword(true);
        break;

      case trimmed.startsWith('sudo'):
        addLine('error', '  Usage: sudo login admin');
        break;

      default:
        addLine('error', `  command not found: ${trimmed.split(' ')[0]}`);
        break;
    }
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
      className="flex flex-col h-full bg-[#0c0c0c] font-mono text-sm select-none"
      onClick={() => inputRef.current?.focus()}
      data-testid="terminal-app"
    >
      {/* Terminal output */}
      <ScrollArea ref={scrollRef} className="flex-1">
        <div className="p-4 flex flex-col gap-1">
          {lines.map((line, i) => (
            <div
              key={i}
              className={`whitespace-pre-wrap leading-relaxed ${
                line.type === 'input' ? 'text-green-400 font-bold' :
                line.type === 'error' ? 'text-red-400 font-bold' :
                line.type === 'success' ? 'text-emerald-400 font-bold' :
                line.type === 'system' ? 'text-cyan-400 font-bold' :
                'text-gray-300'
              }`}
            >
              {line.content || '\u00A0'}
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Input line */}
      <div className="flex items-center px-4 py-3.5 border-t border-white/[0.06] bg-black/55 shrink-0">
        <span className="text-green-400 shrink-0 mr-2.5 font-bold">
          {awaitingPassword ? '🔒 password:' : `${currentUser?.toLowerCase()}@webos:~$`}
        </span>
        <input
          ref={inputRef}
          type={awaitingPassword ? 'password' : 'text'}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1 bg-transparent text-gray-100 outline-none caret-green-400
                     placeholder:text-gray-800 font-mono text-sm"
          placeholder={awaitingPassword ? '••••••••' : 'Type a command...'}
          autoComplete="off"
          spellCheck={false}
          data-testid="terminal-input"
        />
      </div>
    </div>
  );
}

