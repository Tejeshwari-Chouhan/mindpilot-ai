'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStudentData } from '@/hooks/useStudentData';
import FitnessScore from '@/components/dashboard/FitnessScore';
import TodayInsight from '@/components/dashboard/TodayInsight';
import BurnoutRadar from '@/components/dashboard/BurnoutRadar';
import MentalDNA from '@/components/dashboard/MentalDNA';
import ActionPlan from '@/components/dashboard/ActionPlan';
import DailyCheckInForm from '@/components/dashboard/DailyCheckInForm';
import MomBestFriend from '@/components/dashboard/MomBestFriend';
import CrisisHelplineBanner from '@/components/shared/CrisisHelplineBanner';
import { detectCrisisLanguage } from '@/lib/safety';
import { getInterventionForStudent } from '@/lib/mockData';
import { Activity, Sparkles, MessageSquare, Compass, ShieldAlert, Award, RefreshCw, AlertCircle, Gamepad2, Smile, Brain, Trophy, Cloud } from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

export default function DashboardPage() {
  const {
    profile,
    mentalDNA,
    history,
    completedActions,
    resilienceXP,
    resilienceLevel,
    levelProgress,
    showLevelUp,
    dismissLevelUp,
    loading,
    addCheckIn,
    toggleActionCompletion,
    resetToDemoMode,
  } = useStudentData();

  const [dismissCrisis, setDismissCrisis] = useState(false);
 
  const router = useRouter();
 
  useEffect(() => {
    if (!loading && (!profile || !mentalDNA)) {
      router.push('/onboarding');
    }
  }, [loading, profile, mentalDNA, router]);

  if (loading || !profile || !mentalDNA) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[70vh]">
        <div className="flex flex-col items-center gap-2">
          <RefreshCw className="animate-spin text-primary" size={32} />
          <p className="text-sm text-text-muted">Loading MindPilot DNA...</p>
        </div>
      </div>
    );
  }

  const latestEntry = history[history.length - 1];
  const burnoutRisk = latestEntry?.analysis.burnoutRisk ?? 68;

  const intervention = getInterventionForStudent(
    burnoutRisk,
    latestEntry?.analysis.stressTriggers ?? ['Physics', 'Parent Expectations'],
    latestEntry?.analysis.confidence ?? 35
  );

  // Calculate days remaining to exam date
  const examDate = new Date(profile.academic.examDate);
  const diffTime = examDate.getTime() - Date.now();
  const diffDays = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

  // Core configuration based on burnout risk (translated to supportive mind weather)
  const getCoreConfig = (risk: number) => {
    if (risk >= 65) {
      return {
        color: 'from-error/60 to-secondary/60 shadow-[0_0_35px_rgba(239,68,68,0.3)] border-error/20',
        glowColor: 'bg-error animate-pulse',
        status: 'Needs Care 🌸',
        statusColor: 'text-error bg-error/10 border-error/20',
        message: `Hey Dev, it looks like things are feeling a bit heavy today. That is completely okay. Let's take a deep breath. No rush, no pressure—your well-being is the only thing that matters right now.`
      };
    }
    if (risk >= 40) {
      return {
        color: 'from-warning/60 to-primary/60 shadow-[0_0_35px_rgba(245,158,11,0.2)] border-warning/20',
        glowColor: 'bg-warning',
        status: 'Cloudy Pacing 🌤️',
        statusColor: 'text-warning bg-warning/10 border-warning/20',
        message: `Hey Dev, keeping your routine balanced is key. Take regular small breaks today, drink a cup of tea, and remember to be kind to your mind.`
      };
    }
    return {
      color: 'from-primary/60 to-accent/60 shadow-[0_0_35px_rgba(99,102,241,0.2)] border-primary/20',
      glowColor: 'bg-success',
      status: 'Bright Flow ☀️',
      statusColor: 'text-success bg-success/10 border-success/20',
      message: `Hey Dev, your mind feels bright and steady! Enjoy your study flow today, take comfortable breaks, and write down your small victories.`
    };
  };

  const core = getCoreConfig(burnoutRisk);

  const isCrisisDetected = latestEntry ? detectCrisisLanguage(latestEntry.checkIn.journalEntry || '' + (latestEntry.checkIn.voiceNoteTranscription || '')) : false;

  return (
    <div className="space-y-6 animate-in fade-in duration-300" role="main">
      {isCrisisDetected && !dismissCrisis && (
        <CrisisHelplineBanner onDismiss={() => setDismissCrisis(true)} />
      )}
      {/* Spectacular Centerpiece: Resilience Core Orb & Dialogue */}
      <div className="glass-panel rounded-3xl p-6 md:p-8 border border-card-border/80 flex flex-col lg:flex-row items-center gap-6 bg-gradient-to-r from-white/[0.02] via-transparent to-transparent">
        
        {/* Core Glowing Orb */}
        <div className="relative flex items-center justify-center shrink-0 w-36 h-36">
          {/* Outer Ripple Rings */}
          <div className="absolute inset-0 rounded-full border border-white/5 animate-ping opacity-20 [animation-duration:3s]" />
          <div className="absolute inset-2 rounded-full border border-white/5 animate-ping opacity-30 [animation-duration:2s]" />
          
          {/* Main Breathing Orb */}
          <div className={`w-24 h-24 rounded-full bg-gradient-to-tr ${core.color} flex items-center justify-center border animate-breathe shrink-0`}>
            <Brain size={32} className="text-white drop-shadow-md" />
          </div>

          {/* Status Badge floating */}
          <div className={`absolute bottom-0 text-[9px] font-black uppercase tracking-wider border px-2 py-0.5 rounded-full backdrop-blur-md ${core.statusColor}`}>
            {core.status}
          </div>
        </div>

        {/* Empathy dialogue bubble */}
        <div className="flex-1 space-y-4 text-center lg:text-left">
          <div>
            <h1 className="text-xl md:text-2xl font-black text-foreground flex items-center justify-center lg:justify-start gap-2">
              Welcome back, {profile.name}! ✨
              <span className="text-xs text-text-muted font-bold">
                {profile.academic.examType} Prep
              </span>
            </h1>
            <p className="text-xs text-text-muted mt-0.5">
              Target Score: <strong className="text-foreground">{profile.academic.targetScore}</strong> • {diffDays} days remaining to exam day.
            </p>
            {/* Gamification Rank & XP Progress Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 mt-3 bg-white/5 p-3 rounded-xl border border-card-border/80">
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs font-black uppercase text-secondary tracking-wider flex items-center gap-1">
                  <Trophy size={12} className="text-warning animate-pulse" />
                  Self-Care Stage {resilienceLevel}
                </span>
                <span className="text-[10px] text-text-muted flex items-center">({resilienceXP} XP total)</span>
              </div>
              <div className="flex-1 bg-white/10 h-2 rounded-full overflow-hidden relative">
                <div 
                  className="bg-gradient-to-r from-secondary to-primary h-full rounded-full transition-all duration-500" 
                  style={{ width: `${levelProgress}%` }}
                />
              </div>
              <span className="text-[10px] font-bold text-text-muted shrink-0">
                {levelProgress}/100 XP to Stage {resilienceLevel + 1}
              </span>
            </div>
          </div>

          <div className="bg-white/5 border border-card-border p-4 rounded-2xl relative">
            {/* Dialogue tail */}
            <div className="hidden lg:block absolute -left-2 top-6 w-4 h-4 bg-slate-900 border-l border-b border-card-border/50 transform rotate-45" />
            <p className="text-sm font-semibold text-foreground leading-relaxed">
              "{core.message}"
            </p>
          </div>

          {/* Action layout */}
          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3">
            <div className="shrink-0">
              <DailyCheckInForm 
                profile={profile} 
                history={history} 
                onCheckInCompleted={addCheckIn} 
              />
            </div>
            
            <Link
              href="/relax"
              className="flex items-center gap-1.5 bg-secondary/10 border border-secondary/20 hover:bg-secondary/20 text-secondary px-4 py-2 rounded-xl text-xs font-bold transition-all focus:ring-2 focus:ring-secondary outline-none cursor-pointer"
              title="Open relaxation mini-games room to decompress"
            >
              <Gamepad2 size={14} />
              Play a Calming Game 🎮
            </Link>

            <button
              onClick={resetToDemoMode}
              className="flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-4 py-2 rounded-xl border border-red-700 transition-all focus:ring-2 focus:ring-red-500 outline-none cursor-pointer"
              title="Reset storage to default pre-seeded JEE Student A parameters for testing"
              aria-label="Seed Demo Data"
            >
              <RefreshCw size={14} />
              Reset Demo Student
            </button>
          </div>
        </div>
      </div>

      {/* Grid 1: Fitness Score, Today's AI Insight & Mom/Friend Comfort */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <FitnessScore history={history} />
        </div>
        <div className="lg:col-span-1">
          <TodayInsight latestEntry={latestEntry} />
        </div>
        <div className="lg:col-span-1">
          <MomBestFriend latestEntry={latestEntry} />
        </div>
      </div>

      {/* Grid 2: Burnout Radar, Mental DNA, & Action Plan */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <BurnoutRadar history={history} />
        </div>

        <div className="lg:col-span-1">
          <MentalDNA dna={mentalDNA} />
        </div>

        <div className="lg:col-span-1">
          <ActionPlan 
            plan={intervention}
            completedActions={completedActions}
            onToggleAction={toggleActionCompletion}
          />
        </div>
      </div>

      {/* Quick Footer Links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
        <Link 
          href="/cloud-intelligence" 
          className="glass-panel p-4 rounded-xl flex items-center gap-3 hover:bg-white/5 transition-all text-xs font-semibold focus:ring-2 focus:ring-primary outline-none border border-primary/30"
        >
          <Cloud size={20} className="text-primary animate-pulse" />
          <div>
            <span className="block text-foreground font-bold">Cloud Intelligence</span>
            <span className="text-[10px] text-text-muted font-normal">Vertex AI, Earth Engine, BigQuery & Vision</span>
          </div>
        </Link>

        <Link 
          href="/calm-room" 
          className="glass-panel p-4 rounded-xl flex items-center gap-3 hover:bg-white/5 transition-all text-xs font-semibold focus:ring-2 focus:ring-primary outline-none"
        >
          <ShieldAlert size={20} className="text-error" />
          <div>
            <span className="block text-foreground">SOS Calm Room</span>
            <span className="text-[10px] text-text-muted font-normal">Panic attacks, breathing guide & mindfulness</span>
          </div>
        </Link>

        <Link 
          href="/onboarding" 
          className="glass-panel p-4 rounded-xl flex items-center gap-3 hover:bg-white/5 transition-all text-xs font-semibold focus:ring-2 focus:ring-primary outline-none"
        >
          <Activity size={20} className="text-success" />
          <div>
            <span className="block text-foreground">Update Profile</span>
            <span className="text-[10px] text-text-muted font-normal">Adjust exam date, targets & habits</span>
          </div>
        </Link>
      </div>

      {/* Level Up Celebration Modal */}
      <AnimatePresence>
        {showLevelUp && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
            role="dialog"
            aria-modal="true"
            aria-labelledby="levelup-title"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-slate-900 border-2 border-secondary/40 rounded-3xl p-6 md:p-8 max-w-md w-full text-center relative overflow-hidden shadow-[0_0_50px_rgba(168,85,247,0.3)]"
            >
              {/* Confetti particles */}
              <div className="absolute inset-0 pointer-events-none opacity-20">
                <div className="absolute top-10 left-10 w-2 h-2 bg-primary rounded-full animate-ping" />
                <div className="absolute top-20 right-10 w-3.5 h-3.5 bg-secondary rounded-full animate-pulse" />
                <div className="absolute bottom-10 left-20 w-3 h-3 bg-accent rounded-full animate-bounce" />
                <div className="absolute bottom-20 right-20 w-2.5 h-2.5 bg-success rounded-full animate-pulse" />
              </div>

              {/* Glowing Level Ring */}
              <div className="relative w-28 h-28 mx-auto mb-6 flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border border-secondary/30 animate-spin [animation-duration:10s]" />
                <div className="absolute inset-2 rounded-full border border-dashed border-primary/40 animate-spin [animation-duration:6s] [animation-direction:reverse]" />
                <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-secondary to-primary flex flex-col items-center justify-center text-white font-black shadow-lg shadow-secondary/25">
                  <span className="text-[10px] uppercase tracking-widest font-black opacity-85">Level</span>
                  <span className="text-3xl leading-none">{resilienceLevel}</span>
                </div>
              </div>

              <h2 id="levelup-title" className="text-2xl font-black text-foreground flex items-center justify-center gap-2">
                <Trophy className="text-secondary animate-bounce" size={24} />
                Pilot Rank Upgraded!
              </h2>
              
              <p className="text-xs text-text-muted mt-2 max-w-sm mx-auto leading-relaxed">
                Awesome work! Your consistency in tracking your stress and completing your mental resilience actions has powered up your focus core.
              </p>

              {/* Reward Badge details */}
              <div className="bg-white/5 border border-card-border rounded-2xl p-4 my-6 text-xs text-left space-y-2.5">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-secondary/15 flex items-center justify-center text-secondary font-black">⭐</span>
                  <div>
                    <span className="font-bold text-foreground block">Resilience XP Level: {resilienceLevel}</span>
                    <span className="text-text-muted text-[10px] block">Rank: Master Focus Pilot</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-success/15 flex items-center justify-center text-success font-black">🥣</span>
                  <div>
                    <span className="font-bold text-foreground block">Motherly Reward Unlocked</span>
                    <span className="text-text-muted text-[10px] block">Mom says: "I've cooked your favorite kheer. Take a break!"</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <button
                  onClick={dismissLevelUp}
                  className="w-full bg-gradient-to-r from-secondary to-primary hover:opacity-95 text-white font-black py-3 rounded-xl shadow-md transition-all focus:ring-2 focus:ring-secondary outline-none cursor-pointer text-xs"
                >
                  Receive Mom's Hug & Continue 🤗
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
