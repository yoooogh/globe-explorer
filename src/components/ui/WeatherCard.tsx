import { useWeather } from '../../hooks/useWeather';
import { WEATHER_DESCRIPTIONS } from '../../types/weather';
import './Card.css';

interface Props {
  lat: number;
  lon: number;
  compact?: boolean;
}

export function WeatherCard({ lat, lon, compact }: Props) {
  const { data, loading, error } = useWeather(lat, lon);

  if (loading) {
    return (
      <div className="card">
        <div className="card__skeleton card__skeleton--title" />
        <div className="card__skeleton card__skeleton--row" />
        <div className="card__skeleton card__skeleton--row" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="card card--error">
        <p>无法获取天气数据</p>
        <p className="card__error-detail">{error}</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="card card--empty">
        <p>点击地球上的任意位置查看实时天气</p>
      </div>
    );
  }

  const description = WEATHER_DESCRIPTIONS[data.weatherCode] ?? '未知';

  if (compact) {
    return (
      <div className="weather-compact">
        <span className="weather-compact__temp">{data.temperature.toFixed(0)}°</span>
        <span className="weather-compact__desc">{description}</span>
        <span className="weather-compact__detail">💧{data.humidity}%</span>
        <span className="weather-compact__detail">💨{data.windSpeed.toFixed(0)}km/h</span>
      </div>
    );
  }

  return (
    <div className="card">
      <h3 className="card__title">🌤️ 实时天气</h3>
      <div className="weather-card__main">
        <span className="weather-card__temp">{data.temperature.toFixed(1)}°C</span>
        <span className="weather-card__desc">{description}</span>
      </div>
      <div className="card__grid">
        <div className="card__grid-item">
          <span className="card__grid-label">💧 湿度</span>
          <span className="card__grid-value">{data.humidity}%</span>
        </div>
        <div className="card__grid-item">
          <span className="card__grid-label">💨 风速</span>
          <span className="card__grid-value">{data.windSpeed.toFixed(1)} km/h</span>
        </div>
        <div className="card__grid-item">
          <span className="card__grid-label">🌍 坐标</span>
          <span className="card__grid-value">{data.latitude.toFixed(2)}°, {data.longitude.toFixed(2)}°</span>
        </div>
        <div className="card__grid-item">
          <span className="card__grid-label">🕐 更新时间</span>
          <span className="card__grid-value">{data.timestamp?.slice(11, 16) ?? '--:--'}</span>
        </div>
      </div>
      <p className="card__note">数据来源: Open-Meteo (每30分钟更新)</p>
    </div>
  );
}
