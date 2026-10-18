'use client';

import React, { useState } from 'react';
import { usePomodoro, PomodoroMode } from '@/hooks/usePomodoro';
import { Play, Square, Settings, Award, Flame, Coffee, Check, HelpCircle, X, ChevronUp, ChevronDown, Volume2, VolumeX } from 'lucide-react';
import { motion } from 'framer-motion';

export default function PomodoroWidget() {
  const {
    pomodoroMode,
    timeLeft,
    studyDuration,
    breakDuration,
    playCredits,
    dailyWarmupUsed,
    isMuted,
    toggleMute,
    breakMusicTrack,
    setBreakMusicTrack,
    startStudySession,
    stopSession,
    useDailyWarmup,
    updateSettings
  } = usePomodoro();

  const [expanded, setExpanded] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const widgetRef = React.useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [panelXAlign, setPanelXAlign] = useState<'left-0' | 'right-0'>('right-0');
  const [panelYAlign, setPanelYAlign] = useState<'top-0' | 'bottom-0'>('bottom-0');

  const handleExpand = () => {
    if (isDragging) return;
    if (widgetRef.current) {
      const rect = widgetRef.current.getBoundingClientRect();
      const screenWidth = window.innerWidth;
      const screenHeight = window.innerHeight;
      
      const xAlign = (rect.left + rect.width / 2) < (screenWidth / 2) ? 'left-0' : 'right-0';
      const yAlign = (rect.top + rect.height / 2) < (screenHeight / 2) ? 'top-0' : 'bottom-0';
      
      setPanelXAlign(xAlign);
      setPanelYAlign(yAlign);
    }
    setExpanded(true);
  };

  // Format time (seconds to MM:SS)
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainder.toString().padStart(2, '0')}`;
  };

  const getStatusText = () => {
    if (pomodoroMode === 'study') return 'Study Focus Session';
    if (pomodoroMode === 'break') return 'Relaxation Break Time';
    return 'Ready to Focus';
  };

  const getModeColor = () => {
    if (pomodoroMode === 'study') return 'text-emerald-600 font-extrabold';
    if (pomodoroMode === 'break') return 'text-sky-600 font-extrabold';
    return 'text-slate-500 font-bold';
  };

  const getModeBg = () => {
    if (pomodoroMode === 'study') return 'bg-emerald-50 border-emerald-200/60';
    if (pomodoroMode === 'break') return 'bg-sky-50 border-sky-200/60';
    return 'bg-slate-50 border-slate-200/60';
  };

  const handlePresetSelect = (study: number, breakDur: number) => {
    updateSettings(study, breakDur);
    setShowSettings(false);
  };

  const handleWarmup = () => {
    useDailyWarmup();
  };

  const renderPanelContent = () => (
    <>
      {/* Header */}
      <div className="flex justify-between items-center mb-4 border-b border-slate-100 pb-2">
        <div className="flex items-center gap-1.5">
          <Flame size={16} className="text-amber-500 animate-pulse" />
          <h3 className="text-xs font-black text-slate-800 tracking-wide">Focus Co-pilot</h3>
        </div>
        <div className="flex items-center gap-1">
          {pomodoroMode === 'break' && (
            <button
              onClick={toggleMute}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all cursor-pointer"
              title={isMuted ? "Unmute Break Music" : "Mute Break Music"}
            >
              {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} className="animate-pulse text-secondary" />}
            </button>
          )}
          <button
            onClick={() => setShowSettings(!showSettings)}
            className={`p-1.5 rounded-lg transition-all hover:bg-slate-100 cursor-pointer ${showSettings ? 'text-primary' : 'text-slate-400 hover:text-slate-700'}`}
            title="Timer Settings"
          >
            <Settings size={14} />
          </button>
          <button
            onClick={() => { setExpanded(false); setShowSettings(false); }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 transition-all hover:bg-slate-100 cursor-pointer"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {showSettings ? (
        /* Settings Panel */
        <div className="space-y-4 py-2 animate-in fade-in duration-200">
          <div className="space-y-2">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Select Session Rhythm</span>
            <button
              onClick={() => handlePresetSelect(30, 10)}
              className={`w-full flex items-center justify-between text-xs px-3.5 py-2.5 rounded-xl border transition-all cursor-pointer ${
                studyDuration === 30
                  ? 'bg-primary/10 border-primary text-primary font-bold'
                  : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <span>Serene (Recommended)</span>
              <span className="text-[10px] opacity-80 font-mono">30m study / 10m break</span>
            </button>
            <button
              onClick={() => handlePresetSelect(25, 5)}
              className={`w-full flex items-center justify-between text-xs px-3.5 py-2.5 rounded-xl border transition-all cursor-pointer ${
                studyDuration === 25
                  ? 'bg-primary/10 border-primary text-primary font-bold'
                  : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <span>Classic Pomodoro</span>
              <span className="text-[10px] opacity-80 font-mono">25m study / 5m break</span>
            </button>
            <button
              onClick={() => handlePresetSelect(50, 15)}
              className={`w-full flex items-center justify-between text-xs px-3.5 py-2.5 rounded-xl border transition-all cursor-pointer ${
                studyDuration === 50
                  ? 'bg-primary/10 border-primary text-primary font-bold'
                  : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <span>Deep Focus Cycle</span>
              <span className="text-[10px] opacity-80 font-mono">50m study / 15m break</span>
            </button>
          </div>

          <div className="pt-3.5 border-t border-slate-100 space-y-2 text-left">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Break Music Track</span>
            <select
              value={breakMusicTrack}
              onChange={(e) => setBreakMusicTrack(e.target.value as any)}
              className="w-full bg-slate-50 text-slate-700 font-bold border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer text-xs transition-all block"
              aria-label="Select break music track"
            >
              <option value="Forest Synth">Calming Forest Synth 🌲</option>
              <option value="Lofi Study">Relaxing Lofi Study 🎵</option>
              <option value="Ocean Waves">Ocean Wave Synth 🌊</option>
              <option value="Binaural Beats">Binaural Focus Beats 🧠</option>
            </select>
          </div>
        </div>
      ) : (
        /* Main Timer Panel */
        <div className="space-y-4">
          {/* Mode & Timer Badge */}
          <div className={`p-4 rounded-2xl border text-center ${getModeBg()}`}>
            <span className={`text-[10px] font-black uppercase tracking-widest block mb-1 ${getModeColor()}`}>
              {getStatusText()}
            </span>
            <span className="text-3xl font-black font-mono tracking-tight text-slate-800 block">
              {formatTime(timeLeft || (pomodoroMode === 'idle' ? studyDuration * 60 : 0))}
            </span>
          </div>

          {/* Controls */}
          <div className="flex gap-2">
            {pomodoroMode === 'idle' ? (
              <button
                onClick={() => startStudySession()}
                className="flex-1 flex items-center justify-center gap-1.5 bg-primary hover:bg-primary/90 text-white font-bold text-xs py-3 rounded-xl transition-all cursor-pointer shadow shadow-primary/20"
              >
                <Play size={12} fill="white" />
                Start Study Timer
              </button>
            ) : (
              <>
                <button
                  onClick={stopSession}
                  className="flex-1 flex items-center justify-center gap-1.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs py-3 rounded-xl transition-all cursor-pointer"
                >
                  <Square size={12} fill="white" />
                  Stop Focus
                </button>
              </>
            )}
          </div>

          {/* Stats & Free Warmup */}
          <div className="bg-slate-50/70 border border-slate-200/60 p-3.5 rounded-2xl space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-600 font-semibold">Game Play Credits</span>
              <span className="text-sky-600 font-black">{Math.ceil(playCredits / 60)} mins</span>
            </div>

            {!dailyWarmupUsed && (
              <button
                onClick={handleWarmup}
                className="w-full flex items-center justify-center gap-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200/85 text-[10px] font-bold py-2 rounded-xl transition-all cursor-pointer mt-1"
              >
                <Award size={12} />
                Claim 5m Daily Play Warmup 🎁
              </button>
            )}
          </div>

          <div className="text-[9px] text-slate-500 text-center leading-relaxed">
            {pomodoroMode === 'study'
              ? '🔒 Games & Leisure rooms are currently locked to maximize focus rhythm.'
              : '🔓 Complete focus sessions to earn relaxation break time.'}
          </div>
        </div>
      )}
    </>
  );

  return (
    <>
      <motion.div
        ref={widgetRef}
        drag={!expanded}
        dragListener={!expanded}
        dragMomentum={false}
        onDragStart={() => setIsDragging(true)}
        onDragEnd={() => {
          setTimeout(() => setIsDragging(false), 50);
        }}
        className="fixed top-16 right-4 md:top-auto md:bottom-6 md:right-6 z-50 select-none w-14 h-14 cursor-grab active:cursor-grabbing"
      >
        {/* Minimize Circular Badge */}
        {!expanded ? (
          <button
            onClick={handleExpand}
            className={`w-14 h-14 rounded-full flex flex-col items-center justify-center cursor-pointer shadow-lg transition-all duration-300 hover:scale-105 border ${
              pomodoroMode === 'study'
                ? 'bg-primary/95 text-white border-primary shadow-primary/20 animate-pulse'
                : pomodoroMode === 'break'
                ? 'bg-secondary/95 text-white border-secondary shadow-secondary/20 animate-bounce'
                : 'bg-slate-900/90 text-white border-card-border hover:bg-slate-800'
            }`}
            title="Open Focus Pomodoro Panel"
          >
            {pomodoroMode !== 'idle' ? (
              <span className="text-[10px] font-black tracking-tight">{formatTime(timeLeft)}</span>
            ) : (
              <Flame size={20} className="text-amber-500 animate-pulse" />
            )}
            <span className="text-[7px] uppercase font-bold tracking-wider mt-0.5">
              {pomodoroMode === 'idle' ? 'Focus' : pomodoroMode}
            </span>
          </button>
        ) : (
          /* Desktop Expanded Panel - Only visible on screens >= 640px (sm) */
          <div className={`hidden sm:block glass-panel w-80 rounded-3xl p-5 shadow-2xl absolute border border-slate-200/80 overflow-hidden bg-white/95 backdrop-blur-xl animate-in fade-in duration-300 z-50 text-slate-800 ${panelXAlign} ${panelYAlign}`}>
            {renderPanelContent()}
          </div>
        )}
      </motion.div>

      {/* Mobile Expanded Panel & Backdrop - Only visible on screens < 640px (sm) */}
      {expanded && (
        <div className="sm:hidden">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-40"
            onClick={() => { setExpanded(false); setShowSettings(false); }}
          />
          {/* Mobile Panel Card - Centered relative to viewport, ignoring parent drag coordinates */}
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-[320px] glass-panel rounded-3xl p-5 shadow-2xl border border-slate-200/80 overflow-hidden bg-white/95 backdrop-blur-xl animate-in fade-in duration-300 z-50 text-slate-800">
            {renderPanelContent()}
          </div>
        </div>
      )}
    </>
  );
}
