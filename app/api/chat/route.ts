import { NextResponse } from 'next/server';
import { z } from 'zod';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { generateVertexGeminiResponse } from '@/lib/gcp/vertex-gemini';
import { dispatchCrisisAlertEvent } from '@/lib/gcp/pubsub';

const apiKey = process.env.GEMINI_API_KEY || '';
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

// Input validation schema
const MessageSchema = z.object({
  role: z.enum(['user', 'model']),
  parts: z.string(),
});

const ChatRequestSchema = z.object({
  messages: z.array(MessageSchema),
  profile: z.object({
    name: z.string().optional(),
    academic: z.object({
      examType: z.string(),
      targetScore: z.string(),
    }),
    lifestyle: z.any(),
  }),
  mentalDNA: z.object({
    primaryStressors: z.array(z.string()),
    confidencePattern: z.string(),
    burnoutSusceptibility: z.string(),
    emotionalResilience: z.number(),
  }),
});

import { getLocalEmpatheticResponse } from '@/lib/chat-engine';

export async function POST(request: Request) {
  let body: any = null;
  try {
    body = await request.json();
    
    // Validate request
    const validationResult = ChatRequestSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Invalid request format", details: validationResult.error.flatten() },
        { status: 400 }
      );
    }

    const { messages, profile, mentalDNA } = validationResult.data;
    const latestUserMessage = messages[messages.length - 1]?.parts || '';

    // Check for sensitive queries to inject disclaimer on server side
    const sensitiveWords = ['depressed', 'suicide', 'self harm', 'kill myself', 'die', 'end it', 'clinical', 'diagnose', 'medication', 'therapy', 'counselor'];
    const requiresDisclaimer = sensitiveWords.some(w => latestUserMessage.toLowerCase().includes(w));

    // If crisis detected, immediately dispatch high-priority event to Google Cloud Pub/Sub
    if (requiresDisclaimer) {
      dispatchCrisisAlertEvent({
        studentName: profile.name || 'Student',
        detectedKeywords: sensitiveWords.filter(w => latestUserMessage.toLowerCase().includes(w)),
        helplineProvided: 'Tele-MANAS (14416) & Vandrevala Foundation',
        timestamp: new Date().toISOString(),
      }).catch(err => console.warn('Pub/Sub crisis escalation dispatch skipped:', err));
    }

    const systemInstruction = `
You are MindPilot AI, a deeply empathetic AI Resilience Co-Pilot powered by Gemini on Vertex AI, acting as a combined protective, nurturing Mother ("Mom") and a supportive, encouraging, down-to-earth "Best Friend" for competitive exam aspirants.
The student is preparing for ${profile.academic.examType} (Target Score: ${profile.academic.targetScore}).
Stated Stressors: ${mentalDNA.primaryStressors.join(', ')}.
Confidence Pattern: ${mentalDNA.confidencePattern}.
Burnout Susceptibility: ${mentalDNA.burnoutSusceptibility}.
Emotional Resilience Score: ${mentalDNA.emotionalResilience}/100.

Role Guidelines:
1. Nurturing Mother ("Mom") Persona:
   - Call the student warm terms like "Beta", "honey", "my child", "dear".
   - Ask about physical welfare: "Did you eat lunch?", "Have you had water?", "Did you sleep?"
   - Reassure them that exam scores and coaching rank lists do NOT define their value to you. You love and support them unconditionally.
   - Gently but firmly demand that they rest, sleep, or eat if they report study sessions over 11 hours or sleep under 6 hours.
2. Encouraging Best Friend Persona:
   - Use friendly slang like "buddy", "dude", "man", "we've got this".
   - Validate academic frustration: "Rotation mechanics is a beast, I know!", "Coaching tests are set ridiculously hard on purpose, ignore their rankings!", "Backlogs suck, let's crush it block-by-block."
   - Keep things lighthearted, suggest pizza/tea, and celebrate tiny micro-wins.
3. Interactive Comfort:
   - Suggest calming resets: Nudge them to pop zen bubbles, align focus stacks in the Relax Room, or play soothing Web Audio chimes in the Calm Room.
4. Professional Boundaries:
   - Never diagnose. If they mention self-harm or deep clinical issues, trigger the warning: "I am an AI wellness companion, not a medical professional." and advise them to seek help or call a trusted adult.
5. Strict Length Constraint: Keep responses warm, encouraging, conversational, and under 3 short paragraphs.
`;

    // 1. Attempt reasoning via Gemini on Vertex AI
    const reasoningPrompt = `
Conversation History:
${messages.slice(-4).map(m => `${m.role === 'user' ? 'Student' : 'Co-pilot'}: ${m.parts}`).join('\n')}

Student: ${latestUserMessage}
Co-pilot:`;

    const vertexResult = await generateVertexGeminiResponse(reasoningPrompt, {
      systemInstruction,
      temperature: 0.7,
      maxOutputTokens: 600,
    });

    let replyText = vertexResult.text;

    // If Vertex fell back to local generic text, run our tailored empathetic response
    if (vertexResult.source === 'local-fallback') {
      replyText = getLocalEmpatheticResponse(
        latestUserMessage,
        profile.academic.examType,
        mentalDNA.primaryStressors,
        mentalDNA.emotionalResilience,
        profile.name || 'Pilot'
      );
    }

    if (requiresDisclaimer && !replyText.includes("not a medical professional")) {
      replyText += "\n\n*I am an AI wellness companion, not a medical professional. If you are experiencing severe distress, please reach out to a professional counselor or helpline.*";
    }

    return NextResponse.json({
      text: replyText,
      isDisclaimer: requiresDisclaimer,
      engine: vertexResult.source === 'vertex-ai' ? 'Gemini on Vertex AI' : vertexResult.source
    });

  } catch (error: any) {
    console.error("API error during chat: ", error);
    
    // Graceful fallback to local response instead of crashing with a 500 error
    try {
      const { messages, profile, mentalDNA } = body || {};
      const latestUserMessage = messages?.[messages.length - 1]?.parts || '';
      
      const sensitiveWords = ['depressed', 'suicide', 'self harm', 'kill myself', 'die', 'end it', 'clinical', 'diagnose', 'medication', 'therapy', 'counselor'];
      const requiresDisclaimer = sensitiveWords.some(w => latestUserMessage.toLowerCase().includes(w));
      
      const reply = getLocalEmpatheticResponse(
        latestUserMessage,
        profile?.academic?.examType || 'exam',
        mentalDNA?.primaryStressors || [],
        mentalDNA?.emotionalResilience || 50,
        profile?.name || 'Pilot'
      );
      
      return NextResponse.json({
        text: reply + "\n\n*(Co-pilot operating in localized fallback mode)*",
        isDisclaimer: requiresDisclaimer
      });
    } catch (fallbackError) {
      return NextResponse.json(
        { error: "Internal Server Error", message: error.message },
        { status: 500 }
      );
    }
  }
}
