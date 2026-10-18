'use client';

import React, { useEffect } from 'react';
import { Camera, ArrowLeft, Brain } from 'lucide-react';
import Link from 'next/link';
import FunnyCameraPickEat from '@/components/dashboard/FunnyCameraPickEat';
import { useStudentData } from '@/hooks/useStudentData';
import { usePomodoro } from '@/hooks/usePomodoro';

export default function ZenFaceCamPage() {
  const { addXP } = useStudentData();
  const { pomodoroMode, timeLeft, playCredits, deductPlayCredit, startStudySession, useDailyWarmup, dailyWarmupUsed } = usePomodoro();

  // Deduct play credits when playing in idle mode
  useEffect(() => {
    if (pomodoroMode === 'study' || (pomodoroMode !== 'break' && playCredits <= 0)) {
      return;
    }
    if (pomodoroMode === 'break') return;

    const interval = setInterval(() => {
      deductPlayCredit(1);
    }, 1000);

    return () => clearInterval(interval);
  }, [pomodoroMode, playCredits]);

  const handleAddXp = (amount: number) => {
    addXP(amount);
  };

  const isLocked = pomodoroMode === 'study' || (pomodoroMode !== 'break' && playCredits <= 0);

  return (
    <div className="space-y-6 animate-in fade-in duration-300 max-w-4xl mx-auto py-4" role="main" aria-label="Zen Face Cam Page">
      {/* Header */}
      <div className="glass-panel bg-white/40 border border-card-border p-5 rounded-3xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-foreground flex items-center gap-2">
            <Camera size={24} className="text-primary animate-pulse" />
            Zen Face Cam
          </h1>
          <p className="text-xs text-text-muted mt-1 leading-relaxed">
            Turn on your webcam, apply funny filters, and interact with stress-buster fruits to refresh your mood!
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {playCredits > 0 && pomodoroMode !== 'study' && (
            <div className="bg-secondary/10 border border-secondary/20 rounded-xl px-4 py-2 flex items-center gap-1.5 text-xs text-secondary font-bold select-none">
              <span className="w-2 h-2 bg-secondary rounded-full animate-ping" />
              Play Time Left: {Math.floor(playCredits / 60)}m {playCredits % 60}s
            </div>
          )}
          <Link
            href="/"
            className="bg-primary hover:bg-primary/90 text-white font-bold text-xs px-4 py-2 rounded-xl transition-all focus:ring-2 focus:ring-primary outline-none shadow-md shadow-primary/10"
          >
            Return to Dashboard
          </Link>
        </div>
      </div>

      <div className="relative">
        {isLocked && (
          <div className="absolute inset-0 z-30 backdrop-blur-md bg-slate-950/80 rounded-3xl border border-card-border/50 flex flex-col items-center justify-center p-8 text-center min-h-[400px]">
            <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-white shadow-xl shadow-primary/20 mb-4 animate-pulse">
              <Brain size={28} />
            </div>
            
            {pomodoroMode === 'study' ? (
              <div className="space-y-3 max-w-sm">
                <h2 className="text-lg font-black text-white">Focus Session Active 🔒</h2>
                <p className="text-xs text-slate-200 leading-relaxed font-medium">
                  You are currently in study focus mode. Face cam filter games will unlock when your break starts!
                </p>
                <div className="inline-block bg-primary/15 border border-primary/30 rounded-xl px-4 py-2 mt-2">
                  <span className="text-xs text-primary font-mono font-bold tracking-wider">
                    Break starts in: {Math.floor(timeLeft / 60)}m {timeLeft % 60}s
                  </span>
                </div>
              </div>
            ) : (
              <div className="space-y-3 max-w-sm">
                <h2 className="text-lg font-black text-white">Play Time Limits Active ⏳</h2>
                <p className="text-xs text-slate-200 leading-relaxed font-medium">
                  Face cam interactions are limited to prevent exam distractions. Claim your Daily 5m Warmup, or start a Pomodoro Study Focus Session to earn break play time!
                </p>
                
                <div className="flex flex-col sm:flex-row gap-2 mt-4 justify-center">
                  {!dailyWarmupUsed && (
                    <button
                      onClick={useDailyWarmup}
                      className="bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs px-4 py-2.5 rounded-xl cursor-pointer transition-all shadow-md shadow-amber-500/10"
                    >
                      Claim 5m Warmup 🎁
                    </button>
                  )}
                  <button
                    onClick={() => startStudySession(30, 10)}
                    className="bg-primary hover:bg-primary/95 text-white font-bold text-xs px-4 py-2.5 rounded-xl cursor-pointer transition-all shadow-md shadow-primary/10"
                  >
                    Start 30m Focus Session 📚
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="w-full">
          <FunnyCameraPickEat onAddXp={handleAddXp} />
        </div>
      </div>
    </div>
  );
}
