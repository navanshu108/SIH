import React from 'react';
import { WeatherData } from '../types';
import { CloudRain, Sun, Wind, Droplets } from 'lucide-react';

export const WeatherOverview = ({ weather }: { weather: WeatherData | null }) => {
  if (!weather) return <div className="p-4 bg-gray-50 rounded text-center text-gray-500">Live weather unavailable</div>;
  
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold text-gray-800">Current Field Weather</h3>
        <span className="text-xs text-gray-400">Source: Open-Meteo</span>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="flex items-center gap-3 bg-blue-50 p-3 rounded-lg">
          <Sun className="text-orange-500 w-6 h-6" />
          <div><p className="text-xs text-gray-500">Temp</p><p className="font-bold text-gray-800">{weather.temp}°C</p></div>
        </div>
        <div className="flex items-center gap-3 bg-blue-50 p-3 rounded-lg">
          <Droplets className="text-blue-500 w-6 h-6" />
          <div><p className="text-xs text-gray-500">Humidity</p><p className="font-bold text-gray-800">{weather.humidity}%</p></div>
        </div>
        <div className="flex items-center gap-3 bg-blue-50 p-3 rounded-lg">
          <CloudRain className="text-blue-400 w-6 h-6" />
          <div><p className="text-xs text-gray-500">Rain Prob</p><p className="font-bold text-gray-800">{weather.rainProb}%</p></div>
        </div>
        <div className="flex items-center gap-3 bg-blue-50 p-3 rounded-lg">
          <Wind className="text-gray-500 w-6 h-6" />
          <div><p className="text-xs text-gray-500">Rainfall</p><p className="font-bold text-gray-800">{weather.rainSum} mm</p></div>
        </div>
      </div>
    </div>
  );
};