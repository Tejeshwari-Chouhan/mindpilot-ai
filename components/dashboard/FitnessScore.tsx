'use client';

import React, { useState } from 'react';
import { DailyLogEntry } from '@/lib/types';
import { Sun, Cloud, CloudRain, Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface FitnessScoreProps {
  history: DailyLogEntry[];
}

export default function FitnessScore({ history }: FitnessScoreProps) {
  const latestEntry = history[history.length - 1];
  const prevEntry = history[history.length - 2];

  const calculateScore = (entry: DailyLogEntry | undefined) => {
    if (!entry) return 50;
    const stress = entry.checkIn.stressLevel; // 1 to 10
    const sleep = entry.checkIn.sleepHours; // hours
    const confidence = entry.analysis.confidence; // 0 to 100
    const motivation = entry.analysis.motivation; // 0 to 100
    
    // Weight calculations
    const stressWeight = (10 - stress) * 10 * 0.25; // 25% max
    const sleepWeight = Math.min(100, (sleep / 7.5) * 100) * 0.20; // 20% max
    const confidenceWeight = confidence * 0.30; // 30% max
    const motivationWeight = motivation * 0.25; // 25% max
    
    return Math.round(stressWeight + sleepWeight + confidenceWeight + motivationWeight);
  };

  const currentScore = calculateScore(latestEntry);
  const prevScore = calculateScore(prevEntry);
  const scoreDiff = currentScore - prevScore;

  // Let the user interactively change/sandbox the weather scene
  const [sandboxWeather, setSandboxWeather] = useState<'sunny' | 'breezy' | 'rainy' | null>(null);

  const getScoreStatus = (score: number) => {
    if (score >= 75) return 'sunny';
    if (score >= 50) return 'breezy';
    return 'rainy';
  };

  const activeWeather = sandboxWeather || getScoreStatus(currentScore);

  const weatherDetails = {
    sunny: {
      label: 'Sunny Day ☀️',
      desc: 'Clear focus, warm energy. Enjoy your study blocks today!',
      color: 'text-success bg-success/10 border-success/20',
      bgColor: 'from-amber-500/10 via-transparent to-transparent',
      Icon: Sun
    },
    breezy: {
      label: 'Gentle Breeze 🌤️',
      desc: 'A bit of cloudy stress. Take things one concept at a time.',
      color: 'text-warning bg-warning/10 border-warning/20',
      bgColor: 'from-sky-500/10 via-transparent to-transparent',
      Icon: Cloud
    },
    rainy: {
      label: 'Cozy Rain 🌧️',
      desc: 'Things feel heavy. Take a warm rest, your health matters first.',
      color: 'text-error bg-error/10 border-error/20',
      bgColor: 'from-blue-500/10 via-transparent to-transparent',
      Icon: CloudRain
    }
  };

  const currentDetails = weatherDetails[activeWeather];

  return (
    <div 
      className={`glass-panel rounded-3xl p-6 flex flex-col justify-between h-full bg-gradient-to-br ${currentDetails.bgColor} to-transparent border border-card-border/80 transition-all duration-500`}
      aria-label="Interactive Mind Weather Sandbox"
    >
      <div>
        <span className="text-xs text-text-muted font-bold uppercase tracking-wider block mb-1">
          My Mind Weather
        </span>
        
        <div className="flex items-center gap-4 mt-3">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border ${currentDetails.color}`}>
            <currentDetails.Icon size={32} className="animate-pulse" />
          </div>
          <div>
            <h2 className="text-xl font-black text-foreground">
              {currentDetails.label}
            </h2>
            <p className="text-xs text-text-muted mt-0.5">
              {sandboxWeather ? 'Custom Sky Sandbox' : 'Current Vibe'}
            </p>
          </div>
        </div>

        <p className="text-xs font-semibold text-foreground leading-relaxed mt-4">
          {currentDetails.desc}
        </p>

        {/* Dynamic Animated Scene */}
        <div className="h-28 mt-4 w-full bg-black/10 border border-card-border/30 rounded-2xl relative overflow-hidden flex items-center justify-center">
          <AnimatePresence mode="wait">
            {activeWeather === 'sunny' && (
              <motion.div 
                key="sunny"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 flex items-center justify-center"
              >
                {/* Sunrays */}
                <motion.div 
                  className="w-16 h-16 rounded-full bg-amber-500/20 absolute"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 4, repeat: Infinity }}
                />
                <Sun size={40} className="text-amber-400 drop-shadow-[0_0_8px_rgba(245,158,11,0.6)]" />
              </motion.div>
            )}

            {activeWeather === 'breezy' && (
              <motion.div 
                key="breezy"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 flex items-center justify-center"
              >
                {/* Floating clouds drifting back and forth */}
                <motion.div
                  animate={{ x: [-15, 15, -15] }}
                  transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <Cloud size={44} className="text-sky-300/80" />
                </motion.div>
              </motion.div>
            )}

            {activeWeather === 'rainy' && (
              <motion.div 
                key="rainy"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 flex flex-col items-center justify-center"
              >
                <CloudRain size={40} className="text-blue-400" />
                {/* Flowing animated droplets */}
                <div className="flex gap-2.5 mt-2">
                  <span className="w-1 h-3 bg-blue-400/60 rounded-full animate-bounce [animation-duration:0.6s]" />
                  <span className="w-1 h-3 bg-blue-400/60 rounded-full animate-bounce [animation-duration:0.6s] [animation-delay:0.2s]" />
                  <span className="w-1 h-3 bg-blue-400/60 rounded-full animate-bounce [animation-duration:0.6s] [animation-delay:0.4s]" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Sandbox controls */}
        <div className="flex items-center justify-between gap-1.5 mt-4 p-1.5 bg-white/3 border border-card-border/40 rounded-xl">
          <span className="text-[9px] text-text-muted font-bold pl-1 uppercase">Adjust Sky:</span>
          <div className="flex gap-1">
            <button 
              onClick={() => setSandboxWeather('sunny')} 
              className={`p-1 px-2 rounded-lg text-[10px] font-bold cursor-pointer transition-all ${activeWeather === 'sunny' ? 'bg-amber-500/20 text-amber-300' : 'text-text-muted hover:bg-white/5'}`}
            >
              ☀️ Sun
            </button>
            <button 
              onClick={() => setSandboxWeather('breezy')} 
              className={`p-1 px-2 rounded-lg text-[10px] font-bold cursor-pointer transition-all ${activeWeather === 'breezy' ? 'bg-sky-500/20 text-sky-300' : 'text-text-muted hover:bg-white/5'}`}
            >
              🌤️ Breeze
            </button>
            <button 
              onClick={() => setSandboxWeather('rainy')} 
              className={`p-1 px-2 rounded-lg text-[10px] font-bold cursor-pointer transition-all ${activeWeather === 'rainy' ? 'bg-blue-500/20 text-blue-300' : 'text-text-muted hover:bg-white/5'}`}
            >
              🌧️ Rain
            </button>
          </div>
        </div>
      </div>

      <div className="border-t border-card-border/40 pt-3 mt-3 flex items-center justify-between text-[10px] text-text-muted font-bold">
        <span className="flex items-center gap-1">
          <Heart size={12} className="text-error" />
          One step at a time
        </span>
        <span>
          {scoreDiff > 0 ? (
            <span className="text-success">🌤️ Mood lift since yesterday</span>
          ) : scoreDiff < 0 ? (
            <span className="text-warning">🌧️ Energy is slightly low today</span>
          ) : (
            <span>Stable weather</span>
          )}
        </span>
      </div>
    </div>
  );
}
