/**
 * Gemini on Vertex AI Integration
 * Provides advanced reasoning, natural-language conversational interfaces,
 * cognitive diagnostics, and dual-persona psychological coaching for students.
 */

import { VertexAI } from '@google-cloud/vertexai';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { getGCPConfig } from './config';
import { DailyCheckIn, StudentProfile, StructuredGeminiAnalysis } from '../types';
import { localAnalyzeCheckIn } from '../gemini';

let vertexAiInstance: VertexAI | null = null;
let googleGenAIInstance: GoogleGenerativeAI | null = null;

function getVertexAI(): VertexAI | null {
  const config = getGCPConfig();
  if (!vertexAiInstance) {
    try {
      vertexAiInstance = new VertexAI({
        project: config.projectId,
        location: config.vertexAiLocation,
      });
    } catch (e) {
      console.warn('Vertex AI client initialization deferred:', e);
      vertexAiInstance = null;
    }
  }
  return vertexAiInstance;
}

function getDirectGenAI(): GoogleGenerativeAI | null {
  const apiKey = process.env.GEMINI_API_KEY || '';
  if (!googleGenAIInstance && apiKey) {
    googleGenAIInstance = new GoogleGenerativeAI(apiKey);
  }
  return googleGenAIInstance;
}

export interface VertexReasoningOptions {
  model?: string;
  systemInstruction?: string;
  temperature?: number;
  maxOutputTokens?: number;
}

/**
 * Generate a reasoning response via Gemini on Vertex AI with multi-layer resilience
 */
export async function generateVertexGeminiResponse(
  prompt: string,
  options: VertexReasoningOptions = {}
): Promise<{ text: string; source: 'vertex-ai' | 'gemini-direct' | 'local-fallback' }> {
  const modelName = options.model || 'gemini-1.5-flash-001';

  // 1. Attempt Gemini on Vertex AI
  try {
    const vertex = getVertexAI();
    if (vertex) {
      const model = vertex.getGenerativeModel({
        model: modelName,
        systemInstruction: options.systemInstruction,
        generationConfig: {
          temperature: options.temperature ?? 0.7,
          maxOutputTokens: options.maxOutputTokens ?? 1024,
        },
      });

      const response = await model.generateContent(prompt);
      const candidates = response.response.candidates;
      if (candidates && candidates.length > 0) {
        const text = candidates[0].content?.parts?.[0]?.text;
        if (text) {
          return { text, source: 'vertex-ai' };
        }
      }
    }
  } catch (vertexErr) {
    console.warn('Gemini on Vertex AI request passed to fallback layer:', vertexErr);
  }

  // 2. Attempt Direct Gemini API if Vertex AI is unauthenticated in local dev
  try {
    const directGenAI = getDirectGenAI();
    if (directGenAI) {
      const model = directGenAI.getGenerativeModel({
        model: 'gemini-3.8-flash',
        systemInstruction: options.systemInstruction,
      });
      const result = await model.generateContent(prompt);
      const text = result.response.text();
      if (text) {
        return { text, source: 'gemini-direct' };
      }
    }
  } catch (directErr) {
    console.warn('Direct Gemini API request passed to local fallback:', directErr);
  }

  // 3. Fallback: Local Reasoning Engine
  return {
    text: `MindPilot local cognitive engine processed your input. Remember to take regular breaks and protect your circadian rest schedule.`,
    source: 'local-fallback',
  };
}

/**
 * Analyze student check-in journal using Gemini on Vertex AI
 */
export async function analyzeCheckInWithVertex(
  checkIn: DailyCheckIn,
  profile: StudentProfile,
  history: { checkIn: DailyCheckIn; analysis: StructuredGeminiAnalysis }[] = []
): Promise<{ analysis: StructuredGeminiAnalysis; engine: 'vertex-ai' | 'gemini-direct' | 'local' }> {
  const vertex = getVertexAI();

  if (!vertex) {
    const local = localAnalyzeCheckIn(checkIn, profile, history);
    return { analysis: local, engine: 'local' };
  }

  const systemPrompt = `
You are MindPilot AI powered by Gemini on Google Cloud Vertex AI. You serve as an expert clinical psychologist and student resilience counselor specializing in high-stakes competitive exams (JEE, NEET, UPSC, GATE, CAT).
Analyze the student's daily check-in (mood, energy, stress, study/sleep hours, mock test scores, journal text) in context of their academic profile.
Return strictly a JSON object:
{
  "emotion": "string (dominant mental state)",
  "confidence": 0-100,
  "motivation": 0-100,
  "burnoutRisk": 0-100,
  "stressTriggers": ["string (specific triggers)"],
  "academicConcerns": ["string (backlogs, subjects, mock drop)"],
  "sleepIssues": boolean,
  "parentPressure": boolean,
  "interventionSuggestions": ["string (3-4 highly personalized bullet points)"],
  "stressConstellationUpdates": {
    "nodes": [{ "id": "string", "size": number }],
    "edges": [{ "source": "string", "target": "string", "weight": number }]
  }
}`;

  const prompt = `
Student Profile: ${profile.name || 'Student'} (${profile.academic.examType}, Target: ${profile.academic.targetScore})
Today's Check-in:
- Mood: ${checkIn.mood}
- Stress (1-10): ${checkIn.stressLevel}
- Energy (1-10): ${checkIn.energyLevel}
- Sleep: ${checkIn.sleepHours}h | Study: ${checkIn.studyHours}h
- Mock Score: ${checkIn.mockTestScore ?? 'N/A'}
- Journal: "${checkIn.journalEntry}"
- Voice Note Transcript: "${checkIn.voiceNoteTranscription || 'None'}"
`;

  try {
    const model = vertex.getGenerativeModel({
      model: 'gemini-1.5-flash-001',
      systemInstruction: systemPrompt,
      generationConfig: {
        responseMimeType: 'application/json',
      },
    });

    const response = await model.generateContent(prompt);
    const text = response.response.candidates?.[0]?.content?.parts?.[0]?.text;
    if (text) {
      const parsed = JSON.parse(text) as StructuredGeminiAnalysis;
      if (typeof parsed.burnoutRisk === 'number') {
        return { analysis: parsed, engine: 'vertex-ai' };
      }
    }
  } catch (err) {
    console.warn('Vertex AI structured analysis fell back to local diagnostics:', err);
  }

  const localFallback = localAnalyzeCheckIn(checkIn, profile, history);
  return { analysis: localFallback, engine: 'local' };
}
