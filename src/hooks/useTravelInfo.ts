import { useState, useEffect } from 'react';

interface TravelData {
  driving: {
    distance: number;
    time: string;
    toll: number;
    fuel: number;
    total: number;
  } | null;
  train: {
    distance: number;
    time: string;
    secondClass: number;
    firstClass: number;
    businessClass: number;
  } | null;
  flight: {
    price: string;
    time: string;
    note: string;
  } | null;
  error?: string;
}

const cache: Record<string, { data: TravelData; ts: number }> = {};
const TTL = 10 * 60 * 1000; // 10 min

export function useTravelInfo(
  fromLat: number | undefined,
  fromLon: number | undefined,
  fromCity: string | undefined,
  toLat: number | undefined,
  toLon: number | undefined,
  toCity: string | undefined,
) {
  const [data, setData] = useState<TravelData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!fromLat || !toLat) return;

    const cacheKey = `${fromLat.toFixed(2)},${fromLon?.toFixed(2)}|${toLat.toFixed(2)},${toLon?.toFixed(2)}`;
    const cached = cache[cacheKey];
    if (cached && Date.now() - cached.ts < TTL) {
      setData(cached.data);
      return;
    }

    setLoading(true);
    setError(null);

    const params = new URLSearchParams({
      fromLat: fromLat.toFixed(5),
      fromLon: (fromLon || 0).toFixed(5),
      toLat: toLat.toFixed(5),
      toLon: (toLon || 0).toFixed(5),
      fromCity: fromCity || '',
      toCity: toCity || '',
    });

    fetch(`/api/travel?${params}`)
      .then(async (res) => {
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || '请求失败');
        return json as TravelData;
      })
      .then((result) => {
        cache[cacheKey] = { data: result, ts: Date.now() };
        setData(result);
        setLoading(false);
      })
      .catch((e) => {
        setError(e.message);
        setLoading(false);
      });
  }, [fromLat, fromLon, fromCity, toLat, toLon, toCity]);

  return { data, loading, error };
}
