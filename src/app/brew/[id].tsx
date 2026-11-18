import { router, useLocalSearchParams } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { AdviceCard } from '@/components/advice-card';
import { BalanceTag, STRENGTH_LABELS } from '@/components/balance';
import { RatingBeans } from '@/components/bean-glyph';
import { Chip, ChipWrap } from '@/components/chip';
import { Icon } from '@/components/icon';
import { RecipeGrid } from '@/components/recipe-grid';
import { Card, Screen, Section } from '@/components/screen';
import { CircleButton, Tap } from '@/components/tap';
import { AppText } from '@/components/text';
import { useBean, useBrew, useStore } from '@/data/store';
import { confirm } from '@/lib/confirm';
import { adviseNextBrew } from '@/lib/dial-in';
import { formatClock, formatDayLabel } from '@/lib/format';
import { METHODS } from '@/lib/methods';
import { RoastGradients, Spacing } from '@/theme/tokens';
import { useTheme } from '@/theme/use-theme';

export default function BrewDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const brew = useBrew(id);
  const bean = useBean(brew?.beanId);
  const settings = useStore((s) => s.settings);
  const deleteBrew = useStore((s) => s.deleteBrew);
  const { c } = useTheme();

  if (!brew) {
    return (
      <Screen tabScreen={false}>
        <CircleButton icon="back" label="Back" onPress={() => router.back()} />
        <AppText variant="title">This extraction was deleted</AppText>
      </Screen>
    );
  }

  const spec = METHODS[brew.method];
  const when = new Date(brew.createdAt);
  const advice = adviseNextBrew(brew, settings, bean);
  const extras = [
    brew.preinfusion ? `${brew.preinfusion} s pre-infusion` : undefined,
    brew.bloom ? `${brew.bloom} s bloom` : undefined,
  ].filter(Boolean);

  async function onDelete() {
    const ok = await confirm({
      title: 'Delete this extraction?',
      message: 'It will be removed from the journal and the bean’s dial-in map.',
      confirmLabel: 'Delete',
      destructive: true,
    });
    if (ok) {
      router.back();
      deleteBrew(brew!.id);
    }
  }

  return (
    <Screen tabScreen={false}>
      <View style={styles.nav}>
        <CircleButton icon="back" label="Back" onPress={() => router.back()} />
        <View style={styles.navRight}>
          <CircleButton
            icon="edit"
            label="Edit extraction"
            onPress={() => router.push({ pathname: '/brew/new', params: { editId: brew.id } })}
          />
          <CircleButton icon="trash" label="Delete extraction" onPress={onDelete} />
        </View>
      </View>

      <View style={{ gap: Spacing.sm }}>
        <View style={styles.methodRow}>
          <View style={[styles.badge, { backgroundColor: bean ? RoastGradients[bean.roastLevel][0] : c.accent }]}>
            <Icon name={spec.icon} size={14} color="#FBF2E7" />
          </View>
          <AppText variant="eyebrow" tone="inkSoft">
            {[spec.label, brew.brewer, `${formatDayLabel(when)} ${formatClock(when)}`].filter(Boolean).join(' · ')}
          </AppText>
        </View>
        <Tap
          haptic="select"
          pressScale={0.99}
          disabled={!bean}
          onPress={() => bean && router.push({ pathname: '/bean/[id]', params: { id: bean.id } })}>
          <AppText variant="display">{bean?.name ?? 'Unknown bean'}</AppText>
          {bean && (
            <AppText variant="callout" tone="inkSoft">
              {bean.roaster} · {bean.origin}
            </AppText>
          )}
        </Tap>
        <View style={styles.tasteRow}>
          <RatingBeans value={brew.rating} size={18} />
          <BalanceTag balance={brew.balance} />
          <AppText variant="footnote" tone="inkSoft">
            {STRENGTH_LABELS[brew.strength]}
          </AppText>
        </View>
      </View>

      <Card padded={false}>
        <RecipeGrid recipe={brew} method={brew.method} />
        {extras.length > 0 && (
          <View style={[styles.extras, { borderTopColor: c.line }]}>
            <AppText variant="footnote" tone="inkSoft">
              {extras.join(' · ')}
            </AppText>
          </View>
        )}
      </Card>

      <AdviceCard
        advice={advice}
        eyebrow="For your next brew"
        onApply={() => router.push({ pathname: '/brew/new', params: { fromId: brew.id, apply: '1' } })}
      />

      {brew.flavors.length > 0 && (
        <Section title="Tasted">
          <ChipWrap>
            {brew.flavors.map((f) => (
              <Chip key={f} label={f} />
            ))}
          </ChipWrap>
        </Section>
      )}

      {brew.notes && (
        <Section title="Notes">
          <AppText variant="body" tone="inkSoft">
            {brew.notes}
          </AppText>
        </Section>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  nav: { flexDirection: 'row', justifyContent: 'space-between' },
  navRight: { flexDirection: 'row', gap: Spacing.sm },
  methodRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  badge: { width: 24, height: 24, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  tasteRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, marginTop: Spacing.xs },
  extras: { borderTopWidth: StyleSheet.hairlineWidth, padding: Spacing.md },
});
