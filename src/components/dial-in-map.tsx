import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View, type LayoutChangeEvent } from 'react-native';
import Svg, { Circle, G, Line, Text as SvgText } from 'react-native-svg';

import type { Brew, Settings } from '@/data/types';
import { formatGrind, formatShortDate, formatTemp, formatTime, trimNumber } from '@/lib/format';
import { Fonts, Radius, Spacing } from '@/theme/tokens';
import { useTheme } from '@/theme/use-theme';

import { BALANCE_LABELS } from './balance';
import { Tap } from './tap';
import { AppText } from './text';

const H = 220;
const PAD = { l: 40, r: 16, t: 22, b: 26 };
const DOT_R = 7;

function niceStep(span: number, minStep: number, maxTicks: number): number {
  const candidates = [0.1, 0.25, 0.5, 1, 2, 5, 10, 20];
  return candidates.find((s) => s >= minStep && span / s <= maxTicks) ?? 20;
}

function ticks(lo: number, hi: number, step: number): number[] {
  const out: number[] = [];
  for (let v = Math.ceil(lo / step) * step; v <= hi + 1e-9; v += step) out.push(Number(v.toFixed(2)));
  return out;
}

function domain(values: number[], minPad: number, minSpan: number): [number, number] {
  let lo = Math.min(...values);
  let hi = Math.max(...values);
  const pad = Math.max(minPad, (hi - lo) * 0.2);
  lo -= pad;
  hi += pad;
  if (hi - lo < minSpan) {
    const mid = (hi + lo) / 2;
    lo = mid - minSpan / 2;
    hi = mid + minSpan / 2;
  }
  return [lo, hi];
}

/**
 * Dial-in map: every brew of one bean with one method, placed by grind (x) and
 * water temperature (y), shaded by cup score. Over time the dark dots cluster
 * around the bean's sweet spot.
 */
export function DialInMap({ brews, settings, bestId }: { brews: Brew[]; settings: Settings; bestId?: string }) {
  const { c } = useTheme();
  const [width, setWidth] = useState(0);
  const [selectedId, setSelectedId] = useState<string | undefined>(bestId);

  const onLayout = (e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width);
  const ordered = [...brews].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  const selected = brews.find((b) => b.id === selectedId) ?? brews.find((b) => b.id === bestId);

  const [x0, x1] = domain(ordered.map((b) => b.grind), settings.grindStep, settings.grindStep * 4);
  const [y0, y1] = domain(ordered.map((b) => b.temp), 1, 4);
  const plotW = Math.max(1, width - PAD.l - PAD.r);
  const plotH = H - PAD.t - PAD.b;
  const sx = (v: number) => PAD.l + ((v - x0) / (x1 - x0)) * plotW;
  const sy = (v: number) => PAD.t + (1 - (v - y0) / (y1 - y0)) * plotH;
  const xTicks = ticks(x0, x1, niceStep(x1 - x0, settings.grindStep, 6));
  const yTicks = ticks(y0, y1, niceStep(y1 - y0, 1, 5));

  // Brews at the exact same setting sit side by side instead of hiding each other.
  const seen = new Map<string, number>();
  const counts = new Map<string, number>();
  for (const b of ordered) counts.set(`${b.grind}|${b.temp}`, (counts.get(`${b.grind}|${b.temp}`) ?? 0) + 1);
  const points = ordered.map((b) => {
    const key = `${b.grind}|${b.temp}`;
    const i = seen.get(key) ?? 0;
    seen.set(key, i + 1);
    const n = counts.get(key) ?? 1;
    return { brew: b, x: sx(b.grind) + (i - (n - 1) / 2) * (DOT_R * 1.6), y: sy(b.temp) };
  });
  const best = points.find((p) => p.brew.id === bestId);
  const sel = points.find((p) => p.brew.id === selected?.id);
  const fontFamily = Fonts.ui;
  const finerLeft = settings.finerIsLower;

  return (
    <View style={[styles.card, { backgroundColor: c.surface, borderColor: c.line }]}>
      <View onLayout={onLayout} style={{ height: H }}>
        {width > 0 && (
          <Svg width={width} height={H} accessibilityLabel="Dial-in map of grind setting against water temperature">
            {yTicks.map((t) => (
              <G key={`y${t}`}>
                <Line x1={PAD.l} x2={width - PAD.r} y1={sy(t)} y2={sy(t)} stroke={c.line} strokeWidth={1} />
                <SvgText
                  x={PAD.l - 8}
                  y={sy(t) + 4}
                  fontSize={11}
                  fill={c.inkFaint}
                  textAnchor="end"
                  fontFamily={fontFamily}>
                  {`${trimNumber(t, 1)}°`}
                </SvgText>
              </G>
            ))}
            {xTicks.map((t) => (
              <SvgText
                key={`x${t}`}
                x={sx(t)}
                y={H - 6}
                fontSize={11}
                fill={c.inkFaint}
                textAnchor="middle"
                fontFamily={fontFamily}>
                {trimNumber(t)}
              </SvgText>
            ))}

            {points.map((p) => (
              <Circle
                key={p.brew.id}
                cx={p.x}
                cy={p.y}
                r={DOT_R}
                fill={c.scoreRamp[Math.min(5, Math.max(1, Math.round(p.brew.rating))) - 1]}
                stroke={c.surface}
                strokeWidth={2}
              />
            ))}

            {best && (
              <G>
                <Circle cx={best.x} cy={best.y} r={DOT_R + 5} fill="none" stroke={c.ink} strokeWidth={1.5} />
                <SvgText
                  x={best.x}
                  y={best.y - DOT_R - 9 < PAD.t - 8 ? best.y + DOT_R + 18 : best.y - DOT_R - 9}
                  fontSize={11}
                  fontWeight="700"
                  fill={c.ink}
                  textAnchor="middle"
                  fontFamily={fontFamily}>
                  Best
                </SvgText>
              </G>
            )}
            {sel && sel.brew.id !== best?.brew.id && (
              <Circle cx={sel.x} cy={sel.y} r={DOT_R + 4} fill="none" stroke={c.accent} strokeWidth={2} />
            )}

            {points.map((p) => (
              <Circle
                key={`hit${p.brew.id}`}
                cx={p.x}
                cy={p.y}
                r={18}
                fill="transparent"
                onPress={() => setSelectedId(p.brew.id)}
              />
            ))}
          </Svg>
        )}
      </View>

      <View style={styles.axis}>
        <AppText variant="caption" tone="inkSoft">
          ← {finerLeft ? 'Finer' : 'Coarser'}
        </AppText>
        <AppText variant="caption" tone="inkFaint" weight="600">
          GRIND
        </AppText>
        <AppText variant="caption" tone="inkSoft">
          {finerLeft ? 'Coarser' : 'Finer'} →
        </AppText>
      </View>

      <View style={[styles.footer, { borderTopColor: c.line }]}>
        <View style={styles.legend} accessibilityLabel="Darker dots are higher cup scores">
          <AppText variant="caption" tone="inkSoft">
            Cup score
          </AppText>
          <AppText variant="caption" tone="inkFaint">
            1
          </AppText>
          {c.scoreRamp.map((col) => (
            <View key={col} style={[styles.swatch, { backgroundColor: col }]} />
          ))}
          <AppText variant="caption" tone="inkFaint">
            5
          </AppText>
        </View>

        {selected && (
          <Tap
            onPress={() => router.push({ pathname: '/brew/[id]', params: { id: selected.id } })}
            haptic="select"
            pressScale={0.99}
            style={[styles.selected, { backgroundColor: c.surfaceAlt }]}>
            <View style={{ flex: 1 }}>
              <AppText variant="subhead" weight="600" tabular>
                Grind {formatGrind(selected.grind)} · {formatTemp(selected.temp)} · {formatTime(selected.time)}
              </AppText>
              <AppText variant="caption" tone="inkSoft">
                {selected.rating}/5 · {BALANCE_LABELS[selected.balance]} · {formatShortDate(new Date(selected.createdAt))}
              </AppText>
            </View>
            <AppText variant="subhead" tone="accent" weight="600">
              Open
            </AppText>
          </Tap>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: Radius.lg, borderWidth: StyleSheet.hairlineWidth, paddingTop: Spacing.sm, paddingHorizontal: Spacing.sm },
  axis: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingLeft: PAD.l - Spacing.sm,
    paddingRight: Spacing.sm,
    paddingTop: 2,
    paddingBottom: Spacing.sm,
  },
  footer: { borderTopWidth: StyleSheet.hairlineWidth, padding: Spacing.sm, paddingTop: Spacing.md, gap: Spacing.md },
  legend: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  swatch: { width: 16, height: 10, borderRadius: 3 },
  selected: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: Radius.md,
    gap: Spacing.md,
    marginBottom: Spacing.xs,
  },
});
