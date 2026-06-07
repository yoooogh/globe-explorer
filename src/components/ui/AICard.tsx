import { useAIInfo } from '../../hooks/useAIInfo';
import './Card.css';

interface Props {
  placeName?: string;
  countryName?: string;
}

export function AICard({ placeName, countryName }: Props) {
  const queryName = placeName || countryName;
  const { data, loading, error } = useAIInfo(queryName, countryName);

  if (!queryName) {
    return (
      <div className="card card--empty">
        <p>点击城市以获取 AI 智能信息</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="card">
        <div className="card__skeleton card__skeleton--title" />
        <div className="card__skeleton card__skeleton--row" />
        <div className="card__skeleton card__skeleton--row" />
        <div className="card__skeleton card__skeleton--row" />
        <div className="card__skeleton card__skeleton--row" style={{ width: '70%' }} />
        <p style={{ fontSize: 12, color: '#667788', marginTop: 8, textAlign: 'center' }}>
          AI 正在生成 {queryName} 的专属信息...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card card--error">
        <p>AI 请求失败</p>
        <p className="card__error-detail">{error}</p>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="card">
      {/* Climate */}
      <h3 className="card__title">🌡️ 气候</h3>
      <p>{data.climate}</p>

      {/* Vegetation */}
      <h3 className="card__title" style={{ marginTop: 16 }}>🌿 植被与自然</h3>
      <p>{data.vegetation}</p>

      {/* Attractions */}
      <h3 className="card__title" style={{ marginTop: 16 }}>🏛️ 景点推荐</h3>
      <ul className="attractions-list">
        {(data.attractions || []).map((a, i) => (
          <li key={i} className="attraction-item">
            <div className="attraction-item__thumb" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
              🏛️
            </div>
            <div className="attraction-item__info">
              <div className="attraction-item__name">{a.name}</div>
              <div className="attraction-item__desc">{a.desc}</div>
            </div>
          </li>
        ))}
      </ul>

      {/* Culture */}
      <h3 className="card__title" style={{ marginTop: 16 }}>📚 历史文化</h3>
      <p>{data.culture}</p>

      {/* Travel Tips */}
      <h3 className="card__title" style={{ marginTop: 16 }}>💡 旅行贴士</h3>
      <p>{data.tips}</p>

      <p className="card__note">
        🤖 由 DeepSeek AI 生成 · {placeName}
      </p>
    </div>
  );
}
