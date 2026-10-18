import { describe, it, expect } from 'vitest';
import { localAnalyzeCheckIn, recalculateMentalDNA } from '../lib/gemini';
import { getInterventionForStudent } from '../lib/mockData';
import { DailyCheckIn, StudentProfile } from '../lib/types';
import { calculateCalibrationScore, calculateROIMetrics } from '../lib/metrics';

describe('MindPilot AI Resilience Calculations', () => {
  const mockProfile: StudentProfile = {
    name: 'Test Pilot',
    academic: {
      examType: 'JEE',
      targetScore: '280',
      examDate: '2026-09-15',
      studyHoursPerDay: 11,
    },
    lifestyle: {
      sleepHours: 6,
      exerciseHabits: 'Occasional',
      coachingStatus: 'Offline Coaching',
    },
    assessment: {
      primaryStressorSources: ['fear of failure', 'parent expectations'],
      anxietyLevelSelfAssessment: 7,
      supportSystemRating: 5,
    },
    createdAt: new Date().toISOString(),
  };

  it('correctly extracts subject and lifestyle triggers from journal texts', () => {
    const checkIn: DailyCheckIn = {
      id: 'test-1',
      date: '2026-06-13',
      mood: 'anxious',
      energyLevel: 5,
      stressLevel: 8,
      sleepHours: 5,
      studyHours: 12,
      journalEntry: "I'm having a massive physics backlog problem, and my mother kept comparing me. I'm barely sleeping.",
    };

    const analysis = localAnalyzeCheckIn(checkIn, mockProfile);

    // Should detect Physics, Parent expectations, and Sleep issues
    expect(analysis.stressTriggers).toContain('Physics');
    expect(analysis.stressTriggers).toContain('Parent Expectations');
    expect(analysis.stressTriggers).toContain('Sleep Deprivation');
    expect(analysis.sleepIssues).toBe(true);
    expect(analysis.parentPressure).toBe(true);
  });
 
  it('covers all keyword triggers for academic and psychological stress', () => {
    const checkIn: DailyCheckIn = {
      id: 'test-all-triggers',
      date: '2026-06-13',
      mood: 'neutral',
      energyLevel: 5,
      stressLevel: 5,
      sleepHours: 7,
      studyHours: 8,
      journalEntry: "chemistry organic study went fine but calculus math is hard, feeling peer pressure comparing to cousin, left behind with backlog, woke up tired.",
    };
 
    const analysis = localAnalyzeCheckIn(checkIn, mockProfile);
    expect(analysis.stressTriggers).toContain('Chemistry');
    expect(analysis.stressTriggers).toContain('Mathematics');
    expect(analysis.stressTriggers).toContain('Peer Comparison');
    expect(analysis.stressTriggers).toContain('Study Backlog');
    expect(analysis.stressTriggers).toContain('Sleep Deprivation');
  });

  it('calculates burnout risk accurately based on hours and stress levels', () => {
    const lowStressCheckIn: DailyCheckIn = {
      id: 'test-2',
      date: '2026-06-13',
      mood: 'good',
      energyLevel: 8,
      stressLevel: 2,
      sleepHours: 8,
      studyHours: 8,
      journalEntry: "Good day, covered mathematics calculus formulas, slept well.",
    };

    const highStressCheckIn: DailyCheckIn = {
      id: 'test-3',
      date: '2026-06-13',
      mood: 'exhausted',
      energyLevel: 3,
      stressLevel: 9,
      sleepHours: 4.5,
      studyHours: 13,
      journalEntry: "So tired. Backlog in physics rotatory motion is killing me. Slept late.",
    };

    const lowAnalysis = localAnalyzeCheckIn(lowStressCheckIn, mockProfile);
    const highAnalysis = localAnalyzeCheckIn(highStressCheckIn, mockProfile);

    expect(lowAnalysis.burnoutRisk).toBeLessThan(40);
    expect(highAnalysis.burnoutRisk).toBeGreaterThan(70);
  });

  it('selects the correct intervention plan style depending on burnout metrics', () => {
    // Should trigger Burnout plan if burnout risk >= 60
    const burnoutPlan = getInterventionForStudent(75, ['Physics'], 35);
    expect(burnoutPlan.type).toBe('burnout');

    // Should trigger Parent pressure plan if parent expectation triggers are active and risk is low
    const parentPlan = getInterventionForStudent(45, ['Parent Expectations'], 50);
    expect(parentPlan.type).toBe('parent-pressure');

    // Should trigger Exam panic / subject anxiety plan
    const subjectAnxietyPlan = getInterventionForStudent(45, ['Physics Textbook'], 30);
    expect(subjectAnxietyPlan.type).toBe('low-confidence');
  });

  it('dynamically updates Mental DNA profile resilience indices across daily logs', () => {
    const checkIn: DailyCheckIn = {
      id: 'test-4',
      date: '2026-06-13',
      mood: 'anxious',
      energyLevel: 4,
      stressLevel: 8,
      sleepHours: 5,
      studyHours: 12,
      journalEntry: "Hard Physics paper, failed mock test today. Feeling low.",
    };

    const analysis = localAnalyzeCheckIn(checkIn, mockProfile);
    const historyEntry = { checkIn, analysis, mentalDNASnapshot: {} as any };

    const updatedDNA = recalculateMentalDNA(mockProfile, [historyEntry]);

    // Resonance should decrease under pressure, and style should match
    expect(updatedDNA.burnoutSusceptibility).toBe('High');
    expect(updatedDNA.confidencePattern).toBe('Volatile / Vulnerable');
  });
});

describe('MindPilot Metrics calculations', () => {
  it('correctly calculates circadian sync score and tips', () => {
    const optimalResult = calculateCalibrationScore('high-focus', 'practice', 'medium-focus', 'active-reset');
    expect(optimalResult.score).toBe(100);
    expect(optimalResult.tips).toHaveLength(1);
    expect(optimalResult.tips[0]).toContain('Circadian Sync');

    const subOptimalResult = calculateCalibrationScore('active-reset', 'practice', 'medium-focus', 'high-focus');
    expect(subOptimalResult.score).toBeLessThan(70);
    expect(subOptimalResult.tips.some(t => t.includes('evening stimulates brainwaves'))).toBe(true);
    expect(subOptimalResult.tips.some(t => t.includes('Morning slot is peak focus'))).toBe(true);
  });

  it('correctly calculates study ROI retention and effective hours', () => {
    // 8.5 study hours, 8 sleep, low stress, deep review should yield high retention
    const healthyMetrics = calculateROIMetrics(8.5, 8.0, 2, 'deep');
    expect(healthyMetrics.retention).toBeGreaterThan(90);
    expect(healthyMetrics.effectiveHours).toBeCloseTo(8.33, 1);
    expect(healthyMetrics.wastedHours).toBeCloseTo(0.17, 1);

    // Cramming model: 14 study hours, 5 sleep, 9 stress, no review should yield low retention and high Marks Wasted
    const crammingMetrics = calculateROIMetrics(14.0, 5.0, 9, 'none');
    expect(crammingMetrics.retention).toBe(15); // floor of retention
    expect(crammingMetrics.effectiveHours).toBe(2.1);
    expect(crammingMetrics.weeklyMarksWasted).toBeGreaterThan(40);
  });
});
