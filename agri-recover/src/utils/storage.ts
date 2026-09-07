import { AssessmentData } from '../types';

export const saveAssessment = (data: AssessmentData) => {
  const existing = getAssessments();
  const updated = [data, ...existing.filter(a => a.id !== data.id)];
  localStorage.setItem('agri_assessments', JSON.stringify(updated));
};

export const getAssessments = (): AssessmentData[] => {
  const data = localStorage.getItem('agri_assessments');
  return data ? JSON.parse(data) : [];
};

export const getLatestAssessment = (): AssessmentData | null => {
  const data = getAssessments();
  return data.length > 0 ? data[0] : null;
};