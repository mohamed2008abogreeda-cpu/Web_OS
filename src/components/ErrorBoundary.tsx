'use client';
// ============================================================
// ErrorBoundary — Graceful error handling for windows
// ============================================================
import React from 'react';
import { useOSStore } from '@/store/useOSStore';

interface Props {
  windowId: string;
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundaryInner extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex-1 flex items-center justify-center p-8 bg-gray-950">
          <div className="text-center max-w-sm">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-red-500/10 border border-red-500/20
                          flex items-center justify-center text-3xl">
              💥
            </div>
            <h3 className="text-white text-lg font-semibold mb-2">
              Application Error
            </h3>
            <p className="text-gray-500 text-sm mb-4 font-mono">
              {this.state.error?.message || 'An unexpected error occurred'}
            </p>
            <div className="flex gap-2 justify-center">
              <button
                onClick={() => this.setState({ hasError: false, error: null })}
                className="px-4 py-2 rounded-lg bg-white/[0.06] border border-white/[0.1]
                         text-gray-300 text-sm hover:bg-white/[0.1] transition-colors"
              >
                Retry
              </button>
              <CloseButton windowId={this.props.windowId} />
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

function CloseButton({ windowId }: { windowId: string }) {
  const closeWindow = useOSStore((s) => s.closeWindow);
  return (
    <button
      onClick={() => closeWindow(windowId)}
      className="px-4 py-2 rounded-lg bg-red-500/10 border border-red-500/20
               text-red-400 text-sm hover:bg-red-500/20 transition-colors"
    >
      Close
    </button>
  );
}

export default function ErrorBoundary(props: Props) {
  return <ErrorBoundaryInner {...props} />;
}
