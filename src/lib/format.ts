export function decimalsOf(step: number): number {
  const s = String(step);
  const dot = s.indexOf('.');
  return dot === -1 ? 0 : s.length - dot - 1;
}

/** Snap to the nearest multiple of `step` without floating-point noise (12.300000001). */
export function roundToStep(value: number, step: number): number {
  const d = decimalsOf(step);
  return Number((Math.round(value / step) * step).toFixed(d));
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/** 12 → "12", 12.5 → "12.5", 18.25 → "18.25". */
export function trimNumber(value: number, maxDecimals = 2): string {
  return String(Number(value.toFixed(maxDecimals)));
}

export const formatGrind = (v: number) => trimNumber(v);
export const formatTemp = (v: number) => `${trimNumber(v, 1)}°`;
export const formatGrams = (v: number) => `${trimNumber(v, 1)} g`;

/** 28 → "0:28", 185 → "3:05". */
export function formatTime(seconds: number): string {
  const s = Math.max(0, Math.round(seconds));
  const m = Math.floor(s / 60);
  return `${m}:${String(s % 60).padStart(2, '0')}`;
}

/** Ratio as "1:2.0" (espresso) or "1:16.7" (filter). */
export function formatRatio(ratio: number): string {
  if (!Number.isFinite(ratio) || ratio <= 0) return '—';
  return `1:${ratio.toFixed(1)}`;
}

/** Parse "yyyy-mm-dd" as a local calendar date (not UTC midnight). */
export function parseLocalDate(isoDate: string): Date {
  const [y, m, d] = isoDate.slice(0, 10).split('-').map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1);
}

export function toLocalDateString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function daysBetween(from: Date, to: Date): number {
  return Math.round((startOfDay(to).getTime() - startOfDay(from).getTime()) / 86_400_000);
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const WEEKDAYS_LONG = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTHS_LONG = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

/** "16 Nov" */
export function formatShortDate(date: Date): string {
  return `${date.getDate()} ${MONTHS[date.getMonth()]}`;
}

/** "Today", "Yesterday", or "Mon, 16 Nov". */
export function formatDayLabel(date: Date, now = new Date()): string {
  const diff = daysBetween(date, now);
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Yesterday';
  return `${WEEKDAYS[date.getDay()]}, ${formatShortDate(date)}`;
}

/** "Wednesday · 18 November" */
export function formatLongToday(now = new Date()): string {
  return `${WEEKDAYS_LONG[now.getDay()]} · ${now.getDate()} ${MONTHS_LONG[now.getMonth()]}`;
}

export function formatClock(date: Date): string {
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

export function greeting(now = new Date()): string {
  const h = now.getHours();
  if (h < 5) return 'Late night';
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}
