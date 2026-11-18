import { daysBetween, parseLocalDate } from './format';

export type FreshnessStage = 'resting' | 'peak' | 'fading' | 'stale';

export interface Freshness {
  days: number;
  stage: FreshnessStage;
  label: string;
  hint: string;
}

/**
 * Coffee needs a few days to de-gas after roasting, tastes its best for a few
 * weeks, then slowly goes flat. These windows are a sensible middle ground
 * between espresso (likes more rest) and filter (ready sooner).
 */
export function freshnessOf(roastDate: string | undefined, now = new Date()): Freshness | undefined {
  if (!roastDate) return undefined;
  const days = Math.max(0, daysBetween(parseLocalDate(roastDate), now));
  if (days < 7) {
    return { days, stage: 'resting', label: 'Resting', hint: 'Still de-gassing. Best from day 7.' };
  }
  if (days <= 30) {
    return { days, stage: 'peak', label: 'Peak', hint: 'In its sweet spot.' };
  }
  if (days <= 50) {
    return { days, stage: 'fading', label: 'Fading', hint: 'Grind a touch finer as it ages.' };
  }
  return { days, stage: 'stale', label: 'Past prime', hint: 'Flavour is fading. Finish it soon.' };
}
