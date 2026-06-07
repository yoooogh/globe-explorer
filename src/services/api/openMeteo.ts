import { httpGet } from './httpClient';
import type { WeatherData } from '../../types/weather';
import { OPEN_METEO_BASE } from '../../utils/constants';

interface OpenMeteoResponse {
  current: {
    temperature_2m: number;
    relative_humidity_2m: number;
    wind_speed_10m: number;
    weather_code: number;
    time: string;
  };
}

export async function fetchCurrentWeather(
  lat: number,
  lon: number,
): Promise<WeatherData> {
  const params = new URLSearchParams({
    latitude: lat.toFixed(4),
    longitude: lon.toFixed(4),
    current: 'temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code',
    timezone: 'auto',
  });

  const url = `${OPEN_METEO_BASE}?${params.toString()}`;
  const raw = await httpGet<OpenMeteoResponse>(url, 8000);

  return {
    temperature: raw.current.temperature_2m,
    humidity: raw.current.relative_humidity_2m,
    windSpeed: raw.current.wind_speed_10m,
    weatherCode: raw.current.weather_code,
    timestamp: raw.current.time,
    latitude: lat,
    longitude: lon,
  };
}
