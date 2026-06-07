import { SearchBar } from '../ui/SearchBar';
import { LayerToggle } from '../ui/LayerToggle';
import { useUIStore } from '../../store/uiStore';
import './TopBar.css';

export function TopBar() {
  const breakpoint = useUIStore((s) => s.breakpoint);
  const isMobile = breakpoint === 'mobile';

  return (
    <header className="topbar">
      <div className="topbar__left">
        <span className="topbar__logo">🌍</span>
        {!isMobile && <span className="topbar__title">Globe Explorer</span>}
      </div>
      <div className="topbar__center">
        <SearchBar />
      </div>
      {!isMobile && (
        <div className="topbar__right">
          <LayerToggle layer="clouds" label="云图" />
          <LayerToggle layer="temperature" label="温度" />
          <LayerToggle layer="precipitation" label="降水" />
        </div>
      )}
    </header>
  );
}
