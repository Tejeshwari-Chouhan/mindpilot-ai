import { StudentProfile, DailyLogEntry, MentalDNA, InterventionPlan } from './types';

export const SEEDED_STUDENT_PROFILE: StudentProfile = {
  name: 'Bhavesh',
  academic: {
    examType: 'JEE',
    targetScore: '280',
    examDate: '2026-09-15',
    studyHoursPerDay: 11,
  },
  lifestyle: {
    sleepHours: 5.5,
    exerciseHabits: 'Occasional',
    coachingStatus: 'Offline Coaching',
  },
  assessment: {
    primaryStressorSources: ['fear of failure', 'parent expectations', 'poor mock scores', 'backlog'],
    anxietyLevelSelfAssessment: 7,
    supportSystemRating: 5,
  },
  createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
};

export const SEEDED_MENTAL_DNA: MentalDNA = {
  primaryStressors: ['Physics Backlog', 'Parent Expectations', 'Mock Test Scores'],
  confidencePattern: 'Mock Test Dependent',
  recoveryStyle: 'Action-Oriented',
  motivationType: 'Fear Avoidance',
  burnoutSusceptibility: 'High',
  emotionalResilience: 45,
  preferredInterventionStyle: 'Action Plan',
};

// 7 Days of realistic history for the JEE demo student
export const SEEDED_HISTORY: DailyLogEntry[] = [
  {
    checkIn: {
      id: 'day-1',
      date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      mood: 'good',
      energyLevel: 7,
      stressLevel: 5,
      sleepHours: 6.5,
      studyHours: 10,
      journalEntry: "Started the week fine. Did some math integration problems. Felt productive but slightly anxious about upcoming physics mock test on rotatory motion.",
      mockTestScore: 240
    },
    analysis: {
      emotion: "Motivated but anxious",
      confidence: 65,
      motivation: 75,
      burnoutRisk: 40,
      stressTriggers: ["Physics", "Upcoming Mock Test"],
      academicConcerns: ["Physics - Rotatory Motion"],
      sleepIssues: false,
      parentPressure: false,
      interventionSuggestions: [
        "Focus on core concepts in Rotatory Motion rather than solving complex JEE-advanced level questions right away.",
        "Maintain 6.5 hours of sleep to keep energy high."
      ]
    },
    mentalDNASnapshot: {
      primaryStressors: ['Physics', 'Mock Test'],
      confidencePattern: 'Mock Test Dependent',
      recoveryStyle: 'Action-Oriented',
      motivationType: 'Intrinsic Mastery',
      burnoutSusceptibility: 'Medium',
      emotionalResilience: 55,
      preferredInterventionStyle: 'Action Plan'
    }
  },
  {
    checkIn: {
      id: 'day-2',
      date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      mood: 'neutral',
      energyLevel: 6,
      stressLevel: 6,
      sleepHours: 6,
      studyHours: 11,
      journalEntry: "Coaching class went long. The Physics teacher highlighted my backlog in rotatory motion in front of classmates. Felt embarrassed and demotivated.",
    },
    analysis: {
      emotion: "Embarrassed and demotivated",
      confidence: 50,
      motivation: 60,
      burnoutRisk: 50,
      stressTriggers: ["Physics Backlog", "Peer Comparison", "Coaching Teacher"],
      academicConcerns: ["Rotatory Motion Backlog"],
      sleepIssues: false,
      parentPressure: false,
      interventionSuggestions: [
        "Reframe the teacher's comment as a diagnostic indicator, not a personal failure.",
        "Break down the rotatory motion backlog into 3 small sub-topics and allocate 1 hour daily."
      ]
    },
    mentalDNASnapshot: {
      primaryStressors: ['Physics Backlog', 'Peer Comparison'],
      confidencePattern: 'Mock Test Dependent',
      recoveryStyle: 'Action-Oriented',
      motivationType: 'Fear Avoidance',
      burnoutSusceptibility: 'High',
      emotionalResilience: 48,
      preferredInterventionStyle: 'Action Plan'
    }
  },
  {
    checkIn: {
      id: 'day-3',
      date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      mood: 'anxious',
      energyLevel: 5,
      stressLevel: 7,
      sleepHours: 5.5,
      studyHours: 12,
      journalEntry: "Studied late trying to cover Physics. Slept late. Dad asked me about my scores and reminded me that my cousin got into IIT Bombay last year. The comparison really hurts.",
    },
    analysis: {
      emotion: "Insecure and exhausted",
      confidence: 40,
      motivation: 55,
      burnoutRisk: 58,
      stressTriggers: ["Parent Expectations", "Comparison with Cousin", "Sleep Deprivation"],
      academicConcerns: ["Physics", "Lack of Sleep"],
      sleepIssues: true,
      parentPressure: true,
      interventionSuggestions: [
        "Do a 5-minute breathing exercise when feeling the sting of comparison.",
        "Politely request parents for focused study support instead of metric comparisons.",
        "Enforce a strict 11 PM bedtime."
      ]
    },
    mentalDNASnapshot: {
      primaryStressors: ['Physics Backlog', 'Parent Expectations', 'Sleep Deprivation'],
      confidencePattern: 'Mock Test Dependent',
      recoveryStyle: 'Action-Oriented',
      motivationType: 'Fear Avoidance',
      burnoutSusceptibility: 'High',
      emotionalResilience: 42,
      preferredInterventionStyle: 'Re-framing'
    }
  },
  {
    checkIn: {
      id: 'day-4',
      date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      mood: 'exhausted',
      energyLevel: 4,
      stressLevel: 8,
      sleepHours: 5,
      studyHours: 13,
      journalEntry: "Pushing myself too hard. Barely slept. Mock test was today. My score dropped to 190. I feel like my dream of getting into IIT is slipping away. What will my parents say?",
      mockTestScore: 190
    },
    analysis: {
      emotion: "Hopeless and burned out",
      confidence: 30,
      motivation: 45,
      burnoutRisk: 72,
      stressTriggers: ["Poor Mock Test Score", "Parental Reaction", "Exhaustion"],
      academicConcerns: ["All Subjects", "Mock Scores"],
      sleepIssues: true,
      parentPressure: true,
      interventionSuggestions: [
        "Immediate emergency reset: stop studying for 4 hours, sleep, and go for a walk.",
        "Mock scores fluctuate; they are diagnostic tools, not the final JEE rank.",
        "Activate SOS Calm Room for breathing/grounding."
      ]
    },
    mentalDNASnapshot: {
      primaryStressors: ['Mock Test Scores', 'Parent Expectations', 'Sleep Deprivation'],
      confidencePattern: 'Mock Test Dependent',
      recoveryStyle: 'Reflection-Needed',
      motivationType: 'Fear Avoidance',
      burnoutSusceptibility: 'High',
      emotionalResilience: 38,
      preferredInterventionStyle: 'Mindfulness & Grounding'
    }
  },
  {
    checkIn: {
      id: 'day-5',
      date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      mood: 'exhausted',
      energyLevel: 4,
      stressLevel: 8,
      sleepHours: 5,
      studyHours: 9,
      journalEntry: "Woke up with a headache. Couldn't focus on Chemistry. Had a small argument with my mother because I was irritable. I want to escape this pressure. The backlog is piling up.",
    },
    analysis: {
      emotion: "Irritable and overwhelmed",
      confidence: 32,
      motivation: 40,
      burnoutRisk: 75,
      stressTriggers: ["Mother Argument", "Chemistry Focus", "Backlog Accumulation"],
      academicConcerns: ["Chemistry", "Backlog"],
      sleepIssues: true,
      parentPressure: true,
      interventionSuggestions: [
        "Take a brief screen-free break. Apologize to mother to resolve emotional friction.",
        "Break today's Chemistry study into two 45-minute blocks with 15-minute breaks."
      ]
    },
    mentalDNASnapshot: {
      primaryStressors: ['Parent Expectations', 'Backlog', 'Sleep Deprivation'],
      confidencePattern: 'Mock Test Dependent',
      recoveryStyle: 'Empathetic Listening',
      motivationType: 'Fear Avoidance',
      burnoutSusceptibility: 'High',
      emotionalResilience: 35,
      preferredInterventionStyle: 'Empathetic Listening'
    }
  },
  {
    checkIn: {
      id: 'day-6',
      date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      mood: 'anxious',
      energyLevel: 5,
      stressLevel: 7.5,
      sleepHours: 5.5,
      studyHours: 11,
      journalEntry: "Tried to reset. Used MindPilot AI's calm breathing exercise. Felt a bit better, but still dreading the mock test analysis. Physics is still the main roadblock.",
    },
    analysis: {
      emotion: "Anxious but trying",
      confidence: 38,
      motivation: 55,
      burnoutRisk: 68,
      stressTriggers: ["Mock Test Analysis", "Physics"],
      academicConcerns: ["Physics Concepts"],
      sleepIssues: true,
      parentPressure: false,
      interventionSuggestions: [
        "Reward yourself for attempting to reset. Positive reinforcement builds resilience.",
        "Select only 3 mistakes from the mock test to review today, instead of analyzing the whole paper at once."
      ]
    },
    mentalDNASnapshot: {
      primaryStressors: ['Physics', 'Mock Test Scores', 'Parent Expectations'],
      confidencePattern: 'Mock Test Dependent',
      recoveryStyle: 'Action-Oriented',
      motivationType: 'Fear Avoidance',
      burnoutSusceptibility: 'High',
      emotionalResilience: 40,
      preferredInterventionStyle: 'Action Plan'
    }
  },
  {
    checkIn: {
      id: 'day-7',
      date: new Date(Date.now()).toISOString().split('T')[0],
      mood: 'anxious',
      energyLevel: 5,
      stressLevel: 7.8,
      sleepHours: 5.5,
      studyHours: 11.5,
      journalEntry: "Physics mock test is approaching. When I open the Physics textbook, my heart starts racing and I keep thinking about how I will fail. Parents keep asking me how preparation is going. I'm barely sleeping, pushing myself but getting nowhere. Chemistry is okay, Math is okay, but Physics is dragging me down completely.",
    },
    analysis: {
      emotion: "Examine Panic / Subject Anxiety",
      confidence: 35,
      motivation: 50,
      burnoutRisk: 68,
      stressTriggers: ["Physics Textbook", "Physics Mock Test", "Parent Questions", "Lack of Sleep"],
      academicConcerns: ["Physics anxiety", "Mock preparation"],
      sleepIssues: true,
      parentPressure: true,
      interventionSuggestions: [
        "Focus on sub-topic Mastery. Switch from reading heavy Physics textbooks to solving 10 easy-level PYQs (Previous Year Questions) to boost immediate confidence.",
        "Establish an emotional barrier between parent check-ins and self-worth. Reframe their questions as love and concern rather than a performance audit.",
        "Utilize a 4-7-8 breathing protocol before starting Physics study to lower heart rate."
      ]
    },
    mentalDNASnapshot: {
      primaryStressors: ['Physics Backlog', 'Parent Expectations', 'Mock Test Scores'],
      confidencePattern: 'Mock Test Dependent',
      recoveryStyle: 'Action-Oriented',
      motivationType: 'Fear Avoidance',
      burnoutSusceptibility: 'High',
      emotionalResilience: 45,
      preferredInterventionStyle: 'Action Plan'
    }
  }
];

export const MOCK_INTERVENTIONS: InterventionPlan[] = [
  {
    title: "Burnout Recovery Protocol",
    trigger: "Burnout Risk > 60%",
    immediateAction: "Shut down books/screens. Drink water and take a 20-minute silent walk in nature/fresh air.",
    todayAction: "Enforce a strict 6-hour sleep budget tonight. Cut study hours down to 8 hours max; focus on quality over sheer quantity.",
    threeDayPlan: [
      "Limit study blocks to 45 minutes with mandatory 10-minute movement breaks.",
      "Spend 15 minutes each evening doing a non-academic screen-free activity.",
      "Refuse mock tests or practice exams for the next 48 hours to let the nervous system cool down."
    ],
    sevenDayPlan: [
      "Incorporate 20 minutes of light physical exercise daily.",
      "Configure a hard stop study time (e.g., no study after 9:30 PM).",
      "Gradually rebuild study hours back to 9-10 hours, but ensure consistent pacing."
    ],
    type: "burnout"
  },
  {
    title: "Parental Pressure Reframing Plan",
    trigger: "High Parent Expectations",
    immediateAction: "Take three deep breaths. Tell yourself: 'My worth is not defined by an examination score. I am studying to learn and grow.'",
    todayAction: "Create a standard, calm 2-sentence response for when parents ask about your score (e.g., 'I am analyzing my mistakes and working hard to improve. Thank you for checking in.'). This prevents emotional escalations.",
    threeDayPlan: [
      "Write a journal entry about what qualities your parents appreciate in you outside of academics.",
      "Schedule a dedicated 15-minute chat with your parents during a relaxed time to share your study plan, showing them you are on track so they feel reassured.",
      "Create a physical barrier (close door, wear headphones) during peak study hours to avoid interruptions."
    ],
    sevenDayPlan: [
      "Practice setting respectful boundaries around exam conversations (e.g., agreeing not to talk about exams during dinner).",
      "Connect with a supportive peer, mentor, or counselor to vent about expectations.",
      "Engage in cooperative household activities (like helping with a meal) to build positive, non-exam connections with parents."
    ],
    type: "parent-pressure"
  },
  {
    title: "Exam Panic & Subject Anxiety Relief",
    trigger: "High Anxiety / Physics Dread",
    immediateAction: "Step away from the book. Perform the 5-4-3-2-1 Grounding Method: Name 5 things you can see, 4 you can touch, 3 you can hear, 2 you can smell, and 1 you can taste.",
    todayAction: "Break the intimidating subject (e.g. Physics) down. Today, do not study new topics. Only solve 5 very easy, basic level formulas/problems to restore safety and sense of control.",
    threeDayPlan: [
      "Use the 'Calm Protocol' (box breathing for 4 minutes) prior to opening the difficult subject book.",
      "Do mock test analysis focusing only on what went RIGHT first, before cataloging errors.",
      "Study the difficult subject in a group or with an online solution guide to bypass feelings of getting stuck."
    ],
    sevenDayPlan: [
      "Practice mock tests in short, timed 30-minute mini-bursts to desensitize the test anxiety.",
      "Maintain a 'Formula Cheatsheet' and read it when anxiety strikes.",
      "Celebrate small wins: write down 3 things you successfully solved at the end of each day."
    ],
    type: "exam-panic"
  },
  {
    title: "Confidence Restoration Plan",
    trigger: "Confidence < 40%",
    immediateAction: "Look back at your target score of 280 and list 2 difficult topics you have already successfully mastered in the past.",
    todayAction: "Create a 'Victory Log'. Write down 3 specific academic achievements (e.g. solved a hard math problem, understood a complex mechanism, sat focused for 2 hours) from this week.",
    threeDayPlan: [
      "Teach a concept you know well to a friend or write it down as if explaining it to a 10-year-old (Feynman Technique).",
      "Avoid checking peer scores or visiting competitive online forums/discussion threads.",
      "Set daily micro-goals (e.g. complete 10 problems) that you are 100% guaranteed to complete, ensuring a daily win."
    ],
    sevenDayPlan: [
      "Analyze Mock Test errors objectively. Categorize them into: Silly Mistake, Concept Gap, Time Pressure. Realize that over 50% are fixable procedural mistakes.",
      "Review the Victory Log daily to wire the brain for success.",
      "Begin each day's study session with a topic you enjoy and are good at to start with positive momentum."
    ],
    type: "low-confidence"
  }
];

export const MOCK_CONSTELLATION_NODES = [
  { id: 'Physics', label: 'Physics', type: 'subject', x: 200, y: 150, size: 75, impact: 8 },
  { id: 'Math', label: 'Mathematics', type: 'subject', x: 450, y: 120, size: 45, impact: 4 },
  { id: 'Chemistry', label: 'Chemistry', type: 'subject', x: 300, y: 50, size: 35, impact: 3 },
  { id: 'Sleep', label: 'Sleep Quality', type: 'lifestyle', x: 150, y: 350, size: 68, impact: 7 },
  { id: 'ParentPressure', label: 'Parent Expectations', type: 'psychological', x: 500, y: 300, size: 70, impact: 7.5 },
  { id: 'MockTests', label: 'Mock Test Scores', type: 'academic', x: 350, y: 250, size: 65, impact: 6.8 },
  { id: 'Anxiety', label: 'Anxiety', type: 'psychological', x: 320, y: 400, size: 80, impact: 8.5 },
  { id: 'Confidence', label: 'Confidence Drop', type: 'psychological', x: 450, y: 450, size: 78, impact: 8.2 },
  { id: 'Backlog', label: 'Physics Backlog', type: 'academic', x: 100, y: 200, size: 72, impact: 7.8 }
];

export const MOCK_CONSTELLATION_EDGES = [
  { id: 'e-backlog-physics', source: 'Backlog', target: 'Physics', weight: 8, label: 'Causes Dread' },
  { id: 'e-physics-confidence', source: 'Physics', target: 'Confidence', weight: 9, label: 'Crushes' },
  { id: 'e-mocktests-confidence', source: 'MockTests', target: 'Confidence', weight: 8.5, label: 'Dictates' },
  { id: 'e-parent-anxiety', source: 'ParentPressure', target: 'Anxiety', weight: 7.5, label: 'Triggers' },
  { id: 'e-confidence-anxiety', source: 'Confidence', target: 'Anxiety', weight: 9, label: 'Amplifies' },
  { id: 'e-anxiety-sleep', source: 'Anxiety', target: 'Sleep', weight: 8, label: 'Disrupts' },
  { id: 'e-sleep-physics', source: 'Sleep', target: 'Physics', weight: 7, label: 'Impairs Focus' }
];

export function getInterventionForStudent(
  burnoutRisk: number,
  stressTriggers: string[],
  confidence: number
): InterventionPlan {
  if (burnoutRisk >= 60) {
    return MOCK_INTERVENTIONS[0]; // Burnout Recovery
  }
  
  const hasParentPressure = stressTriggers.some(t => 
    t.toLowerCase().includes('parent') || t.toLowerCase().includes('family') || t.toLowerCase().includes('expectations')
  );
  
  if (hasParentPressure) {
    return MOCK_INTERVENTIONS[1]; // Parent pressure
  }
  
  const hasSubjectAnxiety = stressTriggers.some(t => 
    t.toLowerCase().includes('physics') || t.toLowerCase().includes('anxiety') || t.toLowerCase().includes('textbook')
  );
  
  if (hasSubjectAnxiety || confidence < 40) {
    if (confidence < 38) {
      return MOCK_INTERVENTIONS[3]; // Confidence restored
    }
    return MOCK_INTERVENTIONS[2]; // Subject panic
  }
  
  // Default general plan
  return {
    title: "Steady Focus Protocol",
    trigger: "Routine Optimization",
    immediateAction: "Review your target score goals and list three accomplishments you achieved today.",
    todayAction: "Plan your study blocks using the Pomodoro technique: 50 mins study, 10 mins break.",
    threeDayPlan: [
      "Stick to a consistent sleep schedule of 6.5+ hours.",
      "Dedicate the first 30 minutes of your morning to light review, not new learning.",
      "Review mock test mistakes without self-judgment."
    ],
    sevenDayPlan: [
      "Incorporate at least three 20-minute physical exercise sessions this week.",
      "Maintain a daily gratitude journal focusing on progress.",
      "Schedule a rest afternoon with absolutely no studies at the end of the week."
    ],
    type: "general"
  };
}
