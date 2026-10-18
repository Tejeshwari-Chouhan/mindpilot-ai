'use client';

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';

export type PomodoroMode = 'idle' | 'study' | 'break';

export const MUSIC_TRACKS = {
  'Forest Synth': 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3',
  'Lofi Study': 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
  'Ocean Waves': 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
  'Binaural Beats': 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'
};

export type MusicTrackKey = keyof typeof MUSIC_TRACKS;

interface PomodoroContextProps {
  pomodoroMode: PomodoroMode;
  timeLeft: number; // in seconds
  studyDuration: number; // in minutes
  breakDuration: number; // in minutes
  playCredits: number; // in seconds
  dailyWarmupUsed: boolean;
  isMuted: boolean;
  breakMusicTrack: MusicTrackKey;
  toggleMute: () => void;
  setBreakMusicTrack: (track: MusicTrackKey) => void;
  startStudySession: (studyMin?: number, breakMin?: number) => void;
  startBreakSession: () => void;
  stopSession: () => void;
  deductPlayCredit: (seconds: number) => void;
  useDailyWarmup: () => boolean;
  updateSettings: (studyMin: number, breakMin: number) => void;
}

const PomodoroContext = createContext<PomodoroContextProps | undefined>(undefined);

export function PomodoroProvider({ children }: { children: React.ReactNode }) {
  const [pomodoroMode, setPomodoroMode] = useState<PomodoroMode>('idle');
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [studyDuration, setStudyDuration] = useState<number>(30);
  const [breakDuration, setBreakDuration] = useState<number>(10);
  const [playCredits, setPlayCredits] = useState<number>(0);
  const [dailyWarmupUsed, setDailyWarmupUsed] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [breakMusicTrack, setBreakMusicTrack] = useState<MusicTrackKey>('Forest Synth');
  const [mounted, setMounted] = useState<boolean>(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize Audio
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedTrack = localStorage.getItem('mindpilot-pomo-music') as MusicTrackKey;
      const initialSrc = savedTrack && MUSIC_TRACKS[savedTrack] ? MUSIC_TRACKS[savedTrack] : MUSIC_TRACKS['Forest Synth'];
      
      audioRef.current = new Audio(initialSrc);
      audioRef.current.loop = true;
      audioRef.current.volume = 0.20; // Played softly in background
      if (savedTrack) setBreakMusicTrack(savedTrack);
    }
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  // Update audio source when selected track changes
  useEffect(() => {
    if (!mounted || !audioRef.current) return;
    
    const wasPlaying = !audioRef.current.paused;
    audioRef.current.src = MUSIC_TRACKS[breakMusicTrack];
    localStorage.setItem('mindpilot-pomo-music', breakMusicTrack);
    
    if (wasPlaying && pomodoroMode === 'break') {
      audioRef.current.play().catch(() => {});
    }
  }, [breakMusicTrack, mounted]);

  // Initialize state from localStorage
  useEffect(() => {
    const savedMode = localStorage.getItem('mindpilot-pomo-mode') as PomodoroMode || 'idle';
    const savedEndTime = localStorage.getItem('mindpilot-pomo-endtime');
    const savedStudyDur = localStorage.getItem('mindpilot-pomo-study-dur');
    const savedBreakDur = localStorage.getItem('mindpilot-pomo-break-dur');
    const savedCredits = localStorage.getItem('mindpilot-pomo-credits');
    const savedWarmupDate = localStorage.getItem('mindpilot-pomo-warmup-date');

    const todayStr = new Date().toISOString().split('T')[0];

    if (savedStudyDur) setStudyDuration(parseInt(savedStudyDur));
    if (savedBreakDur) setBreakDuration(parseInt(savedBreakDur));
    if (savedCredits) setPlayCredits(parseInt(savedCredits));
    if (savedWarmupDate === todayStr) setDailyWarmupUsed(true);

    if (savedMode !== 'idle' && savedEndTime) {
      const endTimeMs = parseInt(savedEndTime);
      const nowMs = Date.now();
      const diffSec = Math.max(0, Math.ceil((endTimeMs - nowMs) / 1000));

      if (diffSec > 0) {
        setPomodoroMode(savedMode);
        setTimeLeft(diffSec);
        
        // Start break song automatically if break was active
        if (savedMode === 'break' && audioRef.current) {
          audioRef.current.play().catch(() => {});
        }
      } else {
        // Timer expired while away
        if (savedMode === 'study') {
          // Study session finished, trigger break mode & award credits
          setPomodoroMode('break');
          const breakMin = savedBreakDur ? parseInt(savedBreakDur) : 10;
          const breakSec = breakMin * 60;
          setTimeLeft(breakSec);
          localStorage.setItem('mindpilot-pomo-mode', 'break');
          localStorage.setItem('mindpilot-pomo-endtime', String(Date.now() + breakSec * 1000));
          
          const existingCredits = savedCredits ? parseInt(savedCredits) : 0;
          const newCredits = existingCredits + breakSec;
          setPlayCredits(newCredits);
          localStorage.setItem('mindpilot-pomo-credits', String(newCredits));

          // Play break song
          if (audioRef.current) {
            audioRef.current.play().catch(() => {});
          }
        } else {
          // Break finished
          setPomodoroMode('idle');
          setTimeLeft(0);
          localStorage.setItem('mindpilot-pomo-mode', 'idle');
          localStorage.removeItem('mindpilot-pomo-endtime');
        }
      }
    }
    setMounted(true);
  }, []);

  // Timer Tick Loop
  useEffect(() => {
    if (!mounted || pomodoroMode === 'idle') {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      const savedEndTime = localStorage.getItem('mindpilot-pomo-endtime');
      if (!savedEndTime) {
        setPomodoroMode('idle');
        setTimeLeft(0);
        return;
      }

      const endTimeMs = parseInt(savedEndTime);
      const nowMs = Date.now();
      const diffSec = Math.max(0, Math.ceil((endTimeMs - nowMs) / 1000));

      if (diffSec > 0) {
        setTimeLeft(diffSec);
      } else {
        // Timer Completed
        if (timerRef.current) clearInterval(timerRef.current);
        
        if (pomodoroMode === 'study') {
          // Award play credits and start break
          const breakSec = breakDuration * 60;
          setPomodoroMode('break');
          setTimeLeft(breakSec);
          setPlayCredits(prev => {
            const next = prev + breakSec;
            localStorage.setItem('mindpilot-pomo-credits', String(next));
            return next;
          });
          localStorage.setItem('mindpilot-pomo-mode', 'break');
          localStorage.setItem('mindpilot-pomo-endtime', String(Date.now() + breakSec * 1000));
          
          // Start the refreshing song automatically
          if (audioRef.current) {
            audioRef.current.play().catch(() => {});
          }

          // Play a serene chime alert sound
          try {
            const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
            osc.frequency.setValueAtTime(880.00, audioCtx.currentTime + 0.15); // A5
            gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.6);
            osc.start();
            osc.stop(audioCtx.currentTime + 0.6);
          } catch (e) {
            console.log("Audio not supported or blocked by user interaction");
          }
        } else {
          // Break finished
          setPomodoroMode('idle');
          setTimeLeft(0);
          localStorage.setItem('mindpilot-pomo-mode', 'idle');
          localStorage.removeItem('mindpilot-pomo-endtime');
          
          // Stop the break song
          if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
          }
        }
      }
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [pomodoroMode, breakDuration, mounted]);

  const toggleMute = () => {
    setIsMuted(prev => {
      const next = !prev;
      if (audioRef.current) {
        audioRef.current.muted = next;
      }
      return next;
    });
  };

  const startStudySession = (studyMin: number = studyDuration, breakMin: number = breakDuration) => {
    const studySec = studyMin * 60;
    setPomodoroMode('study');
    setTimeLeft(studySec);
    localStorage.setItem('mindpilot-pomo-mode', 'study');
    localStorage.setItem('mindpilot-pomo-endtime', String(Date.now() + studySec * 1000));
  };

  const startBreakSession = () => {
    const breakSec = breakDuration * 60;
    setPomodoroMode('break');
    setTimeLeft(breakSec);
    localStorage.setItem('mindpilot-pomo-mode', 'break');
    localStorage.setItem('mindpilot-pomo-endtime', String(Date.now() + breakSec * 1000));

    // Play break song automatically
    if (audioRef.current) {
      audioRef.current.play().catch(() => {});
    }
  };

  const stopSession = () => {
    setPomodoroMode('idle');
    setTimeLeft(0);
    localStorage.setItem('mindpilot-pomo-mode', 'idle');
    localStorage.removeItem('mindpilot-pomo-endtime');
    if (timerRef.current) clearInterval(timerRef.current);
    
    // Stop break song
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  };

  const deductPlayCredit = (seconds: number) => {
    setPlayCredits(prev => {
      const next = Math.max(0, prev - seconds);
      localStorage.setItem('mindpilot-pomo-credits', String(next));
      return next;
    });
  };

  const useDailyWarmup = (): boolean => {
    const todayStr = new Date().toISOString().split('T')[0];
    if (dailyWarmupUsed) return false;

    setDailyWarmupUsed(true);
    localStorage.setItem('mindpilot-pomo-warmup-date', todayStr);
    
    // Add 5 minutes (300 seconds) of play credit
    setPlayCredits(prev => {
      const next = prev + 300;
      localStorage.setItem('mindpilot-pomo-credits', String(next));
      return next;
    });
    return true;
  };

  const updateSettings = (studyMin: number, breakMin: number) => {
    setStudyDuration(studyMin);
    setBreakDuration(breakMin);
    localStorage.setItem('mindpilot-pomo-study-dur', String(studyMin));
    localStorage.setItem('mindpilot-pomo-break-dur', String(breakMin));
  };

  return (
    <PomodoroContext.Provider
      value={{
        pomodoroMode,
        timeLeft,
        studyDuration,
        breakDuration,
        playCredits,
        dailyWarmupUsed,
        isMuted,
        breakMusicTrack,
        toggleMute,
        setBreakMusicTrack,
        startStudySession,
        startBreakSession,
        stopSession,
        deductPlayCredit,
        useDailyWarmup,
        updateSettings
      }}
    >
      {children}
    </PomodoroContext.Provider>
  );
}

export function usePomodoro() {
  const context = useContext(PomodoroContext);
  if (!context) {
    throw new Error('usePomodoro must be used within a PomodoroProvider');
  }
  return context;
}
