import { useEffect, Component } from 'react';
import type { ReactNode } from 'react';
import { AppShell } from './components/layout/AppShell';
import { useScreenSize } from './hooks/useScreenSize';
import { LoadingSkeleton } from './components/ui/LoadingSkeleton';
import { ErrorFallback } from './components/ui/ErrorFallback';
import { useStaticDataStore } from './store/staticDataStore';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<
  { children: ReactNode; fallback: ReactNode },
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

function AppContent() {
  // Track screen size for responsive layout
  useScreenSize();

  // Load static data (countries, climate, vegetation) on mount
  const loadAll = useStaticDataStore((s) => s.loadAll);
  const isLoaded = useStaticDataStore((s) => s.isLoaded);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  // Show loading screen while static data loads (usually < 1 second)
  if (!isLoaded) {
    return <LoadingSkeleton fullscreen text="正在加载数据..." />;
  }

  return <AppShell />;
}

export default function App() {
  return (
    <ErrorBoundary fallback={<ErrorFallback />}>
      <AppContent />
    </ErrorBoundary>
  );
}
