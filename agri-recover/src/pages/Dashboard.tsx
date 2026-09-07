import React from 'react';
import { Link } from 'react-router-dom';
import { getLatestAssessment } from '../utils/storage';
import { calculateDecision } from '../logic/decisionEngine';
import { Card, ScoreGauge, RiskBadge, DecisionCard, Explainer } from '../components/SharedUI';
import { ArrowRight, Printer, MapPin, CheckSquare, Sprout, Satellite, Thermometer, Droplets, CloudRain, Trash2 } from 'lucide-react';

export const Dashboard = () => {
  const assessment = getLatestAssessment();
  
  const handleClearData = () => {
    localStorage.removeItem('agri_assessments');
    window.location.reload();
  };

  if (!assessment) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] text-center animate-in fade-in">
        <div className="bg-emerald-100 dark:bg-emerald-900/30 p-6 rounded-full mb-6">
          <Sprout className="w-16 h-16 text-emerald-600 dark:text-emerald-400" />
        </div>
        <h2 className="text-4xl font-black text-slate-900 dark:text-white mb-4 tracking-tight">Agricultural Intelligence Platform</h2>
        <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mb-8">Utilize NRSC geospatial data, weather telemetry, and ICAR advisories to assess crop recovery and replanting viability.</p>
        <Link to="/assessment" className="inline-flex items-center gap-2 bg-emerald-600 text-white px-8 py-4 rounded-xl hover:bg-emerald-700 font-bold text-lg transition-all shadow-lg hover:shadow-emerald-500/25 hover:-translate-y-0.5">
          Initialize Field Scan <ArrowRight className="w-5 h-5" />
        </Link>
      </div>
    );
  }

  const result = calculateDecision(assessment);
  const advisories = result.icarAdvisories || [];
  const replantOptions = result.replantOptions || [];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* Header with New Clear Data Button */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 no-print">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight">Intelligence Report</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium flex items-center gap-2 mt-2 text-sm">
            <MapPin className="w-4 h-4"/> {assessment.location.name || "Unknown Field"} • {new Date(assessment.date).toLocaleDateString()}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={handleClearData} className="flex items-center gap-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 px-4 py-2.5 rounded-xl font-bold border border-red-200 dark:border-red-800/50 shadow-sm transition-all text-sm">
            <Trash2 className="w-4 h-4" /> Clear Data
          </button>
          <button onClick={() => window.print()} className="flex items-center gap-2 bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900 px-4 py-2.5 rounded-xl font-bold border border-slate-200 dark:border-slate-800 shadow-sm transition-all text-sm">
            <Printer className="w-4 h-4" /> Export
          </button>
        </div>
      </div>

      {/* Row 1: Weather & Risk Summary */}
      {assessment.nrscWeather && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="md:col-span-2 bg-slate-900 dark:bg-slate-950 border-0 text-white">
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-sm font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                <Satellite className="w-4 h-4"/> NRSC Telemetry
              </h2>
              <span className="text-[10px] font-bold uppercase bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded">Live Sync</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
               <div>
                 <p className="text-slate-400 text-xs font-bold uppercase mb-2 flex items-center gap-1.5"><Thermometer className="w-3.5 h-3.5"/> Temp</p>
                 <p className="text-2xl font-black">{assessment.nrscWeather.temp}°C</p>
               </div>
               <div>
                 <p className="text-slate-400 text-xs font-bold uppercase mb-2 flex items-center gap-1.5"><Droplets className="w-3.5 h-3.5"/> Humidity</p>
                 <p className="text-2xl font-black text-blue-400">{assessment.nrscWeather.humidity}%</p>
               </div>
               <div>
                 <p className="text-slate-400 text-xs font-bold uppercase mb-2 flex items-center gap-1.5"><CloudRain className="w-3.5 h-3.5"/> Rain 48h</p>
                 <p className="text-2xl font-black text-blue-400">{assessment.nrscWeather.recentRain} mm</p>
               </div>
               <div>
                 <p className="text-slate-400 text-xs font-bold uppercase mb-2 flex items-center gap-1.5"><Sprout className="w-3.5 h-3.5"/> Moisture</p>
                 <p className="text-sm font-bold mt-2 text-emerald-400">{assessment.nrscWeather.soilMoistureIndex}</p>
               </div>
            </div>
          </Card>
          
          <Card className="flex flex-col justify-center">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest mb-3">Overall Field Risk</span>
            <div className="mb-4">
              <RiskBadge risk={result.riskScore} />
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-300"><span className="font-semibold">Crop:</span> {assessment.crop.name}</p>
            <p className="text-sm text-slate-600 dark:text-slate-300 mt-1"><span className="font-semibold">Stage:</span> {assessment.crop.stage}</p>
          </Card>
        </div>
      )}

      {/* Row 2: Geospatial Map + ML Score + Decision */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card noPadding className="relative min-h-[250px] bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800">
          <div className="absolute inset-0 map-pattern opacity-60" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative">
              <div className="absolute -inset-8 bg-blue-500/20 rounded-full animate-ping" />
              <div className="absolute -inset-4 bg-blue-500/30 rounded-full" />
              <MapPin className="w-8 h-8 text-blue-600 relative z-10 drop-shadow-md" />
            </div>
          </div>
          <div className="absolute top-4 right-4 bg-white/90 dark:bg-slate-950/90 backdrop-blur-md p-3 rounded-lg shadow-sm border border-slate-200 dark:border-slate-800 text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 space-y-2">
             <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 bg-blue-500 rounded-sm"/> Target Zone</div>
             <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 bg-red-500/50 border border-red-500 rounded-sm"/> Inundation</div>
          </div>
          <div className="absolute bottom-4 left-4 text-[9px] font-bold uppercase tracking-widest text-slate-400">GIS Abstraction Layer</div>
        </Card>

        <ScoreGauge score={result.recoveryScore} />
        <DecisionCard result={result} />
      </div>

      {/* Row 3: ML Factors & ICAR Advisory */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Explainer explanation={result.explanation || []} />
        
        <Card>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-5 uppercase tracking-widest flex items-center gap-2">
            <CheckSquare className="w-4 h-4 text-emerald-500"/> ICAR Agricultural Advisory
          </h3>
          <div className="bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/50 rounded-xl p-5 mb-6">
            {advisories.length > 0 ? (
              <ul className="space-y-3">
                {advisories.map((act, i) => (
                  <li key={i} className="flex gap-3 text-sm text-slate-800 dark:text-slate-200 items-start">
                    <span className="text-emerald-500 font-black mt-0.5">•</span>
                    <span className="leading-relaxed">{act}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-slate-500">No specific advisories available for current conditions.</p>
            )}
          </div>
          
          {result.decision === 'REPLANT' && (
            <div>
              <h4 className="text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-3 uppercase tracking-widest">Recommended Alternate Crops</h4>
              <div className="space-y-2">
                {replantOptions.map((c, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-100 dark:border-slate-800 flex justify-between items-center">
                    <div>
                      <span className="font-bold text-slate-900 dark:text-slate-100 block text-sm">{c.name}</span>
                      <span className="text-xs text-slate-500 dark:text-slate-400">{c.duration} • {c.reason}</span>
                    </div>
                    <span className="text-emerald-600 dark:text-emerald-400 font-black text-sm bg-emerald-100 dark:bg-emerald-900/30 px-2 py-1 rounded-md">{c.suitability}% Match</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>
      </div>

    </div>
  );
};