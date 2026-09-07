export type DecisionType = 'RECOVER' | 'MONITOR' | 'REPLANT';
export type RiskLevel = 'Low' | 'Moderate' | 'High' | 'Critical';
export type ConfidenceLevel = 'High' | 'Moderate' | 'Low';

export interface WeatherData {
  temp: number;
  humidity: number;
  rainProb: number;
  rainSum: number;
  condition: string;
  forecast: Array<{ date: string; min: number; max: number; rainProb: number; rain: number; icon: string }>;
  fetchedAt: number;
}

export interface AssessmentData {
  id: string;
  date: number;
  location: { name: string; lat: number; lon: number };
  crop: { name: string; stage: string; age: number; };
  flood: { durationDays: number; maxDepthCm: number; standingWater: boolean; };
  soil: { drainage: 'Good' | 'Moderate' | 'Poor'; };
  condition: { damagePercent: number; yellowing: boolean; lodging: boolean; };
  weather: WeatherData | null;
  notes: string;
}

export interface DecisionResult {
  recoveryScore: number;
  riskScore: RiskLevel;
  decision: DecisionType;
  confidence: ConfidenceLevel;
  explanation: Array<{ factor: string; effect: number; label: string; type: 'positive' | 'negative' }>;
  actions: string[];
}