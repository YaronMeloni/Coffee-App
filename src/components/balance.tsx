import { StyleSheet, View } from 'react-native';

import type { Balance, Strength } from '@/data/types';
import { Radius, Spacing } from '@/theme/tokens';
import { useTheme, type Theme } from '@/theme/use-theme';

import { Tap } from './tap';
import { AppText } from './text';

export const BALANCE_LABELS: Record<Balance, string> = {
  [-2]: 'Very sour',
  [-1]: 'Sour',
  0: 'Balanced',
  1: 'Bitter',
  2: 'Very bitter',
};

export const STRENGTH_LABELS: Record<Strength, string> = {
  [-1]: 'Weak',
  0: 'Just right',
  1: 'Strong',
};

export function balanceColor(balance: number, c: Theme['c']): string {
  if (balance < 0) return c.sour;
  if (balance > 0) return c.bitter;
  return c.good;
}

export function balanceSoft(balance: number, c: Theme['c']): string {
  if (balance < 0) return c.sourSoft;
  if (balance > 0) return c.bitterSoft;
  return c.goodSoft;
}

/** Compact taste tag. The dot carries the colour; the label stays in ink. */
export function BalanceTag({ balance, compact }: { balance: Balance; compact?: boolean }) {
  const { c } = useTheme();
  const label = compact ? BALANCE_LABELS[Math.sign(balance) as Balance] : BALANCE_LABELS[balance];
  return (
    <View style={[styles.tag, { backgroundColor: balanceSoft(balance, c) }]}>
      <View style={[styles.tagDot, { backgroundColor: balanceColor(balance, c) }]} />
      <AppText variant="caption" weight="600" tone="ink">
        {label}
      </AppText>
    </View>
  );
}

const BALANCE_STEPS: Balance[] = [-2, -1, 0, 1, 2];

/** Five-step taste scale from sour (under-extracted) to bitter (over-extracted). */
export function BalancePicker({ value, onChange }: { value: Balance; onChange: (v: Balance) => void }) {
  const { c } = useTheme();
  return (
    <View style={{ gap: Spacing.sm }}>
      <View style={styles.scale}>
        {BALANCE_STEPS.map((b) => {
          const active = b === value;
          const color = balanceColor(b, c);
          return (
            <Tap
              key={b}
              onPress={() => onChange(b)}
              haptic="select"
              pressScale={0.94}
              accessibilityLabel={BALANCE_LABELS[b]}
              accessibilityState={{ selected: active }}
              style={[
                styles.step,
                {
                  backgroundColor: active ? color : c.surface,
                  borderColor: active ? color : c.line,
                  flex: b === 0 ? 1.4 : 1,
                },
              ]}>
              <View
                style={[
                  styles.stepDot,
                  {
                    width: 6 + Math.abs(b) * 4,
                    height: 6 + Math.abs(b) * 4,
                    backgroundColor: active ? c.surface : color,
                  },
                ]}
              />
            </Tap>
          );
        })}
      </View>
      <View style={styles.scaleLabels}>
        <AppText variant="caption" tone="inkSoft">
          Sour · under
        </AppText>
        <AppText variant="subhead" weight="700">
          {BALANCE_LABELS[value]}
        </AppText>
        <AppText variant="caption" tone="inkSoft">
          over · Bitter
        </AppText>
      </View>
    </View>
  );
}

export function StrengthPicker({ value, onChange }: { value: Strength; onChange: (v: Strength) => void }) {
  const { c } = useTheme();
  return (
    <View style={styles.strengthRow}>
      {([-1, 0, 1] as Strength[]).map((s) => {
        const active = s === value;
        return (
          <Tap
            key={s}
            onPress={() => onChange(s)}
            haptic="select"
            accessibilityLabel={STRENGTH_LABELS[s]}
            accessibilityState={{ selected: active }}
            style={[
              styles.strength,
              { backgroundColor: active ? c.ink : c.surface, borderColor: active ? c.ink : c.line },
            ]}>
            <AppText variant="subhead" weight="600" color={active ? c.bg : c.ink}>
              {STRENGTH_LABELS[s]}
            </AppText>
          </Tap>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.pill,
    alignSelf: 'flex-start',
  },
  tagDot: { width: 7, height: 7, borderRadius: 4 },
  scale: { flexDirection: 'row', gap: 6 },
  step: {
    height: 46,
    borderRadius: Radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepDot: { borderRadius: 10 },
  scaleLabels: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  strengthRow: { flexDirection: 'row', gap: Spacing.sm },
  strength: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: Radius.md,
    borderWidth: StyleSheet.hairlineWidth,
  },
});
