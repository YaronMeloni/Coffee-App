import { StyleSheet, View } from 'react-native';

import { RECIPE_LABELS, type Advice, type RecipeChange } from '@/lib/dial-in';
import { formatGrams, formatGrind, formatTemp, formatTime } from '@/lib/format';
import type { IconName } from '@/lib/icons';
import { Radius, Spacing } from '@/theme/tokens';
import { useTheme } from '@/theme/use-theme';

import { Button } from './button';
import { Icon } from './icon';
import { AppText } from './text';

export function formatChangeValue(ch: RecipeChange, v: number): string {
  switch (ch.key) {
    case 'grind':
      return formatGrind(v);
    case 'temp':
      return formatTemp(v);
    case 'time':
      return formatTime(v);
    default:
      return formatGrams(v);
  }
}

/** The dial-in coach's verdict: what happened in the cup and what to change next. */
export function AdviceCard({
  advice,
  onApply,
  applyLabel = 'Brew with this change',
  eyebrow = 'Dial-in coach',
}: {
  advice: Advice;
  onApply?: () => void;
  applyLabel?: string;
  eyebrow?: string;
}) {
  const { c } = useTheme();
  const tone = {
    dialed: { bg: c.goodSoft, fg: c.good, icon: 'seal' as IconName },
    sour: { bg: c.sourSoft, fg: c.sour, icon: 'sparkles' as IconName },
    bitter: { bg: c.bitterSoft, fg: c.bitter, icon: 'sparkles' as IconName },
    strength: { bg: c.accentSoft, fg: c.accent, icon: 'scale' as IconName },
    polish: { bg: c.accentSoft, fg: c.accent, icon: 'sparkles' as IconName },
  }[advice.tone];

  return (
    <View style={[styles.card, { backgroundColor: tone.bg }]}>
      <View style={styles.eyebrow}>
        <Icon name={tone.icon} size={14} color={tone.fg} />
        <AppText variant="eyebrow" tone="inkSoft">
          {eyebrow}
        </AppText>
      </View>
      <AppText variant="title">{advice.title}</AppText>
      <AppText variant="callout" tone="inkSoft">
        {advice.body}
      </AppText>

      {advice.changes.length > 0 && (
        <View style={styles.changes}>
          {advice.changes.map((ch) => (
            <View key={ch.key} style={[styles.change, { backgroundColor: c.surface }]}>
              <AppText variant="subhead" tone="inkSoft">
                {RECIPE_LABELS[ch.key]}
              </AppText>
              <View style={styles.fromTo}>
                <AppText variant="numberSmall" tone="inkFaint" style={styles.strike}>
                  {formatChangeValue(ch, ch.from)}
                </AppText>
                <Icon name="arrowRight" size={14} color={c.inkSoft} />
                <AppText variant="numberSmall">{formatChangeValue(ch, ch.to)}</AppText>
              </View>
            </View>
          ))}
        </View>
      )}

      {onApply && (
        <Button
          label={advice.changes.length > 0 ? applyLabel : 'Brew this again'}
          icon={advice.changes.length > 0 ? 'sparkles' : 'reset'}
          onPress={onApply}
          style={{ marginTop: Spacing.xs }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: Radius.lg, padding: Spacing.lg, gap: Spacing.sm },
  eyebrow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  changes: { gap: Spacing.sm, marginTop: Spacing.xs },
  change: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.md,
  },
  fromTo: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  strike: { textDecorationLine: 'line-through' },
});
