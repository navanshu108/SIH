import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchNrscData } from '../services/nrscService';
import { AssessmentData } from '../types';
import { saveAssessment } from '../utils/storage';
import { MapPin, Sprout, Droplets, Mountain, Activity, Target, ChevronRight, CheckCircle2 } from 'lucide-react';

const initialData: AssessmentData = {
  id: '', date: Date.now(),
  location: { name: '', lat: 0, lon: 0, elevation: 'Flat' },
  crop: { name: 'Green Gram (Moong)', variety: '', daysAfterSowing: 30, stage: 'Flowering (25-30d)' },
  flood: { durationDays: 0, maxDepthCm: 0, submergence: 'Partial', drainageStatus: 'Slow' },
  soil: { type: 'Loam', fieldCondition: 'Wet' },
  condition: { damagePercent: 0, yellowing: 'None', wilting: false, lodging: false, rotSymptoms: false },
  goals: { resources: 'Medium', riskPreference: 'Medium', seedAvailability: true, laborAvailability: true },
  nrscWeather: null, notes: ''
};

export const Assessment = () => {
  const [step, setStep] = useState(1);
  const [data, setData] = useState<AssessmentData>(initialData);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleFinish = async () => {
    setLoading(true);
    try {
      const weather = await fetchNrscData(data.location.lat, data.location.lon);
      data.nrscWeather = weather;
    } catch (e) {
      console.error(e);
    }
    data.id = `assmnt_${Date.now()}`;
    saveAssessment(data);
    setLoading(false);
    navigate('/');
  };

  const steps = [
    { num: 1, title: 'Location', icon: MapPin },
    { num: 2, title: 'Crop', icon: Sprout },
    { num: 3, title: 'Flood', icon: Droplets },
    { num: 4, title: 'Soil', icon: Mountain },
    { num: 5, title: 'Condition', icon: Activity },
    { num: 6, title: 'Goals', icon: Target },
  ];

  return (
    <div className="max-w-3xl mx-auto bg-white dark:bg-slate-950 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
      <div className="bg-emerald-900 p-4 md:p-6 flex justify-between items-center text-white overflow-x-auto">
        {steps.map(s => (
          <div key={s.num} className={`flex flex-col items-center min-w-[60px] ${step >= s.num ? 'opacity-100 text-emerald-300' : 'opacity-40'}`}>
            <s.icon className="w-5 h-5 mb-1" />
            <span className="text-[10px] font-bold uppercase tracking-wider">{s.title}</span>
          </div>
        ))}
      </div>

      <div className="p-6 md:p-10 bg-slate-50 dark:bg-slate-900 min-h-[400px]">
        {step === 1 && (
          <div className="space-y-6 animate-in fade-in">
            <div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white">1. Farm Information</h2>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Village / District Name</label>
              <input type="text" value={data.location.name} onChange={e => setData({...data, location: {...data.location, name: e.target.value}})} placeholder="e.g. Jabalpur, Madhya Pradesh" className="w-full p-4 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none bg-white dark:bg-slate-800 dark:text-white" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Latitude</label>
                <input type="number" placeholder="23.18" className="w-full p-4 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 dark:text-white" />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Longitude</label>
                <input type="number" placeholder="79.98" className="w-full p-4 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 dark:text-white" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Field Topography</label>
              <select value={data.location.elevation} onChange={e => setData({...data, location: {...data.location, elevation: e.target.value}})} className="w-full p-4 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 dark:text-white">
                <option>Flat</option>
                <option>Low-lying / Depression</option>
                <option>Sloped</option>
              </select>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 animate-in fade-in">
            <div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white">2. Crop Information</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Crop Name</label>
                <select value={data.crop.name} onChange={e => setData({...data, crop: {...data.crop, name: e.target.value}})} className="w-full p-4 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 dark:text-white">
                  <option>Green Gram (Moong)</option>
                  <option>Maize (Makka)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Variety (Optional)</label>
                <input type="text" placeholder="e.g. Pusa Vishal" className="w-full p-4 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 dark:text-white" />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Days after Sowing</label>
                <input type="number" value={data.crop.daysAfterSowing} onChange={e => setData({...data, crop: {...data.crop, daysAfterSowing: Number(e.target.value)}})} className="w-full p-4 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 dark:text-white" />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Current Growth Stage</label>
                <select value={data.crop.stage} onChange={e => setData({...data, crop: {...data.crop, stage: e.target.value}})} className="w-full p-4 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 dark:text-white">
                  <option>Vegetative (10-20d)</option>
                  <option>Flowering (25-30d)</option>
                  <option>Pod Formation (35-50d)</option>
                  <option>Maturity (60-70d)</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6 animate-in fade-in">
            <div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white">3. Flood Information</h2>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Duration (Days)</label>
                <input type="number" min="0" value={data.flood.durationDays} onChange={e => setData({...data, flood: {...data.flood, durationDays: Number(e.target.value)}})} className="w-full p-4 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 dark:text-white" />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Max Depth (cm)</label>
                <input type="number" min="0" value={data.flood.maxDepthCm} onChange={e => setData({...data, flood: {...data.flood, maxDepthCm: Number(e.target.value)}})} className="w-full p-4 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 dark:text-white" />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Submergence</label>
                <select value={data.flood.submergence} onChange={e => setData({...data, flood: {...data.flood, submergence: e.target.value as any}})} className="w-full p-4 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 dark:text-white">
                  <option>Partial</option>
                  <option>Complete</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Drainage Speed</label>
                <select value={data.flood.drainageStatus} onChange={e => setData({...data, flood: {...data.flood, drainageStatus: e.target.value as any}})} className="w-full p-4 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 dark:text-white">
                  <option>Fast</option>
                  <option>Slow</option>
                  <option>Not Drained</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-6 animate-in fade-in">
             <div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white">4. Soil & Field Status</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Soil Type</label>
                <select value={data.soil.type} onChange={e => setData({...data, soil: {...data.soil, type: e.target.value as any}})} className="w-full p-4 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 dark:text-white">
                  <option>Loam</option>
                  <option>Clay (Heavy)</option>
                  <option>Sandy</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Current Field Condition</label>
                <select value={data.soil.fieldCondition} onChange={e => setData({...data, soil: {...data.soil, fieldCondition: e.target.value as any}})} className="w-full p-4 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 dark:text-white">
                  <option>Dry</option>
                  <option>Wet</option>
                  <option>Muddy</option>
                  <option>Standing Water</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="space-y-6 animate-in fade-in">
            <div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white">5. Crop Condition</h2>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Estimated Plant Damage (%)</label>
              <input type="range" min="0" max="100" value={data.condition.damagePercent} onChange={e => setData({...data, condition: {...data.condition, damagePercent: Number(e.target.value)}})} className="w-full accent-emerald-600 h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer" />
              <div className="text-center font-black text-2xl text-emerald-600 dark:text-emerald-400 mt-3">{data.condition.damagePercent}%</div>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Yellowing</label>
                <select value={data.condition.yellowing} onChange={e => setData({...data, condition: {...data.condition, yellowing: e.target.value as any}})} className="w-full p-4 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 dark:text-white">
                  <option>None</option>
                  <option>Mild</option>
                  <option>Moderate</option>
                  <option>Severe</option>
                </select>
              </div>
              <div className="flex flex-col justify-center space-y-4 bg-white dark:bg-slate-800 p-4 border border-slate-200 dark:border-slate-700 rounded-xl">
                <label className="flex items-center gap-3">
                  <input type="checkbox" checked={data.condition.rotSymptoms} onChange={e => setData({...data, condition: {...data.condition, rotSymptoms: e.target.checked}})} className="w-5 h-5 text-emerald-600 rounded" />
                  <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Root/Stalk Rot Visible</span>
                </label>
                <label className="flex items-center gap-3">
                  <input type="checkbox" checked={data.condition.lodging} onChange={e => setData({...data, condition: {...data.condition, lodging: e.target.checked}})} className="w-5 h-5 text-emerald-600 rounded" />
                  <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Plants Fallen (Lodging)</span>
                </label>
              </div>
            </div>
          </div>
        )}

        {step === 6 && (
          <div className="space-y-6 animate-in fade-in">
            <div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white">6. Farmer Goals & Constraints</h2>
            </div>
            <div className="grid grid-cols-2 gap-6">
               <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Available Resources</label>
                <select value={data.goals.resources} onChange={e => setData({...data, goals: {...data.goals, resources: e.target.value as any}})} className="w-full p-4 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 dark:text-white">
                  <option>Low</option>
                  <option>Medium</option>
                  <option>High</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Risk Preference</label>
                <select value={data.goals.riskPreference} onChange={e => setData({...data, goals: {...data.goals, riskPreference: e.target.value as any}})} className="w-full p-4 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 dark:text-white">
                  <option>Low</option>
                  <option>Medium</option>
                  <option>High</option>
                </select>
              </div>
            </div>
            <div className="bg-white dark:bg-slate-800 p-4 border border-slate-200 dark:border-slate-700 rounded-xl">
                <label className="flex items-center gap-3">
                  <input type="checkbox" checked={data.goals.seedAvailability} onChange={e => setData({...data, goals: {...data.goals, seedAvailability: e.target.checked}})} className="w-5 h-5 text-emerald-600 rounded" />
                  <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Alternate Seeds Available Locally</span>
                </label>
            </div>
          </div>
        )}

      </div>

      <div className="bg-white dark:bg-slate-950 p-6 border-t border-slate-100 dark:border-slate-800 flex justify-between">
        {step > 1 ? (
          <button onClick={() => setStep(step - 1)} className="px-6 py-3 font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">Back</button>
        ) : <div></div>}
        
        {step < 6 ? (
          <button onClick={() => setStep(step + 1)} className="flex items-center gap-2 bg-slate-900 dark:bg-emerald-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-slate-800 dark:hover:bg-emerald-500 transition-colors shadow-md">
            Next <ChevronRight className="w-5 h-5"/>
          </button>
        ) : (
          <button onClick={handleFinish} disabled={loading} className="flex items-center gap-2 bg-emerald-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-emerald-500 transition-colors shadow-md disabled:opacity-50">
            {loading ? 'Analyzing...' : <><CheckCircle2 className="w-5 h-5"/> Generate Report</>}
          </button>
        )}
      </div>
    </div>
  );
};