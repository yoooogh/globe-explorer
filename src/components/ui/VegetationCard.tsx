import { useStaticDataStore } from '../../store/staticDataStore';
import './Card.css';

interface Props {
  countryCode: string;
  placeName?: string;
}

export function VegetationCard({ countryCode, placeName }: Props) {
  const vegetation = useStaticDataStore((s) => s.getVegetation(countryCode));

  if (!vegetation) {
    return (
      <div className="card card--empty">
        <p>暂无该地区的植被数据</p>
      </div>
    );
  }

  return (
    <div className="card">
      <h3 className="card__title">🌿 {placeName ? `${placeName} · ` : ''}植被概况</h3>
      <p>{vegetation.description}</p>

      {vegetation.biomes.length > 0 && (
        <>
          <p style={{ marginTop: 12, marginBottom: 6, fontSize: 13, color: '#667788' }}>
            生物群落:
          </p>
          <div className="climate-koppen">
            {vegetation.biomes.map((biome) => (
              <span key={biome} className="climate-koppen-tag">{biome}</span>
            ))}
          </div>
        </>
      )}

      <div className="climate-details" style={{ marginTop: 12 }}>
        <div className="climate-detail-item">
          <span className="climate-detail-label">🌲 森林覆盖率</span>
          <span className="climate-detail-value">{vegetation.forestCoverPercent}%</span>
        </div>
      </div>
    </div>
  );
}
