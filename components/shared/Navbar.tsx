'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAccessibility } from './ClientShell';
import { useStudentData } from '@/hooks/useStudentData';
import { 
  Sun, 
  Moon, 
  Eye, 
  BrainCircuit, 
  MessageSquare, 
  ShieldAlert, 
  Calendar, 
  Gamepad2, 
  Flame, 
  Trophy,
  Tv,
  Camera,
  HelpCircle
} from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();
  const { theme, highContrast, fontSize, toggleTheme, toggleHighContrast, setFontSize } = useAccessibility();
  const { profile, resilienceXP, resilienceLevel, levelProgress, history, loading, streak } = useStudentData();

  const navItems = [
    { name: 'Dashboard', path: '/', icon: BrainCircuit },
    ...(profile ? [] : [{ name: 'Onboarding', path: '/onboarding', icon: Calendar }]),
    { name: 'AI Companion', path: '/companion', icon: MessageSquare },
    { name: 'Relax Room', path: '/relax', icon: Gamepad2 },
    { name: 'Zen Streams', path: '/zen-streams', icon: Tv },
    { name: 'Zen Face Cam', path: '/zen-face-cam', icon: Camera },
    { name: 'Calm Room', path: '/calm-room', icon: ShieldAlert },
  ];
  const triggerTour = () => {
    const event = new CustomEvent('mindpilot-start-tour');
    window.dispatchEvent(event);
  };

  return (
    <>
      {/* Desktop Sidebar Navigation */}
      <aside 
        className="hidden md:flex flex-col justify-between w-72 h-screen sticky top-0 bg-white/40 backdrop-blur-md border-r border-card-border/40 p-6 select-none z-10"
        aria-label="Main Navigation"
      >
        <div className="space-y-6">
          {/* Logo Brand */}
          <div className="flex items-center gap-2 px-2">
            <Link 
              href="/" 
              className="flex items-center gap-2 text-xl font-bold tracking-tight text-foreground focus:ring-2 focus:ring-primary rounded-md outline-none"
              aria-label="MindPilot AI Home"
            >
              <div className="w-8.5 h-8.5 rounded-lg bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-white shadow-md shadow-primary/20 shrink-0">
                <BrainCircuit size={20} />
              </div>
              <div className="flex flex-col">
                <span className="bg-gradient-to-r from-foreground to-text-muted bg-clip-text text-transparent font-black leading-tight text-base">
                  MindPilot <span className="text-primary">AI</span>
                </span>
                <span className="text-[9px] text-text-muted uppercase font-bold tracking-wider">
                  Exam Resilience Suite
                </span>
              </div>
            </Link>
          </div>

          {/* Gamified Streak & Rank Card */}
          {!loading && profile && (
            <div className="bg-white/5 border border-card-border rounded-2xl p-4 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Flame className="w-5 h-5 text-amber-500 fill-amber-500 animate-bounce" />
                  <div>
                    <span className="text-[9px] text-text-muted font-black uppercase tracking-wider block">Active Streak</span>
                    <span className="text-xs font-black text-foreground">{streak} {streak === 1 ? 'Day' : 'Days'}</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[9px] text-text-muted font-black uppercase tracking-wider block">Rank</span>
                  <span className="text-xs font-black text-secondary">{resilienceLevel}</span>
                </div>
              </div>

              {/* Progress to next level */}
              <div className="space-y-1">
                <div className="flex justify-between text-[9px] font-bold text-text-muted">
                  <span>{resilienceXP} XP</span>
                  <span>Lv.{resilienceLevel + 1}</span>
                </div>
                <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-secondary to-primary h-full rounded-full transition-all duration-500" 
                    style={{ width: `${levelProgress}%` }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Navigation Links */}
          <nav className="space-y-1" role="navigation">
            {navItems.map((item) => {
              const isActive = pathname === item.path;
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-semibold transition-all focus:ring-2 focus:ring-primary outline-none ${
                    isActive 
                      ? 'bg-gradient-to-r from-primary/10 to-transparent text-primary border-l-4 border-primary pl-3' 
                      : 'text-text-muted hover:text-foreground hover:bg-white/5 border-l-4 border-transparent'
                  }`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <Icon size={18} className={isActive ? 'text-primary' : 'text-text-muted'} />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Accessibility Toolbar & SOS */}
        <div className="space-y-4 border-t border-card-border/60 pt-4">
          {/* Tour help button */}
          <button
            onClick={triggerTour}
            className="flex items-center justify-center gap-2 bg-primary/10 border border-primary/20 hover:bg-primary/20 text-primary py-2 rounded-xl text-xs font-black transition-all focus:ring-2 focus:ring-primary outline-none w-full text-center cursor-pointer"
            title="Start Guided Tour"
            aria-label="Start Guided Tour"
          >
            <HelpCircle size={15} />
            Start Guided Tour
          </button>
          
          {/* Accessibility Settings Panel */}
          <div 
            className="flex items-center justify-between bg-white/5 p-2 rounded-xl border border-card-border"
            role="toolbar" 
            aria-label="Accessibility settings"
          >
            <div className="flex items-center gap-1">
              <button
                onClick={toggleHighContrast}
                className={`p-1.5 rounded-md text-text-muted hover:text-foreground transition-all hover:bg-white/5 focus:ring-2 focus:ring-primary outline-none ${
                  highContrast ? 'text-primary bg-primary/20' : ''
                }`}
                title="Toggle High Contrast Mode"
                aria-label="Toggle High Contrast Mode"
                aria-pressed={highContrast}
              >
                <Eye size={16} />
              </button>

              <button
                onClick={() => setFontSize('normal')}
                className={`text-[10px] font-bold rounded px-1.5 py-0.5 focus:ring-2 focus:ring-primary outline-none ${
                  fontSize === 'normal' ? 'text-primary bg-primary/20' : 'text-text-muted hover:text-foreground'
                }`}
                title="Standard Text Size"
              >
                A
              </button>
              <button
                onClick={() => setFontSize('large')}
                className={`text-[10px] font-bold rounded px-1.5 py-0.5 focus:ring-2 focus:ring-primary outline-none ${
                  fontSize === 'large' ? 'text-primary bg-primary/20' : 'text-text-muted hover:text-foreground'
                }`}
                title="Large Text Size"
              >
                A+
              </button>
            </div>

            <button
              onClick={toggleTheme}
              className="p-1.5 rounded-md text-text-muted hover:text-foreground transition-all hover:bg-white/5 focus:ring-2 focus:ring-primary outline-none"
              title="Toggle Light/Dark Theme"
              aria-label="Toggle Light/Dark Theme"
            >
              {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
            </button>
          </div>

          {/* Persistent SOS calm button */}
          <Link
            href="/calm-room"
            className="flex items-center justify-center gap-2 bg-error/10 border border-error/20 hover:bg-error/20 text-error py-2.5 rounded-xl text-xs font-black transition-all focus:ring-2 focus:ring-error outline-none w-full text-center"
            aria-label="SOS Calm Room"
          >
            <ShieldAlert size={15} className="animate-pulse" />
            SOS Calm Room
          </Link>
        </div>
      </aside>

      {/* Mobile Header Bar & Bottom Navigation */}
      <div className="md:hidden flex flex-col w-full sticky top-0 z-50">
        <header className="w-full bg-white/40 backdrop-blur-md border-b border-card-border/40 px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-1.5 font-black text-sm">
            <div className="w-6.5 h-6.5 rounded-md bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-white shrink-0">
              <BrainCircuit size={14} />
            </div>
            <span className="text-foreground">MindPilot <span className="text-primary">AI</span></span>
          </Link>

          <div className="flex items-center gap-2">
            <button
              onClick={triggerTour}
              className="p-1.5 rounded-md text-text-muted hover:text-foreground hover:bg-white/5"
              title="Help Tour"
              aria-label="Help Tour"
            >
              <HelpCircle size={15} />
            </button>
            <button
              onClick={toggleTheme}
              className="p-1.5 rounded-md text-text-muted hover:text-foreground hover:bg-white/5"
              aria-label="Toggle Theme"
            >
              {theme === 'light' ? <Moon size={15} /> : <Sun size={15} />}
            </button>
            <Link
              href="/calm-room"
              className="flex items-center gap-1 bg-error/10 border border-error/20 text-error px-2 py-1 rounded-md text-[10px] font-black"
            >
              <ShieldAlert size={12} className="animate-pulse" />
              SOS
            </Link>
          </div>
        </header>

        {/* Mobile Navigation bar at the bottom */}
        <nav 
          className="fixed bottom-0 left-0 right-0 z-50 bg-white/60 backdrop-blur-md border-t border-card-border/40 flex items-center justify-around py-2 px-3 shadow-lg"
          role="navigation"
        >
          {navItems.filter(item => !['Zen Streams', 'Zen Face Cam'].includes(item.name)).map((item) => {
            const isActive = pathname === item.path;
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                href={item.path}
                className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-md text-[10px] font-bold focus:ring-2 focus:ring-primary outline-none transition-all ${
                  isActive ? 'text-primary' : 'text-text-muted hover:text-foreground'
                }`}
                aria-label={item.name}
              >
                <Icon size={18} />
                <span>{item.name.split(' ')[0]}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </>
  );
}
