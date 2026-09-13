// ============================================================
// CyberPulse Demand Forecast — Mock Prediction Algorithm
// ============================================================
// NOTE: This is a PROTOTYPE forecast using deterministic rules
// based on sample historical patterns. It does NOT use real ML.
// ============================================================

import type { DemandForecast, DemandLevel } from '../store/types';

/**
 * Base demand scores by hour of day (0-23).
 * Represents typical computer shop traffic patterns.
 */
const HOURLY_BASE: Record<number, number> = {
  0: 10, 1: 5, 2: 5, 3: 5, 4: 5, 5: 5,
  6: 10, 7: 15, 8: 20, 9: 25, 10: 30, 11: 40,
  12: 50, 13: 55, 14: 65, 15: 70, 16: 80, 17: 85,
  18: 90, 19: 95, 20: 85, 21: 75, 22: 55, 23: 30,
};

/**
 * Day-of-week multipliers (0=Sunday, 6=Saturday).
 * Weekends have higher demand.
 */
const DAY_MULTIPLIER: Record<number, number> = {
  0: 1.3,  // Sunday
  1: 0.8,  // Monday
  2: 0.85, // Tuesday
  3: 0.9,  // Wednesday
  4: 0.95, // Thursday
  5: 1.1,  // Friday
  6: 1.35, // Saturday
};

/**
 * Simple seeded pseudo-random number generator for consistent results.
 */
function seededRandom(seed: number): number {
  const x = Math.sin(seed * 9301 + 49297) * 49.297;
  return x - Math.floor(x);
}

/**
 * Map a score (0-100) to a demand level.
 */
function scoreToDemand(score: number): DemandLevel {
  if (score >= 80) return 'VERY_HIGH';
  if (score >= 55) return 'HIGH';
  if (score >= 30) return 'MEDIUM';
  return 'LOW';
}

/**
 * Calculate a confidence percentage based on how "typical" the time slot is.
 * More consistent historical hours get higher confidence.
 */
function calculateConfidence(hour: number, dayOfWeek: number): number {
  // Peak hours and weekdays have more consistent patterns
  const baseConfidence = 65;
  const hourBonus = hour >= 14 && hour <= 21 ? 15 : 5;
  const dayBonus = dayOfWeek >= 1 && dayOfWeek <= 5 ? 10 : 5;
  const noise = seededRandom(hour * 7 + dayOfWeek * 13) * 10;
  return Math.min(95, Math.max(60, baseConfidence + hourBonus + dayBonus + noise));
}

/**
 * Generate demand forecast for the next 48 hours.
 */
export function generateForecast(fromDate?: Date): DemandForecast[] {
  const now = fromDate || new Date();
  const forecasts: DemandForecast[] = [];

  for (let offsetHours = 1; offsetHours <= 48; offsetHours++) {
    const forecastDate = new Date(now.getTime() + offsetHours * 3600000);
    const hour = forecastDate.getHours();
    const dayOfWeek = forecastDate.getDay();

    // Only include hours between 6 AM and 11 PM
    if (hour < 6 || hour > 23) continue;

    const baseScore = HOURLY_BASE[hour] ?? 20;
    const multiplier = DAY_MULTIPLIER[dayOfWeek] ?? 1;
    const noise = (seededRandom(offsetHours * 31 + hour * 17) - 0.5) * 15;
    const finalScore = Math.max(0, Math.min(100, baseScore * multiplier + noise));

    const factors: string[] = [];
    if (hour >= 16 && hour <= 20) factors.push('Peak afternoon/evening hours');
    if (dayOfWeek === 0 || dayOfWeek === 6) factors.push('Weekend traffic');
    if (dayOfWeek === 5 && hour >= 17) factors.push('Friday evening rush');
    if (hour >= 12 && hour <= 13) factors.push('Lunch break traffic');
    if (baseScore < 25) factors.push('Off-peak hours');
    factors.push('Historical PC usage patterns');

    const dayName = forecastDate.toLocaleDateString('en-US', { weekday: 'long' });
    const timeStr = forecastDate.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });

    forecasts.push({
      datetime: forecastDate.toISOString(),
      label: `${dayName} ${timeStr}`,
      demand: scoreToDemand(finalScore),
      confidence: Math.round(calculateConfidence(hour, dayOfWeek)),
      factors,
    });
  }

  return forecasts;
}

/**
 * Get the demand color for a given level.
 */
export function getDemandColor(demand: DemandLevel): string {
  switch (demand) {
    case 'LOW': return 'text-emerald-400';
    case 'MEDIUM': return 'text-amber-400';
    case 'HIGH': return 'text-orange-400';
    case 'VERY_HIGH': return 'text-red-400';
  }
}

/**
 * Get the demand background color for a given level.
 */
export function getDemandBg(demand: DemandLevel): string {
  switch (demand) {
    case 'LOW': return 'bg-emerald-500/10';
    case 'MEDIUM': return 'bg-amber-500/10';
    case 'HIGH': return 'bg-orange-500/10';
    case 'VERY_HIGH': return 'bg-red-500/10';
  }
}
