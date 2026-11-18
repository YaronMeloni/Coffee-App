import { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { clamp, roundToStep } from '@/lib/format';
import { haptics } from '@/lib/haptics';
import type { IconName } from '@/lib/icons';
import { Fonts, Radius, Spacing } from '@/theme/tokens';
import { useTheme } from '@/theme/use-theme';

import { Icon } from './icon';
import { AppText } from './text';

export interface StepperProps {
  label: string;
  icon?: IconName;
  value: number;
  onChange: (v: number) => void;
  step: number;
  min?: number;
  max?: number;
  format: (v: number) => string;
  hint?: string;
  /** Highlights the tile, e.g. when the coach just changed this value. */
  highlighted?: boolean;
  /** One-row layout for secondary, optional values. */
  compact?: boolean;
}

/**
 * A big, thumb-friendly dial for one recipe variable. Tap ± for one step, hold
 * to run, or tap the number to type it.
 */
export function Stepper({
  label,
  icon,
  value,
  onChange,
  step,
  min = 0,
  max = 9999,
  format,
  hint,
  highlighted,
  compact,
}: StepperProps) {
  const { c } = useTheme();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState('');
  const valueRef = useRef(value);
  const repeat = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    valueRef.current = value;
  }, [value]);

  function nudge(dir: 1 | -1) {
    const next = clamp(roundToStep(valueRef.current + dir * step, step), min, max);
    if (next === valueRef.current) {
      haptics.warning();
      return;
    }
    valueRef.current = next;
    haptics.select();
    onChange(next);
  }

  function startRepeat(dir: 1 | -1) {
    stopRepeat();
    repeat.current = setInterval(() => nudge(dir), 85);
  }

  function stopRepeat() {
    if (repeat.current) clearInterval(repeat.current);
    repeat.current = null;
  }

  useEffect(
    () => () => {
      if (repeat.current) clearInterval(repeat.current);
    },
    [],
  );

  function commit() {
    const parsed = Number(draft.replace(',', '.'));
    if (draft.trim() !== '' && Number.isFinite(parsed)) {
      onChange(clamp(roundToStep(parsed, step), min, max));
    }
    setEditing(false);
  }

  const button = (dir: 1 | -1) => (
    <Pressable
      onPress={() => nudge(dir)}
      onLongPress={() => startRepeat(dir)}
      onPressOut={stopRepeat}
      delayLongPress={320}
      hitSlop={6}
      accessibilityRole="button"
      accessibilityLabel={`${dir > 0 ? 'Increase' : 'Decrease'} ${label}`}
      style={({ pressed }) => [
        styles.btn,
        { backgroundColor: pressed ? c.surfacePressed : c.surfaceAlt },
        pressed && { transform: [{ scale: 0.92 }] },
      ]}>
      <Icon name={dir > 0 ? 'add' : 'minus'} size={18} color={c.ink} weight="bold" />
    </Pressable>
  );

  if (compact) {
    return (
      <View
        style={[styles.compact, { backgroundColor: c.surface, borderColor: c.line }]}
        accessibilityRole="adjustable"
        accessibilityLabel={label}
        aria-valuetext={format(value)}
        accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
        onAccessibilityAction={(e) => nudge(e.nativeEvent.actionName === 'increment' ? 1 : -1)}>
        <View style={{ flex: 1 }}>
          <AppText variant="eyebrow" tone="inkSoft">
            {label}
          </AppText>
          {hint && (
            <AppText variant="caption" tone="inkFaint">
              {hint}
            </AppText>
          )}
        </View>
        <View style={styles.compactBtn}>{button(-1)}</View>
        <AppText variant="numberSmall" align="center" style={styles.compactValue}>
          {format(value)}
        </AppText>
        <View style={styles.compactBtn}>{button(1)}</View>
      </View>
    );
  }

  return (
    <View
      style={[
        styles.tile,
        {
          backgroundColor: c.surface,
          borderColor: highlighted ? c.accent : c.line,
          borderWidth: highlighted ? 1.5 : StyleSheet.hairlineWidth,
        },
      ]}
      accessibilityRole="adjustable"
      accessibilityLabel={label}
      aria-valuetext={format(value)}
      accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
      onAccessibilityAction={(e) => nudge(e.nativeEvent.actionName === 'increment' ? 1 : -1)}>
      <View style={styles.labelRow}>
        {icon && <Icon name={icon} size={13} color={c.inkSoft} />}
        <AppText variant="eyebrow" tone="inkSoft">
          {label}
        </AppText>
      </View>

      {editing ? (
        <TextInput
          value={draft}
          onChangeText={setDraft}
          onBlur={commit}
          onSubmitEditing={commit}
          autoFocus
          selectTextOnFocus
          keyboardType="decimal-pad"
          returnKeyType="done"
          style={[styles.input, { color: c.ink, fontFamily: Fonts.number, borderColor: c.accent }]}
        />
      ) : (
        <Pressable
          onPress={() => {
            setDraft(String(value));
            setEditing(true);
          }}
          accessibilityLabel={`Type ${label}`}>
          <AppText variant="number" align="center" numberOfLines={1} adjustsFontSizeToFit>
            {format(value)}
          </AppText>
        </Pressable>
      )}

      <AppText variant="caption" tone="inkFaint" align="center" numberOfLines={1} style={{ minHeight: 16 }}>
        {hint ?? ' '}
      </AppText>

      <View style={styles.btnRow}>
        {button(-1)}
        {button(1)}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  tile: {
    flex: 1,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    gap: Spacing.xs,
    minWidth: 140,
  },
  labelRow: { flexDirection: 'row', alignItems: 'center', gap: 5, justifyContent: 'center' },
  input: {
    fontSize: 28,
    textAlign: 'center',
    borderBottomWidth: 1.5,
    paddingVertical: 2,
    minHeight: 36,
  },
  btnRow: { flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.xs },
  btn: { flex: 1, height: 40, borderRadius: Radius.sm, alignItems: 'center', justifyContent: 'center' },
  compact: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    borderRadius: Radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    paddingVertical: Spacing.sm,
    paddingLeft: Spacing.lg,
    paddingRight: Spacing.sm,
  },
  compactBtn: { width: 44, flexDirection: 'row' },
  compactValue: { minWidth: 64 },
});
