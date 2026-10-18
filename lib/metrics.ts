/**
 * Utility functions for MindPilot AI calculations, isolated for testability and modularity.
 */

export interface CalibrationResult {
  score: number;
  tips: string[];
}

export interface ROIMetrics {
  retention: number;
  effectiveHours: number;
  wastedHours: number;
  weeklyMarksWasted: number;
}

/**
 * Calculates a study schedule's calibration score based on circadian guidelines.
 */
export function calculateCalibrationScore(
  morningSlot: string,
  afternoonSlot: string,
  lateAfternoonSlot: string,
  eveningSlot: string
): CalibrationResult {
  let score = 100;
  const tips: string[] = [];

  if (eveningSlot === 'high-focus') {
    score -= 30;
    tips.push("⚠️ High-Focus (Physics/Math) in the evening stimulates brainwaves past wind-down times, inducing sleep debt.");
  }

  if (morningSlot === 'active-reset' || morningSlot === 'practice') {
    score -= 20;
    tips.push("⚠️ Morning slot is peak focus window. Use it for heavy concept absorption, not practice or reset.");
  }

  const hasReset = [morningSlot, afternoonSlot, lateAfternoonSlot, eveningSlot].includes('active-reset');
  if (!hasReset) {
    score -= 20;
    tips.push("⚠️ No active resets scheduled. Continuous study leads to focus fatigue. Dedicate at least one slot to breathing / games.");
  }

  if (eveningSlot === 'active-reset' && morningSlot === 'high-focus' && score >= 90) {
    tips.push("✓ Circadian Sync: Morning high focus utilizes peak focus, and evening active reset prepares your neural core for deep sleep.");
  }

  return {
    score: Math.max(10, score),
    tips
  };
}

/**
 * Calculates the ROI metrics for a student's daily study hours based on sleep, stress, and review style.
 */
export function calculateROIMetrics(
  scheduledHours: number,
  sleep: number,
  stress: number,
  reviewStyle: 'none' | 'skim' | 'deep'
): ROIMetrics {
  let base = 100;

  // Sleep penalty
  let sleepPenalty = 0;
  if (sleep >= 7.5) sleepPenalty = 0;
  else if (sleep >= 6.5) sleepPenalty = -15;
  else if (sleep >= 5.5) sleepPenalty = -35;
  else sleepPenalty = -55; // severe sleep debt

  // Stress penalty
  let stressPenalty = 0;
  if (stress <= 3) stressPenalty = 0;
  else if (stress <= 6) stressPenalty = -10;
  else if (stress <= 8) stressPenalty = -25;
  else stressPenalty = -45; // extreme cortisol overload

  // Review bonus/penalty
  let reviewAdjustment = 0;
  if (reviewStyle === 'none') reviewAdjustment = -15;
  else if (reviewStyle === 'skim') reviewAdjustment = 0;
  else reviewAdjustment = 10;

  const retention = Math.max(15, Math.min(98, base + sleepPenalty + stressPenalty + reviewAdjustment));
  
  // Effective hours
  const effectiveHours = (scheduledHours * retention) / 100;
  const wastedHours = scheduledHours - effectiveHours;

  // Weekly marks loss simulation (silly errors due to sleep debt + unresolved concepts)
  const sleepDebt = Math.max(0, 7.5 - sleep);
  const weeklyMarksWasted = Math.round(
    (wastedHours * 1.5) + 
    (sleepDebt * 8) + 
    (reviewStyle === 'none' ? 18 : reviewStyle === 'skim' ? 6 : 0)
  );

  return {
    retention,
    effectiveHours,
    wastedHours,
    weeklyMarksWasted
  };
}
