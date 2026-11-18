import type { SFSymbol } from 'sf-symbols-typescript';

/**
 * Every icon in the app, mapped to an SF Symbol on iOS and a Material Symbol
 * everywhere else, so screens never reference platform-specific names.
 */
export const ICONS = {
  today: { ios: 'cup.and.saucer', web: 'local_cafe' },
  todayFill: { ios: 'cup.and.saucer.fill', web: 'local_cafe' },
  beans: { ios: 'bag', web: 'inventory_2' },
  beansFill: { ios: 'bag.fill', web: 'inventory_2' },
  journal: { ios: 'book.closed', web: 'menu_book' },
  journalFill: { ios: 'book.closed.fill', web: 'menu_book' },
  espresso: { ios: 'cup.and.saucer.fill', web: 'coffee' },
  pourover: { ios: 'drop.fill', web: 'water_drop' },
  aeropress: { ios: 'arrow.down.to.line', web: 'vertical_align_bottom' },
  immersion: { ios: 'mug.fill', web: 'coffee_maker' },
  add: { ios: 'plus', web: 'add' },
  minus: { ios: 'minus', web: 'remove' },
  settings: { ios: 'gearshape', web: 'settings' },
  close: { ios: 'xmark', web: 'close' },
  back: { ios: 'chevron.left', web: 'chevron_left' },
  chevron: { ios: 'chevron.right', web: 'chevron_right' },
  edit: { ios: 'pencil', web: 'edit' },
  trash: { ios: 'trash', web: 'delete' },
  archive: { ios: 'archivebox', web: 'archive' },
  restore: { ios: 'arrow.uturn.backward', web: 'undo' },
  check: { ios: 'checkmark', web: 'check' },
  seal: { ios: 'checkmark.seal.fill', web: 'verified' },
  heart: { ios: 'heart', web: 'favorite_border' },
  heartFill: { ios: 'heart.fill', web: 'favorite' },
  thermometer: { ios: 'thermometer.medium', web: 'thermostat' },
  timer: { ios: 'timer', web: 'timer' },
  play: { ios: 'play.fill', web: 'play_arrow' },
  stop: { ios: 'stop.fill', web: 'stop' },
  reset: { ios: 'arrow.counterclockwise', web: 'restart_alt' },
  sparkles: { ios: 'sparkles', web: 'auto_awesome' },
  dial: { ios: 'dial.medium', web: 'tune' },
  scale: { ios: 'scalemass', web: 'scale' },
  leaf: { ios: 'leaf', web: 'eco' },
  flame: { ios: 'flame', web: 'local_fire_department' },
  calendar: { ios: 'calendar', web: 'calendar_today' },
  arrowRight: { ios: 'arrow.right', web: 'arrow_forward' },
  finer: { ios: 'arrow.down.right', web: 'south_east' },
  coarser: { ios: 'arrow.up.right', web: 'north_east' },
  up: { ios: 'arrow.up', web: 'arrow_upward' },
  down: { ios: 'arrow.down', web: 'arrow_downward' },
  chart: { ios: 'chart.dots.scatter', web: 'scatter_plot' },
} satisfies Record<string, { ios: SFSymbol; web: string }>;

export type IconName = keyof typeof ICONS;
