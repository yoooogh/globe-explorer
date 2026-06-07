import { useTravelInfo } from '../../hooks/useTravelInfo';
import { useHomeStore } from '../../store/homeStore';
import './Card.css';
import './TravelCard.css';

interface Props { toLat: number; toLon: number; toCity?: string; }
interface TripItem {
  type: 'flight' | 'train';
  mode?: 'direct' | 'transfer' | 'nearby';
  depart?: string; from?: string;
  arrive?: string; to?: string;
  via?: string; stopDur?: string;
  airline?: string; trainNo?: string;
  duration?: string; price?: string;
  tag?: string; totalPrice?: string;
}

export function TravelCard({ toLat, toLon, toCity }: Props) {
  const home = useHomeStore((s) => s.home);
  const { data, loading } = useTravelInfo(home?.lat, home?.lon, home?.name, toLat, toLon, toCity);
  if (!home) return <div className="ticket-wrap"><div className="ticket-empty">📍 设置常住城市，查看出行方案</div></div>;
  if (loading) return <div className="ticket-wrap"><div className="ticket-empty">🔍 搜索中…</div></div>;
  if (!data) return null;

  const { driving, train, flight } = data;
  const flights: TripItem[] = flight?.parsed || [];
  const trains: TripItem[] = train?.parsed || [];
  return (
    <div className="ticket-wrap">
      <div className="ticket-header">
        <span className="ticket-from">{home.name}</span>
        <span className="ticket-arrow">→</span>
        <span className="ticket-to">{toCity || '目的地'}</span>
      </div>

      {/* 飞机：优先parsed，失败用raw */}
      {flights.length > 0 ? <FlightBlock items={flights} />
        : flight?.raw ? <RawSection title="✈️ 飞机" text={flight.raw} /> : null}
      {/* 高铁：优先parsed，失败用raw */}
      {trains.length > 0 ? <TrainBlock items={trains} />
        : train?.searchResult ? <RawSection title="🚄 高铁" text={train.searchResult} /> : null}

      {driving && driving.distance < 3000 && (
        <>
          <div className="ticket-section-title">🚗 自驾</div>
          <div className="ticket-drive">
            <div className="ticket-drive-main">
              <span className="ticket-drive-icon">🚗</span>
              <div>
                <span className="ticket-drive-time">{driving.time}</span>
                <span className="ticket-drive-meta"> · {driving.distance}km</span>
              </div>
              <span className="ticket-drive-price">¥{driving.total}</span>
            </div>
            <div className="ticket-drive-sub">过路费 ¥{driving.toll}  ·  油费 ¥{driving.fuel}</div>
          </div>
        </>
      )}
    </div>
  );
}

// ─── ✈️ 飞机区块 ───
function FlightBlock({ items }: { items: TripItem[] }) {
  const nearby = items.filter(i => i.mode === 'nearby');
  const transfers = items.filter(i => i.mode !== 'nearby');

  return (
    <>
      <div className="ticket-section-title">✈️ 飞机中转</div>
      {transfers.map((f, i) => (
        <div key={i} className="ticket-row">
          <span className="ticket-icon">转</span>
          <div className="ticket-row-body">
            <div className="ticket-row-name">
              {f.depart || ''} {f.from || ''}
              {f.via ? ` → ${f.via}` : ''}
              {f.stopDur ? ` ${f.stopDur}` : ''}
              {' → '}{f.arrive || ''} {f.to || ''}
            </div>
            <div className="ticket-row-detail">
              {f.airline || ''}{f.duration ? ` · ${f.duration}` : ''}
            </div>
          </div>
          <div className="ticket-row-right">
            <div className="ticket-price">{f.price ? `¥${f.price}` : ''}</div>
            {f.tag && <div className="ticket-tag">{f.tag}</div>}
          </div>
        </div>
      ))}
      {nearby.length > 0 && (
        <>
          <div className="ticket-section-title" style={{ fontSize: 12, paddingTop: 8 }}>📍 邻近城市出发</div>
          {nearby.map((f, i) => (
            <div key={i} className="ticket-row">
              <span className="ticket-icon">转</span>
              <div className="ticket-row-body">
                <div className="ticket-row-name">
                  {f.depart || ''} {f.from || ''}
                  {f.via ? ` → ${f.via}` : ''}
                  {' → '}{f.arrive || ''} {f.to || ''}
                </div>
                <div className="ticket-row-detail">
                  {f.airline || ''}{f.duration ? ` · ${f.duration}` : ''}
                </div>
              </div>
              <div className="ticket-row-right">
                <div className="ticket-price">{f.price ? `¥${f.price}` : ''}</div>
              </div>
            </div>
          ))}
        </>
      )}
    </>
  );
}

// ─── 🚄 高铁区块 ───
function TrainBlock({ items }: { items: TripItem[] }) {
  const directs = items.filter(i => i.mode === 'direct');
  const transfers = items.filter(i => i.mode === 'transfer');
  const others = items.filter(i => i.mode !== 'direct' && i.mode !== 'transfer');

  return (
    <>
      <div className="ticket-section-title">🚄 火车</div>
      {directs.length > 0 && (
        <>
          <div className="ticket-sub-label">直达</div>
          {directs.map((t, i) => (
            <div key={i} className="ticket-row">
              <div className="ticket-row-body">
                <div className="ticket-row-name">
                  {t.trainNo || ''}  {t.from || ''} → {t.to || ''}
                </div>
                <div className="ticket-row-detail">
                  {t.depart || ''} - {t.arrive || ''}  ·  {t.duration || ''}
                </div>
              </div>
              <div className="ticket-row-right">
                <div className="ticket-price">{t.price ? `¥${t.price}` : ''}</div>
              </div>
            </div>
          ))}
        </>
      )}
      {(transfers.length > 0 || others.length > 0) && (
        <>
          <div className="ticket-sub-label">中转</div>
          {[...transfers, ...others].map((t, i) => (
            <div key={i} className="ticket-row">
              <span className="ticket-icon">转</span>
              <div className="ticket-row-body">
                <div className="ticket-row-name">
                  {t.from || ''}{t.via ? ` → ${t.via}` : ''} → {t.to || ''}
                </div>
                <div className="ticket-row-detail">
                  {t.trainNo || ''}
                  {t.depart ? ` ${t.depart}-${t.arrive || ''}` : ''}
                  {t.duration ? ` · ${t.duration}` : ''}
                  {t.stopDur ? ` · 等${t.stopDur}` : ''}
                </div>
              </div>
              <div className="ticket-row-right">
                <div className="ticket-price">{t.totalPrice ? `¥${t.totalPrice}` : t.price ? `¥${t.price}` : ''}</div>
              </div>
            </div>
          ))}
        </>
      )}
    </>
  );
}

// ─── Fallback raw text ───
function RawSection({ title, text }: { title: string; text: string }) {
  const lines = text.split('\n').filter(l => l.includes('│') && l.split('│').filter(Boolean).length >= 3);
  const rows = lines.filter(l => !/^[\s│\-:]+$/.test(l)).map(l => l.split('│').map(c => c.trim()).filter(Boolean)).filter(r => r.length >= 2);

  return (
    <>
      <div className="ticket-section-title">{title}</div>
      {rows.length > 0 ? rows.map((cols, i) => (
        <div key={i} className="ticket-row">
          <div className="ticket-row-body">
            <div className="ticket-row-name">{cols.slice(0, -1).join(' · ')}</div>
          </div>
          <div className="ticket-row-right">
            <div className="ticket-price">{cols[cols.length - 1]}</div>
          </div>
        </div>
      )) : <div className="ticket-empty">{text.slice(0, 300)}</div>}
    </>
  );
}
