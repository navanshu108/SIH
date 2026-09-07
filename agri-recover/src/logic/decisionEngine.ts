import { AssessmentData, DecisionResult, RiskLevel, ConfidenceLevel } from '../types';
import { decisionRules } from '../data/rules';
export const calculateDecision = (data: AssessmentData): DecisionResult => {
  let score = decisionRules.baseScore;
  const expl = [];
  const actions = [];
  let riskMod = 0;

  // 1. Flood Duration
  if (data.flood.durationDays > 1) {
    const penalty = (data.flood.durationDays - 1) * decisionRules.weights.floodDuration;
    score += penalty;
    riskMod += 20;
    expl.push({ factor: 'Flood Duration', effect: penalty, label: `${data.flood.durationDays} days of flooding`, type: 'negative' });
  } else {
    expl.push({ factor: 'Flood Duration', effect: 0, label: 'Brief flood (< 24h)', type: 'positive' });
  }

  // 2. Standing Water
  if (data.flood.standingWater) {
    score += decisionRules.weights.standingWater;
    riskMod += 30;
    actions.push('Immediately clear drainage pathways to remove standing water.');
    expl.push({ factor: 'Standing Water', effect: decisionRules.weights.standingWater, label: 'Water still present in field', type: 'negative' });
  }

  // 3. Drainage
  if (data.soil.drainage === 'Poor') {
    score += decisionRules.weights.poorDrainage;
    expl.push({ factor: 'Soil Drainage', effect: decisionRules.weights.poorDrainage, label: 'Poor drainage limits recovery', type: 'negative' });
  } else if (data.soil.drainage === 'Good') {
    score += decisionRules.weights.goodDrainage;
    expl.push({ factor: 'Soil Drainage', effect: decisionRules.weights.goodDrainage, label: 'Good drainage aids recovery', type: 'positive' });
  }

  // 4. Damage
  const damagePenalty = Math.floor(data.condition.damagePercent / 10) * decisionRules.weights.damagePer10Percent;
  score += damagePenalty;
  if (data.condition.damagePercent > 30) riskMod += 25;
  expl.push({ factor: 'Crop Damage', effect: damagePenalty, label: `Estimated ${data.condition.damagePercent}% damage`, type: damagePenalty < 0 ? 'negative' : 'positive' });

  // 5. Weather
  if (data.weather && data.weather.rainProb > 60) {
    score += decisionRules.weights.highRainProb;
    riskMod += 15;
    expl.push({ factor: 'Forecast', effect: decisionRules.weights.highRainProb, label: `High chance of rain (${data.weather.rainProb}%)`, type: 'negative' });
    actions.push('Monitor weather closely; incoming rain may worsen waterlogging.');
  } else if (data.weather) {
    expl.push({ factor: 'Forecast', effect: 5, label: 'Favorable drying weather', type: 'positive' });
    score += 5;
  }

  // Determine Risk
  let risk: RiskLevel = 'Low';
  if (riskMod > 60) risk = 'Critical';
  else if (riskMod > 40) risk = 'High';
  else if (riskMod > 20) risk = 'Moderate';

  // Determine Decision
  score = Math.max(0, Math.min(100, score));
  let decision: DecisionResult['decision'] = 'RECOVER';
  if (score < decisionRules.thresholds.replant) decision = 'REPLANT';
  else if (score < decisionRules.thresholds.monitor) decision = 'MONITOR';

  // Specific Overrides
  if (data.flood.standingWater && decision === 'RECOVER') decision = 'MONITOR';

  // Default actions
  actions.push('Assess roots and stems for rot symptoms in 3 days.');
  if (decision === 'REPLANT') actions.unshift('Review alternate crop options based on remaining season.');

  // Confidence
  let confidence: ConfidenceLevel = 'High';
  if (!data.weather) confidence = 'Low';
  else if (data.condition.damagePercent === 0 && data.flood.durationDays > 2) confidence = 'Moderate'; 

  return { recoveryScore: score, riskScore: risk, decision, confidence, explanation: expl as any, actions };
};