'use client';

import { useState, useEffect } from 'react';
import { StudentProfile, DailyLogEntry, MentalDNA, DailyCheckIn, StructuredGeminiAnalysis } from '../lib/types';
import { SEEDED_STUDENT_PROFILE, SEEDED_MENTAL_DNA, SEEDED_HISTORY } from '../lib/mockData';

export function useStudentData() {
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [mentalDNA, setMentalDNA] = useState<MentalDNA | null>(null);
  const [history, setHistory] = useState<DailyLogEntry[]>([]);
  const [completedActions, setCompletedActions] = useState<Record<string, boolean>>({});
  
  // Gamification & Rewards
  const [resilienceXP, setResilienceXP] = useState(150);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [justLeveledUp, setJustLeveledUp] = useState(false);
  const [loading, setLoading] = useState(true);

  // Initialize and seed storage
  useEffect(() => {
    const localProfile = localStorage.getItem('mindpilot-profile');
    const localDNA = localStorage.getItem('mindpilot-dna');
    const localHistory = localStorage.getItem('mindpilot-history');
    const localCompleted = localStorage.getItem('mindpilot-completed-actions');
    const localXP = localStorage.getItem('mindpilot-xp');

    if (!localProfile) {
      // Do NOT auto-seed mock data on first load so that user is forced to onboard first
      setProfile(null);
      setMentalDNA(null);
      setHistory([]);
      setResilienceXP(0);
      setLoading(false);
    } else {
      setProfile(JSON.parse(localProfile));
      if (localDNA) setMentalDNA(JSON.parse(localDNA));
      if (localHistory) setHistory(JSON.parse(localHistory));
      if (localXP) setResilienceXP(parseInt(localXP));
      setLoading(false);
    }

    if (localCompleted) {
      setCompletedActions(JSON.parse(localCompleted));
    }
    
    setLoading(false);
  }, []);

  const onboardStudent = (newProfile: StudentProfile, initialDNA: MentalDNA) => {
    // Calculate initial values for the baseline log entry based on diagnostic profile
    let initialBurnoutRisk = 30 + (newProfile.assessment.anxietyLevelSelfAssessment * 5);
    if (newProfile.assessment.primaryStressorSources.includes('Backlog Pressure')) initialBurnoutRisk += 10;
    if (newProfile.assessment.primaryStressorSources.includes('Parent Expectations')) initialBurnoutRisk += 15;
    if (newProfile.assessment.primaryStressorSources.includes('Mock Test Drops')) initialBurnoutRisk += 10;
    initialBurnoutRisk = Math.min(95, Math.max(10, initialBurnoutRisk));

    const initialConfidence = initialDNA.emotionalResilience; // align with resilience score

    let initialMood: 'excellent' | 'good' | 'neutral' | 'anxious' | 'exhausted' = 'neutral';
    if (newProfile.assessment.anxietyLevelSelfAssessment <= 3) initialMood = 'good';
    else if (newProfile.assessment.anxietyLevelSelfAssessment >= 7) {
      initialMood = initialBurnoutRisk > 70 ? 'exhausted' : 'anxious';
    }

    const baselineEntry = {
      checkIn: {
        id: 'onboarding-baseline',
        date: new Date().toISOString().split('T')[0],
        mood: initialMood,
        energyLevel: Math.round((10 - newProfile.assessment.anxietyLevelSelfAssessment + 4) / 2),
        stressLevel: newProfile.assessment.anxietyLevelSelfAssessment,
        sleepHours: newProfile.lifestyle.sleepHours,
        studyHours: newProfile.academic.studyHoursPerDay,
        journalEntry: `Completed my onboarding diagnostic profile. Preparing for ${newProfile.academic.examType}. Initial anxiety level is ${newProfile.assessment.anxietyLevelSelfAssessment}/10.`,
      },
      analysis: {
        emotion: initialMood === 'exhausted' ? 'Exhaustion' : initialMood === 'anxious' ? 'Anxiety' : 'Determined',
        confidence: initialConfidence,
        motivation: Math.round(initialDNA.emotionalResilience * 0.9),
        burnoutRisk: initialBurnoutRisk,
        stressTriggers: initialDNA.primaryStressors,
        academicConcerns: initialDNA.primaryStressors.filter((s: string) => s !== 'Parent Expectations'),
        sleepIssues: newProfile.lifestyle.sleepHours < 6.5,
        parentPressure: newProfile.assessment.supportSystemRating <= 5,
        interventionSuggestions: [
          `Focus on recovery style: ${initialDNA.recoveryStyle}.`,
          `Keep daily study hours consistent near ${newProfile.academic.studyHoursPerDay} hrs without sacrificing sleep.`,
          `Lean on the AI Companion (Mom & Best Friend mode) whenever backlog pressure spikes.`
        ],
        stressConstellationUpdates: {
          nodes: [
            { id: 'Exam Prep', size: 40 },
            ...initialDNA.primaryStressors.map((s, idx) => ({ id: s, size: 25 + (idx * 5) })),
            { id: 'Sleep', size: newProfile.lifestyle.sleepHours < 6.5 ? 35 : 20 }
          ],
          edges: initialDNA.primaryStressors.map(s => ({
            source: 'Exam Prep',
            target: s,
            weight: 0.7
          }))
        }
      },
      mentalDNASnapshot: initialDNA
    };

    localStorage.setItem('mindpilot-profile', JSON.stringify(newProfile));
    localStorage.setItem('mindpilot-dna', JSON.stringify(initialDNA));
    localStorage.setItem('mindpilot-history', JSON.stringify([baselineEntry]));
    localStorage.setItem('mindpilot-completed-actions', JSON.stringify({}));
    localStorage.setItem('mindpilot-xp', '50'); // Start with 50 XP

    setProfile(newProfile);
    setMentalDNA(initialDNA);
    setHistory([baselineEntry]);
    setCompletedActions({});
    setResilienceXP(50);
  };

  const addCheckIn = (
    checkIn: DailyCheckIn,
    analysis: StructuredGeminiAnalysis,
    updatedDNA: MentalDNA
  ) => {
    const newEntry: DailyLogEntry = {
      checkIn,
      analysis,
      mentalDNASnapshot: updatedDNA
    };

    const updatedHistory = [...history, newEntry];

    // Reward XP for completing Check-in (+50 XP)
    const newXP = resilienceXP + 50;
    const oldLevel = Math.floor(resilienceXP / 100) + 1;
    const newLevel = Math.floor(newXP / 100) + 1;

    if (newLevel > oldLevel) {
      setShowLevelUp(true);
      setJustLeveledUp(true);
    }

    localStorage.setItem('mindpilot-history', JSON.stringify(updatedHistory));
    localStorage.setItem('mindpilot-dna', JSON.stringify(updatedDNA));
    localStorage.setItem('mindpilot-xp', String(newXP));

    setHistory(updatedHistory);
    setMentalDNA(updatedDNA);
    setResilienceXP(newXP);
  };

  const toggleActionCompletion = (planType: string, actionKey: string) => {
    const key = `${planType}-${actionKey}`;
    const wasCompleted = completedActions[key];
    const updated = {
      ...completedActions,
      [key]: !wasCompleted
    };
    
    // Reward XP for completing an action plan step (+30 XP if checking, -30 if unchecking)
    const xpDiff = wasCompleted ? -30 : 30;
    const newXP = Math.max(0, resilienceXP + xpDiff);
    const oldLevel = Math.floor(resilienceXP / 100) + 1;
    const newLevel = Math.floor(newXP / 100) + 1;

    if (newLevel > oldLevel && xpDiff > 0) {
      setShowLevelUp(true);
      setJustLeveledUp(true);
    }

    localStorage.setItem('mindpilot-completed-actions', JSON.stringify(updated));
    localStorage.setItem('mindpilot-xp', String(newXP));
    
    setCompletedActions(updated);
    setResilienceXP(newXP);
  };

  const resetToDemoMode = () => {
    localStorage.setItem('mindpilot-profile', JSON.stringify(SEEDED_STUDENT_PROFILE));
    localStorage.setItem('mindpilot-dna', JSON.stringify(SEEDED_MENTAL_DNA));
    localStorage.setItem('mindpilot-history', JSON.stringify(SEEDED_HISTORY));
    localStorage.setItem('mindpilot-completed-actions', JSON.stringify({}));
    localStorage.setItem('mindpilot-xp', '280'); // Demo student is close to next level

    setProfile(SEEDED_STUDENT_PROFILE);
    setMentalDNA(SEEDED_MENTAL_DNA);
    setHistory(SEEDED_HISTORY);
    setCompletedActions({});
    setResilienceXP(280);
    setShowLevelUp(false);
    setJustLeveledUp(false);
  };

  const addXP = (amount: number) => {
    const newXP = resilienceXP + amount;
    const oldLevel = Math.floor(resilienceXP / 100) + 1;
    const newLevel = Math.floor(newXP / 100) + 1;

    if (newLevel > oldLevel) {
      setShowLevelUp(true);
      setJustLeveledUp(true);
    }

    localStorage.setItem('mindpilot-xp', String(newXP));
    setResilienceXP(newXP);
  };

  const dismissLevelUp = () => {
    setShowLevelUp(false);
    setJustLeveledUp(false);
  };

  const resilienceLevel = Math.floor(resilienceXP / 100) + 1;
  const levelProgress = resilienceXP % 100;

  const getActiveStreak = () => {
    if (history.length === 0) return 0;
    const uniqueDates = history
      .map((entry) => entry.checkIn.date)
      .filter((dateStr, idx, self) => self.indexOf(dateStr) === idx)
      .sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

    if (uniqueDates.length === 0) return 0;

    let currentStreak = 1;
    for (let i = uniqueDates.length - 1; i > 0; i--) {
      const current = new Date(uniqueDates[i]);
      const prev = new Date(uniqueDates[i - 1]);
      current.setHours(0, 0, 0, 0);
      prev.setHours(0, 0, 0, 0);
      
      const diffTime = current.getTime() - prev.getTime();
      const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        currentStreak++;
      } else if (diffDays > 1) {
        break;
      }
    }

    const lastCheckInDate = new Date(uniqueDates[uniqueDates.length - 1]);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    lastCheckInDate.setHours(0, 0, 0, 0);
    
    const timeDiff = today.getTime() - lastCheckInDate.getTime();
    const daysDiff = Math.round(timeDiff / (1000 * 60 * 60 * 24));

    if (daysDiff > 1) {
      return 0;
    }
    return currentStreak;
  };

  const streak = getActiveStreak();

  return {
    profile,
    mentalDNA,
    history,
    completedActions,
    resilienceXP,
    resilienceLevel,
    levelProgress,
    showLevelUp,
    justLeveledUp,
    loading,
    streak,
    onboardStudent,
    addCheckIn,
    toggleActionCompletion,
    resetToDemoMode,
    dismissLevelUp,
    addXP
  };
}

