'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStudentData } from '@/hooks/useStudentData';
import { StudentProfile, MentalDNA } from '@/lib/types';
import { BrainCircuit, HeartHandshake, ArrowRight, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function OnboardingPage() {
  const router = useRouter();
  const { onboardStudent } = useStudentData();
  
  const [step, setStep] = useState(1);
  const handleNext = () => setStep((s) => Math.min(3, s + 1));
  const handlePrev = () => setStep((s) => Math.max(1, s - 1));
  
  // Step 1 variables
  const [studentName, setStudentName] = useState('');
  const [examType, setExamType] = useState<'JEE' | 'NEET' | 'UPSC' | 'CAT' | 'GATE' | 'CUET'>('JEE');

  // Step 2 variables
  const [heaviestLoad, setHeaviestLoad] = useState<string>('Backlog Buildup 📚');
  const [sleepHours, setSleepHours] = useState<number>(6);

  // Step 3 variables
  const [ventingBuddy, setVentingBuddy] = useState<string>('My Mother 🧸');
  const [copilotVibe, setCopilotVibe] = useState<'friend' | 'coach' | 'listener'>('friend');

  const examOptions = ['JEE', 'NEET', 'UPSC', 'CAT', 'GATE', 'CUET'];

  const loads = [
    { label: 'Backlog Buildup 📚', desc: 'Overwhelmed by skipped chapters.' },
    { label: 'Mock Test drops 📉', desc: 'Fear of failing mock papers.' },
    { label: 'Parent expectations 👨‍👩‍👦', desc: 'Performance pressure & peer comparisons.' },
    { label: 'Exam-day panic ⏳', desc: 'Freezing or excessive test anxiety.' }
  ];

  const buddies = [
    { label: 'My Mother 🧸', desc: 'Warm support and love.' },
    { label: 'My Best Friend 🌸', desc: 'Share struggles and laugh.' },
    { label: 'My Pet or Diary 🐶', desc: 'A quiet, non-judgmental space.' },
    { label: 'No one right now 🍂', desc: 'Keeping it to myself.' }
  ];

  const vibes = [
    { id: 'friend' as const, title: 'Warm Friend 🧸', desc: 'Comfort & notes.' },
    { id: 'coach' as const, title: 'Wise Coach 🏃', desc: 'Goals & study plans.' },
    { id: 'listener' as const, title: 'Empathetic Listener 🌸', desc: 'Breathing & venting.' }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const preferredIntervention: 'Action Plan' | 'Mindfulness & Grounding' | 'Empathetic Listening' | 'Re-framing' = 
      copilotVibe === 'coach' ? 'Action Plan' :
      copilotVibe === 'listener' ? 'Mindfulness & Grounding' : 'Empathetic Listening';

    let emotionalResilience = 70;
    if (heaviestLoad.includes('Parent')) emotionalResilience -= 10;
    if (sleepHours < 6) emotionalResilience -= 10;
    if (ventingBuddy.includes('No one')) emotionalResilience -= 15;

    const initialDNA: MentalDNA = {
      primaryStressors: [heaviestLoad.replace(/[\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD00-\uDFFF]/g, '').trim()],
      confidencePattern: heaviestLoad.includes('Mock') ? 'Mock Test Dependent' : 'Consistency-Driven',
      recoveryStyle: copilotVibe === 'listener' ? 'Reflection-Needed' : 'Action-Oriented',
      motivationType: heaviestLoad.includes('Parent') ? 'Extrinsic Pressure' : 'Intrinsic Mastery',
      burnoutSusceptibility: sleepHours < 6 ? 'High' : 'Medium',
      emotionalResilience: Math.max(35, emotionalResilience),
      preferredInterventionStyle: preferredIntervention
    };

    const profile: StudentProfile = {
      name: studentName.trim() || 'Pilot',
      academic: {
        examType,
        targetScore: examType === 'JEE' ? '280' : examType === 'NEET' ? '680' : '120',
        examDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        studyHoursPerDay: 8
      },
      lifestyle: {
        sleepHours,
        exerciseHabits: 'Occasional',
        coachingStatus: ventingBuddy.includes('No one') ? 'Self Study' : 'Online Coaching'
      },
      assessment: {
        primaryStressorSources: initialDNA.primaryStressors,
        anxietyLevelSelfAssessment: sleepHours < 6 ? 8 : 5,
        supportSystemRating: ventingBuddy.includes('No one') ? 3 : 8
      },
      createdAt: new Date().toISOString()
    };

    onboardStudent(profile, initialDNA);
    localStorage.setItem('mindpilot-show-tour', 'true');
    router.push('/');
  };

  return (
    <div 
      className="flex-1 flex items-center justify-center max-w-xl mx-auto py-8 animate-in fade-in duration-300 relative z-10"
      role="main"
      aria-label="Student Counselor Onboarding Page"
    >
      <div className="glass-panel rounded-3xl p-6 md:p-8 w-full flex flex-col justify-between relative shadow-2xl border border-card-border/80 min-h-[550px]">
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-white/5 rounded-t-3xl overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-300"
            style={{ width: `${(step / 3) * 100}%` }}
            role="progressbar"
            aria-valuenow={step}
            aria-valuemin={1}
            aria-valuemax={3}
            aria-label={`Step ${step} of 3`}
          />
        </div>

        <div className="pt-4 flex-1 flex flex-col justify-between">
          <div className="flex items-center gap-2 mb-6 justify-center">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-white">
              <BrainCircuit size={18} />
            </div>
            <span className="text-xs uppercase font-extrabold text-primary tracking-widest">
              MindPilot / Companion Onboarding
            </span>
          </div>

          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step-1"
                initial={{ opacity: 0, x: 15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -15 }}
                className="space-y-6"
              >
                <div className="text-center space-y-1">
                  <h2 className="text-xl font-black text-foreground">Welcome to your safe space 🌿</h2>
                  <p className="text-xs text-text-muted">I'm your student counselor. Let's get to know each other first.</p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1.5 text-left">
                    <label htmlFor="student-name-input" className="text-[11px] font-bold text-text-muted uppercase tracking-wider block">
                      What should I call you?
                    </label>
                    <input
                      id="student-name-input"
                      type="text"
                      required
                      placeholder="Enter your name or nickname..."
                      value={studentName}
                      onChange={(e) => setStudentName(e.target.value)}
                      className="w-full bg-black/30 border border-card-border text-xs rounded-xl px-4 py-3 focus:ring-1 focus:ring-primary focus:outline-none placeholder-text-muted/40 text-foreground"
                      aria-label="Student name input"
                    />
                  </div>

                  <div className="space-y-1.5 text-left">
                    <label className="text-[11px] font-bold text-text-muted uppercase tracking-wider block">
                      Which exam are you preparing for?
                    </label>
                    <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label="Select exam type">
                      {examOptions.map((opt) => (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => setExamType(opt as any)}
                          className={`py-3 px-3 rounded-xl border text-sm font-semibold transition-all focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer ${
                            examType === opt 
                              ? 'bg-primary/20 border-primary text-foreground' 
                              : 'bg-white/5 border-card-border text-text-muted hover:bg-white/10'
                          }`}
                          role="radio"
                          aria-checked={examType === opt}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {studentName.trim() && (
                  <p className="text-xs text-center text-success bg-success/10 border border-success/15 py-2 px-3 rounded-xl animate-pulse">
                    🌿 "Welcome {studentName}! You're taking a brave first step toward balanced study."
                  </p>
                )}
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step-2"
                initial={{ opacity: 0, x: 15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -15 }}
                className="space-y-5"
              >
                <div className="text-center space-y-1">
                  <h2 className="text-xl font-black text-foreground">How's your load feeling? 🎒</h2>
                  <p className="text-xs text-text-muted">A counselor check on the heaviest weight on your chest.</p>
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-text-muted uppercase tracking-wider block">
                    What feels heaviest right now?
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2" role="radiogroup">
                    {loads.map((opt) => (
                      <button
                        key={opt.label}
                        type="button"
                        onClick={() => setHeaviestLoad(opt.label)}
                        className={`text-left p-3.5 rounded-xl border text-xs leading-relaxed transition-all focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer ${
                          heaviestLoad === opt.label
                            ? 'bg-secondary/15 border-secondary text-foreground font-semibold'
                            : 'bg-white/5 border-card-border text-text-muted hover:bg-white/10'
                        }`}
                        role="radio"
                        aria-checked={heaviestLoad === opt.label}
                      >
                        <span className="block font-bold text-[13px] mb-0.5">{opt.label}</span>
                        <span className="opacity-80 block text-[10px]">{opt.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-white/5 border border-card-border p-4 rounded-2xl">
                  <div className="flex justify-between items-center text-xs font-semibold mb-3">
                    <span className="text-text-muted uppercase tracking-wider font-bold">Average daily sleep?</span>
                    <span className={`font-black flex items-center gap-1 ${sleepHours >= 7 ? 'text-success' : sleepHours >= 5.5 ? 'text-warning' : 'text-error'}`}>
                      {sleepHours} Hours {sleepHours >= 7 ? '🛌 Great rest' : sleepHours >= 5.5 ? '🌤️ Getting thin' : '🌧️ Overworking'}
                    </span>
                  </div>
                  
                  <input
                    type="range"
                    min="4"
                    max="9"
                    step="0.5"
                    value={sleepHours}
                    onChange={(e) => setSleepHours(parseFloat(e.target.value))}
                    className="w-full accent-primary bg-slate-800 h-1.5 rounded cursor-pointer"
                    aria-label="Sleep hours slider"
                  />
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step-3"
                initial={{ opacity: 0, x: 15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -15 }}
                className="space-y-5"
              >
                <div className="text-center space-y-1">
                  <h2 className="text-xl font-black text-foreground">Who's by your side? 🧸</h2>
                  <p className="text-xs text-text-muted">Setting up your dynamic AI Co-Pilot vibe style.</p>
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-text-muted uppercase tracking-wider block">
                    My go-to venting buddy:
                  </label>
                  <div className="grid grid-cols-2 gap-2" role="radiogroup">
                    {buddies.map((opt) => (
                      <button
                        key={opt.label}
                        type="button"
                        onClick={() => setVentingBuddy(opt.label)}
                        className={`text-left p-3.5 rounded-xl border text-xs leading-relaxed transition-all focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer ${
                          ventingBuddy === opt.label
                            ? 'bg-secondary/15 border-secondary text-foreground font-semibold'
                            : 'bg-white/5 border-card-border text-text-muted hover:bg-white/10'
                        }`}
                        role="radio"
                        aria-checked={ventingBuddy === opt.label}
                      >
                        <span className="block font-bold text-[12px] mb-0.5">{opt.label}</span>
                        <span className="opacity-70 text-[10px] block">{opt.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-text-muted uppercase tracking-wider block">
                    Choose your AI tone style:
                  </label>
                  <div className="grid grid-cols-3 gap-2" role="radiogroup">
                    {vibes.map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setCopilotVibe(opt.id)}
                        className={`text-center p-3 rounded-xl border text-xs leading-relaxed transition-all focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer ${
                          copilotVibe === opt.id
                            ? 'bg-primary/20 border-primary text-foreground font-bold'
                            : 'bg-white/5 border-card-border text-text-muted hover:bg-white/10'
                        }`}
                        role="radio"
                        aria-checked={copilotVibe === opt.id}
                      >
                        <span className="block text-[11px] mb-0.5">{opt.title}</span>
                        <span className="opacity-70 text-[9px] block leading-normal">{opt.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex items-center justify-between border-t border-card-border pt-4 mt-6">
          {step > 1 ? (
            <button
              onClick={handlePrev}
              className="flex items-center gap-1 bg-white/5 hover:bg-white/10 text-foreground font-bold px-4 py-2 rounded-xl border border-card-border transition-all focus:ring-2 focus:ring-primary outline-none cursor-pointer"
              aria-label="Back to previous page"
            >
              <ArrowLeft size={16} />
              Back
            </button>
          ) : (
            <span />
          )}

          {step < 3 ? (
            <button
              onClick={handleNext}
              className={`flex items-center gap-1 bg-primary text-white font-bold px-4 py-2 rounded-xl hover:opacity-90 transition-all focus:ring-2 focus:ring-primary outline-none cursor-pointer ${
                step === 1 && !studentName.trim() ? 'opacity-50 pointer-events-none' : ''
              }`}
              aria-label="Proceed to next page"
            >
              Continue
              <ArrowRight size={16} />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              className="flex items-center gap-1.5 bg-gradient-to-r from-primary to-secondary text-white font-bold px-5 py-2.5 rounded-xl hover:opacity-90 transition-all focus:ring-2 focus:ring-primary outline-none cursor-pointer"
              aria-label="Complete counselor profile and launch dashboard"
            >
              <HeartHandshake size={16} />
              Unlock Dynamic Companion
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
