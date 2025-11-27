import { GoogleGenAI } from "@google/genai";

let ai: GoogleGenAI | null = null;

const getAIClient = () => {
  if (!ai) {
    ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }
  return ai;
};

export const generatePhilosophy = async (theme: string): Promise<string> => {
  try {
    const aiClient = getAIClient();
    
    const prompt = `
      Write a single, short, "cheesy" and pretentious philosophical subtitle for a travel vlog or an arthouse film.
      The theme is: "${theme}".
      
      Rules:
      1. It must be short (max 20 words).
      2. It should sound deep but be vaguely meaningless or overly melodramatic.
      3. Use a melancholic, "1-bit" aesthetic tone.
      4. Return ONLY the text, no quotes, no explanations.
      5. Can be in English or Chinese (or mixed), matching the vibe of "Wong Kar-wai" or hipster Instagram captions.
    `;

    const response = await aiClient.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text.trim();
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "The void stares back, but the wifi is weak."; // Fallback text
  }
};