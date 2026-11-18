import { router, useLocalSearchParams } from 'expo-router';
import { useRef, useState } from 'react';
import { StyleSheet, View, type ScrollViewInstance } from 'react-native';

import { AdviceCard, formatChangeValue } from '@/components/advice-card';
import { BalancePicker, StrengthPicker } from '@/components/balance';
import { RatingInput } from '@/components/bean-glyph';
import { Button } from '@/components/button';
import { Chip, ChipScroller, ChipWrap } from '@/components/chip';
import { EmptyState } from '@/components/empty-state';
import { Field } from '@/components/field';
import { Icon } from '@/components/icon';
import { FormLabel, Screen, SheetHeader } from '@/components/screen';
import { Segmented } from '@/components/segmented';
import { ShotTimer } from '@/components/shot-timer';
import { Stepper } from '@/components/stepper';
import { Tap } from '@/components/tap';
import { AppText } from '@/components/text';
import { useStore } from '@/data/store';
import type { Balance, Brew, BrewMethod, Strength } from '@/data/types';
import { FLAVORS } from '@/lib/catalog';
import { adviseNextBrew, applyChanges, RECIPE_LABELS, type Advice, type RecipeChange } from '@/lib/dial-in';
import { draftFor, draftFromBrew, pickDefaultBean, pickDefaultMethod, type BrewDraft, type DraftRecipe } from '@/lib/draft';
import { formatGrams, formatGrind, formatRatio, formatTemp, formatTime, trimNumber } from '@/lib/format';
import { haptics } from '@/lib/haptics';
import { METHOD_ORDER, METHODS, ratioOf } from '@/lib/methods';
import { Radius, RoastGradients, Spacing } from '@/theme/tokens';
import { useTheme } from '@/theme/use-theme';

type Params = { beanId?: string; method?: BrewMethod; fromId?: string; apply?: string; editId?: string };

interface Taste {
  rating: number;
  balance: Balance;
  strength: Strength;
  flavors: string[];
  notes: string;
}

const FRESH_TASTE: Taste = { rating: 3, balance: 0, strength: 0, flavors: [], notes: '' };

export default function NewBrewScreen() {
  const params = useLocalSearchParams<Params>();
  const { c } = useTheme();
  const beans = useStore((s) => s.beans);
  const brews = useStore((s) => s.brews);
  const settings = useStore((s) => s.settings);
  const addBrew = useStore((s) => s.addBrew);
  const updateBrew = useStore((s) => s.updateBrew);
  const scroll = useRef<ScrollViewInstance>(null);

  const editing = params.editId ? brews.find((b) => b.id === params.editId) : undefined;

  const [initial] = useState(() => {
    if (editing) {
      return {
        draft: { beanId: editing.beanId, method: editing.method, recipe: { ...editing }, sourceLabel: 'Editing' } as BrewDraft,
        taste: {
          rating: editing.rating,
          balance: editing.balance,
          strength: editing.strength,
          flavors: editing.flavors,
          notes: editing.notes ?? '',
        },
      };
    }
    const source = params.fromId ? brews.find((b) => b.id === params.fromId) : undefined;
    if (source) {
      const bean = beans.find((b) => b.id === source.beanId);
      return { draft: draftFromBrew(source, settings, bean, params.apply === '1'), taste: FRESH_TASTE };
    }
    const bean = beans.find((b) => b.id === params.beanId) ?? pickDefaultBean(beans, brews);
    const method = params.method ?? pickDefaultMethod(brews, bean?.id);
    return { draft: draftFor(bean, method, brews, settings), taste: FRESH_TASTE };
  });

  const [beanId, setBeanId] = useState(initial.draft.beanId);
  const [method, setMethod] = useState<BrewMethod>(initial.draft.method);
  const [recipe, setRecipe] = useState<DraftRecipe>(initial.draft.recipe);
  const [sourceLabel, setSourceLabel] = useState(initial.draft.sourceLabel);
  const [pending, setPending] = useState<Advice | undefined>(initial.draft.pendingAdvice);
  const [highlighted, setHighlighted] = useState<RecipeChange['key'][]>(
    params.apply === '1' && params.fromId ? coachKeys(params.fromId) : [],
  );
  const [taste, setTaste] = useState<Taste>(initial.taste);
  const [saved, setSaved] = useState<Brew | undefined>();

  function coachKeys(fromId: string): RecipeChange['key'][] {
    const src = brews.find((b) => b.id === fromId);
    if (!src) return [];
    return adviseNextBrew(src, settings, beans.find((b) => b.id === src.beanId)).changes.map((ch) => ch.key);
  }

  const shelf = beans.filter((b) => !b.isFinished || b.id === beanId);
  const bean = beans.find((b) => b.id === beanId);
  const spec = METHODS[method];

  function loadDraft(d: BrewDraft) {
    setRecipe(d.recipe);
    setSourceLabel(d.sourceLabel);
    setPending(d.pendingAdvice);
    setHighlighted([]);
  }

  function chooseBean(id: string) {
    setBeanId(id);
    if (!editing) loadDraft(draftFor(beans.find((b) => b.id === id), method, brews, settings));
  }

  function chooseMethod(m: BrewMethod) {
    setMethod(m);
    if (!editing) loadDraft(draftFor(bean, m, brews, settings));
  }

  function applyPending() {
    if (!pending) return;
    haptics.success();
    setRecipe((r) => applyChanges(r, pending.changes));
    setHighlighted(pending.changes.map((ch) => ch.key));
    setSourceLabel(`Coach: ${pending.title.toLowerCase()}`);
    setPending(undefined);
  }

  const set = (key: keyof DraftRecipe) => (v: number) => {
    setRecipe((r) => ({ ...r, [key]: v }));
    setHighlighted((h) => h.filter((k) => k !== key));
  };

  function save() {
    if (!beanId) return;
    const payload = {
      beanId,
      method,
      brewer: spec.brewers.length ? recipe.brewer : undefined,
      grind: recipe.grind,
      temp: recipe.temp,
      dose: recipe.dose,
      yield: recipe.yield,
      time: recipe.time,
      preinfusion: method === 'espresso' ? recipe.preinfusion : undefined,
      bloom: method === 'pourover' ? recipe.bloom : undefined,
      rating: taste.rating,
      balance: taste.balance,
      strength: taste.strength,
      flavors: taste.flavors,
      notes: taste.notes.trim() || undefined,
    };
    if (editing) {
      updateBrew(editing.id, payload);
      router.back();
      return;
    }
    setSaved(addBrew(payload));
    scroll.current?.scrollTo({ y: 0, animated: false });
  }

  function brewNextWithCoach(from: Brew) {
    const d = draftFromBrew(from, settings, bean, true);
    const advice = adviseNextBrew(from, settings, bean);
    loadDraft(d);
    setHighlighted(advice.changes.map((ch) => ch.key));
    setTaste(FRESH_TASTE);
    setSaved(undefined);
    scroll.current?.scrollTo({ y: 0, animated: false });
  }

  // ── No beans yet ─────────────────────────────────────────────────────
  if (beans.length === 0) {
    return (
      <View style={{ flex: 1, backgroundColor: c.bg }}>
        <SheetHeader title="New extraction" onCancel={() => router.back()} />
        <Screen tabScreen={false} padTop={false}>
          <EmptyState title="Add a bean first" body="Every extraction belongs to a coffee. Add the bag you’re brewing.">
            <Button label="Add a bean" icon="add" size="lg" onPress={() => router.replace('/bean/edit')} />
          </EmptyState>
        </Screen>
      </View>
    );
  }

  // ── Saved: show the coach's verdict ──────────────────────────────────
  if (saved) {
    const advice = adviseNextBrew(saved, settings, bean);
    return (
      <View style={{ flex: 1, backgroundColor: c.bg }}>
        <SheetHeader title="Saved" onSave={() => router.back()} saveLabel="Done" />
        <Screen tabScreen={false} padTop={false} ref={scroll}>
          <View style={styles.savedHead}>
            <View style={[styles.check, { backgroundColor: c.goodSoft }]}>
              <Icon name="check" size={30} color={c.good} weight="bold" />
            </View>
            <AppText variant="title" align="center">
              Extraction logged
            </AppText>
            <AppText variant="callout" tone="inkSoft" align="center">
              {bean?.name} · {spec.label} · {saved.rating}/5
            </AppText>
          </View>
          <AdviceCard
            advice={advice}
            eyebrow="For your next brew"
            applyLabel="Brew the next one with this"
            onApply={() => brewNextWithCoach(saved)}
          />
          <Button label="Done" variant="secondary" size="lg" onPress={() => router.back()} />
        </Screen>
      </View>
    );
  }

  const ratio = ratioOf(recipe);
  const [rLo, rHi] = spec.targetRatio;
  const ratioOk = ratio >= rLo && ratio <= rHi;
  const flavorOptions = [...new Set([...(bean?.notes ?? []), ...FLAVORS])];
  const pendingChange = pending?.changes[0];

  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      <SheetHeader
        title={editing ? 'Edit extraction' : 'New extraction'}
        onCancel={() => router.back()}
        onSave={save}
        saveDisabled={!beanId}
      />
      <Screen tabScreen={false} ref={scroll} automaticallyAdjustKeyboardInsets contentStyle={{ paddingTop: Spacing.lg }}>
        {/* ── What ─────────────────────────────────────────────── */}
        <View style={styles.block}>
          <FormLabel>Bean</FormLabel>
          <ChipScroller>
            {shelf.map((b) => (
              <Chip
                key={b.id}
                label={b.name}
                dot={RoastGradients[b.roastLevel][0]}
                selected={b.id === beanId}
                onPress={() => chooseBean(b.id)}
              />
            ))}
            <Chip label="New bean" icon="add" onPress={() => router.push('/bean/edit')} />
          </ChipScroller>
        </View>

        <View style={styles.block}>
          <FormLabel>Method</FormLabel>
          <Segmented<BrewMethod>
            stacked
            value={method}
            onChange={chooseMethod}
            options={METHOD_ORDER.map((m) => ({ value: m, label: METHODS[m].label, icon: METHODS[m].icon }))}
          />
          {spec.brewers.length > 0 && (
            <View style={{ marginTop: Spacing.md }}>
              <ChipWrap>
                {spec.brewers.map((br) => (
                  <Chip
                    key={br}
                    size="sm"
                    label={br}
                    selected={recipe.brewer === br}
                    onPress={() => setRecipe((r) => ({ ...r, brewer: br }))}
                  />
                ))}
              </ChipWrap>
            </View>
          )}
        </View>

        {/* ── How ──────────────────────────────────────────────── */}
        <View style={styles.block}>
          <View style={styles.sourceRow}>
            <Icon name="sparkles" size={13} color={c.accent} />
            <AppText variant="footnote" tone="inkSoft" style={{ flex: 1 }}>
              {sourceLabel}
            </AppText>
          </View>

          {pending && pendingChange && (
            <Tap
              onPress={applyPending}
              haptic={false}
              pressScale={0.98}
              accessibilityLabel={`Apply coach suggestion: ${pending.title}`}
              style={[styles.pending, { backgroundColor: c.accentSoft, borderColor: c.accent }]}>
              <View style={{ flex: 1, gap: 2 }}>
                <AppText variant="eyebrow" tone="accent">
                  Coach suggests
                </AppText>
                <AppText variant="headline">{pending.title}</AppText>
                <AppText variant="footnote" tone="inkSoft">
                  {RECIPE_LABELS[pendingChange.key]} {formatChangeValue(pendingChange, pendingChange.from)} →{' '}
                  {formatChangeValue(pendingChange, pendingChange.to)}, based on your last brew
                </AppText>
              </View>
              <View style={[styles.applyPill, { backgroundColor: c.accent }]}>
                <AppText variant="subhead" weight="700" color={c.accentInk}>
                  Apply
                </AppText>
              </View>
            </Tap>
          )}

          <View style={styles.grid}>
            <Stepper
              label="Grind"
              icon="dial"
              value={recipe.grind}
              onChange={set('grind')}
              step={settings.grindStep}
              max={200}
              format={formatGrind}
              hint={settings.grinderName}
              highlighted={highlighted.includes('grind')}
            />
            <Stepper
              label="Water temp"
              icon="thermometer"
              value={recipe.temp}
              onChange={set('temp')}
              step={0.5}
              min={60}
              max={100}
              format={formatTemp}
              hint={`${spec.tempRange[0]}–${spec.tempRange[1]}° typical`}
              highlighted={highlighted.includes('temp')}
            />
          </View>
          <View style={styles.grid}>
            <Stepper
              label="Dose"
              icon="scale"
              value={recipe.dose}
              onChange={set('dose')}
              step={spec.doseStep}
              min={1}
              max={100}
              format={formatGrams}
              hint="coffee in"
              highlighted={highlighted.includes('dose')}
            />
            <Stepper
              label={spec.yieldLabel}
              icon={method === 'espresso' ? 'espresso' : 'pourover'}
              value={recipe.yield}
              onChange={set('yield')}
              step={spec.yieldStep}
              min={1}
              max={2000}
              format={formatGrams}
              hint={method === 'espresso' ? 'in the cup' : 'water'}
              highlighted={highlighted.includes('yield')}
            />
          </View>

          <View style={[styles.ratio, { backgroundColor: c.surface, borderColor: c.line }]}>
            <View style={[styles.ratioDot, { backgroundColor: ratioOk ? c.good : c.inkFaint }]} />
            <AppText variant="subhead" weight="700" tabular>
              Ratio {formatRatio(ratio)}
            </AppText>
            <AppText variant="footnote" tone="inkSoft">
              {ratioOk ? 'in range' : 'outside'} · typical 1:{trimNumber(rLo, 1)}–{trimNumber(rHi, 1)}
            </AppText>
          </View>

          {method === 'espresso' && (
            <View style={styles.grid}>
              <Stepper
                label="Pre-infusion"
                value={recipe.preinfusion ?? 0}
                onChange={set('preinfusion')}
                step={1}
                max={60}
                format={(v) => `${v} s`}
                hint="optional"
                compact
              />
            </View>
          )}
          {method === 'pourover' && (
            <View style={styles.grid}>
              <Stepper
                label="Bloom"
                value={recipe.bloom ?? 0}
                onChange={set('bloom')}
                step={5}
                max={120}
                format={(v) => `${v} s`}
                hint="optional"
                compact
              />
            </View>
          )}

          <ShotTimer
            label={spec.timeLabel}
            value={recipe.time}
            onChange={set('time')}
            target={spec.targetTime}
            step={spec.timeStep}
          />
        </View>

        {/* ── Taste ────────────────────────────────────────────── */}
        <View style={styles.tasteHead}>
          <AppText variant="title">How did it taste?</AppText>
          <AppText variant="subhead" tone="inkSoft">
            Be honest. The coach uses this to suggest your next change.
          </AppText>
        </View>

        <View style={styles.block}>
          <FormLabel hint={['', 'Not for me', 'Drinkable', 'Good', 'Great', 'Outstanding'][taste.rating]}>
            Cup score
          </FormLabel>
          <RatingInput value={taste.rating} onChange={(rating) => setTaste((t) => ({ ...t, rating }))} />
        </View>

        <View style={styles.block}>
          <FormLabel>Balance</FormLabel>
          <BalancePicker value={taste.balance} onChange={(balance) => setTaste((t) => ({ ...t, balance }))} />
        </View>

        <View style={styles.block}>
          <FormLabel>Strength</FormLabel>
          <StrengthPicker value={taste.strength} onChange={(strength) => setTaste((t) => ({ ...t, strength }))} />
        </View>

        <View style={styles.block}>
          <FormLabel hint={taste.flavors.length ? `${taste.flavors.length} picked` : undefined}>
            What did you taste?
          </FormLabel>
          <ChipWrap>
            {flavorOptions.map((f) => {
              const on = taste.flavors.includes(f);
              return (
                <Chip
                  key={f}
                  size="sm"
                  label={f}
                  selected={on}
                  onPress={() =>
                    setTaste((t) => ({
                      ...t,
                      flavors: on ? t.flavors.filter((x) => x !== f) : [...t.flavors, f],
                    }))
                  }
                />
              );
            })}
          </ChipWrap>
        </View>

        <Field
          label="Notes"
          placeholder="Puck was wet, tried a new basket…"
          value={taste.notes}
          onChangeText={(notes) => setTaste((t) => ({ ...t, notes }))}
          multiline
        />

        <View style={[styles.summary, { backgroundColor: c.surfaceAlt }]}>
          <AppText variant="footnote" tone="inkSoft" tabular align="center">
            {bean?.name ?? 'No bean'} · {spec.label} · Grind {formatGrind(recipe.grind)} · {formatTemp(recipe.temp)} ·{' '}
            {formatGrams(recipe.dose)} → {formatGrams(recipe.yield)} · {formatTime(recipe.time)}
          </AppText>
        </View>

        <Button
          label={editing ? 'Save changes' : 'Save extraction'}
          icon="check"
          size="lg"
          onPress={save}
          disabled={!beanId}
        />
      </Screen>
    </View>
  );
}

const styles = StyleSheet.create({
  block: { gap: Spacing.md },
  sourceRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  pending: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.lg,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderStyle: 'dashed',
  },
  applyPill: { paddingHorizontal: 16, paddingVertical: 9, borderRadius: Radius.pill },
  grid: { flexDirection: 'row', gap: Spacing.md },
  ratio: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: Radius.pill,
    borderWidth: StyleSheet.hairlineWidth,
    alignSelf: 'center',
  },
  ratioDot: { width: 8, height: 8, borderRadius: 4 },
  tasteHead: { gap: 4, marginTop: Spacing.sm },
  summary: { borderRadius: Radius.md, padding: Spacing.md },
  savedHead: { alignItems: 'center', gap: Spacing.sm, paddingTop: Spacing.xl },
  check: { width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.sm },
});
