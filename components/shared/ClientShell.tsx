'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import Navbar from './Navbar';
import { useStudentData } from '@/hooks/useStudentData';
import PomodoroWidget from './PomodoroWidget';
import GuidedTour from './GuidedTour';

type Theme = 'dark' | 'light';
type FontSize = 'normal' | 'large' | 'xlarge';

interface AccessibilityContextProps {
  theme: Theme;
  highContrast: boolean;
  fontSize: FontSize;
  toggleTheme: () => void;
  toggleHighContrast: () => void;
  setFontSize: (size: FontSize) => void;
}

const AccessibilityContext = createContext<AccessibilityContextProps | undefined>(undefined);

export function useAccessibility() {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  return context;
}

export default function ClientShell({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('dark');
  const [highContrast, setHighContrast] = useState(false);
  const [fontSize, setFontSizeState] = useState<FontSize>('normal');
  const [mounted, setMounted] = useState(false);

  const { history } = useStudentData();
  const latestEntry = history[history.length - 1];
  const mood = latestEntry?.checkIn.mood || 'neutral';

  // Load accessibility settings from LocalStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('mindpilot-theme') as Theme;
    const savedHC = localStorage.getItem('mindpilot-hc') === 'true';
    const savedFS = localStorage.getItem('mindpilot-fs') as FontSize;

    if (savedTheme) setTheme(savedTheme);
    setHighContrast(savedHC);
    if (savedFS) setFontSizeState(savedFS);
    
    setMounted(true);
  }, []);

  // Save settings when they change
  useEffect(() => {
    if (!mounted) return;
    localStorage.setItem('mindpilot-theme', theme);
    localStorage.setItem('mindpilot-hc', String(highContrast));
    localStorage.setItem('mindpilot-fs', fontSize);
  }, [theme, highContrast, fontSize, mounted]);

  const toggleTheme = () => setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  const toggleHighContrast = () => setHighContrast(prev => !prev);
  const setFontSize = (size: FontSize) => setFontSizeState(size);

  // Compose class names for layout wrapper
  const themeClass = highContrast ? 'high-contrast-mode' : theme === 'light' ? 'light-mode' : '';
  const fontClass = fontSize === 'large' ? 'font-size-large' : fontSize === 'xlarge' ? 'font-size-xlarge' : '';
  const moodClass = mounted ? `mood-${mood}` : 'mood-neutral';

  // Return a shell that wraps children
  return (
    <AccessibilityContext.Provider
      value={{
        theme,
        highContrast,
        fontSize,
        toggleTheme,
        toggleHighContrast,
        setFontSize,
      }}
    >
      <div 
        id="app-root-shell"
        className={`min-h-screen flex flex-col md:flex-row transition-all duration-700 ${themeClass} ${fontClass} ${moodClass} bg-background text-foreground relative overflow-hidden`}
        aria-label="MindPilot AI Application Shell"
      >
        {/* Serene Nature Scenery Background Image */}
        <div 
          className="absolute inset-0 pointer-events-none z-0 select-none bg-cover bg-center transition-all duration-1000"
          style={{ 
            backgroundImage: "url('/background.jpg')",
            opacity: 0.35
          }}
        />

        {/* Client Shell layout container */}
        <div className="relative z-10 flex flex-col md:flex-row w-full min-h-screen">
          <Navbar />
          <main className="flex-1 flex flex-col w-full h-full md:h-screen md:overflow-y-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 md:pb-6 focus:outline-none" tabIndex={-1}>
            {mounted ? children : (
              <div className="flex-1 flex items-center justify-center">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
              </div>
            )}
          </main>
          {mounted && <PomodoroWidget />}
          {mounted && <GuidedTour />}
        </div>
      </div>
    </AccessibilityContext.Provider>
  );
}
