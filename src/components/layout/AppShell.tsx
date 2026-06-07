import { Suspense } from 'react';
import { TopBar } from './TopBar';
import { MobileNav } from './MobileNav';
import { GlobeViewer } from '../globe/GlobeViewer';
import { GlobeInteraction } from '../globe/GlobeInteraction';
import { LayerManager } from '../globe/LayerManager';
import { CountryBorders } from '../globe/CountryBorders';
import { InfoPanel } from '../ui/InfoPanel';
import { useUIStore } from '../../store/uiStore';
import './AppShell.css';

export function AppShell() {
  const breakpoint = useUIStore((s) => s.breakpoint);

  return (
    <div className={`app-shell app-shell--${breakpoint}`}>
      <TopBar />
      <main className="app-main">
        <div className="app-globe-area">
          <Suspense fallback={null}>
            <GlobeViewer />
            <GlobeInteraction />
            <LayerManager />
            <CountryBorders />
          </Suspense>
        </div>
        <InfoPanel />
      </main>
      {breakpoint === 'mobile' && <MobileNav />}
    </div>
  );
}
