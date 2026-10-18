import { GoogleGenerativeAI } from '@google/generative-ai';
import { DailyCheckIn, StudentProfile, StructuredGeminiAnalysis, MentalDNA, DailyLogEntry } from './types';

// Initialize the Gemini SDK if key is present
const apiKey = process.env.GEMINI_API_KEY || '';
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

// Helper to sanitize JSON response from Gemini
function cleanJsonString(str: string): string {
  // Remove markdown code block markers if present
  let clean = str.trim();
  if (clean.startsWith('```json')) {
    clean = clean.substring(7);
  } else if (clean.startsWith('```')) {
    clean = clean.substring(3);
  }
  if (clean.endsWith('```')) {
    clean = clean.substring(0, clean.length - 3);
  }
  return clean.trim();
}

// Emulate a high-fidelity analysis for local-only/fallback mode
export function localAnalyzeCheckIn(
  checkIn: DailyCheckIn,
  profile: StudentProfile,
  history: { checkIn: DailyCheckIn; analysis: StructuredGeminiAnalysis }[] = []
): StructuredGeminiAnalysis {
  const text = (checkIn.journalEntry + ' ' + (checkIn.voiceNoteTranscription || '')).toLowerCase();
  
  // Base calculations
  let confidence = Math.max(20, 100 - checkIn.stressLevel * 8);
  let motivation = Math.max(10, checkIn.energyLevel * 10);
  let burnoutRisk = Math.min(100, (checkIn.stressLevel * 6) + (10 - checkIn.energyLevel) * 4);
  
  // Adjust based on hours
  if (checkIn.sleepHours < 6) {
    burnoutRisk += 10;
  }
  if (checkIn.studyHours > 12) {
    burnoutRisk += 15;
  }
  
  // Extract triggers based on keywords
  const triggers: string[] = [];
  const concerns: string[] = [];
  let sleepIssues = checkIn.sleepHours < 6;
  let parentPressure = false;
  
  if (text.includes('physics')) {
    triggers.push('Physics');
  }
  if (text.includes('chemistry') || text.includes('organic') || text.includes('inorganic')) {
    triggers.push('Chemistry');
  }
  if (text.includes('math') || text.includes('calculus') || text.includes('algebra') || text.includes('integration')) {
    triggers.push('Mathematics');
  }
  
  if (text.includes('parent') || text.includes('father') || text.includes('mother') || text.includes('mom') || text.includes('dad') || text.includes('expectations')) {
    triggers.push('Parent Expectations');
    parentPressure = true;
  }
  
  if (text.includes('mock') || text.includes('test') || text.includes('score') || text.includes('marks')) {
    triggers.push('Mock Test Scores');
    concerns.push('Test Performance');
  }
  
  if (text.includes('backlog') || text.includes('leftover') || text.includes('behind')) {
    triggers.push('Study Backlog');
    concerns.push('Syllabus Completion');
  }
  
  if (text.includes('sleep') || text.includes('tired') || text.includes('insomnia') || text.includes('woke up')) {
    sleepIssues = true;
    triggers.push('Sleep Deprivation');
  }
  
  if (text.includes('peer') || text.includes('friend') || text.includes('compare') || text.includes('cousin')) {
    triggers.push('Peer Comparison');
  }
  
  // Clean default triggers
  if (triggers.length === 0) {
    triggers.push('General Exam Prep');
  }
  
  // Emotion extraction
  let emotion = 'Anxious';
  if (checkIn.mood === 'excellent') emotion = 'Excited / Motivated';
  else if (checkIn.mood === 'good') emotion = 'Satisfied';
  else if (checkIn.mood === 'neutral') emotion = 'Calm';
  else if (checkIn.mood === 'exhausted') emotion = 'Overwhelmed / Fatigued';
  else if (checkIn.mood === 'anxious') {
    if (text.includes('panic') || text.includes('scared') || text.includes('heart racing')) {
      emotion = 'Panic / High Stress';
    } else {
      emotion = 'Apprehensive / Stressed';
    }
  }

  // Check mock test drops
  if (checkIn.mockTestScore && history.length > 0) {
    const prevScores = history
      .map(h => h.checkIn.mockTestScore)
      .filter((s): s is number => typeof s === 'number');
    if (prevScores.length > 0) {
      const lastScore = prevScores[prevScores.length - 1];
      if (checkIn.mockTestScore < lastScore) {
        confidence -= 15;
        concerns.push('Declining Mock Scores');
      }
    }
  }
  
  // Bounds checking
  confidence = Math.max(10, Math.min(100, confidence));
  motivation = Math.max(10, Math.min(100, motivation));
  burnoutRisk = Math.max(5, Math.min(100, burnoutRisk));

  // Determine dynamic recommendations based on primary triggers
  const suggestions: string[] = [];
  if (burnoutRisk > 65) {
    suggestions.push("Highly Recommend: Shut down studies for 3-4 hours immediately. Sleep early tonight and do a 15-minute grounding walk.");
    suggestions.push("Prioritize sleeping 6.5+ hours over finishing today's syllabus backlog.");
  } else if (confidence < 40) {
    suggestions.push("Confidence recovery: Solve 5 basic, easy formula questions in your weakest subject to rebuild momentum.");
    suggestions.push("Stop checking other students' study tracker logs or mock score announcements today.");
  } else {
    suggestions.push("Keep doing what you're doing. Stick to your structured study chunks (50 min study, 10 min break).");
  }

  if (parentPressure) {
    suggestions.push("Create a clear buffer: rehearse a neutral statement for parent check-ins so questions don't trigger exam panic.");
  }
  if (sleepIssues) {
    suggestions.push("Turn off screens 45 minutes before bed. Engage in box breathing (4-4-4-4) to quiet the nervous system.");
  }

  if (suggestions.length < 3) {
    suggestions.push("Keep a 'victory log' containing 3 things you completed or understood today.");
  }

  // Stress Constellation Updates
  const nodes = [
    { id: 'Physics', size: text.includes('physics') ? 80 : 40 },
    { id: 'Math', size: text.includes('math') ? 80 : 40 },
    { id: 'Chemistry', size: text.includes('chemistry') ? 80 : 40 },
    { id: 'Sleep', size: sleepIssues ? 75 : 45 },
    { id: 'ParentPressure', size: parentPressure ? 80 : 40 },
    { id: 'MockTests', size: checkIn.mockTestScore ? 70 : 45 },
    { id: 'Anxiety', size: checkIn.stressLevel > 6 ? 78 : 45 },
    { id: 'Confidence', size: confidence < 50 ? 75 : 45 },
    { id: 'Backlog', size: text.includes('backlog') ? 75 : 40 }
  ];

  const edges: { source: string; target: string; weight: number }[] = [];
  if (text.includes('physics') && confidence < 50) {
    edges.push({ source: 'Physics', target: 'Confidence', weight: 8.5 });
  }
  if (parentPressure && checkIn.stressLevel > 6) {
    edges.push({ source: 'ParentPressure', target: 'Anxiety', weight: 8 });
  }
  if (checkIn.stressLevel > 6 && sleepIssues) {
    edges.push({ source: 'Anxiety', target: 'Sleep', weight: 7.5 });
  }
  if (checkIn.mockTestScore && confidence < 40) {
    edges.push({ source: 'MockTests', target: 'Confidence', weight: 8 });
  }
  if (sleepIssues && text.includes('physics')) {
    edges.push({ source: 'Sleep', target: 'Physics', weight: 6.5 });
  }

  return {
    emotion,
    confidence,
    motivation,
    burnoutRisk,
    stressTriggers: triggers,
    academicConcerns: concerns.length > 0 ? concerns : ["Syllabus pacing"],
    sleepIssues,
    parentPressure,
    interventionSuggestions: suggestions,
    stressConstellationUpdates: { nodes, edges }
  };
}

// Run server-side Gemini Analysis
export async function analyzeCheckInWithGemini(
  checkIn: DailyCheckIn,
  profile: StudentProfile,
  history: { checkIn: DailyCheckIn; analysis: StructuredGeminiAnalysis }[] = []
): Promise<StructuredGeminiAnalysis> {
  
  if (!genAI) {
    // Return local fallback analysis
    return localAnalyzeCheckIn(checkIn, profile, history);
  }

  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-flash-latest',
      generationConfig: {
        responseMimeType: 'application/json',
      },
    });

    const recentLogsSummary = history.slice(-3).map(h => ({
      date: h.checkIn.date,
      mood: h.checkIn.mood,
      stress: h.checkIn.stressLevel,
      triggers: h.analysis.stressTriggers,
      burnout: h.analysis.burnoutRisk
    }));

    const systemPrompt = `
You are MindPilot AI, an expert clinical psychologist and student counselor specializing in coaching students preparing for high-stakes competitive exams like JEE, NEET, UPSC, etc.
Analyze the student's daily check-in (mood, energy, stress, study/sleep hours, mock test scores, and raw journal/voice note text) in context of their profile.
Return a structured JSON output of the following schema:
{
  "emotion": "string (dominant emotion/mental state extracted)",
  "confidence": "number (0-100 rating of current confidence)",
  "motivation": "number (0-100 rating of motivation)",
  "burnoutRisk": "number (0-100 score indicating burnout probability)",
  "stressTriggers": ["string (highly specific triggers identified from journal)"],
  "academicConcerns": ["string (subjects, topics, backlogs, mock scores causing worry)"],
  "sleepIssues": "boolean (true if poor quality, insomnia, or less than 6 hours sleep)",
  "parentPressure": "boolean (true if there are family expectations, comparisons, or pressure mentioned)",
  "interventionSuggestions": ["string (3-4 highly personalized, actionable, non-medical advice bullet points)"],
  "stressConstellationUpdates": {
    "nodes": [
      { "id": "Physics | Math | Chemistry | Sleep | ParentPressure | MockTests | Anxiety | Confidence | Backlog", "size": "number (30 to 90 depending on impact)" }
    ],
    "edges": [
      { "source": "string", "target": "string", "weight": "number (1 to 10 correlation)" }
    ]
  }
}

Guidelines:
- Do not provide medical diagnoses.
- Suggestions should be highly actionable and split into mental triggers, study patterns, and lifestyle.
- Update node sizes: higher sizes mean more stress impact. Create edges showing correlations (e.g. Physics -> Confidence, ParentPressure -> Anxiety, Anxiety -> Sleep).
- Maintain empathy and exam-specific understanding (e.g. mock test score drops, backlog fears).
`;

    const prompt = `
Student Academic Profile:
- Exam: ${profile.academic.examType}
- Target Score: ${profile.academic.targetScore}
- Study Hours/Day Target: ${profile.academic.studyHoursPerDay}
- Stated Stressors: ${profile.assessment.primaryStressorSources.join(', ')}

Recent History (last 3 entries):
${JSON.stringify(recentLogsSummary, null, 2)}

Today's Check-in:
- Date: ${checkIn.date}
- Mood: ${checkIn.mood}
- Energy Level (1-10): ${checkIn.energyLevel}
- Stress Level (1-10): ${checkIn.stressLevel}
- Sleep Hours: ${checkIn.sleepHours}
- Study Hours: ${checkIn.studyHours}
- Mock Test Score: ${checkIn.mockTestScore || 'N/A'}
- Journal Text: "${checkIn.journalEntry}"
- Voice Note Transcript: "${checkIn.voiceNoteTranscription || 'None'}"

Analyze the input above and return the response strictly as a JSON object matching the requested schema.
`;

    const result = await model.generateContent([systemPrompt, prompt]);
    const responseText = result.response.text();
    const cleanJson = cleanJsonString(responseText);
    const parsed = JSON.parse(cleanJson) as StructuredGeminiAnalysis;

    // Validate properties
    if (
      typeof parsed.emotion === 'string' &&
      typeof parsed.confidence === 'number' &&
      typeof parsed.motivation === 'number' &&
      typeof parsed.burnoutRisk === 'number' &&
      Array.isArray(parsed.stressTriggers) &&
      Array.isArray(parsed.academicConcerns) &&
      typeof parsed.sleepIssues === 'boolean' &&
      typeof parsed.parentPressure === 'boolean' &&
      Array.isArray(parsed.interventionSuggestions)
    ) {
      return parsed;
    }

    throw new Error("Invalid output format from Gemini");
  } catch (error) {
    console.error("Error generating Gemini analysis: ", error);
    // Graceful fallback to local algorithm
    return localAnalyzeCheckIn(checkIn, profile, history);
  }
}

// Update Mental DNA based on logs
export function recalculateMentalDNA(
  profile: StudentProfile,
  history: DailyLogEntry[]
): MentalDNA {
  if (history.length === 0) {
    return {
      primaryStressors: profile.assessment.primaryStressorSources,
      confidencePattern: 'Mock Test Dependent',
      recoveryStyle: 'Action-Oriented',
      motivationType: 'Fear Avoidance',
      burnoutSusceptibility: profile.assessment.anxietyLevelSelfAssessment > 7 ? 'High' : 'Medium',
      emotionalResilience: Math.max(10, 100 - profile.assessment.anxietyLevelSelfAssessment * 8),
      preferredInterventionStyle: 'Action Plan'
    };
  }

  // Count stress triggers
  const triggerCounts: Record<string, number> = {};
  let parentPressureCount = 0;
  let sleepIssuesCount = 0;
  let totalLogs = history.length;
  let avgConfidence = 0;
  let avgBurnout = 0;

  history.forEach(entry => {
    entry.analysis.stressTriggers.forEach(t => {
      triggerCounts[t] = (triggerCounts[t] || 0) + 1;
    });
    if (entry.analysis.parentPressure) parentPressureCount++;
    if (entry.analysis.sleepIssues) sleepIssuesCount++;
    avgConfidence += entry.analysis.confidence;
    avgBurnout += entry.analysis.burnoutRisk;
  });

  avgConfidence /= totalLogs;
  avgBurnout /= totalLogs;

  // Primary Stressors
  const sortedTriggers = Object.entries(triggerCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(entry => entry[0]);

  // Confidence pattern
  let confidencePattern = 'Consistency-Driven';
  const mockLogs = history.filter(h => typeof h.checkIn.mockTestScore === 'number');
  if (mockLogs.length > 1) {
    let mockCorrelation = true; // Simulating check
    confidencePattern = 'Mock Test Dependent';
  } else if (avgConfidence < 40) {
    confidencePattern = 'Volatile / Vulnerable';
  }

  // Recovery Style & Susceptibility
  let recoveryStyle = 'Action-Oriented';
  let preferredStyle: 'Action Plan' | 'Mindfulness & Grounding' | 'Empathetic Listening' | 'Re-framing' = 'Action Plan';
  if (parentPressureCount / totalLogs > 0.4) {
    recoveryStyle = 'Reflection-Needed';
    preferredStyle = 'Re-framing';
  } else if (sleepIssuesCount / totalLogs > 0.4 || avgBurnout > 60) {
    recoveryStyle = 'Nervous System Rest';
    preferredStyle = 'Mindfulness & Grounding';
  }

  let burnoutSusceptibility: 'Low' | 'Medium' | 'High' = 'Medium';
  if (avgBurnout > 65) {
    burnoutSusceptibility = 'High';
  } else if (avgBurnout < 35) {
    burnoutSusceptibility = 'Low';
  }

  // Emotional resilience increases when they follow interventions (energy increases, stress decreases over time)
  let emotionalResilience = Math.round(50 + (avgConfidence - avgBurnout) * 0.5);
  emotionalResilience = Math.max(10, Math.min(100, emotionalResilience));

  return {
    primaryStressors: sortedTriggers.length > 0 ? sortedTriggers : profile.assessment.primaryStressorSources,
    confidencePattern,
    recoveryStyle,
    motivationType: parentPressureCount / totalLogs > 0.4 ? 'Extrinsic Pressure' : 'Intrinsic Mastery',
    burnoutSusceptibility,
    emotionalResilience,
    preferredInterventionStyle: preferredStyle
  };
}
