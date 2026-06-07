import { useStaticDataStore } from '../../store/staticDataStore';
import './Card.css';

interface Props {
  countryCode: string;
  placeName?: string;
}

export function ClimateCard({ countryCode, placeName }: Props) {
  const climate = useStaticDataStore((s) => s.getClimate(countryCode));
  const country = useStaticDataStore((s) => s.getCountry(countryCode));

  if (!climate) {
    return (
      <div className="card card--empty">
        <p>暂无该地区的气候数据</p>
      </div>
    );
  }

  return (
    <div className="card">
      <h3 className="card__title">🌡️ {placeName ? `${placeName} · ` : ''}气候概况</h3>
      <p>{climate.description}</p>

      {climate.koppenZones.length > 0 && (
        <>
          <p style={{ marginTop: 12, marginBottom: 6, fontSize: 13, color: '#667788' }}>
            Köppen 气候分类:
          </p>
          <div className="climate-koppen">
            {climate.koppenZones.map((zone) => (
              <span key={zone} className="climate-koppen-tag">{zone}</span>
            ))}
          </div>
        </>
      )}

      <div className="climate-details">
        <div className="climate-detail-item">
          <span className="climate-detail-label">🌡️ 平均温度范围</span>
          <span className="climate-detail-value">{climate.avgTempRange}</span>
        </div>
        <div className="climate-detail-item">
          <span className="climate-detail-label">🌧️ 雨季</span>
          <span className="climate-detail-value">{climate.rainySeason}</span>
        </div>
        {country && (
          <div className="climate-detail-item">
            <span className="climate-detail-label">🌍 所属大洲</span>
            <span className="climate-detail-value">{country.continent}</span>
          </div>
        )}
      </div>
    </div>
  );
}
