import { NrscData } from '../types';

// Simulating a fetch to NRSC Bhuvan / IMD APIs
export const fetchNrscData = async (lat: number, lon: number): Promise<NrscData> => {
  // In a real app, this would be an API call to NRSC/IMD. 
  // Here we use a deterministic mock based on coordinates to guarantee local offline resilience.
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        temp: 28,
        humidity: 82,
        recentRain: 45, // mm in last 48h
        forecastRain: 12, // mm expected
        soilMoistureIndex: 'High / Saturated',
        satelliteInundation: 'Partial Surface Water Detected',
        condition: 'Cloudy / Humid',
        fetchedAt: Date.now()
      });
    }, 800); // Simulate network latency
  });
};