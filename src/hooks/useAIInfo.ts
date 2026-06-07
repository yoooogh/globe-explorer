import { useState, useEffect } from 'react';

interface AIResponse {
  climate: string;
  vegetation: string;
  attractions: { name: string; desc: string }[];
  culture: string;
  tips: string;
  error?: string;
}

// Cache to avoid duplicate calls
const cache: Record<string, { data: AIResponse; timestamp: number }> = {};
const CACHE_TTL = 30 * 60 * 1000; // 30 min

export function useAIInfo(placeName: string | undefined, countryName: string | undefined) {
  const [data, setData] = useState<AIResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!placeName || !countryName) return;

    const cacheKey = `${placeName}|${countryName}`;
    const cached = cache[cacheKey];
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      setData(cached.data);
      return;
    }

    setLoading(true);
    setError(null);

    const params = new URLSearchParams({ city: placeName, country: countryName });
    fetch(`/api/ai?${params.toString()}`)
      .then(async (res) => {
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || '请求失败');
        return json as AIResponse;
      })
      .then((result) => {
        cache[cacheKey] = { data: result, timestamp: Date.now() };
        setData(result);
        setLoading(false);
      })
      .catch((e) => {
        setError(e.message);
        setLoading(false);
      });
  }, [placeName, countryName]);

  return { data, loading, error };
}
