import { useSelectionStore } from '../../store/selectionStore';
import { LayerToggle } from '../ui/LayerToggle';
import './MobileNav.css';

export function MobileNav() {
  const isPanelOpen = useSelectionStore((s) => s.isPanelOpen);
  const openPanel = useSelectionStore((s) => s.openPanel);
  const closePanel = useSelectionStore((s) => s.closePanel);

  return (
    <nav className="mobile-nav">
      <div className="mobile-nav__layers">
        <LayerToggle layer="clouds" label="云图" compact />
        <LayerToggle layer="temperature" label="温度" compact />
        <LayerToggle layer="precipitation" label="降水" compact />
      </div>
      <button
        className="mobile-nav__panel-btn"
        onClick={() => (isPanelOpen ? closePanel() : openPanel())}
      >
        {isPanelOpen ? '✕' : '📋'}
        <span>{isPanelOpen ? '关闭' : '信息'}</span>
      </button>
    </nav>
  );
}
