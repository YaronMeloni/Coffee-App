import { toLocalDateString } from '@/lib/format';
import { makeId } from '@/lib/id';

import type { Balance, Bean, Brew, BrewMethod, Strength } from './types';

/**
 * Sample shelf so the app can be explored before logging real coffee. The brews
 * tell a believable dial-in story: a sour gusher, a few corrections, a
 * five-star shot, an overshoot, and back again.
 */
export function makeSampleData(now = new Date()): { beans: Bean[]; brews: Brew[] } {
  const at = (daysAgo: number, hour = 8, minute = 0) => {
    const d = new Date(now);
    d.setDate(d.getDate() - daysAgo);
    d.setHours(hour, minute, 0, 0);
    return d.toISOString();
  };
  const roasted = (daysAgo: number) => {
    const d = new Date(now);
    d.setDate(d.getDate() - daysAgo);
    return toLocalDateString(d);
  };

  const bean = (b: Omit<Bean, 'id' | 'createdAt' | 'isFinished' | 'isFavorite'> & Partial<Bean>): Bean => ({
    id: makeId() + Math.random().toString(36).slice(2, 5),
    createdAt: at(20),
    isFinished: false,
    isFavorite: false,
    ...b,
  });

  const kochere = bean({
    name: 'Kochere',
    roaster: 'Northbound Roasters',
    origin: 'Ethiopia',
    region: 'Yirgacheffe',
    process: 'washed',
    varietal: 'Heirloom',
    roastLevel: 'light',
    roastDate: roasted(12),
    notes: ['Jasmine', 'Bergamot', 'White peach'],
    bagWeight: 250,
    isFavorite: true,
  });
  const pinkBourbon = bean({
    name: 'Pink Bourbon',
    roaster: 'Little Ember Coffee',
    origin: 'Colombia',
    region: 'Huila',
    process: 'washed',
    varietal: 'Pink Bourbon',
    roastLevel: 'medium-light',
    roastDate: roasted(19),
    notes: ['Red apple', 'Panela', 'Hibiscus'],
    bagWeight: 340,
  });
  const mantiqueira = bean({
    name: 'Mantiqueira',
    roaster: 'Copperline',
    origin: 'Brazil',
    region: 'Sul de Minas',
    process: 'natural',
    varietal: 'Yellow Bourbon',
    roastLevel: 'medium',
    roastDate: roasted(36),
    notes: ['Hazelnut', 'Milk chocolate', 'Brown sugar'],
    bagWeight: 500,
  });
  const kirinyaga = bean({
    name: 'Kirinyaga AA',
    roaster: 'Field & Fire',
    origin: 'Kenya',
    region: 'Kirinyaga',
    process: 'washed',
    varietal: 'SL28, SL34',
    roastLevel: 'light',
    roastDate: roasted(4),
    notes: ['Blackcurrant', 'Grapefruit', 'Cane sugar'],
    bagWeight: 250,
    createdAt: at(3),
  });
  const lintong = bean({
    name: 'Lintong',
    roaster: 'Copperline',
    origin: 'Indonesia',
    region: 'Sumatra',
    process: 'other',
    varietal: 'Typica',
    roastLevel: 'dark',
    roastDate: roasted(70),
    notes: ['Cedar', 'Dark chocolate', 'Earthy'],
    bagWeight: 250,
    isFinished: true,
    createdAt: at(60),
  });

  type Row = [
    bean: Bean,
    method: BrewMethod,
    when: string,
    grind: number,
    temp: number,
    dose: number,
    out: number,
    time: number,
    rating: number,
    balance: Balance,
    strength: Strength,
    flavors: string[],
    extra?: Partial<Brew>,
  ];

  const nowMinus1h = new Date(now.getTime() - 60 * 60 * 1000).toISOString();

  const rows: Row[] = [
    [kochere, 'espresso', at(9, 7, 40), 15, 93, 18, 36, 21, 2, -2, -1, ['Lemon', 'Thin'], { notes: 'Gushed. Way too sour.' }],
    [kochere, 'espresso', at(8, 7, 35), 13, 93, 18, 36, 25, 3, -1, 0, ['Citrus', 'Peach']],
    [kochere, 'espresso', at(6, 7, 50), 12, 93, 18, 37, 28, 3, -1, 0, ['Peach', 'Bright']],
    [kochere, 'espresso', at(5, 7, 45), 12, 94, 18, 37, 29, 5, 0, 0, ['Jasmine', 'Peach', 'Honey'], { notes: 'There it is. Floral and sweet.' }],
    [kochere, 'pourover', at(3, 9, 10), 24, 96, 15, 250, 175, 4, 0, 0, ['Bergamot', 'Tea-like'], { brewer: 'V60', bloom: 45 }],
    [kochere, 'espresso', at(2, 7, 30), 11, 94, 18, 36, 34, 3, 1, 1, ['Heavy', 'Dry finish'], { notes: 'Too fine. Choked a little.' }],
    [kochere, 'espresso', nowMinus1h, 12, 94, 18, 38, 29, 4, 0, 0, ['Jasmine', 'Honey']],
    [pinkBourbon, 'pourover', at(7, 8, 20), 20, 93, 15, 250, 240, 2, 1, 1, ['Astringent'], { brewer: 'V60', bloom: 40 }],
    [pinkBourbon, 'pourover', at(6, 8, 15), 22, 93, 15, 250, 205, 3, 0, -1, ['Red apple', 'Watery'], { brewer: 'V60', bloom: 40 }],
    [pinkBourbon, 'pourover', at(4, 8, 25), 22, 93, 16, 250, 210, 4, 0, 0, ['Red apple', 'Caramel', 'Juicy'], { brewer: 'V60', bloom: 45 }],
    [pinkBourbon, 'aeropress', at(1, 14, 5), 16, 85, 15, 220, 105, 3, -1, 0, ['Cranberry', 'Bright'], { brewer: 'Inverted' }],
    [mantiqueira, 'immersion', at(10, 9, 0), 30, 95, 30, 500, 240, 4, 0, 0, ['Chocolate', 'Nutty', 'Syrupy'], { brewer: 'French press' }],
    [mantiqueira, 'espresso', at(11, 7, 55), 14, 94, 18.5, 37, 31, 3, 1, 0, ['Cocoa', 'Bitter finish']],
    [mantiqueira, 'espresso', at(4, 7, 40), 14, 92, 18.5, 37, 30, 4, 0, 0, ['Chocolate', 'Hazelnut']],
    [lintong, 'espresso', at(30, 7, 30), 16, 90, 18, 36, 27, 3, 0, 0, ['Dark chocolate', 'Cedar']],
  ];

  const brews: Brew[] = rows.map(
    ([b, method, createdAt, grind, temp, dose, out, time, rating, balance, strength, flavors, extra]) => ({
      id: makeId() + Math.random().toString(36).slice(2, 5),
      beanId: b.id,
      method,
      createdAt,
      grind,
      temp,
      dose,
      yield: out,
      time,
      rating,
      balance,
      strength,
      flavors,
      ...extra,
    }),
  );

  return { beans: [kochere, pinkBourbon, mantiqueira, kirinyaga, lintong], brews };
}
