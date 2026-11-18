import { router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { BrewRow } from '@/components/brew-row';
import { Button } from '@/components/button';
import { Chip, ChipScroller } from '@/components/chip';
import { EmptyState } from '@/components/empty-state';
import { Screen, ScreenHeader } from '@/components/screen';
import { CircleButton } from '@/components/tap';
import { AppText } from '@/components/text';
import { useStore } from '@/data/store';
import type { Brew, BrewMethod } from '@/data/types';
import { formatDayLabel, toLocalDateString } from '@/lib/format';
import { METHOD_ORDER, METHODS } from '@/lib/methods';
import { byNewest } from '@/lib/stats';
import { Spacing } from '@/theme/tokens';

export default function JournalScreen() {
  const beans = useStore((s) => s.beans);
  const brews = useStore((s) => s.brews);
  const [method, setMethod] = useState<BrewMethod | 'all'>('all');

  const beanById = new Map(beans.map((b) => [b.id, b]));
  const filtered = brews.filter((b) => method === 'all' || b.method === method).sort(byNewest);
  const usedMethods = METHOD_ORDER.filter((m) => brews.some((b) => b.method === m));

  const groups: { key: string; label: string; items: Brew[] }[] = [];
  for (const b of filtered) {
    const d = new Date(b.createdAt);
    const key = toLocalDateString(d);
    const last = groups[groups.length - 1];
    if (last?.key === key) last.items.push(b);
    else groups.push({ key, label: formatDayLabel(d), items: [b] });
  }

  const beanCount = new Set(brews.map((b) => b.beanId)).size;

  return (
    <Screen>
      <ScreenHeader
        eyebrow={`${brews.length} extractions · ${beanCount} beans`}
        title="Journal"
        right={
          <CircleButton icon="add" variant="accent" label="Log extraction" onPress={() => router.push('/brew/new')} />
        }
      />

      {brews.length === 0 ? (
        <EmptyState
          title="Nothing brewed yet"
          body="Each extraction you log lands here: grind, temperature, time, and how it tasted.">
          {beans.length > 0 && (
            <Button label="Log an extraction" icon="add" size="lg" onPress={() => router.push('/brew/new')} />
          )}
        </EmptyState>
      ) : (
        <>
          {usedMethods.length > 1 && (
            <ChipScroller>
              <Chip label="All" selected={method === 'all'} onPress={() => setMethod('all')} />
              {usedMethods.map((m) => (
                <Chip
                  key={m}
                  label={METHODS[m].label}
                  icon={METHODS[m].icon}
                  selected={method === m}
                  onPress={() => setMethod(m)}
                />
              ))}
            </ChipScroller>
          )}

          {groups.map((g) => (
            <View key={g.key} style={{ gap: Spacing.sm }}>
              <AppText variant="eyebrow" tone="inkFaint">
                {g.label}
              </AppText>
              {g.items.map((b) => (
                <BrewRow key={b.id} brew={b} bean={beanById.get(b.beanId)} />
              ))}
            </View>
          ))}
        </>
      )}
    </Screen>
  );
}
