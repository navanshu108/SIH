/**
 * nrscService.ts
 *
 * Primary data source: NRSC/Bhuvan backend (when VITE_NRSC_CONTEXT_API_URL is configured).
 * Fallback: Open-Meteo (free, real Indian weather data, no API key required).
 *
 * NRSC (National Remote Sensing Centre) does NOT have a public unauthenticated API.
 * To use real NRSC satellite data, set up a backend proxy and point
 * VITE_NRSC_CONTEXT_API_URL to it. Until then, Open-Meteo provides accurate live data.
 */

import type { LiveContext } from './liveContextService';

export type NrscData = {
  temp: number;
  humidity: number;
  recentRain: number;       // mm in last 48 h
  forecastRain: number;     // mm expected next 24 h
  soilMoistureIndex: string;
  satelliteInundation: string;
  condition: string;
  fetchedAt: number;
  source: 'nrsc-live' | 'openmeteo-live' | 'unavailable';
  location: string;
};

/** Weather code → human readable condition (WMO standard used by Open-Meteo) */
function wmoToCondition(code: number): string {
  if (code === 0) return 'Clear sky';
  if (code <= 3) return 'Partly cloudy';
  if (code <= 48) return 'Foggy / hazy';
  if (code <= 57) return 'Drizzle';
  if (code <= 67) return 'Rainy';
  if (code <= 77) return 'Snow / sleet';
  if (code <= 82) return 'Rain showers';
  if (code <= 99) return 'Thunderstorm';
  return 'Cloudy';
}

/** Derive a rough soil moisture descriptor from recent rain totals */
function soilMoistureLabel(recentRain: number): string {
  if (recentRain > 80) return 'High / Saturated';
  if (recentRain > 40) return 'Moderate / Wet';
  if (recentRain > 15) return 'Adequate';
  if (recentRain > 5) return 'Low / Drying';
  return 'Very Low / Dry';
}

/** Derive a rough inundation label from recent rain + forecast */
function inundationLabel(recentRain: number, forecastRain: number): string {
  const total = recentRain + forecastRain;
  if (total > 120) return 'High risk of surface water / flooding';
  if (total > 60)  return 'Partial surface water possible';
  if (total > 25)  return 'Minor waterlogging risk';
  return 'No inundation signal';
}

/**
 * Fetch real weather + derived agronomic indicators for a coordinate pair.
 * Tries NRSC backend first (if configured), falls back to Open-Meteo.
 */
export async function fetchNrscData(lat: number, lon: number): Promise<NrscData> {
  // ── 1. Try NRSC backend proxy ──────────────────────────────────────────
  const nrscEndpoint = import.meta.env.VITE_NRSC_CONTEXT_API_URL as string | undefined;
  if (nrscEndpoint) {
    try {
      const res = await fetch(nrscEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ latitude: lat, longitude: lon }),
      });
      if (res.ok) {
        const d = await res.json();
        return { ...d, source: 'nrsc-live', fetchedAt: Date.now() };
      }
    } catch {
      // Fall through to Open-Meteo
    }
  }

  // ── 2. Open-Meteo fallback (real data, no API key) ────────────────────
  try {
    const url =
      `https://api.open-meteo.com/v1/forecast` +
      `?latitude=${lat}&longitude=${lon}` +
      `&current=temperature_2m,relative_humidity_2m,weather_code` +
      `&daily=precipitation_sum,precipitation_probability_max` +
      `&past_days=2&forecast_days=2&timezone=auto`;

    const res = await fetch(url);
    if (!res.ok) throw new Error('Open-Meteo unavailable');
    const d = await res.json();

    const dailyRain: number[] = d.daily?.precipitation_sum ?? [];
    // past_days=2 gives [day-2, day-1, today, tomorrow]
    const recentRain = (dailyRain[0] ?? 0) + (dailyRain[1] ?? 0) + (dailyRain[2] ?? 0);
    const forecastRain = dailyRain[3] ?? 0;
    const code: number = d.current?.weather_code ?? 0;

    return {
      temp: Math.round(d.current.temperature_2m),
      humidity: d.current.relative_humidity_2m,
      recentRain: Math.round(recentRain * 10) / 10,
      forecastRain: Math.round(forecastRain * 10) / 10,
      soilMoistureIndex: soilMoistureLabel(recentRain),
      satelliteInundation: inundationLabel(recentRain, forecastRain),
      condition: wmoToCondition(code),
      fetchedAt: Date.now(),
      source: 'openmeteo-live',
      location: `${lat.toFixed(4)}°N, ${lon.toFixed(4)}°E`,
    };
  } catch {
    return {
      temp: 0, humidity: 0, recentRain: 0, forecastRain: 0,
      soilMoistureIndex: 'Unavailable',
      satelliteInundation: 'Unavailable',
      condition: 'Data unavailable',
      fetchedAt: Date.now(),
      source: 'unavailable',
      location: `${lat.toFixed(4)}°N, ${lon.toFixed(4)}°E`,
    };
  }
}

export type { LiveContext };