import React from 'react';
import { DecisionResult } from '../types';
import { AlertCircle, CheckCircle, Info } from 'lucide-react';

export const ScoreGauge = ({ score }: { score: number }) => {
  const color = score > 70 ? 'text-green-600' : score > 40 ? 'text-orange-500' : 'text-red-600';
  return (
    <div className="flex flex-col items-center justify-center p-6 bg-white rounded-xl shadow-sm border border-gray-100">
      <span className="text-sm text-gray-500 uppercase font-semibold tracking-wider">Recovery Score</span>
      <span className={`text-5xl font-bold mt-2 ${color}`}>{score}/100</span>
    </div>
  );
};

export const RiskBadge = ({ risk }: { risk: string }) => {
  const colors: Record<string, string> = {
    Low: 'bg-green-100 text-green-800',
    Moderate: 'bg-yellow-100 text-yellow-800',
    High: 'bg-orange-100 text-orange-800',
    Critical: 'bg-red-100 text-red-800'
  };
  return <span className={`px-3 py-1 rounded-full text-sm font-medium ${colors[risk] || colors.Low}`}>{risk} Risk</span>;
};

export const DecisionCard = ({ result }: { result: DecisionResult }) => {
  const bg = result.decision === 'RECOVER' ? 'bg-green-50 border-green-200' : result.decision === 'MONITOR' ? 'bg-orange-50 border-orange-200' : 'bg-red-50 border-red-200';
  const color = result.decision === 'RECOVER' ? 'text-green-700' : result.decision === 'MONITOR' ? 'text-orange-700' : 'text-red-700';
  
  return (
    <div className={`p-6 rounded-xl border-2 ${bg} text-center`}>
      <h3 className="text-gray-600 font-semibold mb-2 uppercase text-sm tracking-widest">Recommended Action</h3>
      <h1 className={`text-4xl font-black ${color}`}>{result.decision}</h1>
      <p className="mt-4 text-sm text-gray-700 font-medium">Confidence: {result.confidence}</p>
    </div>
  );
};

export const Explainer = ({ explanation }: { explanation: DecisionResult['explanation'] }) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
    <h3 className="text-lg font-bold text-gray-800 mb-4">Why did we recommend this?</h3>
    <div className="space-y-3">
      {explanation.map((item, i) => (
        <div key={i} className="flex justify-between items-center text-sm border-b pb-2 last:border-0">
          <div className="flex items-center gap-2">
            {item.type === 'positive' ? <CheckCircle className="w-4 h-4 text-green-500" /> : <AlertCircle className="w-4 h-4 text-orange-500" />}
            <span className="font-medium text-gray-700">{item.factor}</span>
            <span className="text-gray-500 ml-2">({item.label})</span>
          </div>
          <span className={`font-bold ${item.effect >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {item.effect > 0 ? '+' : ''}{item.effect}
          </span>
        </div>
      ))}
    </div>
  </div>
);