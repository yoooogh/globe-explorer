import { useState, useEffect } from 'react';
import { useStaticDataStore, type AttractionItem } from '../../store/staticDataStore';
import { searchNearby } from '../../services/api/wikipedia';
import type { WikiSearchResult } from '../../types/wiki';
import './Card.css';

interface Props {
  lat: number;
  lon: number;
  countryName: string;
  placeName?: string;
  countryCode: string;
}

interface CombinedAttraction {
  name: string;
  desc: string;
  url?: string;
  distance?: number;
}

export function AttractionsCard({ lat, lon, countryCode, placeName }: Props) {
  const preStored = useStaticDataStore((s) => s.getAttractions(countryCode));
  const [wikiAttractions, setWikiAttractions] = useState<WikiSearchResult[]>([]);
  const [wikiLoading, setWikiLoading] = useState(true);

  // Try Wikipedia geosearch in background
  useEffect(() => {
    setWikiLoading(true);
    searchNearby(lat, lon, 50000, 'zh')
      .then(setWikiAttractions)
      .catch(() => searchNearby(lat, lon, 50000, 'en'))
      .catch(() => [])
      .finally(() => setWikiLoading(false));
  }, [lat, lon]);

  // Sort pre-stored attractions by distance from click point
  const sortedPreStored = [...preStored]
    .map((a) => ({
      name: a.name,
      desc: a.desc,
      distance: haversine(lat, lon, a.lat, a.lon),
    }))
    .sort((a, b) => a.distance - b.distance);

  // If we have pre-stored data, show it immediately (primary source)
  if (sortedPreStored.length > 0) {
    return (
      <div className="card">
        <h3 className="card__title">🏛️ {placeName ? `${placeName}附近` : ''}旅游景点</h3>
        <ul className="attractions-list">
          {sortedPreStored.map((a, i) => (
            <li key={`${a.name}-${i}`} className="attraction-item">
              <div className="attraction-item__thumb" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>
                🏛️
              </div>
              <div className="attraction-item__info">
                <div className="attraction-item__name">{a.name}</div>
                <div className="attraction-item__desc">{a.desc}</div>
                {a.distance < 500 && (
                  <div style={{ fontSize: 11, color: '#667788', marginTop: 2 }}>
                    ≈ {Math.round(a.distance)}km
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>
        {wikiAttractions.length > 0 && (
          <>
            <p style={{ fontSize: 12, color: '#667788', margin: '12px 0 4px' }}>Wikipedia 附近条目:</p>
            {wikiAttractions.slice(0, 5).map((w, i) => (
              <div key={w.pageId} style={{ fontSize: 12, color: '#8899aa', padding: '3px 0' }}>
                📍 {w.title}
              </div>
            ))}
          </>
        )}
        <p className="card__note">预置旅游景点数据</p>
      </div>
    );
  }

  // No pre-stored data, try Wikipedia only
  if (wikiLoading) {
    return (
      <div className="card">
        <div className="card__skeleton card__skeleton--title" />
        <div className="card__skeleton card__skeleton--row" />
        <div className="card__skeleton card__skeleton--row" />
      </div>
    );
  }

  if (wikiAttractions.length > 0) {
    return (
      <div className="card">
        <h3 className="card__title">🏛️ 附近景点</h3>
        <ul className="attractions-list">
          {wikiAttractions.slice(0, 10).map((w, i) => (
            <li key={w.pageId}>
              <a
                href={`https://zh.wikipedia.org/wiki/${encodeURIComponent(w.title)}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ textDecoration: 'none' }}
              >
                <div className="attraction-item">
                  <div className="attraction-item__thumb" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
                    📍
                  </div>
                  <div className="attraction-item__info">
                    <div className="attraction-item__name">{w.title}</div>
                    <div className="attraction-item__desc">距离约 {Math.round(w.distanceMeters / 1000)}km</div>
                  </div>
                </div>
              </a>
            </li>
          ))}
        </ul>
        <p className="card__note">来源: Wikipedia Geosearch</p>
      </div>
    );
  }

  return (
    <div className="card card--empty">
      <p>暂无该地区的旅游景点数据</p>
      <p style={{ fontSize: 12, marginTop: 4 }}>
        当前已覆盖中国、日本、法国、意大利、泰国、美国、英国、澳大利亚、埃及等热门旅游国家
      </p>
    </div>
  );
}

// Haversine distance in km
function haversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
