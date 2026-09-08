export async function askAssistant(prompt: string, context?: any): Promise<string> {
  const apiKey = localStorage.getItem("gemini_apikey");
  if (!apiKey) {
    return "Please enter your Gemini API key in the Pest & Disease page to enable live AI responses.";
  }

  const systemContext = context 
    ? `You are Kisan Mitra, an agricultural AI. The farmer is located in ${context.location}, temperature is ${context.temperature}°C with ${context.rainProbability}% chance of rain.` 
    : "You are Kisan Mitra, a helpful AI agricultural assistant.";

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey.trim()}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: `${systemContext}\n\nFarmer question: ${prompt}` }]
            }
          ]
        })
      }
    );

    const data = await res.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || "No response received.";
  } catch (err) {
    return "Failed to connect to Kisan Mitra. Please verify your connection or API key.";
  }
}