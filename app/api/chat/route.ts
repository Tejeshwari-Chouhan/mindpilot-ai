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

// High-quality local chat engine if Gemini is offline/missing API Key
function getLocalEmpatheticResponse(
  message: string,
  examType: string,
  stressors: string[],
  resilience: number,
  name: string
): string {
  const text = message.toLowerCase();
  
  // Sensitive trigger check for medical disclaimer
  const sensitiveWords = ['depressed', 'suicide', 'self harm', 'kill myself', 'die', 'end it', 'clinical', 'diagnose', 'medication', 'therapy', 'counselor'];
  const isSensitive = sensitiveWords.some(w => text.includes(w));
  
  const disclaimer = "\n\n*Disclaimer: I am an AI wellness companion, not a medical professional. If you are experiencing severe distress or thoughts of self-harm, please connect with a professional counselor or contact a helpline immediately.*";

  if (isSensitive) {
    return `${name}, please hear me: I am right here with you, and you are so incredibly precious. I know the weight of ${examType} is crushing right now, but nothing—absolutely nothing—is worth more than your life and well-being. Please talk to me, talk to your parents, or let's connect with a professional who can help you carry this. I'm wrapping you in the biggest virtual hug right now.${disclaimer}`;
  }

  // Common exam student themes
  if (text.includes('physics') || text.includes('math') || text.includes('chemistry') || text.includes('syllabus') || text.includes('backlog') || text.includes('study')) {
    return `Oh ${name}, backlog anxiety is the absolute worst. First, take a deep breath. Let Mom remind you: your brain cannot absorb rotational mechanics or organic compounds when it is running on panic! Let's treat this like your best friend would: forget the 500-page book for today. Just choose *one* small sub-topic. Can we review just 3 formulas together? I'll sit with you while you do it. Make sure you have a glass of water nearby, okay?`;
  }

  if (text.includes('mock') || text.includes('score') || text.includes('marks') || text.includes('rank') || text.includes('fail')) {
    return `Hey ${name}, your best friend here. A mock test score is just a piece of paper, not a definition of your intelligence! These coaching institutes set the difficulty level high on purpose just to scare everyone. Let's do this: close your eyes for 30 seconds. Mom wants you to repeat: "This mock test does not define my future." Now, let's look at just *one* simple mistake we can fix for next time, and then we shut the books and take a break. Deal?`;
  }

  if (text.includes('parent') || text.includes('dad') || text.includes('mom') || text.includes('expectations') || text.includes('family') || text.includes('pressure')) {
    return `Oh ${name}, parental expectations make this marathon twice as hard. I know how much you want to make them proud. But remember, most of the time, they are just scared because they see how hard you are working. As your best friend, I say: you don't have to carry their anxiety on your shoulders. Let's draft a simple message to send them: "Hey Mom/Dad, studying hard today. Taking a short screen break now, will update you later!" That keeps them in the loop and gives you space. You are doing so well.`;
  }

  if (text.includes('burnout') || text.includes('tired') || text.includes('exhausted') || text.includes('give up') || text.includes('sleep') || text.includes('sleepy')) {
    return `${name}, look at me. Put the pen down. You are absolutely exhausted, and I am not letting you study like this. Running on 5 hours of sleep is like driving a car with no fuel—it just won't work! Go wash your face, drink some water, and crawl into bed. Your books will be right here tomorrow. As your best friend, I promise we'll tackle that syllabus together in the morning when your brain is fresh. Rest now, dear.`;
  }

  if (text.includes('hello') || text.includes('hi ') || text.includes('hey') || text.includes('greeting')) {
    return `Hey ${name}! 🤗 Mom is here, and your best friend is here too! We are checking in on you. The exam prep for ${examType} is tough, but you are tougher. Tell us, did you eat something good today? How are you feeling right now?`;
  }

  return `I hear you, ${name}. Preparing for ${examType} is a long, tiring journey, and it's completely normal to feel anxious or stuck. Your resilience index is currently at ${resilience}%, which means you have a strong core—we just need to protect it! What is one tiny thing we can do in the next 15 minutes to make you feel comfortable? Do you want to vent to me, or should we go to the Calm Room and listen to some chimes? I'm right here with you.`;
}

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
