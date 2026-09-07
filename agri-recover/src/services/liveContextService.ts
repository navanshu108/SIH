export type DayForecast = {
  day: string;
  temp: number;
  rain: number;
};

export type LiveContext = {
  location: string;
  latitude: number;
  longitude: number;
  temperature: number;
  /** Apparent / feels-like temperature °C */
  feelsLike: number;
  humidity: number;
  wind: number;
  /** Max precipitation probability in the next 12 h (%) */
  rainProbability: number;
  /** Max precipitation sum in the next 24 h (mm) */
  maxRain24h: number;
  /** Max temperature in the next 24 h (°C) */
  maxTemp24h: number;
  /** Sum of rain over next 7 days (mm) — used for drought signal */
  rain7daySum: number;
  /** 7-day daily forecast for charts */
  dailyForecast: DayForecast[];
  source: 'live' | 'offline';
  updatedAt: string;
  /** GPS accuracy in metres (only set when from device GPS) */
  accuracyMetres?: number;
};

const DAY_LABELS = ['Today', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun', 'Mon', 'Tue', 'Wed'];

function buildDayLabel(isoDate: string, index: number): string {
  if (index === 0) return 'Today';
  try {
    return new Date(isoDate).toLocaleDateString('en-IN', { weekday: 'short' });
  } catch {
    return DAY_LABELS[index] ?? `Day ${index + 1}`;
  }
}

const fallback: LiveContext = {
  location: 'Saved location',
  latitude: 23.2,
  longitude: 77.1,
  temperature: 28,
  feelsLike: 30,
  humidity: 72,
  wind: 14,
  rainProbability: 70,
  maxRain24h: 18,
  maxTemp24h: 31,
  rain7daySum: 45,
  dailyForecast: [
    { day: 'Today', temp: 28, rain: 18 },
    { day: 'Tue', temp: 27, rain: 32 },
    { day: 'Wed', temp: 29, rain: 12 },
    { day: 'Thu', temp: 31, rain: 4 },
    { day: 'Fri', temp: 30, rain: 8 },
    { day: 'Sat', temp: 29, rain: 20 },
    { day: 'Sun', temp: 28, rain: 16 },
  ],
  source: 'offline',
  updatedAt: new Date().toISOString(),
};

/** Build a clean short place name from Nominatim's address object. */
function shortName(data: Record<string, unknown>): string {
  const a = data.address as Record<string, string> | undefined;
  if (!a) return (data.display_name as string) ?? 'Selected location';
  const parts: string[] = [];
  const city = a.city || a.town || a.village || a.suburb || a.hamlet;
  if (city) parts.push(city);
  const district = a.county || a.district || a.state_district;
  if (district && district !== city) parts.push(district);
  if (a.state) parts.push(a.state);
  return parts.length ? parts.join(', ') : (data.display_name as string) ?? 'Selected location';
}

async function weatherAt(latitude: number, longitude: number, location: string): Promise<LiveContext> {
  const url =
    `https://api.open-meteo.com/v1/forecast` +
    `?latitude=${latitude}&longitude=${longitude}` +
    `&current=temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,weather_code` +
    `&hourly=precipitation_probability,precipitation` +
    `&daily=precipitation_sum,temperature_2m_max,precipitation_probability_max,time` +
    `&forecast_days=7&timezone=auto`;

  const res = await fetch(url);
  if (!res.ok) throw new Error('Weather service unavailable');
  const d = await res.json();

  const hourlyProb: number[] = d.hourly?.precipitation_probability ?? [];
  const hourlyRain: number[] = d.hourly?.precipitation ?? [];

  // Next 12 h max rain probability
  const rainProbability = Math.max(...hourlyProb.slice(0, 12), 0);
  // Next 24 h precipitation total
  const maxRain24h = hourlyRain.slice(0, 24).reduce((a: number, b: number) => a + (b ?? 0), 0);

  // 7-day daily data
  const dailyDates: string[] = d.daily?.time ?? [];
  const dailySums: number[] = d.daily?.precipitation_sum ?? [];
  const dailyMaxTemps: number[] = d.daily?.temperature_2m_max ?? [];

  const rain7daySum = dailySums.reduce((a: number, b: number) => a + (b ?? 0), 0);
  const maxTemp24h: number = dailyMaxTemps[0] ?? Math.round(d.current.temperature_2m);

  const dailyForecast: DayForecast[] = dailyDates.map((date, i) => ({
    day: buildDayLabel(date, i),
    temp: Math.round(dailyMaxTemps[i] ?? 0),
    rain: Math.round((dailySums[i] ?? 0) * 10) / 10,
  }));

  return {
    location,
    latitude,
    longitude,
    temperature: Math.round(d.current.temperature_2m),
    feelsLike: Math.round(d.current.apparent_temperature),
    humidity: d.current.relative_humidity_2m,
    wind: Math.round(d.current.wind_speed_10m),
    rainProbability,
    maxRain24h: Math.round(maxRain24h * 10) / 10,
    maxTemp24h: Math.round(maxTemp24h),
    rain7daySum: Math.round(rain7daySum * 10) / 10,
    dailyForecast,
    source: 'live',
    updatedAt: new Date().toISOString(),
  };
}

/** Optional NRSC backend enrichment (only used when VITE_NRSC_CONTEXT_API_URL is set). */
async function nrscContext(latitude: number, longitude: number): Promise<LiveContext | undefined> {
  const endpoint = import.meta.env.VITE_NRSC_CONTEXT_API_URL as string | undefined;
  if (!endpoint) return undefined;
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ latitude, longitude }),
  });
  if (!response.ok) throw new Error('NRSC context unavailable');
  const data = await response.json();
  return { ...fallback, ...data, latitude, longitude, source: 'live', updatedAt: new Date().toISOString() };
}

export async function getLiveContextForLocation(
  latitude: number,
  longitude: number,
  location: string,
): Promise<LiveContext> {
  try {
    return (await nrscContext(latitude, longitude)) ?? (await weatherAt(latitude, longitude, location));
  } catch {
    try {
      return await weatherAt(latitude, longitude, location);
    } catch {
      return { ...fallback, location, latitude, longitude };
    }
  }
}

export async function getLiveContext(): Promise<LiveContext> {
  if (!navigator.geolocation) return fallback;
  return new Promise(resolve =>
    navigator.geolocation.getCurrentPosition(
      async p => {
        const name = await reverseGeocode(p.coords.latitude, p.coords.longitude);
        const ctx = await getLiveContextForLocation(p.coords.latitude, p.coords.longitude, name);
        resolve({ ...ctx, accuracyMetres: p.coords.accuracy });
      },
      () => resolve(fallback),
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 60000 },
    ),
  );
}

/** Returns a clean short place name, e.g. "Vidisha, Madhya Pradesh". */
export async function reverseGeocode(latitude: number, longitude: number): Promise<string> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}&zoom=10&addressdetails=1`,
      { headers: { 'Accept-Language': 'en' } },
    );
    if (!res.ok) throw new Error();
    const data = await res.json();
    return shortName(data);
  } catch {
    return `${latitude.toFixed(4)}°N, ${longitude.toFixed(4)}°E`;
  }
}

/** Load context for the saved location from localStorage. Returns undefined if nothing saved. */
export async function getSavedLocationContext(): Promise<LiveContext | undefined> {
  const lat = Number(localStorage.getItem('kisansetu_lat'));
  const lng = Number(localStorage.getItem('kisansetu_lng'));
  const loc = localStorage.getItem('kisansetu_location');
  if (!lat || !lng) return undefined;
  return getLiveContextForLocation(lat, lng, loc ?? `${lat.toFixed(4)}°N`);
}
