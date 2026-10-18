export interface AcademicProfile {
  examType: 'JEE' | 'NEET' | 'UPSC' | 'CAT' | 'GATE' | 'CUET';
  targetScore: string;
  examDate: string;
  studyHoursPerDay: number;
}

export interface LifestyleProfile {
  sleepHours: number;
  exerciseHabits: 'None' | 'Occasional' | 'Regular';
  coachingStatus: 'Self Study' | 'Online Coaching' | 'Offline Coaching';
}

export interface PsychologicalAssessment {
  primaryStressorSources: string[]; // e.g., 'fear of failure', 'parent expectations', etc.
  anxietyLevelSelfAssessment: number; // 1-10
  supportSystemRating: number; // 1-10
}

export interface StudentProfile {
  name: string;
  academic: AcademicProfile;
  lifestyle: LifestyleProfile;
  assessment: PsychologicalAssessment;
  createdAt: string;
}

export interface MentalDNA {
  primaryStressors: string[];
  confidencePattern: string; // e.g. "Mock Test Dependent", "Consistency-Driven", "Volatile"
  recoveryStyle: string; // e.g. "Action-Oriented", "Reflection-Needed", "Empathetic Support"
  motivationType: string; // e.g. "Intrinsic Mastery", "Extrinsic Pressure", "Fear Avoidance"
  burnoutSusceptibility: 'Low' | 'Medium' | 'High';
  emotionalResilience: number; // 0 - 100
  preferredInterventionStyle: 'Action Plan' | 'Mindfulness & Grounding' | 'Empathetic Listening' | 'Re-framing';
}

export interface DailyCheckIn {
  id: string;
  date: string;
  mood: 'excellent' | 'good' | 'neutral' | 'anxious' | 'exhausted';
  energyLevel: number; // 1-10
  stressLevel: number; // 1-10
  sleepHours: number;
  studyHours: number;
  journalEntry: string;
  voiceNoteUrl?: string; // If audio was uploaded
  voiceNoteTranscription?: string;
  mockTestScore?: number; // Optional
}

export interface StructuredGeminiAnalysis {
  emotion: string; // dominant emotion extracted
  confidence: number; // 0 - 100
  motivation: number; // 0 - 100
  burnoutRisk: number; // 0 - 100
  stressTriggers: string[]; // list of triggers, e.g. ["Physics", "Parent Pressure", "Sleep Deprivation"]
  academicConcerns: string[]; // e.g. ["Backlog", "Mock Scores"]
  sleepIssues: boolean;
  parentPressure: boolean;
  interventionSuggestions: string[]; // bullet points
  stressConstellationUpdates?: {
    nodes: { id: string; size: number }[];
    edges: { source: string; target: string; weight: number }[];
  };
}

export interface DailyLogEntry {
  checkIn: DailyCheckIn;
  analysis: StructuredGeminiAnalysis;
  mentalDNASnapshot: MentalDNA;
}

export interface InterventionPlan {
  title: string;
  trigger: string;
  immediateAction: string;
  todayAction: string;
  threeDayPlan: string[];
  sevenDayPlan: string[];
  type: 'burnout' | 'parent-pressure' | 'exam-panic' | 'low-confidence' | 'general';
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  isDisclaimer?: boolean;
}
