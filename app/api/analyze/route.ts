import { NextResponse } from 'next/server';
import { z } from 'zod';
import { analyzeCheckInWithGemini, recalculateMentalDNA } from '@/lib/gemini';
import { analyzeCheckInWithVertex } from '@/lib/gcp/vertex-gemini';
import { dispatchCheckInTelemetryEvent } from '@/lib/gcp/pubsub';
import { streamTelemetryToBigQuery } from '@/lib/gcp/bigquery';
import { DailyCheckIn, StudentProfile } from '@/lib/types';

// Zod schema for input validation
const AcademicSchema = z.object({
  examType: z.enum(['JEE', 'NEET', 'UPSC', 'CAT', 'GATE', 'CUET']),
  targetScore: z.string().min(1),
  examDate: z.string(),
  studyHoursPerDay: z.number().min(0).max(24),
});

const LifestyleSchema = z.object({
  sleepHours: z.number().min(0).max(24),
  exerciseHabits: z.enum(['None', 'Occasional', 'Regular']),
  coachingStatus: z.enum(['Self Study', 'Online Coaching', 'Offline Coaching']),
});

const AssessmentSchema = z.object({
  primaryStressorSources: z.array(z.string()),
  anxietyLevelSelfAssessment: z.number().min(1).max(10),
  supportSystemRating: z.number().min(1).max(10),
});

const ProfileSchema = z.object({
  name: z.string().optional().default('Pilot'),
  academic: AcademicSchema,
  lifestyle: LifestyleSchema,
  assessment: AssessmentSchema,
  createdAt: z.string(),
});

const CheckInSchema = z.object({
  id: z.string(),
  date: z.string(),
  mood: z.enum(['excellent', 'good', 'neutral', 'anxious', 'exhausted']),
  energyLevel: z.number().min(1).max(10),
  stressLevel: z.number().min(1).max(10),
  sleepHours: z.number().min(0).max(24),
  studyHours: z.number().min(0).max(24),
  journalEntry: z.string().min(1, "Journal entry cannot be empty"),
  voiceNoteUrl: z.string().optional(),
  voiceNoteTranscription: z.string().optional(),
  mockTestScore: z.number().optional(),
});

const RequestSchema = z.object({
  checkIn: CheckInSchema,
  profile: ProfileSchema,
  history: z.array(z.any()), // Array of DailyLogEntry
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Validate request using Zod
    const validationResult = RequestSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Invalid request data", details: validationResult.error.flatten() },
        { status: 400 }
      );
    }

    const { checkIn, profile, history } = validationResult.data;

    // Call Gemini on Vertex AI (with direct Gemini and local resilience fallbacks)
    let analysis;
    let engine = 'vertex-ai';
    try {
      const vertexRes = await analyzeCheckInWithVertex(
        checkIn as DailyCheckIn,
        profile as StudentProfile,
        history
      );
      analysis = vertexRes.analysis;
      engine = vertexRes.engine;
    } catch {
      analysis = await analyzeCheckInWithGemini(
        checkIn as DailyCheckIn,
        profile as StudentProfile,
        history
      );
      engine = 'gemini-fallback';
    }

    // Event-driven pipeline: Stream check-in telemetry to Pub/Sub and BigQuery asynchronously
    dispatchCheckInTelemetryEvent({
      studentName: profile.name || 'Student',
      examType: profile.academic.examType,
      stressLevel: checkIn.stressLevel,
      burnoutRisk: analysis.burnoutRisk,
      sleepHours: checkIn.sleepHours,
    }).catch(err => console.warn('PubSub event dispatch skipped:', err));

    streamTelemetryToBigQuery(
      checkIn as DailyCheckIn,
      profile as StudentProfile
    ).catch(err => console.warn('BigQuery telemetry streaming skipped:', err));

    // Calculate updated mental DNA
    const fullHistoryEntry = {
      checkIn: checkIn as DailyCheckIn,
      analysis,
      mentalDNASnapshot: {
        primaryStressors: analysis.stressTriggers,
        confidencePattern: 'Mock Test Dependent',
        recoveryStyle: 'Action-Oriented',
        motivationType: 'Fear Avoidance',
        burnoutSusceptibility: 'Medium',
        emotionalResilience: 50,
        preferredInterventionStyle: 'Action Plan'
      } // Temporary placeholder for recalculate
    };
    
    const allHistory = [...history, fullHistoryEntry];
    const updatedMentalDNA = recalculateMentalDNA(profile as StudentProfile, allHistory);

    // Attach final recalculated mental DNA and AI engine to response
    return NextResponse.json({
      analysis,
      updatedMentalDNA,
      engine,
    });

  } catch (error: any) {
    console.error("API error during check-in analysis: ", error);
    return NextResponse.json(
      { error: "Internal Server Error", message: error.message },
      { status: 500 }
    );
  }
}
