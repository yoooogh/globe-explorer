import { useWikipediaSummary } from '../../hooks/useWikipediaSummary';
import { useStaticDataStore } from '../../store/staticDataStore';
import './Card.css';

interface Props {
  countryName: string;
  countryCode: string;
  placeName?: string;
}

export function CultureCard({ countryName, countryCode, placeName }: Props) {
  // If there's a city name, query the city first for more specific culture info
  const queryTitle = placeName || countryName;
  const fallbackTitle = placeName ? countryName : undefined;

  const { data, loading, error } = useWikipediaSummary(queryTitle);
  const { data: fallbackData } = useWikipediaSummary(fallbackTitle || '');
  const preStored = useStaticDataStore((s) => s.getCulture(countryCode));

  // Show loading skeleton while fetching
  if (loading) {
    return (
      <div className="card">
        <div className="card__skeleton card__skeleton--title" />
        <div className="card__skeleton card__skeleton--row" />
        <div className="card__skeleton card__skeleton--row" />
        <div className="card__skeleton card__skeleton--row" />
        <div className="card__skeleton card__skeleton--row" style={{ width: '70%' }} />
      </div>
    );
  }

  // Use Wikipedia data if available (prefer city-specific, fall back to country)
  const bestData = (data?.extract ? data : null) ?? (fallbackData?.extract ? fallbackData : null);

  if (bestData && bestData.extract) {
    return (
      <div className="card">
        <h3 className="card__title">📚 {placeName ? `${placeName} · ` : ''}历史人文</h3>
        {bestData.thumbnail && (
          <img
            src={bestData.thumbnail}
            alt={bestData.title}
            style={{
              width: '100%',
              maxHeight: 200,
              objectFit: 'cover',
              borderRadius: 10,
              marginBottom: 12,
            }}
          />
        )}
        <div className="culture-card__text">{bestData.extract}</div>
        <p className="card__note">
          来源: <a href={bestData.url} target="_blank" rel="noopener noreferrer" style={{ color: '#4fc3f7' }}>Wikipedia</a>
        </p>
      </div>
    );
  }

  // Fall back to pre-stored country data
  if (preStored) {
    return (
      <div className="card">
        <h3 className="card__title">📚 历史人文</h3>
        <div className="culture-card__text">{preStored}</div>
        <p className="card__note">预置数据（Wikipedia 不可用时显示）</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card card--empty">
        <p>暂无该地区的历史人文信息</p>
      </div>
    );
  }

  return (
    <div className="card card--empty">
      <p>暂无该地区的历史人文信息</p>
    </div>
  );
}
