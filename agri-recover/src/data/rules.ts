// Configurable Decision Weights and Rules
export const decisionRules = {
  baseScore: 100,
  weights: {
    floodDuration: -10, // per day over 1
    depthCritical: -15, 
    standingWater: -20,
    damagePer10Percent: -5,
    poorDrainage: -15,
    goodDrainage: 10,
    highRainProb: -10, // if > 60%
  },
  thresholds: {
    replant: 40,
    monitor: 70
  }
};