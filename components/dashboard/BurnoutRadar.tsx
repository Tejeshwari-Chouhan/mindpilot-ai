'use client';

import React, { useState } from 'react';
import { DailyLogEntry } from '@/lib/types';
import { Battery, Heart, Shield } from 'lucide-react';
import { motion } from 'framer-motion';

interface BurnoutRadarProps {
  history: DailyLogEntry[];
}

export default function BurnoutRadar({ history }: BurnoutRadarProps) {
  // Get the latest analysis
  const latestEntry = history[history.length - 1];
  const stressLevel = latestEntry?.checkIn.stressLevel ?? 5; // 1-10
  const sleepHours = latestEntry?.checkIn.sleepHours ?? 7; // hours
  const studyHours = latestEntry?.checkIn.studyHours ?? 8; // hours
  const motivation = latestEntry?.analysis.motivation ?? 75; // 0-100
  const confidence = latestEntry?.analysis.confidence ?? 70; // 0-100
  const batteryCharge = Math.max(10, Math.min(100, Math.round(
    100 - (stressLevel * 3.5) - (sleepHours < 7 ? (7 - sleepHours) * 15 : 0) - (studyHours > 11 ? (studyHours - 11) * 8 : 0)
  )));

  const [gardenTip, setGardenTip] = useState<string>('Click different parts of your Mind Garden to check in! 🧸');

  const getBatteryStatus = (charge: number) => {
    if (charge >= 75) {
      return { 
        label: 'Cognitive Peak', 
        color: 'text-success bg-success/10 border-success/20',
        barColor: 'bg-success',
        detail: 'Your brain has plenty of energy today. Logical processing is smooth.'
      };
    }
    if (charge >= 45) {
      return { 
        label: 'Cognitive Drain', 
        color: 'text-warning bg-warning/10 border-warning/20',
        barColor: 'bg-warning',
        detail: 'Slight focus fatigue. Try spacing your revisions with short breaks.'
      };
    }
    return { 
      label: 'Cognitive Exhaustion', 
      color: 'text-error bg-error/10 border-error/20',
      barColor: 'bg-error',
      detail: 'High fatigue detected. It is highly recommended to rest your eyes.'
    };
  };

  const status = getBatteryStatus(batteryCharge);

  return (
    <div 
      className="glass-panel rounded-3xl p-6 flex flex-col justify-between h-full bg-gradient-to-br from-white/[0.01] via-transparent to-transparent border border-card-border/80"
      aria-label="Daily Mind Garden & Battery Guide"
    >
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-black flex items-center gap-2 text-foreground">
            <Battery size={20} className="text-secondary animate-pulse" />
            My Daily Mind Garden
          </h2>
          <span className={`text-[10px] uppercase font-black tracking-wider border px-2.5 py-0.5 rounded-full ${status.color}`}>
            {status.label}
          </span>
        </div>

        {/* Battery percentage section */}
        <div className="bg-white/2 border border-card-border/50 rounded-2xl p-4 mb-3 flex items-center gap-4">
          <div className="w-16 h-8 border-2 border-foreground/30 rounded-lg p-0.5 flex relative shrink-0">
            <div className="absolute -right-1.5 top-2.5 w-1.5 h-2 bg-foreground/30 rounded-r" />
            <div 
              className={`h-full rounded-md transition-all duration-1000 ${status.barColor}`} 
              style={{ width: `${batteryCharge}%` }} 
            />
          </div>
          <div className="flex-1">
            <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider block">Mind Energy Charge</span>
            <span className="text-2xl font-black text-foreground">{batteryCharge}%</span>
          </div>
        </div>

        {/* Dynamic Interactive SVG Garden */}
        <div className="bg-white/2 border border-card-border/30 rounded-2xl p-3 my-2 h-44 relative flex items-center justify-center overflow-hidden">
          <svg className="w-full h-full max-h-[140px]" viewBox="0 0 160 120">
            {/* Background Hills */}
            <path d="M-10,120 Q30,95 70,110 T170,105 L170,120 Z" fill="rgba(16, 185, 129, 0.08)" />

            {/* Glowing Sun (Confidence) */}
            <motion.circle 
              cx="125" 
              cy="25" 
              r={10 + (confidence / 25)} 
              fill="#fbbf24" 
              className="cursor-pointer drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]"
              whileHover={{ scale: 1.15 }}
              onClick={() => setGardenTip(`Sun: "Your Self-belief is shining at ${confidence}%! Keep radiating confidence." ☀️`)}
            />

            {/* Rain Cloud (Stress overlay) */}
            <motion.g 
              className="cursor-pointer"
              whileHover={{ scale: 1.1 }}
              onClick={() => setGardenTip(`Cloud: "Tension level is ${stressLevel}/10. ${stressLevel > 6 ? 'It is raining a bit heavy—take shelter in study breaks!' : 'Soft weather today, no heavy rain clouds here.'}" 🌧️`)}
            >
              <path 
                d="M45,28 Q35,28 38,20 Q45,12 55,17 Q65,17 62,28 Z" 
                fill={stressLevel > 6 ? 'rgba(148, 163, 184, 0.7)' : 'rgba(255,255,255,0.2)'} 
              />
              {/* Raindrops if stress is high */}
              {stressLevel > 6 && (
                <>
                  <line x1="42" y1="32" x2="40" y2="40" stroke="#38bdf8" strokeWidth="1.5" strokeLinecap="round" className="animate-bounce" />
                  <line x1="50" y1="35" x2="48" y2="43" stroke="#38bdf8" strokeWidth="1.5" strokeLinecap="round" className="animate-bounce [animation-delay:0.2s]" />
                  <line x1="58" y1="32" x2="56" y2="40" stroke="#38bdf8" strokeWidth="1.5" strokeLinecap="round" className="animate-bounce [animation-delay:0.4s]" />
                </>
              )}
            </motion.g>

            {/* Cozy Flower Pot */}
            <motion.path 
              d="M68,105 L92,105 L96,85 L64,85 Z" 
              fill="#b45309" 
              className="cursor-pointer"
              whileHover={{ scale: 1.05 }}
              onClick={() => setGardenTip(`Flower Pot: "Your soil is nourished with ${sleepHours}h of Sleep. Keep it watered daily!" 🛌`)}
            />

            {/* Growing Stem */}
            <path 
              d="M80,85 Q80,55 70,45" 
              fill="none" 
              stroke="#10b981" 
              strokeWidth="3.5" 
              strokeLinecap="round" 
            />

            {/* Left Leaf (Sleep) */}
            <motion.path 
              d="M78,70 Q55,65 60,55 Q70,60 78,70" 
              fill={sleepHours >= 7 ? '#10b981' : '#f59e0b'}
              className="cursor-pointer"
              whileHover={{ scale: 1.1, rotate: -5 }}
              onClick={() => setGardenTip(`Green Leaf: "Rest levels look ${sleepHours >= 7 ? 'excellent' : 'slightly dry'}. Try targeting 7-8 hours of sleep." 🛌`)}
            />

            {/* Right Leaf (Drive / Motivation) */}
            <motion.path 
              d="M76,58 Q95,52 90,42 Q80,47 76,58" 
              fill="#a855f7" 
              className="cursor-pointer"
              whileHover={{ scale: 1.1, rotate: 5 }}
              onClick={() => setGardenTip(`Purple Leaf: "Inner Drive is at ${motivation}%. Your leaves are glowing with academic aspiration!" ⚡`)}
            />

            {/* Center Flower Bud (Self-belief / Confidence) */}
            <motion.circle 
              cx="70" 
              cy="45" 
              r="6" 
              fill="#ec4899" 
              className="cursor-pointer drop-shadow-[0_0_6px_rgba(236,72,153,0.5)]"
              whileHover={{ scale: 1.2 }}
              onClick={() => setGardenTip(`Bud: "Your self-care flower is blooming! Complete actions to water it." 🌸`)}
            />
          </svg>
        </div>

        {/* Dynamic visual counselor tip card */}
        <div className="bg-emerald-50 border border-emerald-200/80 py-2.5 px-3.5 rounded-2xl text-center my-2">
          <p className="text-xs text-emerald-800 font-black leading-relaxed">
            {gardenTip}
          </p>
        </div>
      </div>

      {/* Reassurance Footer */}
      <div className="border-t border-card-border/40 pt-3 mt-2 flex items-start gap-2 text-xs bg-secondary/5 rounded-2xl p-3 border border-secondary/10">
        <Heart size={14} className="text-secondary shrink-0 mt-0.5 animate-pulse" />
        <p className="text-[11px] text-text-muted leading-relaxed">
          Plants grow best with light, water, and time. Feed your garden with rest and small study pacing blocks. ☕
        </p>
      </div>
    </div>
  );
}
