'use client';

import React, { useState } from 'react';
import { MentalDNA as MentalDNAType } from '@/lib/types';
import { Brain, Heart, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

interface MentalDNAProps {
  dna: MentalDNAType;
}

export default function MentalDNA({ dna }: MentalDNAProps) {
  const getSusceptibilityColor = (level: string) => {
    switch (level) {
      case 'High': return 'text-error bg-error/10 border-error/20';
      case 'Medium': return 'text-warning bg-warning/10 border-warning/20';
      default: return 'text-success bg-success/10 border-success/20';
    }
  };

  const getFriendlyTensionLevel = (level: string) => {
    switch (level) {
      case 'High': return 'High Tension';
      case 'Medium': return 'Moderate Load';
      default: return 'Light/Stable';
    }
  };

  // Combine triggers and strengths into bubble items for the Floating Mind Cloud
  const cloudItems = [
    ...dna.primaryStressors.map((s, idx) => ({ 
      text: s, 
      type: 'stress', 
      size: 12 + (s.length % 4),
      tip: `Tension Trigger: "${s}". Don't let it cloud your day. We can chunk this load together!`
    })),
    { 
      text: dna.confidencePattern, 
      type: 'strength', 
      size: 13,
      tip: `Secret Strength: "${dna.confidencePattern}". Your confidence builds when you follow this pattern. Trust it!` 
    },
    { 
      text: dna.recoveryStyle, 
      type: 'recovery', 
      size: 14,
      tip: `Recharge Style: "${dna.recoveryStyle}". Take rest blocks that match your inner recovery needs.` 
    },
    { 
      text: dna.motivationType, 
      type: 'motivation', 
      size: 13,
      tip: `Drive Spark: "${dna.motivationType}". Connect to your deep learning purpose, not just scores.` 
    },
  ];

  const [activeTip, setActiveTip] = useState<string>('Click a floating balloon to read counselor reflections! 🎈');

  const radius = 24;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (dna.emotionalResilience / 100) * circumference;

  return (
    <div 
      className="glass-panel rounded-3xl p-6 flex flex-col justify-between h-full bg-gradient-to-br from-white/[0.01] via-transparent to-transparent border border-card-border/80"
      aria-label="My Mind Shields & Safeguards"
    >
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-black flex items-center gap-2 text-foreground">
            <Brain size={20} className="text-primary animate-pulse" />
            My Mind Shields
          </h2>
          <span className="text-xs text-text-muted font-bold">Personal Profile</span>
        </div>

        {/* Visual Mind Cloud (Interactive Floating Balloons) */}
        <div className="mb-3 bg-white/40 border border-card-border/30 rounded-2xl p-4 relative overflow-hidden min-h-[165px] h-auto flex items-center justify-center">
          <div className="absolute inset-0 bg-radial-gradient from-transparent to-black/5 pointer-events-none" />
          
          <div className="flex flex-wrap items-center justify-center gap-2 max-w-full z-10 py-1">
            {cloudItems.map((item, idx) => {
              let bubbleStyle = 'bg-white/90 border-slate-200 text-slate-800';
              if (item.type === 'stress') {
                bubbleStyle = 'bg-red-50 border-red-200 text-red-700 font-bold';
              } else if (item.type === 'strength') {
                bubbleStyle = 'bg-cyan-50 border-cyan-200 text-cyan-700 font-bold';
              } else if (item.type === 'recovery') {
                bubbleStyle = 'bg-purple-50 border-purple-200 text-purple-700 font-bold';
              } else if (item.type === 'motivation') {
                bubbleStyle = 'bg-emerald-50 border-emerald-200 text-emerald-700 font-bold';
              }

              return (
                <motion.div
                  key={idx}
                  className={`border px-3 py-1 rounded-full font-black text-center cursor-pointer shadow-sm select-none flex items-center gap-1 ${bubbleStyle}`}
                  style={{ fontSize: `${item.size}px` }}
                  animate={{
                    y: [0, -4, 0],
                    scale: [1, 1.03, 1],
                  }}
                  transition={{
                    duration: 3 + (idx % 3),
                    repeat: Infinity,
                    ease: 'easeInOut',
                    delay: idx * 0.2
                  }}
                  whileHover={{ scale: 1.1, rotate: [0, 2, -2, 0] }}
                  onClick={() => setActiveTip(item.tip)}
                >
                  {item.type === 'stress' && <span className="text-[10px]" aria-hidden="true">🌧️</span>}
                  {item.type === 'strength' && <span className="text-[10px]" aria-hidden="true">⚡</span>}
                  {item.type === 'recovery' && <span className="text-[10px]" aria-hidden="true">❤️</span>}
                  {item.type === 'motivation' && <span className="text-[10px]" aria-hidden="true">✨</span>}
                  {item.text}
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Tip Banner */}
        <div className="bg-white/5 border border-card-border/40 py-2 px-3 rounded-2xl mb-4 text-center min-h-[48px] flex items-center justify-center">
          <p className="text-[10px] text-foreground font-black leading-tight">
            {activeTip}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-white/3 border border-card-border/40 rounded-2xl p-2.5 flex flex-col justify-between min-h-[65px]">
            <span className="text-[9px] text-text-muted block uppercase tracking-wider font-bold">
              Recharge style
            </span>
            <span className="text-[11px] font-bold text-foreground flex items-center gap-1 mt-1">
              <Heart size={12} className="text-secondary" />
              {dna.recoveryStyle}
            </span>
          </div>

          <div className={`border rounded-2xl p-2.5 flex flex-col justify-between min-h-[65px] ${getSusceptibilityColor(dna.burnoutSusceptibility)}`}>
            <span className="text-[9px] block uppercase tracking-wider font-bold opacity-85">
              Tension shield
            </span>
            <span className="text-[11px] font-black flex items-center gap-1 mt-1">
              <AlertCircle size={12} />
              {getFriendlyTensionLevel(dna.burnoutSusceptibility)}
            </span>
          </div>
        </div>
      </div>

      {/* Resilience Score Gauge representation */}
      <div className="border-t border-card-border/40 pt-3.5 flex items-center justify-between gap-4">
        <div>
          <span className="text-xs text-text-muted uppercase tracking-wider font-bold block">
            Mind Elasticity (Resilience)
          </span>
          <span className="text-[10px] font-black text-success bg-success/15 px-2.5 py-1 rounded-full border border-success/20 inline-block mt-1.5">
            Stable recovery speed
          </span>
        </div>
        
        {/* Glowing Dial representation */}
        <div className="relative w-12 h-12 shrink-0 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="24"
              cy="24"
              r={radius}
              className="stroke-white/10"
              strokeWidth="3.5"
              fill="transparent"
            />
            <motion.circle
              cx="24"
              cy="24"
              r={radius}
              className="stroke-primary"
              strokeWidth="3.5"
              fill="transparent"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset: strokeDashoffset }}
              transition={{ duration: 1, ease: 'easeOut' }}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute text-[10px] font-black text-foreground">
            {dna.emotionalResilience}%
          </div>
        </div>
      </div>
    </div>
  );
}
