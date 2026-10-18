'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ShieldAlert, Compass, Eye, Heart, Volume2, VolumeX, Sparkles, Check, ArrowRight, ShieldCheck, Trophy } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useStudentData } from '@/hooks/useStudentData';

class AmbientSynthesizer {
  private ctx: AudioContext | null = null;
  private binauralOscLeft: OscillatorNode | null = null;
  private binauralOscRight: OscillatorNode | null = null;
  private noiseSource: AudioBufferSourceNode | null = null;
  private noiseFilter: BiquadFilterNode | null = null;
  private lfo: OscillatorNode | null = null;
  private lfoGain: GainNode | null = null;
  private masterGain: GainNode | null = null;
  private chimeInterval: any = null;

  start(theme: 'Ocean Waves' | 'Rainfall' | 'Binaural Beats') {
    this.stop();
    
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    
    try {
      this.ctx = new AudioContextClass();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = 0.25; // soft master volume
      this.masterGain.connect(this.ctx.destination);

      if (theme === 'Binaural Beats') {
        this.playBinauralBeats();
      } else if (theme === 'Ocean Waves') {
        this.playOceanWaves();
      } else if (theme === 'Rainfall') {
        this.playRainfall();
      }

      // Start background chimes on top of any theme
      this.startChimes();
    } catch (e) {
      console.error("Audio Context failed to start: ", e);
    }
  }

  private playBinauralBeats() {
    if (!this.ctx || !this.masterGain) return;
    
    // Left ear oscillator
    const oscLeft = this.ctx.createOscillator();
    oscLeft.type = 'sine';
    oscLeft.frequency.value = 150; // 150Hz base hum

    // Right ear oscillator
    const oscRight = this.ctx.createOscillator();
    oscRight.type = 'sine';
    oscRight.frequency.value = 156; // 6Hz difference (Theta frequency for anxiety reduction)

    const gainLeft = this.ctx.createGain();
    const gainRight = this.ctx.createGain();
    gainLeft.gain.value = 0.45;
    gainRight.gain.value = 0.45;

    const merger = this.ctx.createChannelMerger(2);
    oscLeft.connect(gainLeft).connect(merger, 0, 0);
    oscRight.connect(gainRight).connect(merger, 0, 1);

    // Also create a low frequency filter to make the hum warmer
    const lowpass = this.ctx.createBiquadFilter();
    lowpass.type = 'lowpass';
    lowpass.frequency.value = 180;

    merger.connect(lowpass).connect(this.masterGain);

    oscLeft.start();
    oscRight.start();

    this.binauralOscLeft = oscLeft;
    this.binauralOscRight = oscRight;
  }

  private playOceanWaves() {
    if (!this.ctx || !this.masterGain) return;

    // Generate White Noise Buffer
    const bufferSize = 2 * this.ctx.sampleRate;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = noiseBuffer;
    noise.loop = true;

    // Apply Lowpass filter to shape waves
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 320; // base frequency
    filter.Q.value = 1.0;

    // Modulate cutoff frequency using LFO (Low Frequency Oscillator) to simulate waves swelling
    const lfo = this.ctx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.value = 0.07; // ~14 seconds per wave cycle

    const lfoGain = this.ctx.createGain();
    lfoGain.gain.value = 220; // modulation depth (320Hz +- 220Hz)

    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);

    // Modulate gain slightly with same LFO so swell is louder
    const ampMod = this.ctx.createGain();
    ampMod.gain.value = 0.45;

    const ampLfoGain = this.ctx.createGain();
    ampLfoGain.gain.value = 0.2;
    lfo.connect(ampLfoGain);
    ampLfoGain.connect(ampMod.gain);

    noise.connect(filter).connect(ampMod).connect(this.masterGain);
    
    lfo.start();
    noise.start();

    this.noiseSource = noise;
    this.noiseFilter = filter;
    this.lfo = lfo;
    this.lfoGain = lfoGain;
  }

  private playRainfall() {
    if (!this.ctx || !this.masterGain) return;

    // Generate Noise Buffer
    const bufferSize = 2 * this.ctx.sampleRate;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = noiseBuffer;
    noise.loop = true;

    // Shorter high pass for raindrops
    const highpass = this.ctx.createBiquadFilter();
    highpass.type = 'highpass';
    highpass.frequency.value = 450;

    // Soft low pass to filter out harsh crackles
    const lowpass = this.ctx.createBiquadFilter();
    lowpass.type = 'lowpass';
    lowpass.frequency.value = 1300;

    const gain = this.ctx.createGain();
    gain.gain.value = 0.3;

    noise.connect(highpass).connect(lowpass).connect(gain).connect(this.masterGain);
    noise.start();

    this.noiseSource = noise;
  }

  private startChimes() {
    if (!this.ctx) return;
    
    const playSingleChime = () => {
      if (!this.ctx || this.ctx.state === 'closed') return;

      // Pentatonic chime notes (C4, E4, G4, A4, C5, D5, E5)
      const frequencies = [261.63, 329.63, 392.00, 440.00, 523.25, 587.33, 659.25];
      const freq = frequencies[Math.floor(Math.random() * frequencies.length)];

      const osc = this.ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = freq;

      const oscOvertone = this.ctx.createOscillator();
      oscOvertone.type = 'triangle';
      oscOvertone.frequency.value = freq * 1.5; // perfect fifth overtone for bell richness

      const gain = this.ctx.createGain();
      const gainOvertone = this.ctx.createGain();
      
      const now = this.ctx.currentTime;

      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.05, now + 0.1); // soft attack
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 5.0); // long decay

      gainOvertone.gain.setValueAtTime(0, now);
      gainOvertone.gain.linearRampToValueAtTime(0.01, now + 0.05);
      gainOvertone.gain.exponentialRampToValueAtTime(0.0001, now + 1.8);

      const panner = this.ctx.createStereoPanner ? this.ctx.createStereoPanner() : null;
      if (panner) {
        panner.pan.value = Math.random() * 1.6 - 0.8; // pan randomly left/right
        osc.connect(gain).connect(panner);
        oscOvertone.connect(gainOvertone).connect(panner);
        panner.connect(this.ctx.destination);
      } else {
        osc.connect(gain).connect(this.ctx.destination);
        oscOvertone.connect(gainOvertone).connect(this.ctx.destination);
      }

      osc.start(now);
      osc.stop(now + 5.2);
      oscOvertone.start(now);
      oscOvertone.stop(now + 2.2);
    };

    // Play one chime immediately
    playSingleChime();

    // Trigger chimes periodically every 8 to 15 seconds
    this.chimeInterval = setInterval(() => {
      playSingleChime();
    }, 8000 + Math.random() * 7000);
  }

  stop() {
    if (this.chimeInterval) {
      clearInterval(this.chimeInterval);
      this.chimeInterval = null;
    }

    if (this.binauralOscLeft) {
      try { this.binauralOscLeft.stop(); } catch (e) {}
      this.binauralOscLeft.disconnect();
      this.binauralOscLeft = null;
    }
    if (this.binauralOscRight) {
      try { this.binauralOscRight.stop(); } catch (e) {}
      this.binauralOscRight.disconnect();
      this.binauralOscRight = null;
    }
    if (this.noiseSource) {
      try { this.noiseSource.stop(); } catch (e) {}
      this.noiseSource.disconnect();
      this.noiseSource = null;
    }
    if (this.noiseFilter) {
      this.noiseFilter.disconnect();
      this.noiseFilter = null;
    }
    if (this.lfo) {
      try { this.lfo.stop(); } catch (e) {}
      this.lfo.disconnect();
      this.lfo = null;
    }
    if (this.lfoGain) {
      this.lfoGain.disconnect();
      this.lfoGain = null;
    }
    if (this.masterGain) {
      this.masterGain.disconnect();
      this.masterGain = null;
    }
    if (this.ctx && this.ctx.state !== 'closed') {
      this.ctx.close();
      this.ctx = null;
    }
  }
 
  playPunchSound() {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    try {
      const ctx = new AudioContextClass();
      const now = ctx.currentTime;
      
      // Low-frequency thud
      const oscThud = ctx.createOscillator();
      oscThud.type = 'sine';
      oscThud.frequency.setValueAtTime(130, now);
      oscThud.frequency.exponentialRampToValueAtTime(35, now + 0.12);
      
      const gainThud = ctx.createGain();
      gainThud.gain.setValueAtTime(0.5, now);
      gainThud.gain.exponentialRampToValueAtTime(0.001, now + 0.16);
      
      oscThud.connect(gainThud).connect(ctx.destination);
      oscThud.start(now);
      oscThud.stop(now + 0.18);
 
      // Short slap crack noise
      const bufferSize = ctx.sampleRate * 0.08;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }
      const noise = ctx.createBufferSource();
      noise.buffer = noiseBuffer;
      
      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = 650;
      filter.Q.value = 2.5;
 
      const gainNoise = ctx.createGain();
      gainNoise.gain.setValueAtTime(0.15, now);
      gainNoise.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
 
      noise.connect(filter).connect(gainNoise).connect(ctx.destination);
      noise.start(now);
      noise.stop(now + 0.08);
    } catch (e) {
      console.error(e);
    }
  }
}

type BreathingPhase = 'inhale' | 'hold-in' | 'exhale' | 'hold-out';

export default function CalmRoomPage() {
  const { addXP } = useStudentData();
  // Breathing Trainer States
  const [breathingActive, setBreathingActive] = useState(false);
  const [phase, setPhase] = useState<BreathingPhase>('inhale');
  const [secondsRemaining, setSecondsRemaining] = useState(4);
  const [cyclesCompleted, setCyclesCompleted] = useState(0);

  // Grounding states
  const [groundingStep, setGroundingStep] = useState(0);
  const [groundingInputs, setGroundingInputs] = useState<string[]>(['', '', '', '', '']);

  // Ambient sound state (simulated)
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [ambientTheme, setAmbientTheme] = useState<'Ocean Waves' | 'Rainfall' | 'Binaural Beats'>('Ocean Waves');

  const synthRef = useRef<AmbientSynthesizer | null>(null);

  useEffect(() => {
    synthRef.current = new AmbientSynthesizer();
    return () => {
      if (synthRef.current) {
        synthRef.current.stop();
      }
    };
  }, []);

  useEffect(() => {
    if (synthRef.current) {
      if (isAudioPlaying) {
        synthRef.current.start(ambientTheme);
      } else {
        synthRef.current.stop();
      }
    }
  }, [isAudioPlaying, ambientTheme]);
 
  // Calm Mode Switcher
  const [calmMode, setCalmMode] = useState<'mindful' | 'meditate' | 'anger'>('mindful');
  
  // Meditation states
  const [meditationActive, setMeditationActive] = useState(false);
  const [activeSession, setActiveSession] = useState<'quick_calm' | 'anxiety_reset' | 'deep_focus' | 'sleep'>('quick_calm');
  const [meditationTime, setMeditationTime] = useState(120); // default for quick_calm
  const [meditationTotal, setMeditationTotal] = useState(120);
  const [selectedExam, setSelectedExam] = useState<string>('jee');
  const [meditationCompleted, setMeditationCompleted] = useState(false);

  const SESSIONS = [
    { id: 'quick_calm' as const, title: '2-Min Quick Calm', duration: 120, desc: 'Ideal before entering an exam hall. Lowers immediate flight-or-fight heart rate.', theme: 'from-teal-500 to-emerald-400' },
    { id: 'anxiety_reset' as const, title: '5-Min Anxiety Reset', duration: 300, desc: 'For sudden panic, mock test shocks, or feeling overwhelmed by a tough topic.', theme: 'from-sky-500 to-indigo-400' },
    { id: 'deep_focus' as const, title: '10-Min Deep Focus', duration: 600, desc: 'Prime your brain before starting a heavy problem-solving session.', theme: 'from-violet-500 to-purple-400' },
    { id: 'sleep' as const, title: 'Sleep Meditation', duration: 900, desc: 'Calms brainwaves to transition into deep, memory-consolidating sleep cycles.', theme: 'from-slate-600 to-indigo-950' }
  ];

  const EXAMS_TIPS: Record<string, { name: string; stress: string; tips: string[] }> = {
    jee: {
      name: 'JEE (Main & Advanced)',
      stress: 'Physics derivations & math problem pressure',
      tips: [
        '10-Min Deep Focus before Physics problem-solving sessions.',
        '2-Min Quick Calm before entering the exam hall.',
        '5-Min Anxiety Reset after negative mock test results.'
      ]
    },
    neet: {
      name: 'NEET (UG)',
      stress: 'Vast Biology syllabus & memory overload',
      tips: [
        'Sleep Meditation consolidates Biology mnemonics overnight.',
        'Deep Focus primes recall of taxonomy and organ systems.',
        'Anxiety Reset between paper shifts (Chem → Bio).'
      ]
    },
    upsc: {
      name: 'UPSC (CSE)',
      stress: 'Multi-year prep fatigue & current affairs overload',
      tips: [
        'Sleep Meditation critical after 12+ hour study days.',
        'Deep Focus before Answer Writing practice sessions.',
        'Anxiety Reset after negative Mains mock evaluations.'
      ]
    },
    cat: {
      name: 'CAT (MBA)',
      stress: 'Time pressure & VARC section anxiety',
      tips: [
        'Quick Calm for time-pressure simulation in mock CATs.',
        'Deep Focus before RC passage practice sets.',
        'Box breathing lowers reactivity during tricky DI-LR sets.'
      ]
    },
    gate: {
      name: 'GATE',
      stress: 'Technical depth & rank-list anxiety',
      tips: [
        '10-Min Deep Focus before core engineering subjects.',
        'Quick Calm before mock GATE full-length tests.',
        'Sleep Meditation for signal-processing memory consolidation.'
      ]
    },
    cuet: {
      name: 'CUET (UG)',
      stress: 'Multi-domain syllabus & cutoff anxiety',
      tips: [
        'Anxiety Reset between domain subject shifts.',
        'Quick Calm 2 minutes before the test server logs in.',
        'Deep Focus before General Test reasoning sets.'
      ]
    }
  };

  useEffect(() => {
    if (!meditationActive) return;

    const interval = setInterval(() => {
      setMeditationTime((prev) => {
        if (prev <= 1) {
          setMeditationActive(false);
          setMeditationCompleted(true);
          // Reward user +20 XP reactively for completing meditation
          addXP(20);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [meditationActive]);

  const selectMeditationSession = (id: 'quick_calm' | 'anxiety_reset' | 'deep_focus' | 'sleep', duration: number) => {
    setMeditationActive(false);
    setMeditationCompleted(false);
    setActiveSession(id);
    setMeditationTime(duration);
    setMeditationTotal(duration);
  };

  // Anger Cushion States
  const [angerTension, setAngerTension] = useState(100);
  const [punchesLanded, setPunchesLanded] = useState(0);
  const [floatingTexts, setFloatingTexts] = useState<{ id: number; text: string; x: number; y: number }[]>([]);
  const [angerSuccess, setAngerSuccess] = useState(false);
 
  const handlePunch = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (angerSuccess) return;
 
    // Play synthesized thud/slap
    if (synthRef.current) {
      synthRef.current.playPunchSound();
    }
 
    // Spawn floating hit words
    const hitWords = ['BAM!', 'POW!', 'SMASH!', 'RELEASE!', 'LET IT OUT!', 'CRACK!', 'OOMPH!', 'ARRGH!'];
    const randomWord = hitWords[Math.floor(Math.random() * hitWords.length)];
    
    // Get mouse offset relative to button boundary
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const newId = Date.now() + Math.random();
    setFloatingTexts((prev) => [...prev, { id: newId, text: randomWord, x, y }]);
    
    // Remove floating text after 1s
    setTimeout(() => {
      setFloatingTexts((prev) => prev.filter((t) => t.id !== newId));
    }, 1000);
 
    const newTension = Math.max(0, angerTension - 5);
    setAngerTension(newTension);
    setPunchesLanded((p) => p + 1);
 
    if (newTension === 0) {
      setAngerSuccess(true);
      // Reward +10 XP reactively
      addXP(10);
    }
  };
 
  const handleResetAnger = () => {
    setAngerTension(100);
    setPunchesLanded(0);
    setFloatingTexts([]);
    setAngerSuccess(false);
  };

  // Box breathing phase text
  const phaseDetails = {
    'inhale': { text: 'Inhale deeply...', scale: 1.15, color: 'bg-primary border-primary shadow-[0_0_40px_rgba(99,102,241,0.5)]' },
    'hold-in': { text: 'Hold your breath...', scale: 1.15, color: 'bg-secondary border-secondary shadow-[0_0_40px_rgba(168,85,247,0.5)]' },
    'exhale': { text: 'Exhale slowly...', scale: 0.9, color: 'bg-accent border-accent shadow-[0_0_40px_rgba(6,182,212,0.5)]' },
    'hold-out': { text: 'Pause and rest...', scale: 0.9, color: 'bg-slate-700 border-slate-600 shadow-[0_0_20px_rgba(255,255,255,0.15)]' }
  };

  // Timer loop for box breathing (4-4-4-4 cycle)
  useEffect(() => {
    if (!breathingActive) return;

    const interval = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev === 1) {
          // Move to next phase
          setPhase((currentPhase) => {
            switch (currentPhase) {
              case 'inhale': return 'hold-in';
              case 'hold-in': return 'exhale';
              case 'exhale': return 'hold-out';
              case 'hold-out':
                setCyclesCompleted(c => c + 1);
                return 'inhale';
              default: return 'inhale';
            }
          });
          return 4; // Reset to 4 seconds
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [breathingActive]);

  const groundingStages = [
    { number: 5, prompt: "What are 5 things you can SEE around you?", placeholder: "e.g. A water bottle, textbook, wall lamp...", color: 'border-primary' },
    { number: 4, prompt: "What are 4 things you can TOUCH/FEEL?", placeholder: "e.g. Laptop keys, study desk wood, cotton shirt...", color: 'border-secondary' },
    { number: 3, prompt: "What are 3 things you can HEAR?", placeholder: "e.g. Fan whirring, distant traffic, clock ticking...", color: 'border-accent' },
    { number: 2, prompt: "What are 2 things you can SMELL?", placeholder: "e.g. Coffee aroma, paper pages, fresh laundry...", color: 'border-success' },
    { number: 1, prompt: "What is 1 thing you can TASTE?", placeholder: "e.g. Mint candy, drinking water, toothpaste...", color: 'border-warning' }
  ];

  const handleGroundingInput = (idx: number, val: string) => {
    const updated = [...groundingInputs];
    updated[idx] = val;
    setGroundingInputs(updated);
  };

  const resetBreathing = () => {
    setBreathingActive(false);
    setPhase('inhale');
    setSecondsRemaining(4);
    setCyclesCompleted(0);
  };

  return (
    <div 
      className="flex-1 flex flex-col justify-center items-center py-6 space-y-8 max-w-3xl mx-auto text-center animate-in fade-in duration-500"
      role="main"
      aria-label="SOS Calm Room distraction free workspace"
    >
      {/* Calm Header */}
      <div className="glass-panel bg-white/70 border border-slate-200/50 p-5 rounded-3xl space-y-2 max-w-md w-full mx-auto shadow-md">
        <span className="text-xs font-bold text-error uppercase tracking-widest bg-error/10 border border-error/20 px-3 py-1 rounded-full flex items-center justify-center gap-1.5 w-fit mx-auto">
          <ShieldAlert size={14} className="animate-pulse" />
          SOS Calm Room Active
        </span>
        <h1 className="text-2xl font-black text-foreground">
          Take a Resiliency Break
        </h1>
        <p className="text-xs text-text-muted max-w-md mx-auto leading-relaxed">
          Slowing down your breathing and grounding your physical senses shuts down panic loops and blocks exam stress build-ups.
        </p>
      </div>
 
      {/* Calm Mode Selector Tabs */}
      <div className="flex bg-white/5 p-1 rounded-2xl border border-card-border max-w-md w-full mx-auto" role="tablist">
        <button
          role="tab"
          aria-selected={calmMode === 'mindful'}
          onClick={() => setCalmMode('mindful')}
          className={`flex-1 py-2 rounded-xl text-[10px] sm:text-xs font-black transition-all focus:outline-none cursor-pointer ${
            calmMode === 'mindful' 
              ? 'bg-primary text-white shadow' 
              : 'text-text-muted hover:text-foreground'
          }`}
        >
          Mindfulness Reset 🧘
        </button>
        <button
          role="tab"
          aria-selected={calmMode === 'meditate'}
          onClick={() => setCalmMode('meditate')}
          className={`flex-1 py-2 rounded-xl text-[10px] sm:text-xs font-black transition-all focus:outline-none cursor-pointer ${
            calmMode === 'meditate' 
              ? 'bg-secondary text-white shadow' 
              : 'text-text-muted hover:text-foreground hover:bg-white/5'
          }`}
        >
          Meditation Hub 🌌
        </button>
        <button
          role="tab"
          aria-selected={calmMode === 'anger'}
          onClick={() => setCalmMode('anger')}
          className={`flex-1 py-2 rounded-xl text-[10px] sm:text-xs font-black transition-all focus:outline-none cursor-pointer ${
            calmMode === 'anger' 
              ? 'bg-error text-white shadow-[0_0_15px_rgba(239,68,68,0.3)]' 
              : 'text-text-muted hover:text-foreground hover:bg-white/5'
          }`}
        >
          Anger Release 🥊
        </button>
      </div>
 
      {calmMode === 'mindful' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
        {/* Box Breathing */}
        <div className="glass-panel rounded-2xl p-6 flex flex-col items-center justify-between min-h-[360px]">
          <div className="w-full flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
              <Heart size={16} />
              Box Breathing Guide
            </h2>
            {breathingActive && (
              <span className="text-[10px] text-success font-bold bg-success/10 border border-success/20 px-2 py-0.5 rounded">
                Cycles: {cyclesCompleted}
              </span>
            )}
          </div>

          {/* Breathing Circle Container */}
          <div className="flex-1 flex items-center justify-center min-h-[160px] sm:min-h-[200px]">
            <div className="relative flex items-center justify-center">
              {/* Outer Pulse */}
              <AnimatePresence>
                {breathingActive && (
                  <motion.div
                    className="absolute rounded-full border border-white/5 bg-white/2 shrink-0 w-36 h-36 sm:w-44 sm:h-44"
                    animate={{
                      scale: phaseDetails[phase].scale * 1.15,
                    }}
                    transition={{ duration: 4, ease: 'easeInOut' }}
                  />
                )}
              </AnimatePresence>

              {/* Main breathing circle */}
              <motion.div
                className={`w-24 h-24 sm:w-28 sm:h-28 rounded-full border-2 flex flex-col items-center justify-center transition-all text-white font-black shrink-0 ${
                  breathingActive ? phaseDetails[phase].color : 'bg-white/5 border-card-border'
                }`}
                animate={{
                  scale: breathingActive ? phaseDetails[phase].scale : 1.0,
                }}
                transition={{ duration: 4, ease: 'easeInOut' }}
              >
                {breathingActive ? (
                  <>
                    <span className="text-xl sm:text-2xl font-black">{secondsRemaining}</span>
                    <span className="text-[8px] sm:text-[9px] uppercase tracking-wider font-semibold opacity-70 mt-0.5 sm:mt-1">Secs</span>
                  </>
                ) : (
                  <Heart size={28} className="text-primary animate-pulse sm:w-8 sm:h-8" />
                )}
              </motion.div>
            </div>
          </div>

          <div className="space-y-4 w-full">
            <p className="text-xs text-foreground font-semibold h-4">
              {breathingActive ? phaseDetails[phase].text : 'Ready to start breathing exercises?'}
            </p>

            <div className="flex gap-2 justify-center">
              {breathingActive ? (
                <button
                  onClick={resetBreathing}
                  className="bg-slate-800 hover:bg-slate-700 text-text-muted hover:text-foreground text-xs font-bold px-4 py-2 rounded-xl border border-card-border focus:ring-2 focus:ring-primary outline-none"
                >
                  Stop
                </button>
              ) : (
                <button
                  onClick={() => setBreathingActive(true)}
                  className="bg-primary hover:opacity-90 text-white text-xs font-bold px-6 py-2 rounded-xl shadow shadow-primary/20 focus:ring-2 focus:ring-primary outline-none"
                >
                  Start Box Breathing (4s)
                </button>
              )}
            </div>
          </div>
        </div>

        {/* 5-4-3-2-1 Grounding Technique */}
        <div className="glass-panel rounded-2xl p-6 flex flex-col justify-between min-h-[360px]">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-secondary flex items-center gap-1.5">
              <Compass size={16} />
              5-4-3-2-1 Grounding
            </h2>
            <span className="text-[10px] text-text-muted font-bold">
              Step {groundingStep + 1} of 5
            </span>
          </div>

          <div className="flex-1 flex flex-col justify-center py-4">
            <AnimatePresence mode="wait">
              <motion.div
                key={groundingStep}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.15 }}
                className="space-y-4"
              >
                <div className="flex items-center justify-center gap-2">
                  <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center text-sm font-black ${groundingStages[groundingStep].color}`}>
                    {groundingStages[groundingStep].number}
                  </div>
                </div>
                
                <h3 className="text-sm font-bold text-foreground">
                  {groundingStages[groundingStep].prompt}
                </h3>

                <input
                  type="text"
                  placeholder={groundingStages[groundingStep].placeholder}
                  value={groundingInputs[groundingStep]}
                  onChange={(e) => handleGroundingInput(groundingStep, e.target.value)}
                  className="w-full bg-black/20 border border-card-border text-xs rounded-xl px-3.5 py-2.5 focus:ring-1 focus:ring-primary focus:outline-none"
                  aria-label={`Grounding step input for ${groundingStages[groundingStep].prompt}`}
                />
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Controls */}
          <div className="flex justify-between items-center border-t border-card-border/30 pt-4">
            <button
              onClick={() => setGroundingStep((prev) => Math.max(0, prev - 1))}
              disabled={groundingStep === 0}
              className="text-xs text-text-muted hover:text-foreground disabled:opacity-40 focus:outline-none"
            >
              Previous
            </button>

            {groundingStep < 4 ? (
              <button
                onClick={() => setGroundingStep((prev) => Math.min(4, prev + 1))}
                className="bg-white/5 border border-card-border text-text-muted hover:text-foreground text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 focus:ring-1 focus:ring-primary outline-none"
              >
                Next Step
                <ArrowRight size={12} />
              </button>
            ) : (
              <button
                onClick={() => {
                  alert("Grounding completed successfully. Take a deep breath! You are present. You are safe. (+15 XP earned)");
                  addXP(15);
                  setGroundingStep(0);
                  setGroundingInputs(['', '', '', '', '']);
                }}
                className="bg-success/15 border border-success/30 text-success text-xs font-bold px-4 py-1.5 rounded-lg flex items-center gap-1 focus:ring-2 focus:ring-success outline-none"
              >
                Complete
                <Check size={12} />
              </button>
            )}
          </div>
        </div>
      </div>
      )}

      {calmMode === 'meditate' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full text-left">
          {/* Left panel: Session list */}
          <div className="md:col-span-2 glass-panel rounded-2xl p-6 flex flex-col justify-between min-h-[400px]">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-bold uppercase tracking-wider text-secondary flex items-center gap-1.5">
                  <Compass size={16} />
                  Guided Audio Meditation Timers
                </h2>
                {meditationCompleted && (
                  <span className="text-[10px] text-success font-bold bg-success/10 border border-success/20 px-2 py-0.5 rounded">
                    Session Done! +20 XP
                  </span>
                )}
              </div>
              <p className="text-xs text-text-muted mb-6">
                Select a context-based audio countdown timer block. Tap play to focus your brainwaves or quiet your flight-or-fight response.
              </p>

              {/* Session Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {SESSIONS.map((session) => (
                  <button
                    key={session.id}
                    onClick={() => selectMeditationSession(session.id, session.duration)}
                    className={`p-4 rounded-xl border text-left cursor-pointer transition-all ${
                      activeSession === session.id
                        ? 'bg-secondary/10 border-secondary'
                        : 'bg-white/5 border-card-border hover:bg-white/10'
                    }`}
                  >
                    <div className="font-bold text-sm text-foreground flex items-center justify-between">
                      <span>{session.title}</span>
                      <span className="text-[10px] opacity-75 font-semibold">{(session.duration / 60)} min</span>
                    </div>
                    <p className="text-[10px] text-text-muted mt-1 leading-relaxed">{session.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Active Meditation Timer Display */}
            <div className="mt-8 bg-white/5 border border-card-border rounded-xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <span className="text-[9px] uppercase font-black text-secondary tracking-widest block">Active Session</span>
                <span className="text-sm font-bold text-foreground">
                  {SESSIONS.find(s => s.id === activeSession)?.title}
                </span>
              </div>

              {/* Big Timer */}
              <div className="text-3xl font-black font-mono text-foreground tracking-wider">
                {Math.floor(meditationTime / 60)}:{(meditationTime % 60).toString().padStart(2, '0')}
              </div>

              {/* Player Controls */}
              <div className="flex gap-2">
                <button
                  onClick={() => setMeditationActive(!meditationActive)}
                  className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                    meditationActive
                      ? 'bg-warning text-slate-900'
                      : 'bg-gradient-to-r from-secondary to-primary text-white'
                  }`}
                >
                  {meditationActive ? 'Pause' : 'Start Timer'}
                </button>
                <button
                  onClick={() => selectMeditationSession(activeSession, meditationTotal)}
                  className="bg-white/5 hover:bg-white/10 border border-card-border px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  Reset
                </button>
              </div>
            </div>
          </div>

          {/* Right panel: Exam Specific Coping Tips */}
          <div className="md:col-span-1 glass-panel rounded-2xl p-6 flex flex-col justify-between min-h-[400px]">
            <div className="space-y-4">
              <h2 className="text-sm font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
                <Trophy size={16} />
                Aspirant Coping Tips
              </h2>
              <p className="text-xs text-text-muted">
                Select your target competitive exam to see personalized psychological tips.
              </p>

              {/* Dropdown Selector */}
              <select
                value={selectedExam}
                onChange={(e) => setSelectedExam(e.target.value)}
                className="w-full bg-white/5 border border-card-border text-foreground text-xs font-bold rounded-xl p-2.5 focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
              >
                <option value="jee" className="bg-slate-900">JEE Prep Tips</option>
                <option value="neet" className="bg-slate-900">NEET Prep Tips</option>
                <option value="upsc" className="bg-slate-900">UPSC CSE Prep Tips</option>
                <option value="cat" className="bg-slate-900">CAT Prep Tips</option>
                <option value="gate" className="bg-slate-900">GATE Prep Tips</option>
                <option value="cuet" className="bg-slate-900">CUET Prep Tips</option>
              </select>

              {/* Stress trigger and tips content */}
              <div className="bg-white/5 border border-card-border rounded-xl p-4 space-y-3">
                <div>
                  <span className="text-[9px] uppercase font-black text-text-muted tracking-widest block">Primary stressor</span>
                  <span className="text-xs font-bold text-error">{EXAMS_TIPS[selectedExam].stress}</span>
                </div>
                <div className="space-y-2">
                  <span className="text-[9px] uppercase font-black text-text-muted tracking-widest block">Mindfulness guidance</span>
                  <ul className="space-y-1.5">
                    {EXAMS_TIPS[selectedExam].tips.map((tip, idx) => (
                      <li key={idx} className="text-[10px] text-text-muted leading-relaxed flex items-start gap-1">
                        <span className="text-primary font-bold">•</span>
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-white/5 border border-card-border/60 rounded-xl p-3.5 flex items-start gap-2 text-[10px] text-text-muted leading-relaxed">
              <Compass size={14} className="text-secondary shrink-0 mt-0.5" />
              <p>Tip: Practice these techniques regularly to build memory retention and clear spatial load in your pre-frontal cortex.</p>
            </div>
          </div>
        </div>
      )}

      {calmMode === 'anger' && (
        <div className="glass-panel rounded-3xl p-6 md:p-8 w-full max-w-md mx-auto flex flex-col items-center justify-between min-h-[420px] animate-in fade-in duration-300 relative overflow-hidden border border-error/20 bg-gradient-to-tr from-error/[0.03] to-transparent">
          {/* Floating Impact text words overlay */}
          <div className="absolute inset-0 pointer-events-none">
            <AnimatePresence>
              {floatingTexts.map((txt) => (
                <motion.span
                  key={txt.id}
                  initial={{ opacity: 1, scale: 0.8, y: txt.y, x: txt.x }}
                  animate={{ opacity: 0, scale: 1.4, y: txt.y - 120, x: txt.x + (Math.random() * 40 - 20) }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                  className="absolute text-sm font-black text-error drop-shadow-[0_0_8px_rgba(239,68,68,0.6)] uppercase"
                >
                  {txt.text}
                </motion.span>
              ))}
            </AnimatePresence>
          </div>
 
          <div className="w-full">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold uppercase tracking-wider text-error flex items-center gap-1.5">
                <ShieldAlert size={16} />
                Anger Release Cushion
              </h2>
              <span className="text-[10px] text-text-muted font-bold">
                Punches: {punchesLanded}
              </span>
            </div>
 
            <p className="text-xs text-text-muted mb-6">
              When study pressure or parent expectations make you want to hit something, vent it here. Tap/click the cushion rapidly to release physical tension.
            </p>
 
            {/* Anger Tension bar */}
            <div className="space-y-1 mb-6">
              <div className="flex justify-between text-[10px] font-bold">
                <span className="text-error uppercase tracking-wider">Anger Tension Level</span>
                <span className="text-foreground">{angerTension}%</span>
              </div>
              <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden border border-card-border">
                <div 
                  className="h-full bg-gradient-to-r from-error to-warning transition-all duration-300 rounded-full" 
                  style={{ width: `${angerTension}%` }}
                />
              </div>
            </div>
          </div>
 
          {/* Interactive Cushion */}
          <div className="my-4 relative flex items-center justify-center min-h-[160px]">
            <AnimatePresence mode="wait">
              {angerSuccess ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center space-y-4"
                >
                  <motion.span 
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                    className="text-6xl block"
                  >
                    😌✨
                  </motion.span>
                  <div className="space-y-1">
                    <span className="text-sm text-success font-black block">Tension Released!</span>
                    <span className="text-[10px] text-text-muted block max-w-xs leading-relaxed">
                      Now take a slow, deep breath. You are back in control of your focus. +10 XP has been added to your resilience core.
                    </span>
                  </div>
                  <button
                    onClick={handleResetAnger}
                    className="bg-white/5 border border-card-border hover:bg-white/10 text-foreground text-xs font-bold px-4 py-2 rounded-xl focus:ring-1 focus:ring-primary outline-none transition-all cursor-pointer"
                  >
                    Vent Again
                  </button>
                </motion.div>
              ) : (
                <motion.button
                  key="cushion"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.88, rotate: Math.random() * 6 - 3 }}
                  onClick={handlePunch}
                  className="w-32 h-32 rounded-full bg-gradient-to-br from-error to-red-800 border-4 border-error/50 flex flex-col items-center justify-center text-white font-black shadow-[0_10px_35px_rgba(239,68,68,0.4)] hover:shadow-[0_12px_45px_rgba(239,68,68,0.6)] focus:outline-none transition-shadow relative cursor-pointer"
                  aria-label="Punch cushion to release anger"
                >
                  <span className="text-4xl">🥊</span>
                  <span className="text-[8px] uppercase tracking-widest font-black opacity-80 mt-1">HIT ME</span>
                </motion.button>
              )}
            </AnimatePresence>
          </div>
 
          <div className="w-full border-t border-card-border/30 pt-4 mt-6 text-[10px] text-text-muted leading-relaxed">
            *This is a physical tension release tool. Tapping activates low-frequency synthesized impact sound waves designed to simulate haptic release.*
          </div>
        </div>
      )}
 
      {/* Audio Ambient and Navigation back */}
      <div className="w-full flex flex-col sm:flex-row justify-between items-center gap-4 glass-panel bg-white/70 border border-slate-200/50 p-4 rounded-2xl shadow-md">
        {/* Ambient audio synthesis */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsAudioPlaying(!isAudioPlaying)}
            className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
              isAudioPlaying 
                ? 'bg-success/15 border-success/30 text-success font-bold' 
                : 'bg-slate-50 border-slate-200/80 text-slate-600 hover:text-slate-800 hover:bg-slate-100'
            } focus:outline-none`}
            title="Play calming background sounds"
            aria-label="Play calming background sounds"
          >
            {isAudioPlaying ? <Volume2 size={16} /> : <VolumeX size={16} />}
          </button>
          
          <div className="text-left text-xs">
            <span className="text-slate-500 block font-semibold">Ambient Sound</span>
            <select
              value={ambientTheme}
              onChange={(e) => setAmbientTheme(e.target.value as any)}
              className="bg-slate-50 hover:bg-slate-100 text-slate-800 font-bold border border-slate-200 rounded-xl px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer text-xs mt-1 transition-all block w-full"
              aria-label="Select ambient audio theme"
            >
              <option value="Ocean Waves" className="bg-white text-slate-800 font-semibold">Ocean Waves (Live Synthesized) 🌊</option>
              <option value="Rainfall" className="bg-white text-slate-800 font-semibold">Rainfall (Live Synthesized) 🌧️</option>
              <option value="Binaural Beats" className="bg-white text-slate-800 font-semibold">Binaural Focus Beats (Theta Waves) 🧠</option>
            </select>
          </div>
        </div>

        <Link
          href="/"
          className="bg-primary hover:bg-primary/90 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-all focus:ring-2 focus:ring-primary outline-none shadow-md"
        >
          Return to Dashboard
        </Link>
      </div>
    </div>
  );
}
