'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useStudentData } from '@/hooks/useStudentData';
import { ChatMessage } from '@/lib/types';
import { MessageSquare, Send, Brain, User, AlertCircle, Sparkles, ShieldAlert, Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import CrisisHelplineBanner from '@/components/shared/CrisisHelplineBanner';
import { detectCrisisLanguage } from '@/lib/safety';

// Split into a search parameter consumer and the shell wrapper to handle NextJS Suspense requirements
function ChatInterface() {
  const searchParams = useSearchParams();
  const defaultPrompt = searchParams.get('prompt') || '';
  
  const { profile, mentalDNA, history, loading } = useStudentData();
  
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [showCrisisBanner, setShowCrisisBanner] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Initialize chat history with a welcome message from AI
  useEffect(() => {
    if (loading || !profile) return;
    
    const welcomeText = `Hey ${profile.name}! 🤗 I'm your MindPilot Resilience Co-Pilot, but you can think of me as your best friend and second mom here to support you. I know studying for ${profile.academic.examType} gets super tough and backlogs feel heavy, but we're in this together. How are you feeling today? Did you sleep well and have a good meal? Let's chat!`;
    
    setMessages([
      {
        id: 'welcome',
        sender: 'ai',
        text: welcomeText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }
    ]);

    // Handle URL search param loaded prompt
    if (defaultPrompt) {
      setInputMessage(defaultPrompt);
    }
  }, [loading, profile, mentalDNA]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, chatLoading]);

  const handleSendMessage = async (textToSend?: string) => {
    const messageText = textToSend || inputMessage;
    if (!messageText.trim() || chatLoading || !profile || !mentalDNA) return;

    if (detectCrisisLanguage(messageText)) {
      setShowCrisisBanner(true);
    }

    // Add user message
    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: messageText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setChatLoading(true);

    // Prepare message history formatted for the endpoint
    const historyPayload = messages.map(m => ({
      role: m.sender === 'user' ? 'user' as const : 'model' as const,
      parts: m.text
    }));
    
    // Add latest user message
    historyPayload.push({
      role: 'user',
      parts: messageText
    });

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: historyPayload,
          profile,
          mentalDNA
        })
      });

      if (!res.ok) {
        throw new Error("Co-pilot connection interrupted.");
      }

      const data = await res.json();
      
      const aiResponse: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: data.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isDisclaimer: data.isDisclaimer
      };

      setMessages(prev => [...prev, aiResponse]);
    } catch (err: any) {
      console.error(err);
      const errorMsg: ChatMessage = {
        id: `error-${Date.now()}`,
        sender: 'ai',
        text: "My neural models are experiencing connection jitters. I'm operating in localized safety mode. Remember: I am an AI wellness companion, not a medical professional. Please reach out to your parents or coaching counselor if things get too heavy.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isDisclaimer: true
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setChatLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (loading || !profile || !mentalDNA) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[70vh]">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="animate-spin text-primary" size={32} />
          <p className="text-sm text-text-muted">Powering up AI Co-pilot...</p>
        </div>
      </div>
    );
  }

  // Dynamic prompt chips based on active stressors
  const generateDynamicChips = () => {
    const chips = ["I need a 4-minute panic reset drill."];
    
    if (profile?.academic?.studyHoursPerDay && profile.academic.studyHoursPerDay > 9) {
      chips.push(`How do I manage studying ${profile.academic.studyHoursPerDay} hours without burning out?`);
    } else {
      chips.push("How do I maintain my focus rhythm without burning out?");
    }

    if (mentalDNA?.primaryStressors) {
      if (mentalDNA.primaryStressors.includes('Parent Expectations') || mentalDNA.primaryStressors.includes('parent expectations')) {
        chips.push("My parents are constantly putting pressure on me. What should I do?");
      }
      if (mentalDNA.primaryStressors.some(s => s.toLowerCase().includes('physics'))) {
        chips.push(`I am feeling very anxious about my ${profile?.academic?.examType || 'exam'} Physics prep.`);
      }
      if (mentalDNA.primaryStressors.some(s => s.toLowerCase().includes('mock'))) {
        chips.push("I had a score drop in my recent mock test. Can we talk about it?");
      }
      if (mentalDNA.primaryStressors.some(s => s.toLowerCase().includes('backlog'))) {
        chips.push("My syllabus backlog is building up and making me panic.");
      }
    }
    
    // Fallback if chips are too few
    if (chips.length < 3) {
      chips.push(`How do I crack ${profile?.academic?.examType || 'exams'} while staying happy?`);
    }
    return chips;
  };

  const quickChips = generateDynamicChips();

  return (
    <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-6 max-h-[82vh] min-h-[500px]">
      {/* Left Sidebar: Mental DNA snap */}
      <div className="hidden lg:block lg:col-span-1 glass-panel rounded-2xl p-5 flex flex-col justify-between overflow-y-auto">
        <div className="space-y-5">
          <h2 className="text-sm font-bold uppercase tracking-wider text-primary flex items-center gap-2">
            <Brain size={16} />
            Co-pilot Context
          </h2>
          
          <div className="bg-white/5 border border-card-border p-3.5 rounded-xl text-xs">
            <span className="text-text-muted block font-semibold">Active Profile</span>
            <span className="text-foreground font-bold text-sm block mt-1">{profile.academic.examType} Aspirant</span>
            <span className="text-text-muted block mt-1">Target Score: {profile.academic.targetScore}</span>
          </div>

          <div className="bg-white/5 border border-card-border p-3.5 rounded-xl text-xs space-y-3">
            <div>
              <span className="text-[10px] text-text-muted uppercase tracking-wider block font-semibold">Current Stressors</span>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {mentalDNA.primaryStressors.map((s, idx) => (
                  <span key={idx} className="bg-white/5 px-2 py-0.5 rounded text-[10px] border border-card-border">
                    {s}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <span className="text-[10px] text-text-muted uppercase tracking-wider block font-semibold">Resilience Level</span>
              <div className="flex items-center gap-2 mt-1">
                <div className="flex-1 bg-white/5 h-1.5 rounded-full overflow-hidden border border-card-border">
                  <div className="h-full bg-primary" style={{ width: `${mentalDNA.emotionalResilience}%` }}></div>
                </div>
                <span className="font-bold">{mentalDNA.emotionalResilience}%</span>
              </div>
            </div>

            <div>
              <span className="text-[10px] text-text-muted uppercase tracking-wider block font-semibold">Recovery Mode</span>
              <span className="text-foreground font-semibold block mt-0.5">{mentalDNA.preferredInterventionStyle}</span>
            </div>
          </div>
        </div>

        <div className="bg-error/5 border border-error/20 rounded-xl p-3.5 flex items-start gap-2 text-[10px] text-text-muted leading-relaxed">
          <ShieldAlert size={16} className="text-error shrink-0 mt-0.5" />
          <p>
            MindPilot AI companion is a digital resilience guide. It is not an alternative to professional therapy.
          </p>
        </div>
      </div>

      {/* Right Column: Conversational Workspace */}
      <div className="lg:col-span-3 glass-panel rounded-2xl flex flex-col justify-between overflow-hidden h-full">
        {/* Chat Header */}
        <div className="bg-white/40 border-b border-card-border px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Link href="/" className="lg:hidden text-text-muted hover:text-foreground mr-1" aria-label="Back to dashboard">
              <ArrowLeft size={18} />
            </Link>
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-white shadow-md">
              <Brain size={16} className="animate-pulse" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-foreground leading-none">Resilience Co-pilot</h2>
              <span className="text-[10px] text-success font-medium flex items-center gap-1 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-success inline-block"></span>
                Empathetic Listening Active
              </span>
            </div>
          </div>

          <div className="text-[10px] text-text-muted bg-white/5 border border-card-border px-2 py-0.5 rounded flex items-center gap-1">
            <AlertCircle size={10} className="text-primary" />
            <span>Encouragement Mode</span>
          </div>
        </div>

        {/* Safety Disclaimer Banner */}
        {showCrisisBanner ? (
          <div className="p-3 bg-white/40 border-b border-card-border/40 backdrop-blur-md">
            <CrisisHelplineBanner onDismiss={() => setShowCrisisBanner(false)} />
          </div>
        ) : (
          <div className="bg-error/10 border-b border-error/10 px-4 py-2 flex items-center gap-2 text-[11px] text-error font-medium">
            <ShieldAlert size={14} className="shrink-0" />
            <span>I am an AI wellness companion, not a medical professional. If in severe distress, please seek human support.</span>
          </div>
        )}

        {/* Messages List Area */}
        <div 
          className="flex-1 overflow-y-auto p-4 space-y-4 max-h-[52vh] min-h-[220px]"
          aria-label="Conversation log"
        >
          {messages.map((msg) => {
            const isAI = msg.sender === 'ai';
            return (
              <div 
                key={msg.id} 
                className={`flex gap-3 max-w-[85%] ${isAI ? 'mr-auto' : 'ml-auto flex-row-reverse'}`}
              >
                {/* Avatar */}
                <div 
                  className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-white ${
                    isAI ? 'bg-primary shadow' : 'bg-secondary'
                  }`}
                  aria-hidden="true"
                >
                  {isAI ? <Brain size={12} /> : <User size={12} />}
                </div>

                {/* Message Bubble */}
                <div className="space-y-1">
                  <div className={`p-3 rounded-2xl text-xs leading-relaxed border ${
                    isAI 
                      ? 'bg-white/80 border border-slate-200/60 text-slate-800 rounded-tl-none shadow-sm' 
                      : 'bg-primary/15 border-primary/20 text-foreground rounded-tr-none'
                  }`}>
                    {msg.text.split('\n').map((para, i) => (
                      <p key={i} className={i > 0 ? 'mt-2' : ''}>{para}</p>
                    ))}
                  </div>
                  <span className={`text-[9px] text-text-muted block ${isAI ? 'text-left' : 'text-right'}`}>
                    {msg.timestamp}
                  </span>
                </div>
              </div>
            );
          })}

          {/* Typing Indicator */}
          {chatLoading && (
            <div className="flex gap-3 max-w-[80%] mr-auto">
              <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center text-white shrink-0" aria-hidden="true">
                <Brain size={12} />
              </div>
              <div className="bg-white/80 border border-slate-200/60 p-3 rounded-2xl rounded-tl-none flex items-center gap-1.5 shadow-sm" aria-label="AI is compiling insights">
                <span className="w-1.5 h-1.5 bg-text-muted rounded-full animate-bounce"></span>
                <span className="w-1.5 h-1.5 bg-text-muted rounded-full animate-bounce [animation-delay:0.2s]"></span>
                <span className="w-1.5 h-1.5 bg-text-muted rounded-full animate-bounce [animation-delay:0.4s]"></span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Chips */}
        <div className="px-4 py-2 border-t border-card-border bg-white/20">
          <div className="flex items-center gap-1 text-[10px] text-text-muted mb-1.5 uppercase font-bold tracking-wider">
            <Sparkles size={10} className="text-secondary" />
            Quick resilience queries
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar select-none">
            {quickChips.map((chip, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(chip)}
                className="shrink-0 bg-white/5 hover:bg-white/10 border border-card-border text-[10px] px-2.5 py-1 rounded-full text-text-muted hover:text-foreground transition-all focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
              >
                {chip.length > 55 ? `${chip.substring(0, 52)}...` : chip}
              </button>
            ))}
          </div>
        </div>

        {/* Input box */}
        <div className="p-3 bg-white/40 border-t border-card-border flex items-center gap-2">
          <textarea
            rows={1}
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Talk to your resilience co-pilot..."
            className="flex-1 bg-white/90 border border-slate-200/80 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:ring-1 focus:ring-primary focus:outline-none placeholder-slate-400/80 resize-none max-h-20"
            aria-label="AI companion message text field"
          />
          <button
            onClick={() => handleSendMessage()}
            disabled={!inputMessage.trim() || chatLoading}
            className="bg-primary hover:opacity-90 text-white p-2.5 rounded-xl transition-all shadow shadow-primary/20 disabled:opacity-40 focus:ring-2 focus:ring-primary outline-none"
            aria-label="Send message"
          >
            <Send size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function CompanionPage() {
  return (
    <Suspense fallback={
      <div className="flex-1 flex items-center justify-center min-h-[70vh]">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="animate-spin text-primary" size={32} />
          <p className="text-sm text-text-muted">Preparing secure AI environment...</p>
        </div>
      </div>
    }>
      <ChatInterface />
    </Suspense>
  );
}
