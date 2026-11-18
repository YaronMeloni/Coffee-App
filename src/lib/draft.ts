import type { Bean, Brew, BrewMethod, Recipe, Settings } from '@/data/types';

import { adviseNextBrew, applyChanges, type Advice } from './dial-in';
import { formatShortDate } from './format';
import { METHODS } from './methods';
import { bestBrew, brewsForBean, byNewest, isDialedIn } from './stats';

export interface DraftRecipe extends Recipe {
  brewer?: string;
}

export interface BrewDraft {
  beanId?: string;
  method: BrewMethod;
  recipe: DraftRecipe;
  /** Human explanation of where the starting numbers came from. */
  sourceLabel: string;
  /** A coach suggestion from the last brew that the user can apply with one tap. */
  pendingAdvice?: Advice;
}

function recipeOf(b: Brew): DraftRecipe {
  return {
    grind: b.grind,
    temp: b.temp,
    dose: b.dose,
    yield: b.yield,
    time: b.time,
    preinfusion: b.preinfusion,
    bloom: b.bloom,
    brewer: b.brewer,
  };
}

export function pickDefaultBean(beans: Bean[], brews: Brew[]): Bean | undefined {
  const shelf = beans.filter((b) => !b.isFinished);
  const last = [...brews].sort(byNewest).find((br) => shelf.some((b) => b.id === br.beanId));
  return shelf.find((b) => b.id === last?.beanId) ?? shelf[0];
}

export function pickDefaultMethod(brews: Brew[], beanId?: string): BrewMethod {
  const sorted = [...brews].sort(byNewest);
  return (sorted.find((b) => b.beanId === beanId) ?? sorted[0])?.method ?? 'espresso';
}

/** Recipe for a bean+method when you switch method or bean in the form. */
export function draftFor(
  bean: Bean | undefined,
  method: BrewMethod,
  brews: Brew[],
  settings: Settings,
): BrewDraft {
  const history = bean ? brewsForBean(brews, bean.id, method) : [];
  const best = bestBrew(history);

  if (best && isDialedIn(best)) {
    return {
      beanId: bean?.id,
      method,
      recipe: recipeOf(best),
      sourceLabel: `Your best recipe · ${best.rating}★ · ${formatShortDate(new Date(best.createdAt))}`,
    };
  }

  const last = history[0];
  if (last) {
    const advice = adviseNextBrew(last, settings, bean);
    return {
      beanId: bean?.id,
      method,
      recipe: recipeOf(last),
      sourceLabel: `Your last ${METHODS[method].label.toLowerCase()} · ${formatShortDate(new Date(last.createdAt))}`,
      pendingAdvice: advice.changes.length > 0 ? advice : undefined,
    };
  }

  const anyOfMethod = brews.filter((b) => b.method === method).sort(byNewest)[0];
  if (anyOfMethod) {
    return {
      beanId: bean?.id,
      method,
      recipe: { ...recipeOf(anyOfMethod) },
      sourceLabel: `First time with this bean. Starting from your last ${METHODS[method].label.toLowerCase()}.`,
    };
  }

  return {
    beanId: bean?.id,
    method,
    recipe: { ...METHODS[method].defaults, brewer: METHODS[method].brewers[0] },
    sourceLabel: `A classic ${METHODS[method].label.toLowerCase()} starting point`,
  };
}

/** Recipe when re-brewing from a specific brew, optionally with the coach's changes. */
export function draftFromBrew(source: Brew, settings: Settings, bean: Bean | undefined, apply: boolean): BrewDraft {
  if (apply) {
    const advice = adviseNextBrew(source, settings, bean);
    return {
      beanId: source.beanId,
      method: source.method,
      recipe: applyChanges(recipeOf(source), advice.changes),
      sourceLabel: `Coach: ${advice.title.toLowerCase()}`,
    };
  }
  return {
    beanId: source.beanId,
    method: source.method,
    recipe: recipeOf(source),
    sourceLabel: `Repeating ${formatShortDate(new Date(source.createdAt))}`,
  };
}
