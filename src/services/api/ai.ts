import { httpGet } from './httpClient';

interface AIResponse {
  climate: string;
  vegetation: string;
  attractions: { name: string; desc: string }[];
  culture: string;
  tips: string;
}

export async function fetchCityInfo(
  cityName: string,
  countryName: string,
): Promise<AIResponse> {
  const params = new URLSearchParams({
    city: cityName,
    country: countryName,
  });

  const url = `/api/ai?${params.toString()}`;
  return await httpGet<AIResponse>(url, 30000);
}
