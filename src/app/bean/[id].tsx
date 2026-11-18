import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BeanGlyph, RatingBeans } from '@/components/bean-glyph';
import { BrewRow } from '@/components/brew-row';
import { Button } from '@/components/button';
import { Chip, ChipWrap } from '@/components/chip';
import { DialInMap } from '@/components/dial-in-map';
import { Icon } from '@/components/icon';
import { RecipeGrid } from '@/components/recipe-grid';
import { Card, Screen, Section } from '@/components/screen';
import { Segmented } from '@/components/segmented';
import { CircleButton } from '@/components/tap';
import { AppText } from '@/components/text';
import { useBean, useStore } from '@/data/store';
import type { BrewMethod } from '@/data/types';
import { PROCESS_LABELS } from '@/lib/catalog';
import { confirm } from '@/lib/confirm';
import { formatShortDate, parseLocalDate } from '@/lib/format';
import { freshnessOf } from '@/lib/freshness';
import { METHOD_ORDER, METHODS } from '@/lib/methods';
import { bagStatus, bestBrew, brewsForBean, isDialedIn } from '@/lib/stats';
import { Radius, ROAST_LABELS, RoastGradients, ScreenPadding, Spacing } from '@/theme/tokens';
import { useTheme } from '@/theme/use-theme';

export default function BeanDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const bean = useBean(id);
  const brews = useStore((s) => s.brews);
  const settings = useStore((s) => s.settings);
  const updateBean = useStore((s) => s.updateBean);
  const deleteBean = useStore((s) => s.deleteBean);
  const { c, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const [picked, setPicked] = useState<BrewMethod | undefined>();

  if (!bean) {
    return (
      <Screen tabScreen={false}>
        <CircleButton icon="back" label="Back" onPress={() => router.back()} />
        <AppText variant="title">This bean is gone</AppText>
      </Screen>
    );
  }

  const beanBrews = brewsForBean(brews, bean.id);
  const methods = METHOD_ORDER.filter((m) => beanBrews.some((b) => b.method === m));
  const method = picked && methods.includes(picked) ? picked : methods[0];
  const methodBrews = method ? beanBrews.filter((b) => b.method === method) : [];
  const best = bestBrew(methodBrews);
  const dialed = isDialedIn(best);
  const fresh = freshnessOf(bean.roastDate);
  const bag = bagStatus(bean, beanBrews);
  const [from, to] = RoastGradients[bean.roastLevel];

  async function onDelete() {
    const ok = await confirm({
      title: `Delete ${bean!.name}?`,
      message: `This also deletes its ${beanBrews.length} extraction${beanBrews.length === 1 ? '' : 's'}. This can’t be undone.`,
      confirmLabel: 'Delete',
      destructive: true,
    });
    if (ok) {
      router.back();
      deleteBean(bean!.id);
    }
  }

  return (
    <Screen tabScreen={false} padTop={false} contentStyle={{ paddingHorizontal: 0 }}>
      <LinearGradient
        colors={[from, to]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.hero, { paddingTop: Math.max(insets.top, Spacing.lg) + Spacing.sm }]}>
        <View style={styles.heroGlyph} pointerEvents="none">
          <BeanGlyph size={280} fill="rgba(255,240,225,0.12)" crease="rgba(0,0,0,0.18)" />
        </View>

        <View style={styles.nav}>
          <CircleButton icon="back" variant="glass" label="Back" onPress={() => router.back()} />
          <View style={styles.navRight}>
            <CircleButton
              icon={bean.isFavorite ? 'heartFill' : 'heart'}
              variant="glass"
              label={bean.isFavorite ? 'Remove from favourites' : 'Add to favourites'}
              onPress={() => updateBean(bean.id, { isFavorite: !bean.isFavorite })}
            />
            <CircleButton
              icon="edit"
              variant="glass"
              label="Edit bean"
              onPress={() => router.push({ pathname: '/bean/edit', params: { id: bean.id } })}
            />
          </View>
        </View>

        <View style={{ gap: 4 }}>
          <AppText variant="eyebrow" color="rgba(251,242,231,0.75)">
            {[bean.origin, bean.region].filter(Boolean).join(' · ')}
          </AppText>
          <AppText variant="hero" color={c.heroInk}>
            {bean.name}
          </AppText>
          <AppText variant="callout" color="rgba(251,242,231,0.82)">
            {bean.roaster}
          </AppText>
        </View>

        <View style={styles.heroChips}>
          {[PROCESS_LABELS[bean.process], bean.varietal, `${ROAST_LABELS[bean.roastLevel]} roast`]
            .filter(Boolean)
            .map((t) => (
              <View key={t} style={styles.glassChip}>
                <AppText variant="caption" weight="700" color={c.heroInk}>
                  {t}
                </AppText>
              </View>
            ))}
        </View>

        {!bean.isFinished && (
          <Button
            label="Brew this bean"
            variant="crema"
            size="lg"
            trailingIcon="arrowRight"
            onPress={() => router.push({ pathname: '/brew/new', params: { beanId: bean.id, method } })}
          />
        )}
      </LinearGradient>

      <View style={styles.body}>
        <View style={styles.facts}>
          <Fact
            icon="leaf"
            label="Freshness"
            value={fresh ? `Day ${fresh.days} · ${fresh.label}` : 'Unknown'}
            hint={
              fresh
                ? `Roasted ${formatShortDate(parseLocalDate(bean.roastDate!))}. ${fresh.hint}`
                : 'Add a roast date to track it.'
            }
          />
          <Fact
            icon="scale"
            label="In the bag"
            value={bag ? `${Math.round(bag.remaining)} g` : 'Not tracked'}
            hint={bag ? `About ${bag.servingsLeft} more brews` : 'Add a bag size to track it.'}
            progress={bag?.fraction}
          />
        </View>

        {bean.notes.length > 0 && (
          <Section title="Roaster’s notes">
            <ChipWrap>
              {bean.notes.map((n) => (
                <Chip key={n} label={n} />
              ))}
            </ChipWrap>
          </Section>
        )}

        {method && best ? (
          <>
            <Section title="Your recipe">
              {methods.length > 1 && (
                <Segmented<BrewMethod>
                  value={method}
                  onChange={setPicked}
                  options={methods.map((m) => ({ value: m, label: METHODS[m].label, icon: METHODS[m].icon }))}
                />
              )}
              <Card padded={false}>
                <View style={styles.recipeHead}>
                  <View style={{ flex: 1 }}>
                    <View style={styles.statusRow}>
                      <Icon name={dialed ? 'seal' : 'dial'} size={16} color={dialed ? c.good : c.accent} />
                      <AppText variant="headline">{dialed ? 'Dialed in' : 'Still dialing in'}</AppText>
                    </View>
                    <AppText variant="footnote" tone="inkSoft">
                      Best of {methodBrews.length} {METHODS[method].label.toLowerCase()}
                      {methodBrews.length === 1 ? '' : 's'}
                      {best.brewer ? ` · ${best.brewer}` : ''} · {formatShortDate(new Date(best.createdAt))}
                    </AppText>
                  </View>
                  <RatingBeans value={best.rating} size={15} />
                </View>
                <View style={[styles.recipeGrid, { borderColor: c.line }]}>
                  <RecipeGrid recipe={best} method={method} />
                </View>
                <View style={{ padding: Spacing.md }}>
                  <Button
                    label="Brew this recipe"
                    icon="reset"
                    variant="secondary"
                    onPress={() => router.push({ pathname: '/brew/new', params: { fromId: best.id } })}
                  />
                </View>
              </Card>
            </Section>

            {methodBrews.length >= 2 && (
              <Section title="Dial-in map">
                <AppText variant="subhead" tone="inkSoft" style={{ marginTop: -Spacing.xs }}>
                  Every {METHODS[method].label.toLowerCase()} by grind and water temperature. The{' '}
                  {isDark ? 'brighter' : 'darker'} the dot, the better the cup.
                </AppText>
                <DialInMap key={method} brews={methodBrews} settings={settings} bestId={best.id} />
              </Section>
            )}

            <Section title={`Extractions · ${beanBrews.length}`}>
              <View style={{ gap: Spacing.sm }}>
                {beanBrews.map((b) => (
                  <BrewRow key={b.id} brew={b} bean={bean} showBean={false} />
                ))}
              </View>
            </Section>
          </>
        ) : (
          <Card style={{ gap: Spacing.sm }}>
            <AppText variant="headline">No extractions yet</AppText>
            <AppText variant="subhead" tone="inkSoft">
              Log your first brew of {bean.name}. After a couple of tries the coach will point you toward its sweet spot.
            </AppText>
          </Card>
        )}

        <View style={styles.actions}>
          <Button
            label={bean.isFinished ? 'Put back on the shelf' : 'Mark bag as finished'}
            icon={bean.isFinished ? 'restore' : 'archive'}
            variant="secondary"
            onPress={() => updateBean(bean.id, { isFinished: !bean.isFinished })}
          />
          <Button label="Delete bean" icon="trash" variant="danger" onPress={onDelete} />
        </View>
      </View>
    </Screen>
  );
}

function Fact({
  icon,
  label,
  value,
  hint,
  progress,
}: {
  icon: 'leaf' | 'scale';
  label: string;
  value: string;
  hint: string;
  progress?: number;
}) {
  const { c } = useTheme();
  return (
    <View style={[styles.fact, { backgroundColor: c.surface, borderColor: c.line }]}>
      <View style={styles.statusRow}>
        <Icon name={icon} size={13} color={c.inkSoft} />
        <AppText variant="eyebrow" tone="inkSoft">
          {label}
        </AppText>
      </View>
      <AppText variant="headline">{value}</AppText>
      {progress !== undefined && (
        <View style={[styles.track, { backgroundColor: c.surfaceAlt }]}>
          <View style={[styles.fill, { width: `${Math.round(progress * 100)}%`, backgroundColor: c.accent }]} />
        </View>
      )}
      <AppText variant="caption" tone="inkSoft">
        {hint}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: {
    paddingHorizontal: ScreenPadding,
    paddingBottom: Spacing.xxl,
    gap: Spacing.lg,
    overflow: 'hidden',
    borderBottomLeftRadius: Radius.xl,
    borderBottomRightRadius: Radius.xl,
  },
  heroGlyph: { position: 'absolute', right: -90, top: 10 },
  nav: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: Spacing.lg },
  navRight: { flexDirection: 'row', gap: Spacing.sm },
  heroChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  glassChip: {
    backgroundColor: 'rgba(20,10,4,0.25)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: Radius.pill,
  },
  body: { paddingHorizontal: ScreenPadding, gap: Spacing.xxl },
  facts: { flexDirection: 'row', gap: Spacing.sm },
  fact: { flex: 1, borderRadius: Radius.lg, borderWidth: StyleSheet.hairlineWidth, padding: Spacing.md, gap: 6 },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  track: { height: 4, borderRadius: 2, overflow: 'hidden' },
  fill: { height: 4, borderRadius: 2 },
  recipeHead: { flexDirection: 'row', alignItems: 'center', padding: Spacing.lg, gap: Spacing.md },
  recipeGrid: { borderTopWidth: StyleSheet.hairlineWidth, borderBottomWidth: StyleSheet.hairlineWidth },
  actions: { gap: Spacing.sm },
});
