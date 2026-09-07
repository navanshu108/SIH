import { aiAnswer } from './mockServices';
import type { LiveContext } from './liveContextService';
export async function askAssistant(question:string, context?:LiveContext) {
  const endpoint=import.meta.env.VITE_ASSISTANT_API_URL as string | undefined;
  if(endpoint){const response=await fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({question,context})});if(!response.ok) throw new Error('Assistant service unavailable');const data=await response.json();return String(data.answer||data.message||'No answer returned.');}
  const locality=context?.source==='live'?` Live conditions for ${context.location}: ${context.temperature}°C, ${context.humidity}% humidity, ${context.rainProbability}% rain chance.`:'';
  return aiAnswer(question)+locality+' Configure VITE_ASSISTANT_API_URL with a secure server endpoint to enable live web-grounded AI answers.';
}
