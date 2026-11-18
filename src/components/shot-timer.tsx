import { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { clamp, formatTime } from '@/lib/format';
import { haptics } from '@/lib/haptics';
import { Fonts, Radius, Spacing } from '@/theme/tokens';
import { useTheme } from '@/theme/use-theme';

import { Icon } from './icon';
import { Tap } from './tap';
import { AppText } from './text';

/**
 * Built-in brew timer. Start it when you start the pump (or the pour), stop it
 * when you're done, and the time is recorded. A haptic tap marks the moment
 * you enter the target window.
 */
export function ShotTimer({
  label,
  value,
  onChange,
  target,
  step,
}: {
  label: string;
  value: number;
  onChange: (seconds: number) => void;
  target: [number, number];
  step: number;
}) {
  const { c } = useTheme();
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const startedAt = useRef(0);
  const enteredWindow = useRef(false);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      const s = (Date.now() - startedAt.current) / 1000;
      setElapsed(s);
      if (!enteredWindow.current && s >= target[0]) {
        enteredWindow.current = true;
        haptics.success();
      }
    }, 100);
    return () => clearInterval(id);
  }, [running, target]);

  const shown = running ? elapsed : value;
  const [lo, hi] = target;
  const scaleMax = hi * 1.35;
  const pos = clamp(shown / scaleMax, 0, 1);
  const inWindow = shown >= lo && shown <= hi;

  function toggle() {
    if (running) {
      setRunning(false);
      haptics.firm();
      onChange(Math.round(elapsed));
    } else {
      startedAt.current = Date.now();
      enteredWindow.current = false;
      setElapsed(0);
      setRunning(true);
      haptics.firm();
    }
  }

  const adjust = (dir: 1 | -1) => (
    <Pressable
      onPress={() => {
        haptics.select();
        onChange(Math.max(0, value + dir * step));
      }}
      disabled={running}
      hitSlop={8}
      accessibilityLabel={`${dir > 0 ? 'Add' : 'Remove'} ${step} seconds`}
      style={({ pressed }) => [
        styles.adjust,
        { backgroundColor: pressed ? c.surfacePressed : c.surfaceAlt, opacity: running ? 0.35 : 1 },
      ]}>
      <Icon name={dir > 0 ? 'add' : 'minus'} size={16} color={c.ink} weight="bold" />
    </Pressable>
  );

  return (
    <View style={[styles.card, { backgroundColor: c.surface, borderColor: c.line }]}>
      <View style={styles.head}>
        <View style={styles.labelRow}>
          <Icon name="timer" size={13} color={c.inkSoft} />
          <AppText variant="eyebrow" tone="inkSoft">
            {label}
          </AppText>
        </View>
        <AppText variant="caption" tone="inkFaint">
          Target {formatTime(lo)}–{formatTime(hi)}
        </AppText>
      </View>

      <View style={styles.readoutRow}>
        {adjust(-1)}
        <AppText
          style={[styles.readout, { fontFamily: Fonts.number }]}
          color={running ? c.accent : c.ink}
          tabular
          accessibilityLiveRegion="polite">
          {running ? `${formatTime(elapsed)}.${Math.floor((elapsed % 1) * 10)}` : formatTime(value)}
        </AppText>
        {adjust(1)}
      </View>

      <View style={styles.trackWrap} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
        <View style={[styles.track, { backgroundColor: c.surfaceAlt }]}>
          <View
            style={[
              styles.window,
              {
                left: `${(lo / scaleMax) * 100}%`,
                width: `${((hi - lo) / scaleMax) * 100}%`,
                backgroundColor: c.goodSoft,
                borderColor: c.good,
              },
            ]}
          />
        </View>
        <View
          style={[
            styles.marker,
            {
              left: `${pos * 100}%`,
              backgroundColor: inWindow ? c.good : c.accent,
              borderColor: c.surface,
            },
          ]}
        />
      </View>

      <Tap
        onPress={toggle}
        haptic={false}
        accessibilityLabel={running ? 'Stop timer' : 'Start timer'}
        style={[styles.go, { backgroundColor: running ? c.ink : c.accent }]}>
        <Icon name={running ? 'stop' : 'play'} size={16} color={running ? c.bg : c.accentInk} />
        <AppText variant="headline" color={running ? c.bg : c.accentInk}>
          {running ? 'Stop' : 'Start timer'}
        </AppText>
      </Tap>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: Radius.lg, borderWidth: StyleSheet.hairlineWidth, padding: Spacing.lg, gap: Spacing.md },
  head: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  labelRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  readoutRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  readout: { fontSize: 56, lineHeight: 64, letterSpacing: -1 },
  adjust: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  trackWrap: { height: 18, justifyContent: 'center' },
  track: { height: 8, borderRadius: 4, overflow: 'hidden' },
  window: { position: 'absolute', top: 0, bottom: 0, borderLeftWidth: 1.5, borderRightWidth: 1.5 },
  marker: {
    position: 'absolute',
    width: 18,
    height: 18,
    marginLeft: -9,
    borderRadius: 9,
    borderWidth: 3,
  },
  go: {
    flexDirection: 'row',
    gap: Spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.pill,
    paddingVertical: 14,
  },
});
