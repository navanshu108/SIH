export interface DailyForecast {
  day: string;
  rain: number;
  temp: number;
}

export interface LiveContext {
  location: string;
  latitude: number;
  longitude: number;
  temperature: number;
  feelsLike: number;
  humidity: number;
  wind: number;
  rainProbability: number;
  maxRain24h: number;
  maxTemp24h: number;
  rain7daySum: number;
  dailyForecast: DailyForecast[];
  updatedAt: string;
  source: 'live' | 'saved';
  accuracyMetres?: number;
}

export async function getLiveContextForLocation(
  lat: number,
  lng: number,
  locationName: string = 'Saved Location'
): Promise<LiveContext> {
  // Add &models=best_match to the end of the URL
const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,wind_speed_10m&hourly=precipitation_probability,precipitation&daily=temperature_2m_max,precipitation_sum,precipitation_probability_max&timezone=auto&models=best_match`;

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error('Failed to fetch Open-Meteo data');
  }

  const data = await res.json();

  const current = data.current;
  const daily = data.daily;
  const hourly = data.hourly;

  // Next 12-24h rain probability and accumulation
  const rainProb12h = hourly?.precipitation_probability?.slice(0, 12) || [];
  const maxRainProb = rainProb12h.length ? Math.max(...rainProb12h) : (daily?.precipitation_probability_max?.[0] ?? 0);
  const rainNext24h = (hourly?.precipitation?.slice(0, 24) || []).reduce((acc: number, v: number) => acc + (v || 0), 0);

  // 7-day daily forecast format for Recharts
  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const dailyForecast: DailyForecast[] = (daily?.time || []).slice(0, 7).map((t: string, idx: number) => {
    const d = new Date(t);
    return {
      day: weekdays[d.getDay()],
      rain: Math.round((daily.precipitation_sum?.[idx] || 0) * 10) / 10,
      temp: Math.round(daily.temperature_2m_max?.[idx] || 0),
    };
  });

  const rain7daySum = (daily?.precipitation_sum || []).slice(0, 7).reduce((a: number, b: number) => a + (b || 0), 0);

  return {
    location: locationName,
    latitude: lat,
    longitude: lng,
    temperature: Math.round(current.temperature_2m),
    feelsLike: Math.round(current.apparent_temperature),
    humidity: Math.round(current.relative_humidity_2m),
    wind: Math.round(current.wind_speed_10m),
    rainProbability: Math.round(maxRainProb),
    maxRain24h: Math.round(rainNext24h * 10) / 10,
    maxTemp24h: Math.round(daily?.temperature_2m_max?.[0] ?? current.temperature_2m),
    rain7daySum: Math.round(rain7daySum * 10) / 10,
    dailyForecast,
    updatedAt: new Date().toISOString(),
    source: 'live',
  };
}

export async function getSavedLocationContext(): Promise<LiveContext | null> {
  const latStr = localStorage.getItem('kisansetu_lat');
  const lngStr = localStorage.getItem('kisansetu_lng');
  const loc = localStorage.getItem('kisansetu_location') || 'Your Farm';

  if (!latStr || !lngStr || latStr === '0' || lngStr === '0') {
    return null;
  }

  const lat = parseFloat(latStr);
  const lng = parseFloat(lngStr);

  try {
    return await getLiveContextForLocation(lat, lng, loc);
  } catch (err) {
    console.error('Error fetching weather:', err);
    return null;
  }
}

export async function getLiveContext(): Promise<LiveContext> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation not supported'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude, accuracy } = pos.coords;
        const name = await reverseGeocode(latitude, longitude);
        const ctx = await getLiveContextForLocation(latitude, longitude, name);
        ctx.accuracyMetres = accuracy;
        resolve(ctx);
      },
      (err) => reject(err),
      { enableHighAccuracy: true, timeout: 12000 }
    );
  });
}

export async function reverseGeocode(lat: number, lng: number): Promise<string> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&zoom=10&addressdetails=1`,
      { headers: { 'Accept-Language': 'en' } }
    );
    if (!res.ok) return `${lat.toFixed(4)}°N, ${lng.toFixed(4)}°E`;
    const data = await res.json();
    const a = data.address;
    if (a) {
      const city = a.city || a.town || a.village || a.suburb || a.hamlet || a.county;
      const state = a.state;
      return [city, state].filter(Boolean).join(', ');
    }
    return data.display_name?.split(',').slice(0, 2).join(', ') || `${lat.toFixed(4)}°N, ${lng.toFixed(4)}°E`;
  } catch {
    return `${lat.toFixed(4)}°N, ${lng.toFixed(4)}°E`;
  }
}