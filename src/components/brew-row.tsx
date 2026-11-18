import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import type { Bean, Brew } from '@/data/types';
import { formatClock, formatGrams, formatGrind, formatShortDate, formatTemp, formatTime, trimNumber } from '@/lib/format';
import { METHODS } from '@/lib/methods';
import { Radius, RoastGradients, Spacing } from '@/theme/tokens';
import { useTheme } from '@/theme/use-theme';

import { BalanceTag } from './balance';
import { RatingBeans } from './bean-glyph';
import { Icon } from './icon';
import { Tap } from './tap';
import { AppText } from './text';

export function recipeLine(b: Brew): string {
  return `Grind ${formatGrind(b.grind)} · ${formatTemp(b.temp)} · ${trimNumber(b.dose, 1)}→${formatGrams(b.yield)} · ${formatTime(b.time)}`;
}

/** One extraction in a list: what, how, and how it tasted. */
export function BrewRow({
  brew,
  bean,
  showBean = true,
  showDate = false,
}: {
  brew: Brew;
  bean?: Bean;
  showBean?: boolean;
  showDate?: boolean;
}) {
  const { c } = useTheme();
  const spec = METHODS[brew.method];
  const when = new Date(brew.createdAt);
  const tint = bean ? RoastGradients[bean.roastLevel][0] : c.accent;
  const subtitle = [spec.label, brew.brewer, showDate ? formatShortDate(when) : formatClock(when)]
    .filter(Boolean)
    .join(' · ');

  return (
    <Tap
      onPress={() => router.push({ pathname: '/brew/[id]', params: { id: brew.id } })}
      pressScale={0.98}
      accessibilityLabel={`${bean?.name ?? 'Brew'}, ${spec.label}, ${brew.rating} of 5`}
      style={[styles.row, { backgroundColor: c.surface, borderColor: c.line }]}>
      <View style={[styles.badge, { backgroundColor: tint }]}>
        <Icon name={spec.icon} size={20} color="#FBF2E7" />
      </View>
      <View style={styles.body}>
        <View style={styles.line}>
          <AppText variant="headline" numberOfLines={1} style={{ flex: 1 }}>
            {showBean ? (bean?.name ?? 'Unknown bean') : spec.label}
          </AppText>
          <RatingBeans value={brew.rating} size={12} />
        </View>
        <View style={styles.line}>
          <AppText variant="footnote" tone="inkSoft" numberOfLines={1} style={{ flex: 1 }}>
            {showBean ? subtitle : [brew.brewer, formatShortDate(when)].filter(Boolean).join(' · ')}
          </AppText>
          <BalanceTag balance={brew.balance} compact />
        </View>
        <AppText variant="footnote" tone="ink" tabular numberOfLines={1} style={{ marginTop: 3 }}>
          {recipeLine(brew)}
        </AppText>
      </View>
    </Tap>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
  },
  badge: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  body: { flex: 1, gap: 2 },
  line: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
});
