import { useEffect } from 'react';
import { useWeatherStore } from '../store/weatherStore';

export function useWeather(lat: number | undefined, lon: number | undefined) {
  const fetchWeather = useWeatherStore((s) => s.fetchWeather);
  const key = lat !== undefined && lon !== undefined
    ? `${lat.toFixed(2)},${lon.toFixed(2)}`
    : null;
  const cache = useWeatherStore((s) => s.cache);
  const isLoading = useWeatherStore((s) => s.isLoading);
  const error = useWeatherStore((s) => s.error);

  useEffect(() => {
    if (lat !== undefined && lon !== undefined) {
      fetchWeather(lat, lon);
    }
  }, [lat, lon, fetchWeather]);

  const data = key ? cache[key]?.data ?? null : null;

  return { data, loading: isLoading, error };
}
