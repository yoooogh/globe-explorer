import { useGlobeStore } from '../../store/globeStore';
import type { LayerKey } from '../../types/globe';
import './LayerToggle.css';

interface Props {
  layer: LayerKey;
  label: string;
  compact?: boolean;
}

const ICONS: Record<LayerKey, string> = {
  clouds: '☁️',
  temperature: '🌡️',
  precipitation: '🌧️',
  borders: '🗺️',
};

export function LayerToggle({ layer, label, compact }: Props) {
  const active = useGlobeStore((s) => s.layers[layer]);
  const toggleLayer = useGlobeStore((s) => s.toggleLayer);

  const classes = [
    'layer-toggle',
    active && 'layer-toggle--active',
    compact && 'layer-toggle--compact',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button className={classes} onClick={() => toggleLayer(layer)} title={label}>
      <span className="layer-toggle__icon">{ICONS[layer]}</span>
      {!compact && <span className="layer-toggle__label">{label}</span>}
    </button>
  );
}
