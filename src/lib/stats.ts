import type { Bean, Brew, BrewMethod } from '@/data/types';

export function byNewest(a: Brew, b: Brew): number {
  return b.createdAt.localeCompare(a.createdAt);
}

export function brewsForBean(brews: Brew[], beanId: string, method?: BrewMethod): Brew[] {
  return brews
    .filter((b) => b.beanId === beanId && (method === undefined || b.method === method))
    .sort(byNewest);
}

/**
 * The best extraction: highest cup score, then the most balanced, then the most
 * recent. This is what "your recipe" for a bean means.
 */
export function bestBrew(brews: Brew[]): Brew | undefined {
  let best: Brew | undefined;
  for (const b of brews) {
    if (
      !best ||
      b.rating > best.rating ||
      (b.rating === best.rating && Math.abs(b.balance) < Math.abs(best.balance)) ||
      (b.rating === best.rating &&
        Math.abs(b.balance) === Math.abs(best.balance) &&
        b.createdAt > best.createdAt)
    ) {
      best = b;
    }
  }
  return best;
}

/** A bean is dialed in for a method once a balanced brew scores 4 or more. */
export function isDialedIn(best: Brew | undefined): boolean {
  return !!best && best.rating >= 4 && best.balance === 0;
}

export function methodsUsed(brews: Brew[]): BrewMethod[] {
  return [...new Set(brews.map((b) => b.method))];
}

export interface BagStatus {
  used: number;
  remaining: number;
  fraction: number;
  /** How many more brews the rest of the bag makes at your latest dose. */
  servingsLeft: number;
}

export function bagStatus(bean: Bean, beanBrews: Brew[]): BagStatus | undefined {
  if (!bean.bagWeight) return undefined;
  const used = beanBrews.reduce((sum, b) => sum + b.dose, 0);
  const remaining = Math.max(0, bean.bagWeight - used);
  const lastDose = beanBrews[0]?.dose ?? 18;
  return {
    used,
    remaining,
    fraction: bean.bagWeight > 0 ? remaining / bean.bagWeight : 0,
    servingsLeft: Math.floor(remaining / lastDose),
  };
}

export function averageRating(brews: Brew[]): number | undefined {
  if (brews.length === 0) return undefined;
  return brews.reduce((s, b) => s + b.rating, 0) / brews.length;
}
