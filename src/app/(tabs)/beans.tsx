import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';

import { BeanCard } from '@/components/bean-card';
import { Button } from '@/components/button';
import { EmptyState } from '@/components/empty-state';
import { Screen, ScreenHeader } from '@/components/screen';
import { Segmented } from '@/components/segmented';
import { CircleButton } from '@/components/tap';
import { AppText } from '@/components/text';
import { useStore } from '@/data/store';
import { brewsForBean } from '@/lib/stats';
import { MaxContentWidth, ScreenPadding, Spacing } from '@/theme/tokens';

type Filter = 'shelf' | 'finished';

export default function BeansScreen() {
  const beans = useStore((s) => s.beans);
  const brews = useStore((s) => s.brews);
  const [filter, setFilter] = useState<Filter>('shelf');
  const { width } = useWindowDimensions();

  const shelf = beans.filter((b) => !b.isFinished);
  const finished = beans.filter((b) => b.isFinished);
  const list = (filter === 'shelf' ? shelf : finished).sort(
    (a, b) => Number(b.isFavorite) - Number(a.isFavorite) || b.createdAt.localeCompare(a.createdAt),
  );
  const cardWidth = (Math.min(width, MaxContentWidth) - ScreenPadding * 2 - Spacing.md) / 2;

  return (
    <Screen>
      <ScreenHeader
        eyebrow={`${shelf.length} on the shelf`}
        title="Beans"
        right={<CircleButton icon="add" variant="accent" label="Add bean" onPress={() => router.push('/bean/edit')} />}
      />

      {beans.length === 0 ? (
        <EmptyState
          title="No beans yet"
          body="Add a bag to start tracking its freshness, how much is left, and the recipe that makes it sing.">
          <Button label="Add a bean" icon="add" size="lg" onPress={() => router.push('/bean/edit')} />
        </EmptyState>
      ) : (
        <>
          <Segmented<Filter>
            value={filter}
            onChange={setFilter}
            options={[
              { value: 'shelf', label: `On the shelf · ${shelf.length}` },
              { value: 'finished', label: `Finished · ${finished.length}` },
            ]}
          />
          {list.length === 0 ? (
            <AppText variant="callout" tone="inkSoft" align="center" style={{ paddingVertical: Spacing.xxxl }}>
              {filter === 'shelf'
                ? 'Nothing on the shelf. Time for a coffee run.'
                : 'Finished bags will land here, with all their history kept.'}
            </AppText>
          ) : (
            <View style={styles.grid}>
              {list.map((b) => (
                <BeanCard key={b.id} bean={b} brews={brewsForBean(brews, b.id)} width={cardWidth} height={228} />
              ))}
            </View>
          )}
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.md },
});
