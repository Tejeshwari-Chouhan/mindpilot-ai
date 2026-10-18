'use client';

import React from 'react';
import { Tv, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import StressReliefVideos from '@/components/dashboard/StressReliefVideos';
import { useStudentData } from '@/hooks/useStudentData';

export default function ZenStreamsPage() {
  const { addXP } = useStudentData();

  const handleAddXp = (amount: number) => {
    addXP(amount);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 max-w-4xl mx-auto py-4" role="main" aria-label="Zen Streams Page">
      {/* Header */}
      <div className="glass-panel bg-white/70 border border-slate-200/50 p-5 rounded-3xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-md">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-foreground flex items-center gap-2">
            <Tv size={24} className="text-primary animate-pulse" />
            Zen Streams
          </h1>
          <p className="text-xs text-text-muted mt-1 leading-relaxed">
            Relaxing lofi streams, nature visuals, and ambient soundscapes to clear your focus channel.
          </p>
        </div>
        <Link
          href="/"
          className="bg-primary hover:bg-primary/90 text-white font-bold text-xs px-4 py-2 rounded-xl transition-all focus:ring-2 focus:ring-primary outline-none shadow-md shadow-primary/10"
        >
          Return to Dashboard
        </Link>
      </div>

      <div className="w-full">
        <StressReliefVideos onAddXp={handleAddXp} />
      </div>
    </div>
  );
}
