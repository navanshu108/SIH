import { AssessmentData } from '../types';

export const saveAssessment = (data: AssessmentData) => {
  const existing = getAssessments();
  const updated = [data, ...existing.filter(a => a.id !== data.id)];
  localStorage.setItem('agri_assessments', JSON.stringify(updated));
};

export const getAssessments = (): AssessmentData[] => {
  try {
    const data = localStorage.getItem('agri_assessments');
    if (!data) return [];
    
    const parsed = JSON.parse(data);
    
    // FAILSAFE: If the saved data is from the old version (missing the 'goals' object),
    // it will crash the new decision engine. We catch that here and wipe the slate clean.
    if (parsed.length > 0 && !parsed[0].goals) {
      console.warn("Incompatible old data detected. Clearing cache.");
      localStorage.removeItem('agri_assessments');
      return [];
    }
    
    return parsed;
  } catch (e) {
    // If the data is corrupted, wipe it
    localStorage.removeItem('agri_assessments');
    return [];
  }
};

export const getLatestAssessment = (): AssessmentData | null => {
  const data = getAssessments();
  return data.length > 0 ? data[0] : null;
};
