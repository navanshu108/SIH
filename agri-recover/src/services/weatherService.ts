import { weather } from './mockServices';
/** Replace this mock boundary with a server-backed weather API when configured. */
export async function getWeather(_location: string) { return weather; }
