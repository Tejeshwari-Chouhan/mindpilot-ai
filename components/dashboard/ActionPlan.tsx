'use client';
 
import React from 'react';
import { InterventionPlan } from '@/lib/types';
import { CheckCircle2, Circle, ClipboardList, Lightbulb, Shield, Zap, Compass, Trophy } from 'lucide-react';
import { motion } from 'framer-motion';
 
interface ActionPlanProps {
  plan: InterventionPlan;
  completedActions: Record<string, boolean>;
  onToggleAction: (planType: string, actionKey: string) => void;
}
 
export default function ActionPlan({ plan, completedActions, onToggleAction }: ActionPlanProps) {
  const allTasks = [
    { key: 'immediate', label: plan.immediateAction, timeframe: 'Immediate Reset', icon: Shield, color: 'border-error text-error bg-error/15' },
    { key: 'today', label: plan.todayAction, timeframe: "Today's Target", icon: Zap, color: 'border-warning text-warning bg-warning/15' },
    ...plan.threeDayPlan.map((action, idx) => ({ key: `3day-${idx}`, label: action, timeframe: '3-Day Goal', icon: Compass, color: 'border-primary text-primary bg-primary/15' })),
    ...plan.sevenDayPlan.map((action, idx) => ({ key: `7day-${idx}`, label: action, timeframe: '7-Day Goal', icon: Trophy, color: 'border-accent text-accent bg-accent/15' })),
  ];
 
  const completedCount = allTasks.filter(t => completedActions[`${plan.type}-${t.key}`]).length;
  const progressPercent = Math.round((completedCount / allTasks.length) * 100);
 
  const getActionColor = (type: string) => {
    switch (type) {
      case 'burnout': return 'text-error';
      case 'parent-pressure': return 'text-warning';
      case 'exam-panic': return 'text-accent';
      default: return 'text-primary';
    }
  };

  const getWarmTitle = (title: string) => {
    const t = title.toLowerCase();
    if (t.includes('burnout')) return 'Focus: Rest & Recover 🌿';
    if (t.includes('pressure')) return 'Focus: Reclaiming Space 🕊️';
    if (t.includes('panic')) return 'Focus: Finding Calm 🧘';
    return 'Focus: Paced Self-Care ⭐';
  };
 
  return (
    <div 
      className="glass-panel rounded-3xl p-6 flex flex-col justify-between h-full bg-gradient-to-b from-white/[0.01] via-transparent to-transparent border border-card-border/80"
      aria-label="My Gentle Steps Today Checklist"
    >
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-black flex items-center gap-2 text-foreground">
            <ClipboardList size={20} className={getActionColor(plan.type)} />
            My Gentle Steps Today
          </h2>
          <span className="text-[10px] uppercase font-black tracking-wider bg-white/5 border border-card-border px-2.5 py-1 rounded text-text-muted">
            {getWarmTitle(plan.title)}
          </span>
        </div>
 
        <p className="text-xs text-text-muted mb-5 leading-relaxed">
          Taking tiny, gentle steps helps you feel in control. Tap the circular stepping stones below to mark your small victories (+30 XP per step).
        </p>

        {/* Journey stepping stones visualization */}
        <div className="relative my-6 px-1 flex flex-col gap-6">
          {/* Vertical connecting line */}
          <div className="absolute left-[23px] top-6 bottom-6 w-0.5 bg-slate-800 pointer-events-none" />

          {/* Glowing active progress overlay line */}
          <div 
            className="absolute left-[23px] top-6 w-0.5 bg-gradient-to-b from-success to-primary transition-all duration-500 pointer-events-none" 
            style={{ 
              height: `${Math.max(0, ((completedCount - 0.5) / (allTasks.length - 1 || 1)) * 100)}%`,
              maxHeight: '80%'
            }}
          />

          {allTasks.map((task, idx) => {
            const isCompleted = completedActions[`${plan.type}-${task.key}`];
            const TaskIcon = task.icon;

            return (
              <div key={task.key} className="flex items-start gap-4 relative z-10">
                {/* Stepping stone circle */}
                <motion.button
                  whileHover={{ scale: 1.12 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onToggleAction(plan.type, task.key)}
                  className={`w-12 h-12 rounded-full border-2 flex items-center justify-center shrink-0 transition-all cursor-pointer ${
                    isCompleted 
                      ? 'bg-success/20 border-success text-success shadow-[0_0_20px_rgba(34,197,94,0.4)]' 
                      : 'bg-slate-900 border-slate-700 hover:border-primary text-text-muted hover:text-foreground'
                  }`}
                  title={`Mark ${task.timeframe} complete`}
                >
                  <TaskIcon size={20} className={isCompleted ? 'animate-pulse' : ''} />
                </motion.button>

                {/* Description details card */}
                <button
                  onClick={() => onToggleAction(plan.type, task.key)}
                  className={`flex-1 text-left p-3 rounded-2xl border transition-all duration-300 ${
                    isCompleted 
                      ? 'bg-success/5 border-success/15 opacity-70' 
                      : 'bg-white/5 border-card-border hover:bg-white/10 hover:border-card-border/80'
                  }`}
                >
                  <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-wider text-text-muted">
                    <span>{task.timeframe}</span>
                    <span>Step {idx + 1}</span>
                  </div>
                  <p className={`text-xs mt-1 font-bold leading-relaxed ${isCompleted ? 'line-through text-text-muted' : 'text-foreground'}`}>
                    {task.label}
                  </p>
                </button>
              </div>
            );
          })}
        </div>
      </div>
 
      <div className="border-t border-card-border/40 pt-4 mt-6 flex items-start gap-2.5 text-xs bg-primary/5 rounded-2xl p-4 border border-primary/10">
        <Lightbulb size={16} className="text-primary shrink-0 mt-0.5 animate-pulse" />
        <p className="text-text-muted leading-relaxed">
          Doing even one task is a victory. Take baby steps to avoid overload. You are doing great!
        </p>
      </div>
    </div>
  );
}
