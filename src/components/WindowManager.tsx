'use client';
// ============================================================
// WindowManager — Renders all open windows
// ============================================================
import { useOSStore } from '@/store/useOSStore';
import WindowWrapper from './WindowWrapper';
import ErrorBoundary from './ErrorBoundary';

// App components (lazy-loaded would be ideal, but inline for reliability)
import ProjectViewer from './apps/ProjectViewer';
import TerminalApp from './apps/TerminalApp';
import DiscordCallApp from './apps/DiscordCallApp';
import AboutApp from './apps/AboutApp';
import SettingsApp from './apps/SettingsApp';
import ControlPanel from './apps/ControlPanel';

const COMPONENT_MAP: Record<string, React.ComponentType<{ windowId: string }>> = {
  ProjectViewer,
  TerminalApp,
  DiscordCallApp,
  AboutApp,
  SettingsApp,
  ControlPanel,
};

export default function WindowManager() {
  const windows = useOSStore((s) => s.windows);

  return (
    <>
      {windows
        .filter((w) => w.isOpen)
        .map((win) => {
          const Component = COMPONENT_MAP[win.component];
          if (!Component) return null;

          return (
            <WindowWrapper key={win.id} window={win}>
              <ErrorBoundary windowId={win.id}>
                <Component windowId={win.id} />
              </ErrorBoundary>
            </WindowWrapper>
          );
        })}
    </>
  );
}
