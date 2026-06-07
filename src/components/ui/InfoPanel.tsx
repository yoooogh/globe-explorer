import { useSelectionStore } from '../../store/selectionStore';
import { useUIStore } from '../../store/uiStore';
import { useHomeStore } from '../../store/homeStore';
import { AICard } from './AICard';
import { WeatherCard } from './WeatherCard';
import { TravelCard } from './TravelCard';
import './InfoPanel.css';

export function InfoPanel() {
  const selected = useSelectionStore((s) => s.selected);
  const isPanelOpen = useSelectionStore((s) => s.isPanelOpen);
  const closePanel = useSelectionStore((s) => s.closePanel);
  const breakpoint = useUIStore((s) => s.breakpoint);
  const home = useHomeStore((s) => s.home);
  const setHome = useHomeStore((s) => s.setHome);

  if (!selected) return null;

  const isMobile = breakpoint === 'mobile';

  const handleSetHome = () => {
    setHome({
      lat: selected.latitude,
      lon: selected.longitude,
      name: selected.placeName || selected.countryName,
    });
  };

  const panelClasses = [
    'info-panel',
    `info-panel--${breakpoint}`,
    isPanelOpen && 'info-panel--open',
  ].filter(Boolean).join(' ');

  return (
    <>
      {isMobile && isPanelOpen && (
        <div className="info-panel__overlay" onClick={closePanel} />
      )}
      <aside className={panelClasses}>
        <div className="info-panel__header">
          <div>
            <h2 className="info-panel__country-name">
              {selected.placeName || selected.countryName}
            </h2>
            {selected.placeName && (
              <p className="info-panel__country-sub">{selected.countryName}</p>
            )}
          </div>
          <div className="info-panel__header-actions">
            <button
              className="info-panel__home-btn"
              onClick={handleSetHome}
              title="设为常住城市"
            >
              {home?.name === (selected.placeName || selected.countryName) ? '🏠✓' : '🏠'}
            </button>
            <button className="info-panel__close" onClick={closePanel}>✕</button>
          </div>
        </div>

        <div className="info-panel__content">
          <WeatherCard lat={selected.latitude} lon={selected.longitude} compact />
          {home && (
            <TravelCard
              toLat={selected.latitude}
              toLon={selected.longitude}
              toCity={selected.placeName || selected.countryName}
            />
          )}
          <AICard placeName={selected.placeName} countryName={selected.countryName} />
        </div>
      </aside>
    </>
  );
}
