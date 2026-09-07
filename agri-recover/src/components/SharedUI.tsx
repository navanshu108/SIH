import React from 'react';
import { DecisionResult } from '../types';
import { AlertCircle, CheckCircle, Leaf, ShieldAlert, Cpu } from 'lucide-react';

// The missing Card component is added right here!
export const Card = ({ children, className = "", noPadding = false }: { children: React.ReactNode, className?: string, noPadding?: boolean }) => (
  <div className={`bg-white dark:bg-slate-950 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden ${className}`}>
    {noPadding ? children : <div className="p-6">{children}</div>}
  </div>
);

export const ScoreGauge = ({ score }: { score: number }) => {
  const color = score > 70 ? 'text-emerald-500' : score > 40 ? 'text-yellow-500' : 'text-red-500';
  return (
    <Card className="flex flex-col items-center justify-center text-center">
      <span className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest">Recovery Probability</span>
      <div className="relative w-32 h-32 mt-4 flex items-center justify-center">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
          <path className="text-slate-100 dark:text-slate-800" strokeWidth="3" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
          <path className={color} strokeDasharray={`${score}, 100`} strokeWidth="3" strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
        </svg>
        <div className="absolute flex flex-col items-center justify-center">
          <span className={`text-3xl font-black ${color}`}>{score}%</span>
        </div>
      </div>
      <div className="mt-4 text-[10px] uppercase font-bold text-slate-400 tracking-wider">Source: ML Engine</div>
    </Card>
  );
};

export const RiskBadge = ({ risk }: { risk: string }) => {
  const colors: Record<string, string> = {
    Low: 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800',
    Moderate: 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800',
    High: 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800',
    Critical: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800'
  };
  return <span className={`px-3 py-1 rounded-md text-xs font-bold border ${colors[risk] || colors.Low}`}>{risk} Risk</span>;
};

export const DecisionCard = ({ result }: { result: DecisionResult }) => {
  const bg = result.decision === 'RECOVER' ? 'bg-emerald-50 dark:bg-emerald-900/10' : result.decision === 'MONITOR' ? 'bg-yellow-50 dark:bg-yellow-900/10' : 'bg-red-50 dark:bg-red-900/10';
  const color = result.decision === 'RECOVER' ? 'text-emerald-600' : result.decision === 'MONITOR' ? 'text-yellow-600' : 'text-red-600';
  
  return (
    <Card className={`${bg} border-0 ring-1 ring-inset ring-slate-200 dark:ring-slate-800 flex flex-col justify-center`}>
      <h3 className="text-slate-500 dark:text-slate-400 font-bold mb-2 uppercase text-xs tracking-widest flex items-center gap-2">
        <Cpu className="w-4 h-4" /> Synthesized Action
      </h3>
      <h1 className={`text-4xl md:text-5xl font-black tracking-tight ${color}`}>{result.decision}</h1>
      <p className="mt-4 text-sm text-slate-700 dark:text-slate-300 font-medium flex items-center gap-1.5">
        <ShieldAlert className="w-4 h-4"/> Model Confidence: <span className="font-bold">{result.confidence}</span>
      </p>
    </Card>
  );
};

export const Explainer = ({ explanation }: { explanation: DecisionResult['explanation'] }) => (
  <Card>
    <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-5 uppercase tracking-widest flex items-center gap-2">
      <Leaf className="w-4 h-4 text-emerald-500"/> Prediction Factors
    </h3>
    <div className="space-y-4">
      {explanation.map((item, i) => (
        <div key={i} className="flex justify-between items-center text-sm border-b border-slate-100 dark:border-slate-800 pb-4 last:border-0 last:pb-0">
          <div className="flex items-start gap-3">
            {item.type === 'positive' ? <CheckCircle className="w-5 h-5 text-emerald-500 mt-0.5" /> : <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />}
            <div>
              <p className="font-bold text-slate-800 dark:text-slate-200">{item.factor}</p>
              <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5">{item.label}</p>
            </div>
          </div>
          <span className={`font-black text-lg ${item.effect >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
            {item.effect > 0 ? '+' : ''}{item.effect}
          </span>
        </div>
      ))}
    </div>
  </Card>
);