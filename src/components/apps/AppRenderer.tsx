'use client';
import ProjectViewer from './ProjectViewer';
import TerminalApp from './TerminalApp';
import DiscordCallApp from './DiscordCallApp';
import AboutApp from './AboutApp';
import SettingsApp from './SettingsApp';
import ControlPanel from './ControlPanel';
import MusicApp from './MusicApp';
import ErrorBoundary from '../ErrorBoundary';

const COMPONENT_MAP: Record<string, React.ComponentType<{ windowId: string }>> = {
  ProjectViewer,
  TerminalApp,
  DiscordCallApp,
  AboutApp,
  SettingsApp,
  ControlPanel,
  MusicApp,
};

interface AppRendererProps {
  componentName: string;
  windowId: string;
}

export default function AppRenderer({ componentName, windowId }: AppRendererProps) {
  const Component = COMPONENT_MAP[componentName];
  if (!Component) {
    return (
      <div className="p-4 flex items-center justify-center w-full h-full bg-black/80 text-red-400 font-mono text-sm text-center">
        Error: Component "{componentName}" not found.
      </div>
    );
  }

  return (
    <ErrorBoundary windowId={windowId}>
      <Component windowId={windowId} />
    </ErrorBoundary>
  );
}
