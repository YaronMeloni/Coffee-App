import type { BrewMethod, Recipe } from '@/data/types';

import type { IconName } from './icons';

export interface MethodSpec {
  id: BrewMethod;
  label: string;
  icon: IconName;
  yieldLabel: string;
  timeLabel: string;
  /** Starting recipe when there is no history to learn from. */
  defaults: Recipe;
  /** Time window (s) a well-extracted brew usually lands in. */
  targetTime: [number, number];
  /** Brew ratio window, expressed as yield ÷ dose. */
  targetRatio: [number, number];
  /** Sensible water temperature bounds (°C) the coach will stay within. */
  tempRange: [number, number];
  doseStep: number;
  yieldStep: number;
  timeStep: number;
  brewers: string[];
  /** One line of expert context shown while logging. */
  tip: string;
}

export const METHODS: Record<BrewMethod, MethodSpec> = {
  espresso: {
    id: 'espresso',
    label: 'Espresso',
    icon: 'espresso',
    yieldLabel: 'Yield',
    timeLabel: 'Shot time',
    defaults: { grind: 12, temp: 93, dose: 18, yield: 36, time: 28, preinfusion: 0 },
    targetTime: [25, 32],
    targetRatio: [1.8, 2.5],
    tempRange: [88, 96],
    doseStep: 0.1,
    yieldStep: 0.5,
    timeStep: 1,
    brewers: [],
    tip: 'Change one thing at a time. Grind is your main lever.',
  },
  pourover: {
    id: 'pourover',
    label: 'Pour-over',
    icon: 'pourover',
    yieldLabel: 'Water',
    timeLabel: 'Brew time',
    defaults: { grind: 22, temp: 94, dose: 15, yield: 250, time: 180, bloom: 45 },
    targetTime: [150, 225],
    targetRatio: [15, 17],
    tempRange: [88, 99],
    doseStep: 0.5,
    yieldStep: 5,
    timeStep: 5,
    brewers: ['V60', 'Chemex', 'Kalita Wave', 'Origami', 'April'],
    tip: 'A slow drawdown points finer than you need; a fast one, coarser.',
  },
  aeropress: {
    id: 'aeropress',
    label: 'AeroPress',
    icon: 'aeropress',
    yieldLabel: 'Water',
    timeLabel: 'Steep time',
    defaults: { grind: 16, temp: 88, dose: 15, yield: 225, time: 120 },
    targetTime: [60, 180],
    targetRatio: [11, 17],
    tempRange: [80, 96],
    doseStep: 0.5,
    yieldStep: 5,
    timeStep: 5,
    brewers: ['Standard', 'Inverted'],
    tip: 'Forgiving and fast. Temperature changes taste more than you expect.',
  },
  immersion: {
    id: 'immersion',
    label: 'Immersion',
    icon: 'immersion',
    yieldLabel: 'Water',
    timeLabel: 'Steep time',
    defaults: { grind: 30, temp: 95, dose: 30, yield: 500, time: 240 },
    targetTime: [210, 300],
    targetRatio: [14, 17],
    tempRange: [88, 99],
    doseStep: 0.5,
    yieldStep: 10,
    timeStep: 10,
    brewers: ['French press', 'Clever', 'Hario Switch'],
    tip: 'Steep time does the work here. Go coarse and let it sit.',
  },
};

export const METHOD_ORDER: BrewMethod[] = ['espresso', 'pourover', 'aeropress', 'immersion'];

export function ratioOf(r: Pick<Recipe, 'dose' | 'yield'>): number {
  return r.dose > 0 ? r.yield / r.dose : 0;
}
