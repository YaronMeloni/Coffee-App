export type BrewMethod = 'espresso' | 'pourover' | 'aeropress' | 'immersion';

export type RoastLevel = 'light' | 'medium-light' | 'medium' | 'medium-dark' | 'dark';

export type Process = 'washed' | 'natural' | 'honey' | 'anaerobic' | 'other';

export interface Bean {
  id: string;
  name: string;
  roaster: string;
  origin: string;
  region?: string;
  process: Process;
  varietal?: string;
  roastLevel: RoastLevel;
  /** ISO date (yyyy-mm-dd) the coffee was roasted. */
  roastDate?: string;
  /** The roaster's tasting notes, e.g. ["Jasmine", "Peach"]. */
  notes: string[];
  /** Bag size in grams, used to estimate how much is left. */
  bagWeight?: number;
  comment?: string;
  isFavorite: boolean;
  /** Finished bags move off the shelf but keep their history. */
  isFinished: boolean;
  createdAt: string;
}

/**
 * Extraction balance: −2 very sour (under-extracted) … 0 balanced … +2 very
 * bitter (over-extracted). This is the signal the dial-in coach works from.
 */
export type Balance = -2 | -1 | 0 | 1 | 2;

/** −1 weak / thin, 0 just right, +1 too strong / heavy. */
export type Strength = -1 | 0 | 1;

export interface Recipe {
  /** Grinder setting, in the units of your grinder's dial. */
  grind: number;
  /** Water temperature in °C. */
  temp: number;
  /** Coffee in, grams. */
  dose: number;
  /** Espresso: beverage out (g). Every other method: water (g). */
  yield: number;
  /** Espresso: shot time. Every other method: total brew / steep time. Seconds. */
  time: number;
  /** Espresso only: pre-infusion seconds. */
  preinfusion?: number;
  /** Pour-over only: bloom seconds. */
  bloom?: number;
}

export interface Brew extends Recipe {
  id: string;
  beanId: string;
  method: BrewMethod;
  /** Brewer or style, e.g. "V60", "Inverted", "French press". */
  brewer?: string;
  createdAt: string;
  /** Cup score, 1–5. */
  rating: number;
  balance: Balance;
  strength: Strength;
  /** Flavours you actually tasted. */
  flavors: string[];
  notes?: string;
}

export interface Settings {
  grinderName: string;
  /** Smallest change your grinder can make (1, 0.5, 0.25 or 0.1). */
  grindStep: number;
  /** On most grinders a lower number is finer. */
  finerIsLower: boolean;
}

export type RecipeKey = keyof Recipe;
