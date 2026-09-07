import { WeatherData } from '../types';

export const searchLocation = async (query: string) => {
  const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=5&language=en&format=json`);
  const data = await res.json();
  return data.results || [];
};

export const getForecast = async (lat: number, lon: number): Promise<WeatherData> => {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,precipitation,cloud_cover,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max&timezone=auto`;
  const res = await fetch(url);
  const data = await res.json();
  
  const forecast = data.daily.time.map((t: string, i: number) => ({
    date: t,
    min: data.daily.temperature_2m_min[i],
    max: data.daily.temperature_2m_max[i],
    rainProb: data.daily.precipitation_probability_max[i],
    rain: data.daily.precipitation_sum[i],
    icon: data.daily.precipitation_sum[i] > 5 ? 'Rain' : 'Clear'
  })).slice(0, 7);

  return {
    temp: data.current.temperature_2m,
    humidity: data.current.relative_humidity_2m,
    rainProb: forecast[0].rainProb,
    rainSum: data.current.precipitation,
    condition: data.current.weather_code > 50 ? 'Rainy' : 'Clear',
    forecast,
    fetchedAt: Date.now()
  };
};