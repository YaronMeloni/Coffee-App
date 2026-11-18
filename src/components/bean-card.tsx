import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import type { Bean, Brew } from '@/data/types';
import { freshnessOf } from '@/lib/freshness';
import { bagStatus, bestBrew, isDialedIn, methodsUsed } from '@/lib/stats';
import { Radius, RoastGradients, Spacing } from '@/theme/tokens';
import { useTheme } from '@/theme/use-theme';

import { BeanGlyph } from './bean-glyph';
import { Icon } from './icon';
import { Tap } from './tap';
import { AppText } from './text';

/** A bean's card wears its roast: light roasts are amber, dark roasts nearly black. */
export function BeanCard({
  bean,
  brews,
  width,
  height = 216,
}: {
  bean: Bean;
  /** All brews of this bean, newest first. */
  brews: Brew[];
  width?: number;
  height?: number;
}) {
  const { c } = useTheme();
  const [from, to] = RoastGradients[bean.roastLevel];
  const fresh = freshnessOf(bean.roastDate);
  const bag = bagStatus(bean, brews);
  const dialed = methodsUsed(brews).some((m) => isDialedIn(bestBrew(brews.filter((b) => b.method === m))));

  return (
    <Tap
      onPress={() => router.push({ pathname: '/bean/[id]', params: { id: bean.id } })}
      accessibilityLabel={`${bean.name} by ${bean.roaster}`}
      style={{ width }}>
      <LinearGradient
        colors={[from, to]}
        start={{ x: 0.1, y: 0 }}
        end={{ x: 0.9, y: 1 }}
        style={[styles.card, { height }, bean.isFinished && { opacity: 0.7 }]}>
        <View style={styles.glyph} pointerEvents="none">
          <BeanGlyph size={170} fill="rgba(255,240,225,0.13)" crease="rgba(0,0,0,0.16)" />
        </View>

        <View style={styles.top}>
          {fresh && !bean.isFinished ? (
            <View style={styles.pill}>
              <AppText variant="caption" weight="700" color={c.heroInk}>
                Day {fresh.days} · {fresh.label}
              </AppText>
            </View>
          ) : bean.isFinished ? (
            <View style={styles.pill}>
              <AppText variant="caption" weight="700" color={c.heroInk}>
                Finished
              </AppText>
            </View>
          ) : (
            <View />
          )}
          {dialed && (
            <View style={styles.seal} accessibilityLabel="Dialed in">
              <Icon name="seal" size={18} color={c.crema} />
            </View>
          )}
        </View>

        <View style={{ gap: 2 }}>
          <AppText variant="eyebrow" color="rgba(251,242,231,0.72)" numberOfLines={1}>
            {bean.origin}
          </AppText>
          <AppText variant="title2" color={c.heroInk} numberOfLines={2}>
            {bean.name}
          </AppText>
          <AppText variant="footnote" color="rgba(251,242,231,0.78)" numberOfLines={1}>
            {bean.roaster}
          </AppText>
        </View>

        {bag && (
          <View style={{ gap: 5 }}>
            <View style={styles.track}>
              <View style={[styles.fill, { width: `${Math.round(bag.fraction * 100)}%`, backgroundColor: c.crema }]} />
            </View>
            <AppText variant="caption" color="rgba(251,242,231,0.78)" tabular>
              {Math.round(bag.remaining)} g left
              {bag.servingsLeft > 0 ? ` · ~${bag.servingsLeft} brews` : ''}
            </AppText>
          </View>
        )}
      </LinearGradient>
    </Tap>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.lg + 2,
    padding: Spacing.lg,
    justifyContent: 'space-between',
    overflow: 'hidden',
    gap: Spacing.sm,
  },
  glyph: { position: 'absolute', right: -52, top: -26 },
  top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', flex: 1, alignSelf: 'stretch' },
  pill: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(20,10,4,0.28)',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: Radius.pill,
  },
  seal: { alignSelf: 'flex-start' },
  track: { height: 4, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.2)', overflow: 'hidden' },
  fill: { height: 4, borderRadius: 2 },
});
