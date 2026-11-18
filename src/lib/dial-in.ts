import type { Bean, Brew, Recipe, Settings } from '@/data/types';

import { clamp, formatGrams, formatTemp, formatTime, roundToStep } from './format';
import { METHODS } from './methods';

export type AdviceTone = 'dialed' | 'sour' | 'bitter' | 'strength' | 'polish';

export interface RecipeChange {
  key: 'grind' | 'temp' | 'dose' | 'yield' | 'time';
  from: number;
  to: number;
}

export interface Advice {
  tone: AdviceTone;
  title: string;
  body: string;
  /** Concrete changes for the next brew. Empty means "repeat this recipe". */
  changes: RecipeChange[];
}

type TimeVerdict = 'fast' | 'ok' | 'slow';

function timeVerdict(brew: Brew): TimeVerdict {
  const [lo, hi] = METHODS[brew.method].targetTime;
  if (brew.time < lo) return 'fast';
  if (brew.time > hi) return 'slow';
  return 'ok';
}

const steps = (n: number) => (n === 1 ? 'one step' : `${n} steps`);

/**
 * The dial-in coach. Reads how the cup tasted (balance, strength, score) against
 * how it was brewed (grind, temperature, time, ratio) and recommends the single
 * most useful change for the next brew. Changing one variable at a time is how
 * baristas dial in, so the coach almost always suggests exactly one change.
 */
export function adviseNextBrew(brew: Brew, settings: Settings, bean?: Bean): Advice {
  const spec = METHODS[brew.method];
  const [tMin, tMax] = spec.tempRange;
  const [timeLo, timeHi] = spec.targetTime;
  const window = brew.method === 'espresso' ? `${timeLo}–${timeHi} s` : `${formatTime(timeLo)}–${formatTime(timeHi)}`;
  const magnitude = Math.abs(brew.balance);
  const step = settings.grindStep;
  const finerDelta = (settings.finerIsLower ? -step : step) * magnitude;

  const grindTo = (dir: 'finer' | 'coarser'): RecipeChange => ({
    key: 'grind',
    from: brew.grind,
    to: Math.max(0, roundToStep(brew.grind + (dir === 'finer' ? finerDelta : -finerDelta), step)),
  });
  const tempTo = (delta: number): RecipeChange => ({
    key: 'temp',
    from: brew.temp,
    to: clamp(roundToStep(brew.temp + delta, 0.5), tMin, tMax),
  });
  const yieldTo = (factor: number): RecipeChange => ({
    key: 'yield',
    from: brew.yield,
    to: roundToStep(brew.yield * factor, spec.yieldStep),
  });
  const doseTo = (delta: number): RecipeChange => ({
    key: 'dose',
    from: brew.dose,
    to: roundToStep(Math.max(1, brew.dose + delta), spec.doseStep),
  });

  const speed = timeVerdict(brew);
  const isPercolation = brew.method === 'espresso' || brew.method === 'pourover';
  const canHeat = brew.temp < tMax;
  const canCool = brew.temp > tMin;

  // ── Sour: under-extracted ────────────────────────────────────────────
  if (brew.balance < 0) {
    if (isPercolation && speed === 'fast') {
      return {
        tone: 'sour',
        title: 'Grind finer',
        body: `Sour and quick (${formatTime(brew.time)}): the water rushed through before it could pull out the sweetness. Go ${steps(magnitude)} finer to land in the ${window} window.`,
        changes: [grindTo('finer')],
      };
    }
    if (brew.method === 'immersion') {
      return {
        tone: 'sour',
        title: 'Grind finer',
        body: `Sharp, sour notes mean the grounds gave up too little. Go ${steps(magnitude)} finer, or steep about 30 s longer.`,
        changes: [grindTo('finer')],
      };
    }
    if (canHeat) {
      const why =
        speed === 'slow' && isPercolation
          ? `It ran long (${formatTime(brew.time)}) yet still tastes sour, which often means uneven extraction. Even out your ${brew.method === 'espresso' ? 'puck prep' : 'pours'}, and use hotter water.`
          : 'Timing looks right, so grind isn’t the problem. Hotter water dissolves more of the sugars that balance the acidity.';
      return {
        tone: 'sour',
        title: 'Raise the temperature',
        body: why,
        changes: [tempTo(magnitude)],
      };
    }
    if (brew.method === 'espresso') {
      return {
        tone: 'sour',
        title: 'Pull a longer shot',
        body: `You’re already at ${formatTemp(brew.temp)}. Let more water through to extract further: aim for ${formatGrams(roundToStep(brew.yield * 1.1, spec.yieldStep))}.`,
        changes: [yieldTo(1.1)],
      };
    }
    return {
      tone: 'sour',
      title: 'Grind finer',
      body: `The water is as hot as it should go, so grind ${steps(magnitude)} finer to extract more.`,
      changes: [grindTo('finer')],
    };
  }

  // ── Bitter: over-extracted ───────────────────────────────────────────
  if (brew.balance > 0) {
    if (isPercolation && speed === 'slow') {
      return {
        tone: 'bitter',
        title: 'Grind coarser',
        body: `Bitter and slow (${formatTime(brew.time)}): the water spent too long in the coffee. Go ${steps(magnitude)} coarser to speed it up into ${window}.`,
        changes: [grindTo('coarser')],
      };
    }
    if (brew.method === 'immersion') {
      return {
        tone: 'bitter',
        title: 'Grind coarser',
        body: `Harsh and drying means too much came out. Go ${steps(magnitude)} coarser, or plunge about 30 s sooner.`,
        changes: [grindTo('coarser')],
      };
    }
    if (canCool) {
      const why =
        speed === 'fast' && isPercolation
          ? `Fast but bitter usually points to channeling: water finding a shortcut and over-extracting that path. Work on ${brew.method === 'espresso' ? 'distribution and an even tamp' : 'a gentler, centred pour'}, and cool the water.`
          : 'Timing is on target, so cool the water slightly to tame harsh, roasty notes.';
      return {
        tone: 'bitter',
        title: 'Lower the temperature',
        body: why,
        changes: [tempTo(-magnitude)],
      };
    }
    if (brew.method === 'espresso') {
      return {
        tone: 'bitter',
        title: 'Pull a shorter shot',
        body: `Stop earlier and leave the bitter tail behind: aim for ${formatGrams(roundToStep(brew.yield * 0.9, spec.yieldStep))}.`,
        changes: [yieldTo(0.9)],
      };
    }
    return {
      tone: 'bitter',
      title: 'Grind coarser',
      body: `The water is already at the cool end, so grind ${steps(magnitude)} coarser.`,
      changes: [grindTo('coarser')],
    };
  }

  // ── Balanced: tune strength, then polish ─────────────────────────────
  if (brew.strength < 0) {
    return brew.method === 'espresso'
      ? {
          tone: 'strength',
          title: 'Pull a shorter shot',
          body: 'Balanced but thin. A tighter ratio gives more body and intensity without changing the balance.',
          changes: [yieldTo(0.9)],
        }
      : {
          tone: 'strength',
          title: 'Add more coffee',
          body: 'Balanced but watery. Use a little more coffee for the same water to boost body.',
          changes: [doseTo(brew.method === 'immersion' ? 2 : 1)],
        };
  }
  if (brew.strength > 0) {
    return brew.method === 'espresso'
      ? {
          tone: 'strength',
          title: 'Pull a longer shot',
          body: 'Balanced but intense. A longer ratio opens it up and lets the clarity through.',
          changes: [yieldTo(1.1)],
        }
      : {
          tone: 'strength',
          title: 'Add more water',
          body: 'Balanced but heavy. A little more water for the same coffee will lighten it.',
          changes: [yieldTo(1.07)],
        };
  }

  const name = bean?.name ?? 'this coffee';
  if (brew.rating >= 4) {
    return {
      tone: 'dialed',
      title: 'Dialed in',
      body: `Balanced, the right strength, and you loved it. This is your recipe for ${name}. Repeat it.`,
      changes: [],
    };
  }

  // Balanced, right strength, but not exciting: nudge temperature by roast.
  const darkish = bean?.roastLevel === 'dark' || bean?.roastLevel === 'medium-dark';
  if (darkish && canCool) {
    return {
      tone: 'polish',
      title: 'Try a little cooler',
      body: 'It’s balanced but flat. Darker roasts often get sweeter and rounder with slightly cooler water.',
      changes: [tempTo(-1)],
    };
  }
  if (!darkish && canHeat) {
    return {
      tone: 'polish',
      title: 'Try a little hotter',
      body: 'It’s balanced but muted. Lighter roasts often open up with a degree more heat for extra sweetness and clarity.',
      changes: [tempTo(1)],
    };
  }
  return {
    tone: 'polish',
    title: 'Explore the ratio',
    body: 'Balanced but not singing yet. Try a slightly longer ratio to bring out more of the coffee’s character.',
    changes: [yieldTo(1.05)],
  };
}

export function applyChanges<T extends Recipe>(recipe: T, changes: RecipeChange[]): T {
  const next = { ...recipe };
  for (const ch of changes) next[ch.key] = ch.to;
  return next;
}

export const RECIPE_LABELS: Record<RecipeChange['key'], string> = {
  grind: 'Grind',
  temp: 'Temp',
  dose: 'Dose',
  yield: 'Yield',
  time: 'Time',
};
