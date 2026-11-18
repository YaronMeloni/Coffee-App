import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';

import { BeanCard } from '@/components/bean-card';
import { BeanGlyph } from '@/components/bean-glyph';
import { BrewRow } from '@/components/brew-row';
import { Button } from '@/components/button';
import { EmptyState } from '@/components/empty-state';
import { Icon } from '@/components/icon';
import { RecipeGrid } from '@/components/recipe-grid';
import { Card, Screen, ScreenHeader, Section } from '@/components/screen';
import { CircleButton } from '@/components/tap';
import { AppText } from '@/components/text';
import { useStore } from '@/data/store';
import type { Bean } from '@/data/types';
import { RECIPE_LABELS } from '@/lib/dial-in';
import { formatChangeValue } from '@/components/advice-card';
import { draftFor, pickDefaultBean, pickDefaultMethod, type BrewDraft } from '@/lib/draft';
import { formatLongToday, greeting, trimNumber } from '@/lib/format';
import { METHOD_ORDER, METHODS } from '@/lib/methods';
import { useNow } from '@/lib/use-now';
import { averageRating, bestBrew, brewsForBean, byNewest, isDialedIn } from '@/lib/stats';
import { Radius, ScreenPadding, Spacing } from '@/theme/tokens';
import { useTheme } from '@/theme/use-theme';

export default function TodayScreen() {
  const beans = useStore((s) => s.beans);
  const brews = useStore((s) => s.brews);
  const settings = useStore((s) => s.settings);
  const loadSampleData = useStore((s) => s.loadSampleData);
  const now = useNow();

  const settingsButton = <CircleButton icon="settings" label="Settings" onPress={() => router.push('/settings')} />;

  if (beans.length === 0) {
    return (
      <Screen>
        <ScreenHeader eyebrow={formatLongToday(now)} title={greeting(now)} right={settingsButton} />
        <EmptyState
          title="Your coffee journal starts here"
          body="Add the beans on your shelf, log each extraction, and Dialed learns the grind and temperature each coffee likes best.">
          <Button label="Add your first bean" icon="add" size="lg" onPress={() => router.push('/bean/edit')} />
          <Button label="Explore with sample beans" variant="secondary" size="lg" onPress={loadSampleData} />
        </EmptyState>
      </Screen>
    );
  }

  const shelf = beans.filter((b) => !b.isFinished);
  const recent = [...brews].sort(byNewest).slice(0, 4);
  const beanById = new Map(beans.map((b) => [b.id, b]));
  const nextBean = pickDefaultBean(beans, brews);
  const nextMethod = pickDefaultMethod(brews, nextBean?.id);
  const draft = nextBean ? draftFor(nextBean, nextMethod, brews, settings) : undefined;

  const weekAgo = now.getTime() - 7 * 86_400_000;
  const thisWeek = brews.filter((b) => Date.parse(b.createdAt) >= weekAgo);
  const avg = averageRating(thisWeek);
  const dialedCount = shelf.filter((bean) =>
    METHOD_ORDER.some((m) => isDialedIn(bestBrew(brewsForBean(brews, bean.id, m)))),
  ).length;

  return (
    <Screen>
      <ScreenHeader eyebrow={formatLongToday(now)} title={greeting(now)} right={settingsButton} />

      {nextBean && draft ? (
        <NextBrewHero bean={nextBean} draft={draft} />
      ) : (
        <Card>
          <AppText variant="headline">Your shelf is empty</AppText>
          <AppText variant="subhead" tone="inkSoft" style={{ marginTop: 4, marginBottom: Spacing.md }}>
            Every bag is marked finished. Add a new bean to keep brewing.
          </AppText>
          <Button label="Add a bean" icon="add" onPress={() => router.push('/bean/edit')} />
        </Card>
      )}

      <View style={styles.stats}>
        <Stat value={String(thisWeek.length)} label="brews this week" />
        <Stat value={avg ? trimNumber(avg, 1) : '—'} label="avg cup score" />
        <Stat value={`${dialedCount}/${shelf.length}`} label="beans dialed in" />
      </View>

      {shelf.length > 0 && (
        <Section title="On the shelf" action="All beans" onAction={() => router.navigate('/beans')}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ marginHorizontal: -ScreenPadding }}
            contentContainerStyle={{ paddingHorizontal: ScreenPadding, gap: Spacing.md }}>
            {shelf.map((b) => (
              <BeanCard key={b.id} bean={b} brews={brewsForBean(brews, b.id)} width={172} />
            ))}
          </ScrollView>
        </Section>
      )}

      {recent.length > 0 && (
        <Section title="Recent extractions" action="Journal" onAction={() => router.navigate('/journal')}>
          <View style={{ gap: Spacing.sm }}>
            {recent.map((b) => (
              <BrewRow key={b.id} brew={b} bean={beanById.get(b.beanId)} />
            ))}
          </View>
        </Section>
      )}
    </Screen>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  const { c } = useTheme();
  return (
    <View style={[styles.stat, { backgroundColor: c.surface, borderColor: c.line }]}>
      <AppText variant="numberSmall">{value}</AppText>
      <AppText variant="caption" tone="inkSoft" numberOfLines={2}>
        {label}
      </AppText>
    </View>
  );
}

/** The espresso-dark card that tells you exactly what to brew next. */
function NextBrewHero({ bean, draft }: { bean: Bean; draft: BrewDraft }) {
  const { c } = useTheme();
  const spec = METHODS[draft.method];
  const change = draft.pendingAdvice?.changes[0];
  return (
    <LinearGradient colors={['#3B271B', '#1C120C']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.hero}>
      <View style={styles.heroGlyph} pointerEvents="none">
        <BeanGlyph size={210} fill="rgba(226,168,103,0.10)" crease="rgba(0,0,0,0.25)" />
      </View>

      <View style={styles.heroTop}>
        <AppText variant="eyebrow" color={c.crema}>
          Next up
        </AppText>
        <View style={styles.methodPill}>
          <Icon name={spec.icon} size={13} color={c.heroInk} />
          <AppText variant="caption" weight="700" color={c.heroInk}>
            {spec.label}
            {draft.recipe.brewer ? ` · ${draft.recipe.brewer}` : ''}
          </AppText>
        </View>
      </View>

      <View>
        <AppText variant="title" color={c.heroInk}>
          {bean.name}
        </AppText>
        <AppText variant="subhead" color={c.heroInkSoft}>
          {bean.roaster} · {bean.origin}
        </AppText>
      </View>

      <View style={[styles.heroGrid, { borderColor: 'rgba(255,255,255,0.12)' }]}>
        <RecipeGrid recipe={draft.recipe} method={draft.method} onDark />
      </View>

      <View style={styles.coachRow}>
        <Icon name="sparkles" size={14} color={c.crema} />
        <AppText variant="footnote" color={c.heroInkSoft} style={{ flex: 1 }}>
          {draft.pendingAdvice && change
            ? `Coach: ${draft.pendingAdvice.title.toLowerCase()}. ${RECIPE_LABELS[change.key]} ${formatChangeValue(change, change.from)} → ${formatChangeValue(change, change.to)}`
            : draft.sourceLabel}
        </AppText>
      </View>

      <Button
        label="Start brewing"
        variant="crema"
        size="lg"
        trailingIcon="arrowRight"
        onPress={() =>
          router.push({ pathname: '/brew/new', params: { beanId: bean.id, method: draft.method } })
        }
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  hero: { borderRadius: Radius.xl, padding: Spacing.xl, gap: Spacing.lg, overflow: 'hidden' },
  heroGlyph: { position: 'absolute', right: -70, top: -50 },
  heroTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  methodPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: Radius.pill,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  heroGrid: { borderTopWidth: StyleSheet.hairlineWidth, borderBottomWidth: StyleSheet.hairlineWidth, marginHorizontal: -Spacing.md },
  coachRow: { flexDirection: 'row', gap: Spacing.sm, alignItems: 'flex-start' },
  stats: { flexDirection: 'row', gap: Spacing.sm },
  stat: {
    flex: 1,
    borderRadius: Radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    gap: 2,
  },
});
