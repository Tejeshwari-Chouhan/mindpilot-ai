'use client';

import React, { useState, useEffect } from 'react';
import { Gamepad2, Sparkles, RefreshCw, Trophy, Brain, Heart, ArrowLeft, Sun, MessageSquare, Tv, Camera, Cloud, Smile, Coffee, Flame, Compass } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useStudentData } from '@/hooks/useStudentData';
import { usePomodoro } from '@/hooks/usePomodoro';

export default function RelaxRoomPage() {
  const [activeTab, setActiveTab] = useState<'bubbles' | 'stack' | 'memory'>('bubbles');
  const { addXP } = useStudentData();
  const { pomodoroMode, timeLeft, playCredits, deductPlayCredit, startStudySession, useDailyWarmup, dailyWarmupUsed } = usePomodoro();

  // Deduct play credits when actively playing in idle mode
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

  // ==========================================
  // GAME 1: ZEN BUBBLE POPPER
  // ==========================================
  const [bubbles, setBubbles] = useState<{ id: number; x: number; y: number; size: number; text: string; popped: boolean }[]>([]);
  const [popCount, setPopCount] = useState(0);
  const [lastAffirmation, setLastAffirmation] = useState('Tap a bubble to release peace.');

  const affirmations = [
    "Progress over perfection.",
    "Your worth is not defined by an examination score.",
    "One concept, one step at a time.",
    "Inhale peace, exhale comparison.",
    "It is completely okay to rest today.",
    "You have survived 100% of your hardest days.",
    "Mock scores show concept gaps, not your potential.",
    "Be kind to your mind.",
    "IIT or not, you will find your unique path.",
    "Breathing in, I calm my body. Breathing out, I smile.",
    "You are capable of doing hard things."
  ];

  // Spawn bubbles
  useEffect(() => {
    if (activeTab !== 'bubbles') return;

    const interval = setInterval(() => {
      setBubbles((prev) => {
        // Filter out bubbles that have drifted off screen
        const filtered = prev.filter(b => b.y > -20 && !b.popped);
        if (filtered.length >= 8) return filtered;

        const newBubble = {
          id: Date.now() + Math.random(),
          x: Math.random() * 85 + 5, // percentage
          y: 110, // start below screen
          size: Math.random() * 40 + 50, // width/height in px
          text: affirmations[Math.floor(Math.random() * affirmations.length)],
          popped: false
        };

        return [...filtered, newBubble];
      });
    }, 1500);

    return () => clearInterval(interval);
  }, [activeTab]);

  // Drift bubbles upwards (Slower and calmer drift speed)
  useEffect(() => {
    if (activeTab !== 'bubbles') return;

    const interval = setInterval(() => {
      setBubbles((prev) => 
        prev.map(b => ({ ...b, y: b.y - 0.18 }))
      );
    }, 50);

    return () => clearInterval(interval);
  }, [activeTab]);

  const handlePop = (id: number, text: string) => {
    setBubbles(prev => 
      prev.filter(b => b.id !== id)
    );
    setPopCount(p => p + 1);
    setLastAffirmation(text);
  };

  // ==========================================
  // GAME 2: FOCUS STACKER (ZEN STACK)
  // ==========================================
  const [stack, setStack] = useState<{ width: number; x: number }[]>([{ width: 60, x: 20 }]);
  const [currentBlock, setCurrentBlock] = useState({ width: 60, x: 0, direction: 1 });
  const [gameActive, setGameActive] = useState(false);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  // Animate current moving block
  useEffect(() => {
    if (!gameActive || gameOver || activeTab !== 'stack') return;

    const interval = setInterval(() => {
      setCurrentBlock((prev) => {
        let nextX = prev.x + prev.direction * 2;
        let nextDir = prev.direction;
        if (nextX > 100 - prev.width || nextX < 0) {
          nextDir = -prev.direction;
          nextX = prev.x + nextDir * 2;
        }
        return { ...prev, x: nextX, direction: nextDir };
      });
    }, 50);

    return () => clearInterval(interval);
  }, [gameActive, gameOver, activeTab]);

  const handlePlaceBlock = () => {
    if (gameOver) return;
    if (!gameActive) {
      setGameActive(true);
      return;
    }

    const lastBlock = stack[stack.length - 1];
    
    // Calculate overlap
    const left1 = currentBlock.x;
    const right1 = currentBlock.x + currentBlock.width;
    const left2 = lastBlock.x;
    const right2 = lastBlock.x + lastBlock.width;

    const overlapLeft = Math.max(left1, left2);
    const overlapRight = Math.min(right1, right2);
    const overlapWidth = overlapRight - overlapLeft;

    if (overlapWidth <= 0) {
      setGameOver(true);
      setGameActive(false);
      return;
    }

    // Stack successfully
    const newBlock = { width: overlapWidth, x: overlapLeft };
    setStack(prev => [...prev, newBlock]);
    setScore(s => s + 1);
    
    // Set next moving block starting from 0
    setCurrentBlock({
      width: overlapWidth,
      x: 0,
      direction: 1
    });
  };

  const resetStackGame = () => {
    setStack([{ width: 60, x: 20 }]);
    setCurrentBlock({ width: 60, x: 0, direction: 1 });
    setScore(0);
    setGameOver(false);
    setGameActive(false);
  };

  // ==========================================
  // GAME 3: ZEN MEMORY MATCH
  // ==========================================
  const iconPool = [
    { icon: Heart, type: 'heart' },
    { icon: Brain, type: 'brain' },
    { icon: Sun, type: 'sun' },
    { icon: Sparkles, type: 'sparkles' },
    { icon: Cloud, type: 'cloud' },
    { icon: Smile, type: 'smile' },
    { icon: Coffee, type: 'coffee' },
    { icon: Flame, type: 'flame' },
    { icon: Compass, type: 'compass' },
    { icon: Trophy, type: 'trophy' }
  ];

  const [cards, setCards] = useState<{ id: number; icon: any; type: string; matched: boolean; flipped: boolean }[]>([]);
  const [selectedCards, setSelectedCards] = useState<number[]>([]);
  const [memoryMatches, setMemoryMatches] = useState(0);

  // Shuffle on mounting
  useEffect(() => {
    if (activeTab === 'memory') {
      shuffleCards();
    }
  }, [activeTab]);

  const shuffleCards = () => {
    // Fisher-Yates shuffle function
    const shuffleArray = <T,>(arr: T[]): T[] => {
      const copy = [...arr];
      for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
      }
      return copy;
    };

    // Pick 4 random icons from the 10-icon pool using a true shuffle
    const shuffledPool = shuffleArray(iconPool);
    const chosenTypes = shuffledPool.slice(0, 4);
    
    // Duplicate to make 8 cards (4 pairs)
    const cardDeck: any[] = [];
    chosenTypes.forEach((item, index) => {
      cardDeck.push({ id: index * 2, icon: item.icon, type: item.type, matched: false, flipped: false });
      cardDeck.push({ id: index * 2 + 1, icon: item.icon, type: item.type, matched: false, flipped: false });
    });
    
    // Shuffle the deck completely
    const shuffledDeck = shuffleArray(cardDeck).map(c => ({
      ...c,
      id: Math.random() // Unique random id key to force React re-render
    }));
      
    setCards(shuffledDeck);
    setSelectedCards([]);
    setMemoryMatches(0);
  };

  const handleCardClick = (idx: number) => {
    if (selectedCards.length >= 2 || cards[idx].flipped || cards[idx].matched) return;

    // Flip card
    const updatedCards = [...cards];
    updatedCards[idx].flipped = true;
    setCards(updatedCards);

    const newSelected = [...selectedCards, idx];
    setSelectedCards(newSelected);

    if (newSelected.length === 2) {
      const first = cards[newSelected[0]];
      const second = cards[newSelected[1]];

      if (first.type === second.type) {
        // Matched
        setTimeout(() => {
          setCards(prev => 
            prev.map((c, i) => i === newSelected[0] || i === newSelected[1] ? { ...c, matched: true } : c)
          );
          setSelectedCards([]);
          setMemoryMatches(m => m + 1);
        }, 600);
      } else {
        // Mismatched: flip back
        setTimeout(() => {
          setCards(prev => 
            prev.map((c, i) => i === newSelected[0] || i === newSelected[1] ? { ...c, flipped: false } : c)
          );
          setSelectedCards([]);
        }, 1200);
      }
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 max-w-4xl mx-auto py-4" role="main" aria-label="Relaxation Games Room">
      {/* Header */}
      <div className="glass-panel bg-white/70 border border-slate-200/50 p-5 rounded-3xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-md">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-foreground flex items-center gap-2">
            <Gamepad2 size={24} className="text-primary" />
            Relaxation Room
          </h1>
          <p className="text-xs text-text-muted mt-1 leading-relaxed">
            Decompress your amygdala. Low-stress micro-games to reset focus, quiet racing thoughts, and clear exam anxiety.
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

      {/* Game Content Container */}
      <div className="relative">
        {(() => {
          const isLocked = pomodoroMode === 'study' || (pomodoroMode !== 'break' && playCredits <= 0);
          return isLocked && (
            <div className="absolute inset-0 z-30 backdrop-blur-md bg-slate-950/80 rounded-3xl border border-card-border/50 flex flex-col items-center justify-center p-8 text-center min-h-[480px]">
              <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-white shadow-xl shadow-primary/20 mb-4 animate-pulse">
                <Brain size={28} />
              </div>
              
              {pomodoroMode === 'study' ? (
                <div className="space-y-3 max-w-sm">
                  <h2 className="text-lg font-black text-white">Focus Session Active 🔒</h2>
                  <p className="text-xs text-slate-200 leading-relaxed font-medium">
                    You are currently in study focus mode. To keep your brain in rhythm, games will unlock when your break starts!
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
                    Games can become addictive during preparation. To play, claim your Daily 5m Warmup, or start a Pomodoro Study Focus Session to earn break play time!
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

                  <div className="bg-white/10 border border-card-border/40 p-3 rounded-2xl text-[11px] text-slate-300 font-medium mt-2">
                    Complete study sessions to earn game break credits.
                  </div>
                </div>
              )}
            </div>
          );
        })()}

        {/* Tabs Selector */}
        <div className="flex gap-2 bg-white/5 p-1 rounded-2xl border border-card-border w-fit mx-auto mb-6" role="tablist">
        <button
          role="tab"
          aria-selected={activeTab === 'bubbles'}
          onClick={() => setActiveTab('bubbles')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all focus:outline-none cursor-pointer ${
            activeTab === 'bubbles' 
              ? 'bg-primary text-white shadow-md' 
              : 'text-text-muted hover:text-foreground'
          }`}
        >
          Zen Bubble Popper
        </button>
        <button
          role="tab"
          aria-selected={activeTab === 'stack'}
          onClick={() => setActiveTab('stack')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all focus:outline-none cursor-pointer ${
            activeTab === 'stack' 
              ? 'bg-secondary text-white shadow-md' 
              : 'text-text-muted hover:text-foreground'
          }`}
        >
          Focus Stacker
        </button>
        <button
          role="tab"
          aria-selected={activeTab === 'memory'}
          onClick={() => setActiveTab('memory')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all focus:outline-none cursor-pointer ${
            activeTab === 'memory' 
              ? 'bg-accent text-white shadow-md' 
              : 'text-text-muted hover:text-foreground'
          }`}
        >
          Zen Memory Match
        </button>
      </div>
      <div className="min-h-[440px] flex flex-col justify-between">
        <AnimatePresence mode="wait">
          {/* GAME 1: ZEN BUBBLE POPPER */}
          {activeTab === 'bubbles' && (
            <motion.div
              key="bubbles"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="glass-panel rounded-3xl p-6 flex flex-col items-center justify-between min-h-[440px] relative overflow-hidden bg-gradient-to-b from-primary/5 via-transparent to-transparent"
            >
              <div className="w-full flex justify-between items-center text-xs text-text-muted z-10">
                <span className="font-semibold">Tap floating bubbles to pop them & release calm thoughts</span>
                <span className="font-bold flex items-center gap-1"><Trophy size={14} className="text-secondary" /> Pops: {popCount}</span>
              </div>

              {/* Bubble drifting canvas */}
              <div className="absolute inset-0 z-10 overflow-hidden pointer-events-none">
                {bubbles.map((bubble) => (
                  <button
                    key={bubble.id}
                    onClick={() => handlePop(bubble.id, bubble.text)}
                    style={{
                      left: `${bubble.x}%`,
                      top: `${bubble.y}%`,
                      width: `${bubble.size}px`,
                      height: `${bubble.size}px`
                    }}
                    className="absolute rounded-full border-2 border-primary/20 bg-primary/10 backdrop-blur-[2px] shadow-[0_0_15px_rgba(99,102,241,0.2)] flex items-center justify-center cursor-pointer transition-transform hover:scale-105 select-none focus:outline-none pointer-events-auto z-20"
                  >
                    <span className="w-3 h-3 rounded-full bg-white/20 absolute top-2 left-2"></span>
                  </button>
                ))}
              </div>

              {/* Dynamic Affirmation Banner */}
              <div className="z-10 bg-slate-900/80 border border-card-border/80 px-6 py-4 rounded-2xl max-w-md text-center shadow-lg backdrop-blur-md mt-auto">
                <span className="text-[10px] text-primary uppercase font-bold tracking-widest block mb-1">
                  Co-pilot Whisper
                </span>
                <p className="text-sm font-semibold text-white italic leading-relaxed">
                  "{lastAffirmation}"
                </p>
              </div>
            </motion.div>
          )}

          {/* GAME 2: FOCUS STACKER */}
          {activeTab === 'stack' && (
            <motion.div
              key="stack"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="glass-panel rounded-3xl p-6 flex flex-col items-center justify-between min-h-[440px] bg-gradient-to-b from-secondary/5 via-transparent to-transparent"
            >
              <div className="w-full flex justify-between items-center text-xs text-text-muted">
                <span className="font-semibold">Drop blocks perfectly on top of each other. Restores timing focus.</span>
                <span className="font-bold">Score: {score}</span>
              </div>

              {/* Stacking tower workspace */}
              <div 
                onClick={handlePlaceBlock}
                className="w-full max-w-[320px] h-64 bg-black/40 border border-card-border/80 rounded-2xl relative overflow-hidden cursor-pointer flex flex-col justify-end p-2 select-none"
              >
                {/* Score badge */}
                {!gameActive && !gameOver && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-center p-4 z-10 rounded-2xl">
                    <p className="text-xs text-foreground font-bold leading-relaxed">
                      Tap anywhere inside the box to drop the block. <br />
                      <span className="text-secondary font-black block mt-2 animate-pulse">Click to Start Stacking</span>
                    </p>
                  </div>
                )}

                {gameOver && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 text-center p-4 z-10 rounded-2xl">
                    <span className="text-error font-black text-sm uppercase block mb-1">Out of Focus</span>
                    <p className="text-xs text-text-muted">Tower collapsed. Final Score: {score}</p>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        resetStackGame();
                      }}
                      className="bg-secondary text-white text-[10px] font-bold px-3 py-1.5 rounded-lg mt-3"
                    >
                      Try Again
                    </button>
                  </div>
                )}

                {/* Blocks tower */}
                <div className="space-y-[2px] w-full flex flex-col items-center">
                  {/* Moving block */}
                  {gameActive && !gameOver && (
                    <div 
                      style={{
                        width: `${currentBlock.width}%`,
                        marginLeft: `${currentBlock.x}%`,
                        marginRight: `${100 - currentBlock.width - currentBlock.x}%`
                      }}
                      className="h-4 bg-gradient-to-r from-secondary to-accent rounded shrink-0 shadow-md transition-all duration-75"
                    />
                  )}

                  {/* Stacked tower blocks (rendered bottom to top) */}
                  {[...stack].reverse().map((block, idx) => (
                    <div 
                      key={idx}
                      style={{
                        width: `${block.width}%`,
                        marginLeft: `${block.x}%`,
                        marginRight: `${100 - block.width - block.x}%`
                      }}
                      className={`h-4 rounded shrink-0 ${
                        idx === 0 
                          ? 'bg-secondary' 
                          : idx % 2 === 0 
                          ? 'bg-primary/80' 
                          : 'bg-accent/80'
                      }`}
                    />
                  ))}
                </div>
              </div>

              <div className="text-[10px] text-text-muted flex items-center gap-1 mt-2">
                <Brain size={12} className="text-secondary" />
                <span>Aligning blocks matches rhythmic brain waves (Alpha frequencies) to settle anxiety.</span>
              </div>
            </motion.div>
          )}

          {/* GAME 3: ZEN MEMORY MATCH */}
          {activeTab === 'memory' && (
            <motion.div
              key="memory"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="glass-panel rounded-3xl p-6 flex flex-col items-center justify-between min-h-[440px] bg-gradient-to-b from-accent/5 via-transparent to-transparent"
            >
              <div className="w-full flex justify-between items-center text-xs text-text-muted">
                <span className="font-semibold">Match pairs of calming symbols. Exercises focus.</span>
                <span className="font-bold flex items-center gap-1.5">
                  Matches: {memoryMatches}/4
                  <button onClick={shuffleCards} className="p-1 rounded hover:bg-white/5" title="Restart Game">
                    <RefreshCw size={12} />
                  </button>
                </span>
              </div>

              {/* Cards Grid */}
              <div className="grid grid-cols-4 gap-3 max-w-[280px] w-full my-auto py-4">
                {cards.map((card, idx) => {
                  const Icon = card.icon;
                  const showFront = card.flipped || card.matched;
                  
                  return (
                    <button
                      key={card.id}
                      onClick={() => handleCardClick(idx)}
                      style={{ height: '70px' }}
                      className={`rounded-xl border transition-all duration-300 flex items-center justify-center cursor-pointer select-none focus:outline-none ${
                        showFront 
                          ? 'bg-accent/15 border-accent text-accent scale-105 shadow-md shadow-accent/10' 
                          : 'bg-white/5 border-card-border hover:bg-white/10 text-text-muted'
                      }`}
                      aria-label={`Memory card ${idx + 1}`}
                    >
                      {showFront ? (
                        <Icon size={24} className={card.matched ? 'animate-pulse' : ''} />
                      ) : (
                        <span className="font-black text-sm text-text-muted/50">?</span>
                      )}
                    </button>
                  );
                })}
              </div>

              {memoryMatches === 4 ? (
                <div className="bg-success/10 border border-success/20 text-success rounded-xl p-3 text-xs flex items-center gap-2">
                  <Sun size={16} className="animate-spin" />
                  <span>Excellent! Memory match complete. Taking a cognitive break resets exam exhaustion.</span>
                </div>
              ) : (
                <div className="text-[10px] text-text-muted flex items-center gap-1 mt-2">
                  <Heart size={12} className="text-accent" />
                  <span>Matching patterns quietens the threat-sensing amygdala and centers focus.</span>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      </div>

      {/* Navigation shortcuts to separate Zen features */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
        <Link 
          href="/zen-streams" 
          className="glass-panel p-4 rounded-xl flex items-center gap-3 hover:bg-white/5 transition-all text-xs font-semibold focus:ring-2 focus:ring-primary outline-none border border-secondary/20"
        >
          <Tv size={20} className="text-secondary shrink-0" />
          <div className="text-left">
            <span className="block text-foreground font-bold">Zen Streams 🎵</span>
            <span className="text-[10px] text-text-muted font-normal block mt-0.5">Tune into relaxing lofi study rooms & nature sounds</span>
          </div>
        </Link>

        <Link 
          href="/zen-face-cam" 
          className="glass-panel p-4 rounded-xl flex items-center gap-3 hover:bg-white/5 transition-all text-xs font-semibold focus:ring-2 focus:ring-primary outline-none border border-primary/20"
        >
          <Camera size={20} className="text-primary shrink-0" />
          <div className="text-left">
            <span className="block text-foreground font-bold">Zen Face Cam 🤳</span>
            <span className="text-[10px] text-text-muted font-normal block mt-0.5">Funny filters & pick-and-eat mood upgrades</span>
          </div>
        </Link>
      </div>
    </div>
  );
}
