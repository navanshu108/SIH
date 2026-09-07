import React, { useState, useEffect } from 'react';
import { AlertTriangle, Droplets, Activity, ThermometerSun, Loader2, MapPin } from 'lucide-react';

const SUPPORTED_INDIAN_CROPS = [
  'Soybean', 'Paddy (Rice)', 'Wheat', 'Maize', 'Cotton', 'Mustard', 
  'Lentil', 'Tomato', 'Brinjal', 'Cucumber', 'Cabbage', 'Cauliflower'
];

export default function PostFloodAssessment() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [floodData, setFloodData] = useState<any>(null);
  const [formData, setFormData] = useState({
    cropName: '', growthStage: '', floodDuration: '', waterDepth: '', soilType: '', cropCondition: ''
  });
  
  const [result, setResult] = useState<{
    risk: 'Low' | 'Moderate' | 'High';
    action: string;
    description: string;
    apiInsight: string;
  } | null>(null);

  // 1. Auto-fetch the farmer's saved location
  const lat = localStorage.getItem('kisansetu_lat') || '22.2014'; 
  const lng = localStorage.getItem('kisansetu_lng') || '77.0500';
  const locationName = localStorage.getItem('kisansetu_location') || 'Saved Farm Location';

  useEffect(() => {
    const fetchFloodData = async () => {
      try {
        // 2. Pass the saved coordinates directly to the API
        const res = await fetch(`https://flood-api.open-meteo.com/v1/flood?latitude=${lat}&longitude=${lng}&daily=river_discharge,river_discharge_mean,river_discharge_max&past_days=7&forecast_days=3`);
        const data = await res.json();
        setFloodData(data);
      } catch (err) {
        console.error("Failed to fetch Open-Meteo flood data", err);
      }
    };
    fetchFloodData();
  }, [lat, lng]);

  const handleInputChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const analyzeData = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      const duration = parseInt(formData.floodDuration) || 0;
      let riskScore = 0;
      let apiInsight = "Normal regional water levels detected. Local field drainage is your primary concern.";

      if (duration > 48) riskScore += 3;
      else if (duration > 24) riskScore += 2;
      
      if (formData.cropCondition === 'Severe Rot') riskScore += 3;
      else if (formData.cropCondition === 'Yellowing') riskScore += 1;

      if (formData.waterDepth === 'Complete') riskScore += 2;
      if (formData.soilType === 'Clay') riskScore += 1;
      
      if (formData.growthStage === 'Flowering' || formData.growthStage === 'Seedling') riskScore += 1;

      if (floodData && floodData.daily) {
        const latestDischarge = floodData.daily.river_discharge[7]; 
        const meanDischarge = floodData.daily.river_discharge_mean[7];
        const maxDischarge = floodData.daily.river_discharge_max[7];

        if (latestDischarge > meanDischarge * 2) {
          riskScore += 2; 
          apiInsight = `Open-Meteo Alert: Regional river discharge is significantly elevated (${latestDischarge} m³/s vs normal ${meanDischarge} m³/s). Groundwater table is high, delaying field drying.`;
        } else if (latestDischarge > maxDischarge * 0.8) {
          riskScore += 3; 
          apiInsight = `Open-Meteo Alert: Critical flood levels nearby. River discharge is near maximum capacity. Prolonged waterlogging is highly likely.`;
        }
      }

      let finalResult;
      if (riskScore >= 6) {
        finalResult = {
          risk: 'High' as const,
          action: 'Consider Replanting',
          description: `With ${duration}hrs of flooding and severe symptoms, ${formData.cropName} recovery is unlikely. Prepare field for alternate short-duration crops (e.g., Mustard or short-cycle pulses) to secure the season.`,
          apiInsight
        };
      } else if (riskScore >= 3) {
        finalResult = {
          risk: 'Moderate' as const,
          action: 'Monitor Closely & Apply Interventions',
          description: `The ${formData.cropName} is stressed but salvageable. Drain excess water immediately. Apply a foliar spray of 2% Urea or Potassium Nitrate once leaves dry to revive vegetative growth.`,
          apiInsight
        };
      } else {
        finalResult = {
          risk: 'Low' as const,
          action: 'Continue Standard Management',
          description: `Good chance of recovery. The ${formData.cropName} is resilient at this stage. Ensure field drainage is clear and monitor for fungal diseases over the next 3-5 days.`,
          apiInsight
        };
      }

      setResult(finalResult);
      setLoading(false);
      setStep(2);
    }, 1500);
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 bg-gray-50 min-h-screen font-sans">
      <div className="bg-gradient-to-r from-green-800 to-green-600 text-white p-6 rounded-t-xl shadow-md flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Smart Post-Flood Assessment</h1>
          <p className="text-green-100 mt-1 text-sm">Powered by Open-Meteo Global Flood API & Crop Science</p>
        </div>
        <Activity className="h-10 w-10 text-green-200 opacity-80 hidden sm:block" />
      </div>

      <div className="bg-white p-6 rounded-b-xl shadow-md border border-gray-200">
        
        {/* 3. Visually show the farmer that their location is automatically applied */}
        <div className="mb-6 flex items-center gap-2 bg-blue-50 text-blue-800 p-3 rounded-lg border border-blue-100">
          <MapPin size={18} className="text-blue-600" />
          <span className="text-sm font-medium">Assessing risk for: <strong>{locationName}</strong> (Auto-detected)</span>
        </div>

        {step === 1 ? (
          <form onSubmit={analyzeData} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div className="space-y-4 p-5 bg-white rounded-xl border border-gray-200 shadow-sm">
                <h3 className="font-bold text-gray-800 border-b pb-2 flex items-center gap-2">
                  <span className="bg-green-100 text-green-700 p-1.5 rounded-lg">1</span> Crop & Stage
                </h3>
                <div>
                  <label className="block text-sm font-semibold text-gray-700">Select Crop</label>
                  <select required name="cropName" onChange={handleInputChange} className="mt-1 w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none">
                    <option value="">Select supported crop...</option>
                    {SUPPORTED_INDIAN_CROPS.map(crop => (
                      <option key={crop} value={crop}>{crop}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700">Growth Stage</label>
                  <select required name="growthStage" onChange={handleInputChange} className="mt-1 w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none">
                    <option value="">Select Stage...</option>
                    <option value="Seedling">Seedling / Early Vegetative</option>
                    <option value="Vegetative">Active Vegetative</option>
                    <option value="Flowering">Flowering</option>
                    <option value="Fruiting">Fruiting / Pod Formation / Maturity</option>
                  </select>
                </div>
              </div>

              <div className="space-y-4 p-5 bg-white rounded-xl border border-gray-200 shadow-sm">
                <h3 className="font-bold text-gray-800 border-b pb-2 flex items-center gap-2">
                  <span className="bg-blue-100 text-blue-700 p-1.5 rounded-lg"><Droplets size={16}/></span> Flood Conditions
                </h3>
                <div>
                  <label className="block text-sm font-semibold text-gray-700">Flood Duration (Hours)</label>
                  <input required type="number" name="floodDuration" onChange={handleInputChange} className="mt-1 w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="e.g., 24" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700">Submergence Level</label>
                  <select required name="waterDepth" onChange={handleInputChange} className="mt-1 w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
                    <option value="">Select...</option>
                    <option value="Partial">Partial (Only stems/roots)</option>
                    <option value="Complete">Complete (Leaves submerged)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-4 p-5 bg-white rounded-xl border border-gray-200 shadow-sm">
                <h3 className="font-bold text-gray-800 border-b pb-2 flex items-center gap-2">
                  <span className="bg-amber-100 text-amber-700 p-1.5 rounded-lg"><ThermometerSun size={16}/></span> Soil & Field
                </h3>
                <div>
                  <label className="block text-sm font-semibold text-gray-700">Soil Type</label>
                  <select required name="soilType" onChange={handleInputChange} className="mt-1 w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none">
                    <option value="">Select...</option>
                    <option value="Clay">Black/Clay (Slow drainage)</option>
                    <option value="Loam">Loam / Alluvial (Moderate)</option>
                    <option value="Sandy">Sandy (Fast drainage)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-4 p-5 bg-white rounded-xl border border-gray-200 shadow-sm">
                <h3 className="font-bold text-gray-800 border-b pb-2 flex items-center gap-2">
                  <span className="bg-red-100 text-red-700 p-1.5 rounded-lg"><AlertTriangle size={16}/></span> Current Condition
                </h3>
                <div>
                  <label className="block text-sm font-semibold text-gray-700">Visible Symptoms</label>
                  <select required name="cropCondition" onChange={handleInputChange} className="mt-1 w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none">
                    <option value="">Select...</option>
                    <option value="Healthy">Mostly Healthy / Minor Mud</option>
                    <option value="Yellowing">Mild/Moderate Yellowing</option>
                    <option value="Severe Rot">Severe Wilting, Lodging, or Root Rot</option>
                  </select>
                </div>
              </div>
            </div>

            <button disabled={loading || !floodData} type="submit" className="w-full bg-green-600 text-white font-bold py-3.5 px-4 rounded-xl hover:bg-green-700 transition-all flex justify-center items-center gap-2 disabled:opacity-70">
              {loading ? <><Loader2 className="animate-spin" size={20}/> Analyzing Data...</> : 'Analyze Multi-Source Recovery Risk'}
            </button>
            {!floodData && <p className="text-center text-sm text-gray-500 animate-pulse">Connecting to Open-Meteo Global Flood API...</p>}
          </form>
        ) : (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl flex gap-4 items-start">
              <Activity className="text-blue-600 flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-bold text-blue-900">Hydrological Data Insight</h4>
                <p className="text-sm text-blue-800 mt-1">{result?.apiInsight}</p>
              </div>
            </div>

            <div className={`p-6 rounded-xl border-2 ${result?.risk === 'High' ? 'bg-red-50 border-red-200' : result?.risk === 'Moderate' ? 'bg-yellow-50 border-yellow-200' : 'bg-green-50 border-green-200'}`}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2">
                <div>
                  <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Calculated Risk Level</p>
                  <p className={`text-3xl font-black mt-1 ${result?.risk === 'High' ? 'text-red-600' : result?.risk === 'Moderate' ? 'text-yellow-600' : 'text-green-600'}`}>
                    {result?.risk} Risk
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Primary Action</p>
                  <p className="text-2xl font-bold mt-1 text-gray-800">
                    {result?.action}
                  </p>
                </div>
              </div>
              
              <div className="mt-6 pt-6 border-t border-gray-200/60">
                <p className="text-sm md:text-base text-gray-800 leading-relaxed font-medium">
                  {result?.description}
                </p>
              </div>
            </div>

            <button onClick={() => setStep(1)} className="text-green-700 font-bold hover:text-green-800 hover:underline px-2 flex items-center gap-2">
              ← Run Another Assessment
            </button>
          </div>
        )}
      </div>
    </div>
  );
}