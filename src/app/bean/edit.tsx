import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Chip, ChipScroller, ChipWrap } from '@/components/chip';
import { Field } from '@/components/field';
import { Icon } from '@/components/icon';
import { FormLabel, Screen, SheetHeader } from '@/components/screen';
import { Tap } from '@/components/tap';
import { AppText } from '@/components/text';
import { useBean, useStore } from '@/data/store';
import type { Process, RoastLevel } from '@/data/types';
import { BAG_SIZES, ORIGINS, PROCESS_LABELS } from '@/lib/catalog';
import { daysBetween, formatShortDate, parseLocalDate, toLocalDateString } from '@/lib/format';
import { Radius, ROAST_LABELS, RoastGradients, Spacing } from '@/theme/tokens';
import { useTheme } from '@/theme/use-theme';

const ROASTS: RoastLevel[] = ['light', 'medium-light', 'medium', 'medium-dark', 'dark'];
const PROCESSES: Process[] = ['washed', 'natural', 'honey', 'anaerobic', 'other'];

export default function EditBeanScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const existing = useBean(id);
  const addBean = useStore((s) => s.addBean);
  const updateBean = useStore((s) => s.updateBean);
  const { c } = useTheme();

  const [name, setName] = useState(existing?.name ?? '');
  const [roaster, setRoaster] = useState(existing?.roaster ?? '');
  const [origin, setOrigin] = useState(existing?.origin ?? '');
  const [region, setRegion] = useState(existing?.region ?? '');
  const [varietal, setVarietal] = useState(existing?.varietal ?? '');
  const [process, setProcess] = useState<Process>(existing?.process ?? 'washed');
  const [roastLevel, setRoastLevel] = useState<RoastLevel>(existing?.roastLevel ?? 'medium-light');
  const [roastDate, setRoastDate] = useState<string | undefined>(() =>
    existing ? existing.roastDate : toLocalDateString(new Date(Date.now() - 7 * 86_400_000)),
  );
  const [notes, setNotes] = useState(existing?.notes.join(', ') ?? '');
  const [bag, setBag] = useState(existing?.bagWeight ? String(existing.bagWeight) : '250');
  const [comment, setComment] = useState(existing?.comment ?? '');

  const canSave = name.trim().length > 0;

  function save() {
    if (!canSave) return;
    const bagWeight = Number(bag);
    const data = {
      name: name.trim(),
      roaster: roaster.trim(),
      origin: origin.trim() || 'Unknown origin',
      region: region.trim() || undefined,
      varietal: varietal.trim() || undefined,
      process,
      roastLevel,
      roastDate,
      notes: notes
        .split(',')
        .map((n) => n.trim())
        .filter(Boolean),
      bagWeight: Number.isFinite(bagWeight) && bagWeight > 0 ? bagWeight : undefined,
      comment: comment.trim() || undefined,
    };
    if (existing) updateBean(existing.id, data);
    else addBean(data);
    router.back();
  }

  function shiftRoast(days: number) {
    const base = roastDate ? parseLocalDate(roastDate) : new Date();
    base.setDate(base.getDate() + days);
    if (base > new Date()) return;
    setRoastDate(toLocalDateString(base));
  }

  const daysAgo = roastDate ? daysBetween(parseLocalDate(roastDate), new Date()) : undefined;
  const [from, to] = RoastGradients[roastLevel];

  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      <SheetHeader
        title={existing ? 'Edit bean' : 'New bean'}
        onCancel={() => router.back()}
        onSave={save}
        saveDisabled={!canSave}
      />
      <Screen tabScreen={false} automaticallyAdjustKeyboardInsets contentStyle={{ paddingTop: Spacing.lg }}>
        <LinearGradient colors={[from, to]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.preview}>
          <AppText variant="eyebrow" color="rgba(251,242,231,0.75)">
            {origin || 'Origin'}
          </AppText>
          <AppText variant="title" color={c.heroInk} numberOfLines={1}>
            {name || 'Bean name'}
          </AppText>
          <AppText variant="footnote" color="rgba(251,242,231,0.8)" numberOfLines={1}>
            {roaster || 'Roaster'}
          </AppText>
        </LinearGradient>

        <Field label="Name" placeholder="e.g. Kochere" value={name} onChangeText={setName} autoFocus={!existing} />
        <Field label="Roaster" placeholder="Who roasted it?" value={roaster} onChangeText={setRoaster} />

        <View>
          <Field label="Origin" placeholder="Country" value={origin} onChangeText={setOrigin} />
          <View style={{ marginTop: Spacing.sm }}>
            <ChipScroller>
              {ORIGINS.map((o) => (
                <Chip key={o} size="sm" label={o} selected={origin === o} onPress={() => setOrigin(o)} />
              ))}
            </ChipScroller>
          </View>
        </View>

        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <Field label="Region" placeholder="Optional" value={region} onChangeText={setRegion} />
          </View>
          <View style={{ flex: 1 }}>
            <Field label="Varietal" placeholder="Optional" value={varietal} onChangeText={setVarietal} />
          </View>
        </View>

        <View>
          <FormLabel>Process</FormLabel>
          <ChipWrap>
            {PROCESSES.map((p) => (
              <Chip key={p} label={PROCESS_LABELS[p]} selected={process === p} onPress={() => setProcess(p)} />
            ))}
          </ChipWrap>
        </View>

        <View>
          <FormLabel hint={ROAST_LABELS[roastLevel]}>Roast level</FormLabel>
          <View style={styles.roastRow}>
            {ROASTS.map((r) => {
              const active = r === roastLevel;
              return (
                <Tap
                  key={r}
                  haptic="select"
                  onPress={() => setRoastLevel(r)}
                  accessibilityLabel={`${ROAST_LABELS[r]} roast`}
                  accessibilityState={{ selected: active }}
                  style={{ flex: 1 }}>
                  <LinearGradient
                    colors={RoastGradients[r]}
                    style={[styles.swatch, active && { borderColor: c.ink, borderWidth: 2.5 }]}>
                    {active && <Icon name="check" size={16} color="#FBF2E7" weight="bold" />}
                  </LinearGradient>
                </Tap>
              );
            })}
          </View>
        </View>

        <View>
          <FormLabel hint={daysAgo !== undefined ? `${daysAgo} day${daysAgo === 1 ? '' : 's'} ago` : undefined}>
            Roast date
          </FormLabel>
          <View style={[styles.dateRow, { backgroundColor: c.surface, borderColor: c.line }]}>
            <Tap onPress={() => shiftRoast(-1)} haptic="select" hitSlop={8} accessibilityLabel="One day earlier">
              <Icon name="back" size={20} color={c.ink} />
            </Tap>
            <View style={{ alignItems: 'center', gap: 2 }}>
              <Icon name="calendar" size={14} color={c.inkSoft} />
              <AppText variant="headline">{roastDate ? formatShortDate(parseLocalDate(roastDate)) : 'Unknown'}</AppText>
            </View>
            <Tap onPress={() => shiftRoast(1)} haptic="select" hitSlop={8} accessibilityLabel="One day later">
              <Icon name="chevron" size={20} color={c.ink} />
            </Tap>
          </View>
          <View style={{ marginTop: Spacing.sm }}>
            <ChipWrap>
              {[
                ['Today', 0],
                ['3 days ago', 3],
                ['1 week ago', 7],
                ['2 weeks ago', 14],
              ].map(([label, d]) => (
                <Chip
                  key={label}
                  size="sm"
                  label={String(label)}
                  selected={daysAgo === d}
                  onPress={() => setRoastDate(toLocalDateString(new Date(Date.now() - Number(d) * 86_400_000)))}
                />
              ))}
              <Chip size="sm" label="Unknown" selected={!roastDate} onPress={() => setRoastDate(undefined)} />
            </ChipWrap>
          </View>
        </View>

        <Field
          label="Roaster’s tasting notes"
          hint="comma separated"
          placeholder="Jasmine, Bergamot, Peach"
          value={notes}
          onChangeText={setNotes}
        />

        <View>
          <Field label="Bag size (g)" placeholder="250" value={bag} onChangeText={setBag} keyboardType="number-pad" />
          <View style={{ marginTop: Spacing.sm }}>
            <ChipWrap>
              {BAG_SIZES.map((s) => (
                <Chip
                  key={s}
                  size="sm"
                  label={s >= 1000 ? `${s / 1000} kg` : `${s} g`}
                  selected={bag === String(s)}
                  onPress={() => setBag(String(s))}
                />
              ))}
            </ChipWrap>
          </View>
        </View>

        <Field
          label="Comment"
          placeholder="Where you bought it, price, first impressions…"
          value={comment}
          onChangeText={setComment}
          multiline
        />
      </Screen>
    </View>
  );
}

const styles = StyleSheet.create({
  preview: { borderRadius: Radius.lg, padding: Spacing.lg, gap: 2 },
  row: { flexDirection: 'row', gap: Spacing.md },
  roastRow: { flexDirection: 'row', gap: Spacing.sm },
  swatch: {
    height: 52,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2.5,
    borderColor: 'transparent',
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: StyleSheet.hairlineWidth,
  },
});
