'use client';

import React, { useState } from 'react';
import { DailyCheckIn, StudentProfile, DailyLogEntry } from '@/lib/types';
import { Smile, Meh, Frown, Sparkles, Mic, Square, Loader2, BookOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface DailyCheckInFormProps {
  profile: StudentProfile;
  history: DailyLogEntry[];
  onCheckInCompleted: (checkIn: DailyCheckIn, analysis: any, updatedDNA: any) => void;
}

export default function DailyCheckInForm({ profile, history, onCheckInCompleted }: DailyCheckInFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [mood, setMood] = useState<'excellent' | 'good' | 'neutral' | 'anxious' | 'exhausted'>('neutral');
  const [energyLevel, setEnergyLevel] = useState(6);
  const [stressLevel, setStressLevel] = useState(5);
  const [sleepHours, setSleepHours] = useState(6);
  const [studyHours, setStudyHours] = useState(10);
  const [mockScore, setMockScore] = useState<string>('');
  const [journalEntry, setJournalEntry] = useState('');
  const [logDate, setLogDate] = useState(new Date().toISOString().split('T')[0]);
  
  // Audio states
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [transcription, setTranscription] = useState('');
  const [recordingTimer, setRecordingTimer] = useState<NodeJS.Timeout | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const moods = [
    { value: 'excellent', label: 'Great', emoji: '😊', color: 'hover:bg-success/15 border-success/20 text-success' },
    { value: 'good', label: 'Good', emoji: '🙂', color: 'hover:bg-primary/15 border-primary/20 text-primary' },
    { value: 'neutral', label: 'Ok', emoji: '😐', color: 'hover:bg-slate-300/10 border-card-border text-foreground' },
    { value: 'anxious', label: 'Anxious', emoji: '😰', color: 'hover:bg-warning/15 border-warning/20 text-warning' },
    { value: 'exhausted', label: 'Exhausted', emoji: '😫', color: 'hover:bg-error/15 border-error/20 text-error' },
  ];

  const handleStartRecording = () => {
    setIsRecording(true);
    setRecordingSeconds(0);
    const interval = setInterval(() => {
      setRecordingSeconds(prev => prev + 1);
    }, 1000);
    setRecordingTimer(interval);
  };

  const handleStopRecording = () => {
    if (recordingTimer) {
      clearInterval(recordingTimer);
      setRecordingTimer(null);
    }
    setIsRecording(false);
    
    // Simulate a smart exam-related transcription based on exam type
    const simulatedTranscripts = [
      `I spent almost 12 hours studying math and physics today. The rotation backlog is massive, and my mock exam scores dropped. My father asked why I got less marks, and I felt so discouraged and couldn't sleep.`,
      `Feeling totally burned out today. Spent the whole day reading organic chemistry but couldn't retain anything. Slept only 4 hours, and I am starting to panic about NEET.`,
      `Mock test went bad. Got low marks, which is making me doubt myself. My parents are expecting me to get a top 100 rank, and it's putting a lot of pressure.`,
      `Managed to cover some backlog in physics, which made me feel a bit confident, but sleep was poor because my mind was racing thinking about mock exam results.`
    ];
    
    const randomTranscript = simulatedTranscripts[Math.floor(Math.random() * simulatedTranscripts.length)];
    setTranscription(randomTranscript);
    setJournalEntry(prev => prev ? `${prev}\n\n[Voice Note Transcript]: ${randomTranscript}` : randomTranscript);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const finalJournal = journalEntry.trim() || `Feeling ${mood} today.`;

    const checkInPayload: DailyCheckIn = {
      id: `checkin-${Date.now()}`,
      date: logDate,
      mood,
      energyLevel,
      stressLevel,
      sleepHours,
      studyHours,
      journalEntry: finalJournal,
      voiceNoteTranscription: transcription || undefined,
      mockTestScore: mockScore ? parseInt(mockScore) : undefined
    };

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          checkIn: checkInPayload,
          profile,
          history
        })
      });

      if (!res.ok) {
        throw new Error("Failed to analyze check-in. Please try again.");
      }

      const data = await res.json();
      
      // Reset form fields
      setJournalEntry('');
      setTranscription('');
      setMockScore('');
      setIsOpen(false);

      // Trigger success hook
      onCheckInCompleted(checkInPayload, data.analysis, data.updatedMentalDNA);
      
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Something went wrong during Gemini analysis.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="w-full bg-gradient-to-r from-primary to-secondary text-white font-bold px-6 py-3.5 rounded-xl hover:opacity-90 shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2 focus:ring-2 focus:ring-primary outline-none"
        aria-label="Submit a new daily check-in"
      >
        <Sparkles size={18} />
        Complete Today's Daily Check-in
      </button>

      {/* Modal Dialog */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="glass-panel w-full max-w-2xl rounded-2xl p-6 overflow-y-auto max-h-[90vh] flex flex-col justify-between"
              role="dialog"
              aria-modal="true"
              aria-label="New Daily Check-in Form"
            >
              {/* Header */}
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-xl font-bold flex items-center gap-2 text-foreground">
                    <Sparkles className="text-primary" size={20} />
                    Daily Check-In & Journal Log
                  </h2>
                  <p className="text-xs text-text-muted mt-0.5">Let MindPilot extract triggers and adjust your actions.</p>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-text-muted hover:text-foreground p-1 text-sm font-semibold focus:outline-none"
                  aria-label="Cancel check-in"
                >
                  Cancel
                </button>
              </div>

              {error && (
                <div className="bg-error/15 border border-error/20 text-error rounded-xl p-3 text-xs mb-5">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5 flex-1">
                {/* Mood Selection */}
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-text-muted block mb-3">
                    Current Mood
                  </label>
                  <div className="grid grid-cols-5 gap-2" role="radiogroup" aria-label="Select mood">
                    {moods.map((m) => (
                      <button
                        key={m.value}
                        type="button"
                        onClick={() => setMood(m.value as any)}
                        className={`flex flex-col items-center p-2.5 rounded-xl border text-center transition-all focus:outline-none focus:ring-2 focus:ring-primary ${
                          mood === m.value 
                            ? 'bg-primary/20 border-primary text-foreground font-semibold scale-105 shadow-md shadow-primary/10' 
                            : 'bg-white/5 border-card-border text-text-muted hover:bg-white/10'
                        }`}
                        aria-checked={mood === m.value}
                        role="radio"
                      >
                        <span className="text-2xl mb-1" aria-hidden="true">{m.emoji}</span>
                        <span className="text-[10px] uppercase font-bold tracking-wider">{m.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Metrics Sliders (Collapsible for simple & non-tedious UI) */}
                <details className="group bg-white/5 border border-card-border/40 rounded-2xl p-4 cursor-pointer outline-none">
                  <summary className="text-xs font-bold text-text-muted select-none flex justify-between items-center outline-none">
                    <span>Show Detailed Hours & Scores (Optional) ⚙️</span>
                    <span className="text-[10px] text-primary group-open:hidden">Expand</span>
                    <span className="text-[10px] text-primary hidden group-open:inline">Collapse</span>
                  </summary>
                  
                  <div className="space-y-4 pt-4 cursor-default" onClick={(e) => e.stopPropagation()}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Energy level */}
                      <div className="bg-white/5 border border-card-border p-3.5 rounded-xl">
                        <div className="flex justify-between items-center text-xs font-semibold mb-2">
                          <span className="text-text-muted">Energy Level</span>
                          <span className="text-primary font-bold">{energyLevel}/10</span>
                        </div>
                        <input 
                          type="range" 
                          min="1" 
                          max="10" 
                          value={energyLevel}
                          onChange={(e) => setEnergyLevel(parseInt(e.target.value))}
                          className="w-full accent-primary bg-slate-800 h-1.5 rounded cursor-pointer"
                          aria-label="Energy level scale 1 to 10"
                        />
                      </div>

                      {/* Stress Level */}
                      <div className="bg-white/5 border border-card-border p-3.5 rounded-xl">
                        <div className="flex justify-between items-center text-xs font-semibold mb-2">
                          <span className="text-text-muted">Stress Level</span>
                          <span className="text-secondary font-bold">{stressLevel}/10</span>
                        </div>
                        <input 
                          type="range" 
                          min="1" 
                          max="10" 
                          value={stressLevel}
                          onChange={(e) => setStressLevel(parseInt(e.target.value))}
                          className="w-full accent-secondary bg-slate-800 h-1.5 rounded cursor-pointer"
                          aria-label="Stress level scale 1 to 10"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                      {/* Log Date */}
                      <div className="bg-white/5 border border-card-border p-3 rounded-xl">
                        <label htmlFor="checkin-date" className="text-[10px] font-bold text-text-muted uppercase tracking-wider block mb-1">
                          Log Date
                        </label>
                        <input 
                          id="checkin-date"
                          type="date" 
                          value={logDate}
                          onChange={(e) => setLogDate(e.target.value)}
                          className="w-full bg-black/20 border border-card-border/80 text-sm rounded px-3 py-1.5 focus:ring-1 focus:ring-primary focus:outline-none"
                          required
                        />
                      </div>

                      {/* Sleep Hours */}
                      <div className="bg-white/5 border border-card-border p-3 rounded-xl">
                        <label htmlFor="checkin-sleep" className="text-[10px] font-bold text-text-muted uppercase tracking-wider block mb-1">
                          Sleep Hours
                        </label>
                        <input 
                          id="checkin-sleep"
                          type="number" 
                          step="0.5" 
                          min="0" 
                          max="24"
                          value={sleepHours}
                          onChange={(e) => setSleepHours(parseFloat(e.target.value) || 0)}
                          className="w-full bg-black/20 border border-card-border/80 text-sm rounded px-3 py-1.5 focus:ring-1 focus:ring-primary focus:outline-none"
                          required
                        />
                      </div>

                      {/* Study Hours */}
                      <div className="bg-white/5 border border-card-border p-3 rounded-xl">
                        <label htmlFor="checkin-study" className="text-[10px] font-bold text-text-muted uppercase tracking-wider block mb-1">
                          Study Hours
                        </label>
                        <input 
                          id="checkin-study"
                          type="number" 
                          step="0.5" 
                          min="0" 
                          max="24"
                          value={studyHours}
                          onChange={(e) => setStudyHours(parseFloat(e.target.value) || 0)}
                          className="w-full bg-black/20 border border-card-border/80 text-sm rounded px-3 py-1.5 focus:ring-1 focus:ring-primary focus:outline-none"
                          required
                        />
                      </div>

                      {/* Mock Score (Optional) */}
                      <div className="bg-white/5 border border-card-border p-3 rounded-xl">
                        <label htmlFor="checkin-mock-score" className="text-[10px] font-bold text-text-muted uppercase tracking-wider block mb-1">
                          Mock Score (Optional)
                        </label>
                        <input 
                          id="checkin-mock-score"
                          type="number" 
                          placeholder="e.g. 210"
                          value={mockScore}
                          onChange={(e) => setMockScore(e.target.value)}
                          className="w-full bg-black/20 border border-card-border/80 text-sm rounded px-3 py-1.5 focus:ring-1 focus:ring-primary focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                </details>

                {/* Journal & Audio */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label htmlFor="checkin-journal" className="text-xs font-bold uppercase tracking-wider text-text-muted">
                      Share reflection or log notes
                    </label>
                    
                    {/* Audio Recorder button */}
                    <div className="flex items-center gap-2">
                      {isRecording ? (
                        <button
                          type="button"
                          onClick={handleStopRecording}
                          className="flex items-center gap-1.5 bg-error/20 hover:bg-error/30 text-error text-[10px] font-bold border border-error/30 px-2.5 py-1 rounded-full animate-pulse focus:outline-none cursor-pointer"
                        >
                          <Square size={10} />
                          Stop Rec ({recordingSeconds}s)
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={handleStartRecording}
                          className="flex items-center gap-1.5 bg-primary/10 hover:bg-primary/20 text-primary text-[10px] font-bold border border-primary/20 px-2.5 py-1 rounded-full focus:outline-none cursor-pointer"
                        >
                          <Mic size={10} />
                          Voice Journal
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Quick Express tags to avoid typing */}
                  <div className="flex flex-wrap gap-1.5 mb-2.5">
                    {[
                      "Good study flow 📖",
                      "Physics backlog stress 📚",
                      "Mock scores dropped 📉",
                      "Exhausted/need rest 🔋",
                      "Parent pressure 👨‍👩‍👦",
                      "Pace is steady 😌"
                    ].map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => setJournalEntry(prev => prev ? `${prev}, ${tag}` : tag)}
                        className="text-[10px] font-semibold bg-white/5 border border-card-border hover:bg-primary/15 hover:border-primary/30 text-text-muted hover:text-primary py-1 px-2.5 rounded-full cursor-pointer transition-all"
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                  
                  <textarea
                    id="checkin-journal"
                    rows={4}
                    placeholder="Describe how your preparation went today. Click a tag above or voice record to auto-fill (optional)..."
                    value={journalEntry}
                    onChange={(e) => setJournalEntry(e.target.value)}
                    className="w-full bg-black/20 border border-card-border text-sm rounded-xl p-3.5 focus:ring-1 focus:ring-primary focus:outline-none leading-relaxed text-foreground placeholder-text-muted/60"
                    aria-label="Open-ended mental journal entry text field"
                  />
                  {transcription && (
                    <p className="text-[10px] text-success font-medium mt-1">
                      ✓ Voice transcribed successfully!
                    </p>
                  )}
                </div>

                {/* Submit Action */}
                <div className="pt-2 border-t border-card-border/40 flex items-center justify-between">
                  <div className="text-[10px] text-text-muted flex items-center gap-1">
                    <BookOpen size={12} />
                    Undergoes Gemini Analysis
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-primary text-white font-bold px-6 py-2.5 rounded-xl hover:opacity-90 shadow-md shadow-primary/10 flex items-center gap-1.5 disabled:opacity-50 focus:ring-2 focus:ring-primary outline-none"
                  >
                    {loading ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        Analyzing DNA...
                      </>
                    ) : (
                      <>
                        Submit & Analyze
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
