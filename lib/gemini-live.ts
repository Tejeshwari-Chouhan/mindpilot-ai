import { GoogleGenerativeAI } from '@google/generative-ai';
import { StudentProfile, MentalDNA } from './types';

const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || process.env.GEMINI_API_KEY || '';

/**
 * Generate a live, authentic reasoning response from Google's Gemini LLM
 * Dual-persona: Loving Indian Mother + Tactical Best Friend / Senior Coach
 */
export async function generateLiveGeminiCompanionReply(
  prompt: string,
  history: Array<{ role: 'user' | 'model'; parts: string }>,
  profile: StudentProfile,
  mentalDNA: MentalDNA
): Promise<string> {
  if (!API_KEY) {
    throw new Error("Missing Gemini API Key");
  }

  const genAI = new GoogleGenerativeAI(API_KEY);
  
  const systemInstruction = `You are MindPilot AI, an elite, deeply empathetic cognitive resilience co-pilot built specifically for competitive exam aspirants in India (preparing for ${profile.academic.examType}, target score: ${profile.academic.targetScore}).
You embody a unique, balanced dual-persona:
1. 50% Loving Indian Mother: Warm, reassuring, prioritizing their emotional well-being, nutrition, and rest. Remind them gently to drink water, eat proper meals, and protect their sleep. Use occasional warm Indian terms of endearment like beta/bachha naturally where appropriate.
2. 50% Strategic Best Friend / Senior Mentor: Tactical, grounded, practical. You break massive backlogs into small 20-minute chunks, normalize mock test score drops as diagnostic data, and help them bounce back.

Student Name: ${profile.name || 'Aspirant'}
Current Primary Stressors: ${mentalDNA.primaryStressors?.join(', ') || 'Backlog, Mock Scores'}
Resilience Level: ${mentalDNA.emotionalResilience || 65}%
Recovery Style: ${mentalDNA.recoveryStyle || 'Action-Oriented'}

Guidelines:
- Address them warmly by their name.
- Respond with genuine empathy, actionable study/mindset advice, and warmth (2-4 paragraphs).
- Never give canned or robotic answers. Always engage directly with the specific subject, topic, marks, or emotion they mentioned.`;

  const modelCandidates = ['gemini-3.8-flash', 'gemini-3.5-flash', 'gemini-2.5-flash-lite', 'gemini-flash-latest'];
  let lastError: any = null;

  for (const modelName of modelCandidates) {
    try {
      const model = genAI.getGenerativeModel({
        model: modelName,
        systemInstruction,
      });

      // Filter and format previous history turns for Gemini
      const formattedHistory = history
        .slice(0, -1)
        .filter(h => h.parts && h.parts.trim().length > 0)
        .map(h => ({
          role: h.role,
          parts: [{ text: h.parts }]
        }));

      const chat = model.startChat({
        history: formattedHistory,
      });

      const result = await chat.sendMessage(prompt);
      const text = result.response.text();
      if (text && text.trim().length > 0) {
        return text;
      }
    } catch (err: any) {
      console.warn(`Gemini model ${modelName} error, trying fallback candidate:`, err);
      lastError = err;
    }
  }

  throw lastError || new Error("Failed to generate response from Gemini LLM");
}
