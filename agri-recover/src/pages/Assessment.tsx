import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { searchLocation, getForecast } from '../services/weatherService';
import { AssessmentData } from '../types';
import { saveAssessment } from '../utils/storage';
import { MapPin, Cloud, Droplets, Leaf, CheckCircle } from 'lucide-react';

const initialData: AssessmentData = {
  id: '',
  date: Date.now(),
  location: { name: '', lat: 0, lon: 0 },
  crop: { name: 'Soybean', stage: 'Flowering', age: 45 },
  flood: { durationDays: 0, maxDepthCm: 0, standingWater: false },
  soil: { drainage: 'Moderate' },
  condition: { damagePercent: 0, yellowing: false, lodging: false },
  weather: null,
  notes: ''
};

export const Assessment = () => {
  const [step, setStep] = useState(1);
  const [data, setData] = useState<AssessmentData>(initialData);
  const [locSearch, setLocSearch] = useState('');
  const [locResults, setLocResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSearch = async () => {
    setLoading(true);
    try {
      const res = await searchLocation(locSearch);
      setLocResults(res);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const selectLocation = (loc: any) => {
    setData(prev => ({ ...prev, location: { name: `${loc.name}, ${loc.admin1}`, lat: loc.latitude, lon: loc.longitude } }));
    setLocResults([]);
    setStep(2);
  };

  const handleFinish = async () => {
    setLoading(true);
    try {
      if (data.location.lat !== 0) {
        const weather = await getForecast(data.location.lat, data.location.lon);
        data.weather = weather;
      }
    } catch (e) {
      console.error("Weather fetch failed, continuing without live weather.");
    }
    data.id = `assmnt_${Date.now()}`;
    saveAssessment(data);
    setLoading(false);
    navigate('/');
  };

  const steps = [
    { num: 1, title: 'Location', icon: MapPin },
    { num: 2, title: 'Crop & Flood', icon: Droplets },
    { num: 3, title: 'Damage', icon: Leaf },
  ];

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="bg-agri-900 p-6 flex justify-between items-center text-white">
        {steps.map(s => (
          <div key={s.num} className={`flex items-center gap-2 ${step >= s.num ? 'opacity-100' : 'opacity-40'}`}>
            <s.icon className="w-5 h-5" />
            <span className="hidden sm:inline font-medium text-sm">{s.title}</span>
          </div>
        ))}
      </div>

      <div className="p-8">
        {step === 1 && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-800 mb-2">Where is your field?</h2>
            <div className="flex gap-2">
              <input type="text" value={locSearch} onChange={e => setLocSearch(e.target.value)} placeholder="e.g. Indore, Madhya Pradesh" className="flex-1 p-3 border rounded-lg focus:ring-2 focus:ring-agri-500 outline-none" />
              <button onClick={handleSearch} disabled={loading} className="bg-agri-700 text-white px-6 py-3 rounded-lg font-medium hover:bg-agri-800 disabled:opacity-50">Search</button>
            </div>
            <div className="space-y-2">
              {locResults.map((r, i) => (
                <button key={i} onClick={() => selectLocation(r)} className="w-full text-left p-3 hover:bg-gray-50 border rounded-lg text-sm text-gray-700">
                  {r.name}, {r.admin1}, {r.country}
                </button>
              ))}
            </div>
            {/* Demo Button to skip API typing */}
            <button onClick={() => selectLocation({ name: 'Indore', admin1: 'Madhya Pradesh', latitude: 22.71, longitude: 75.85 })} className="text-xs text-agri-700 font-semibold underline mt-4">Load Demo Location</button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-800">Crop & Flood Details</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Crop</label>
                <select value={data.crop.name} onChange={e => setData(prev => ({...prev, crop: {...prev.crop, name: e.target.value}}))} className="w-full p-3 border rounded-lg text-sm bg-white">
                  <option>Soybean</option>
                  <option>Maize</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Growth Stage</label>
                <select value={data.crop.stage} onChange={e => setData(prev => ({...prev, crop: {...prev.crop, stage: e.target.value}}))} className="w-full p-3 border rounded-lg text-sm bg-white">
                  <option>Vegetative</option>
                  <option>Flowering</option>
                  <option>Pod Formation</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Flood Duration (Days)</label>
                <input type="number" min="0" value={data.flood.durationDays} onChange={e => setData(prev => ({...prev, flood: {...prev.flood, durationDays: Number(e.target.value)}}))} className="w-full p-3 border rounded-lg text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Max Depth (cm)</label>
                <input type="number" min="0" value={data.flood.maxDepthCm} onChange={e => setData(prev => ({...prev, flood: {...prev.flood, maxDepthCm: Number(e.target.value)}}))} className="w-full p-3 border rounded-lg text-sm" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="standing" checked={data.flood.standingWater} onChange={e => setData(prev => ({...prev, flood: {...prev.flood, standingWater: e.target.checked}}))} className="w-4 h-4 text-agri-600 rounded" />
              <label htmlFor="standing" className="text-sm font-medium text-gray-700">Standing water is currently present in the field</label>
            </div>
            <button onClick={() => setStep(3)} className="w-full bg-agri-700 text-white p-3 rounded-lg font-bold hover:bg-agri-800">Next Step</button>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-800">Damage Assessment</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Plant Damage (%)</label>
              <input type="range" min="0" max="100" value={data.condition.damagePercent} onChange={e => setData(prev => ({...prev, condition: {...prev.condition, damagePercent: Number(e.target.value)}}))} className="w-full accent-agri-600" />
              <div className="text-center font-bold text-lg text-agri-700 mt-2">{data.condition.damagePercent}%</div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Soil Drainage Condition</label>
              <select value={data.soil.drainage} onChange={e => setData(prev => ({...prev, soil: {...prev.soil, drainage: e.target.value as any}}))} className="w-full p-3 border rounded-lg text-sm bg-white">
                <option>Good</option>
                <option>Moderate</option>
                <option>Poor</option>
              </select>
            </div>
            <button onClick={handleFinish} disabled={loading} className="w-full flex items-center justify-center gap-2 bg-agri-700 text-white p-3 rounded-lg font-bold hover:bg-agri-800 disabled:opacity-50">
              {loading ? 'Analyzing...' : <><CheckCircle className="w-5 h-5"/> Complete Assessment</>}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};