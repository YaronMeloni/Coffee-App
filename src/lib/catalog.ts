import type { Process } from '@/data/types';

export const PROCESS_LABELS: Record<Process, string> = {
  washed: 'Washed',
  natural: 'Natural',
  honey: 'Honey',
  anaerobic: 'Anaerobic',
  other: 'Other',
};

export const ORIGINS = [
  'Ethiopia', 'Kenya', 'Colombia', 'Brazil', 'Guatemala', 'Costa Rica', 'Panama', 'Honduras',
  'Rwanda', 'Burundi', 'Peru', 'El Salvador', 'Indonesia', 'Yemen', 'Mexico', 'Uganda', 'Blend',
];

/** Flavour vocabulary offered while tasting, from fruity to roasty to faults. */
export const FLAVORS = [
  'Sweet', 'Juicy', 'Chocolate', 'Caramel', 'Nutty', 'Citrus', 'Berry', 'Stone fruit',
  'Floral', 'Tea-like', 'Honey', 'Syrupy', 'Bright', 'Creamy', 'Spicy', 'Winey',
  'Thin', 'Watery', 'Astringent', 'Dry finish', 'Ashy', 'Harsh',
];

export const BAG_SIZES = [200, 250, 340, 500, 1000];
