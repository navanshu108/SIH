import React from 'react';
import { getAssessments } from '../utils/storage';
import { RiskBadge } from '../components/SharedUI';
import { calculateDecision } from '../logic/decisionEngine';

export const History = () => {
  const records = getAssessments();

  if (records.length === 0) return <div className="text-center py-20 text-gray-500">No assessments found.</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Assessment History</h1>
      <div className="space-y-4">
        {records.map(r => {
          const res = calculateDecision(r);
          return (
            <div key={r.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
              <div>
                <h3 className="font-bold text-gray-800">{r.location.name} - {r.crop.name}</h3>
                <p className="text-sm text-gray-500">{new Date(r.date).toLocaleDateString()} • {r.flood.durationDays} days flooded</p>
              </div>
              <div className="flex items-center gap-4">
                <RiskBadge risk={res.riskScore} />
                <span className="font-bold text-gray-800 w-24 text-right">{res.decision}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};