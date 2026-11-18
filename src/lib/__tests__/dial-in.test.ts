/// <reference types="node" />
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import type { Brew, Settings } from '../../data/types';
import { adviseNextBrew, applyChanges } from '../dial-in';
import { draftFor, draftFromBrew } from '../draft';
import { roundToStep } from '../format';
import { freshnessOf } from '../freshness';
import { bagStatus, bestBrew, isDialedIn } from '../stats';
import { makeSampleData } from '../../data/seed';

const settings: Settings = { grinderName: 'Test', grindStep: 1, finerIsLower: true };

function shot(p: Partial<Brew> = {}): Brew {
  return {
    id: 'x',
    beanId: 'b',
    method: 'espresso',
    createdAt: '2026-11-10T07:00:00.000Z',
    grind: 12,
    temp: 93,
    dose: 18,
    yield: 36,
    time: 28,
    rating: 3,
    balance: 0,
    strength: 0,
    flavors: [],
    ...p,
  };
}

describe('dial-in coach: espresso', () => {
  it('sour and fast → grind finer by one step', () => {
    const a = adviseNextBrew(shot({ balance: -1, time: 20 }), settings);
    assert.equal(a.tone, 'sour');
    assert.deepEqual(a.changes, [{ key: 'grind', from: 12, to: 11 }]);
  });

  it('very sour → two steps finer', () => {
    const a = adviseNextBrew(shot({ balance: -2, time: 20 }), settings);
    assert.equal(a.changes[0].to, 10);
  });

  it('respects grinders where a higher number is finer', () => {
    const a = adviseNextBrew(shot({ balance: -1, time: 20 }), { ...settings, finerIsLower: false });
    assert.equal(a.changes[0].to, 13);
  });

  it('respects fractional grind steps', () => {
    const a = adviseNextBrew(shot({ balance: -1, time: 20, grind: 2.3 }), { ...settings, grindStep: 0.1 });
    assert.equal(a.changes[0].to, 2.2);
  });

  it('sour with good timing → raise the temperature, not the grind', () => {
    const a = adviseNextBrew(shot({ balance: -1, time: 28 }), settings);
    assert.deepEqual(a.changes, [{ key: 'temp', from: 93, to: 94 }]);
  });

  it('sour at max temperature → longer shot', () => {
    const a = adviseNextBrew(shot({ balance: -1, time: 28, temp: 96 }), settings);
    assert.equal(a.changes[0].key, 'yield');
    assert.ok(a.changes[0].to > 36);
  });

  it('bitter and slow → grind coarser', () => {
    const a = adviseNextBrew(shot({ balance: 1, time: 36 }), settings);
    assert.equal(a.tone, 'bitter');
    assert.deepEqual(a.changes, [{ key: 'grind', from: 12, to: 13 }]);
  });

  it('bitter with good timing → lower the temperature', () => {
    const a = adviseNextBrew(shot({ balance: 1, time: 28 }), settings);
    assert.deepEqual(a.changes, [{ key: 'temp', from: 93, to: 92 }]);
  });

  it('bitter at min temperature → shorter shot', () => {
    const a = adviseNextBrew(shot({ balance: 1, time: 28, temp: 88 }), settings);
    assert.equal(a.changes[0].key, 'yield');
    assert.ok(a.changes[0].to < 36);
  });

  it('balanced but thin → tighter ratio', () => {
    const a = adviseNextBrew(shot({ strength: -1 }), settings);
    assert.equal(a.tone, 'strength');
    assert.equal(a.changes[0].key, 'yield');
    assert.ok(a.changes[0].to < 36);
  });

  it('balanced, right strength, loved → dialed in, no changes', () => {
    const a = adviseNextBrew(shot({ rating: 5 }), settings);
    assert.equal(a.tone, 'dialed');
    assert.equal(a.changes.length, 0);
  });

  it('balanced but meh, dark roast → a little cooler', () => {
    const a = adviseNextBrew(shot({ rating: 3 }), settings, {
      id: 'b', name: 'Dark', roaster: '', origin: '', process: 'washed', roastLevel: 'dark',
      notes: [], isFavorite: false, isFinished: false, createdAt: '',
    });
    assert.deepEqual(a.changes, [{ key: 'temp', from: 93, to: 92 }]);
  });

  it('never suggests a grind below zero', () => {
    const a = adviseNextBrew(shot({ balance: -2, time: 18, grind: 1 }), settings);
    assert.equal(a.changes[0].to, 0);
  });
});

describe('dial-in coach: other methods', () => {
  it('pour-over bitter and slow → coarser', () => {
    const a = adviseNextBrew(shot({ method: 'pourover', balance: 1, time: 260, yield: 250, dose: 15 }), settings);
    assert.equal(a.changes[0].key, 'grind');
    assert.equal(a.changes[0].to, 13);
  });

  it('immersion sour → finer even though steep time is user-controlled', () => {
    const a = adviseNextBrew(shot({ method: 'immersion', balance: -1, time: 240, yield: 500, dose: 30 }), settings);
    assert.equal(a.changes[0].key, 'grind');
    assert.equal(a.changes[0].to, 11);
  });

  it('aeropress sour → hotter', () => {
    const a = adviseNextBrew(shot({ method: 'aeropress', balance: -1, temp: 85, time: 105, yield: 220, dose: 15 }), settings);
    assert.deepEqual(a.changes, [{ key: 'temp', from: 85, to: 86 }]);
  });

  it('filter balanced but watery → more coffee', () => {
    const a = adviseNextBrew(shot({ method: 'pourover', strength: -1, time: 200, yield: 250, dose: 15 }), settings);
    assert.deepEqual(a.changes, [{ key: 'dose', from: 15, to: 16 }]);
  });
});

describe('recipe helpers', () => {
  it('applyChanges returns a new recipe', () => {
    const r = shot();
    const next = applyChanges(r, [{ key: 'grind', from: 12, to: 11 }]);
    assert.equal(next.grind, 11);
    assert.equal(r.grind, 12);
  });

  it('roundToStep avoids floating-point noise', () => {
    assert.equal(roundToStep(18 + 0.1 + 0.1 + 0.1, 0.1), 18.3);
    assert.equal(roundToStep(36 * 1.1, 0.5), 39.5);
  });

  it('bestBrew prefers score, then balance, then recency', () => {
    const a = shot({ id: 'a', rating: 4, balance: 1 });
    const b = shot({ id: 'b', rating: 4, balance: 0 });
    const c = shot({ id: 'c', rating: 3, balance: 0 });
    assert.equal(bestBrew([a, b, c])?.id, 'b');
    assert.equal(isDialedIn(bestBrew([a, b, c])), true);
    assert.equal(isDialedIn(bestBrew([c])), false);
  });

  it('bag status estimates servings left from the latest dose', () => {
    const bean = { bagWeight: 250 } as Parameters<typeof bagStatus>[0];
    const s = bagStatus(bean, [shot({ dose: 18 }), shot({ dose: 18 })]);
    assert.equal(s?.remaining, 214);
    assert.equal(s?.servingsLeft, 11);
  });

  it('freshness windows', () => {
    const now = new Date(2026, 10, 18);
    assert.equal(freshnessOf('2026-11-15', now)?.stage, 'resting');
    assert.equal(freshnessOf('2026-11-06', now)?.stage, 'peak');
    assert.equal(freshnessOf('2026-10-10', now)?.stage, 'fading');
    assert.equal(freshnessOf('2026-09-01', now)?.stage, 'stale');
    assert.equal(freshnessOf(undefined, now), undefined);
  });
});

describe('smart drafts on the sample data', () => {
  const { beans, brews } = makeSampleData(new Date(2026, 10, 18, 10, 0));
  const kochere = beans.find((b) => b.name === 'Kochere')!;
  const kenya = beans.find((b) => b.name === 'Kirinyaga AA')!;
  const pink = beans.find((b) => b.name === 'Pink Bourbon')!;

  it('a dialed-in bean starts from its best recipe', () => {
    const d = draftFor(kochere, 'espresso', brews, settings);
    assert.match(d.sourceLabel, /best recipe/);
    assert.equal(d.recipe.grind, 12);
    assert.equal(d.recipe.temp, 94);
    assert.equal(d.pendingAdvice, undefined);
  });

  it('a bean still being dialed in starts from the last brew and offers the next change', () => {
    const d = draftFor(pink, 'aeropress', brews, settings);
    assert.match(d.sourceLabel, /last aeropress/);
    assert.equal(d.pendingAdvice?.changes[0].key, 'temp');
  });

  it('a new bean borrows the last recipe for that method', () => {
    const d = draftFor(kenya, 'espresso', brews, settings);
    assert.match(d.sourceLabel, /First time/);
  });

  it('a method never used falls back to classic defaults', () => {
    const d = draftFor(kenya, 'espresso', [], settings);
    assert.equal(d.recipe.dose, 18);
    assert.equal(d.recipe.yield, 36);
  });

  it('re-brewing with the coach applies its change', () => {
    const sour = brews.find((b) => b.beanId === kochere.id && b.time === 21)!;
    const d = draftFromBrew(sour, settings, kochere, true);
    assert.equal(d.recipe.grind, 13);
  });
});
