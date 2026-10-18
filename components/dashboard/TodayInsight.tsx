'use client';

import React from 'react';
import { DailyLogEntry } from '@/lib/types';
import { Sparkles, ArrowRight, BookOpen } from 'lucide-react';
import Link from 'next/link';

interface TodayInsightProps {
  latestEntry: DailyLogEntry | undefined;
}

export default function TodayInsight({ latestEntry }: TodayInsightProps) {
  const defaultInsight = "Welcome to MindPilot AI! Complete your onboarding profile and submit your first daily journal check-in to receive personalized emotional and academic insights.";
  
  const getInsightText = () => {
    if (!latestEntry) return defaultInsight;
    
    const analysis = latestEntry.analysis;
    const triggers = analysis.stressTriggers;
    const concern = analysis.academicConcerns[0] || 'your schedule';
    
    if (analysis.burnoutRisk >= 60) {
      return `Critical Alert: You are exhibiting severe burnout signs. Your anxiety is heavily impacting sleep quality. We recommend stepping away from ${triggers[0] || 'textbooks'} and adopting our 3-day recovery plan.`;
    }
    
    if (analysis.confidence < 40) {
      return `Confidence Dip detected: Dread of ${concern} is triggering avoidance. Shift from reading theory to solving 5 easy Previous Year Questions (PYQs) today to restore micro-control.`;
    }
    
    return `Looking stable: Continue pacing your studies. Since ${triggers.join(', ') || 'exams'} are on your mind, focus on chunked 50-minute study blocks with light screen-free resets.`;
  };

  const insight = getInsightText();

  return (
    <div 
      className="glass-panel rounded-2xl p-6 bg-gradient-to-r from-primary/10 via-secondary/5 to-transparent border border-primary/20 flex flex-col justify-between h-full"
      aria-label="Today's AI Resiliency Insight banner"
    >
      <div>
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold text-primary flex items-center gap-1.5 uppercase tracking-widest">
            <Sparkles size={14} className="text-secondary animate-pulse" />
            Today's Comfort Tip
          </span>
          <span className="text-[10px] text-text-muted">Daily Cheer</span>
        </div>
        <p className="text-sm font-semibold text-foreground leading-relaxed">
          {insight}
        </p>
      </div>

      <div className="mt-4 pt-3 border-t border-card-border/30 flex items-center justify-between">
        <span className="text-xs text-text-muted flex items-center gap-1">
          <BookOpen size={12} />
          Non-medical recommendations
        </span>
        <Link 
          href="/companion" 
          className="text-xs text-primary font-bold hover:underline flex items-center gap-1 group focus:ring-2 focus:ring-primary rounded px-1"
          aria-label="Discuss this insight with the AI Companion"
        >
          Discuss with Co-Pilot
          <ArrowRight size={12} className="transform group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </div>
  );
}
