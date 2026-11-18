import { StyleSheet, View } from 'react-native';

import type { BrewMethod, Recipe } from '@/data/types';
import { formatGrams, formatGrind, formatRatio, formatTemp, formatTime } from '@/lib/format';
import { METHODS, ratioOf } from '@/lib/methods';
import { Spacing } from '@/theme/tokens';
import { useTheme } from '@/theme/use-theme';

import { AppText } from './text';

/** The six numbers that define an extraction, laid out like a recipe card. */
export function RecipeGrid({ recipe, method, onDark }: { recipe: Recipe; method: BrewMethod; onDark?: boolean }) {
  const { c } = useTheme();
  const spec = METHODS[method];
  const cells: [string, string][] = [
    ['Grind', formatGrind(recipe.grind)],
    ['Temp', formatTemp(recipe.temp)],
    ['Ratio', formatRatio(ratioOf(recipe))],
    ['Dose', formatGrams(recipe.dose)],
    [spec.yieldLabel, formatGrams(recipe.yield)],
    [method === 'espresso' ? 'Time' : 'Total', formatTime(recipe.time)],
  ];
  const labelColor = onDark ? c.heroInkSoft : c.inkFaint;
  const valueColor = onDark ? c.heroInk : c.ink;
  const rule = onDark ? 'rgba(255,255,255,0.12)' : c.line;

  return (
    <View style={styles.grid}>
      {cells.map(([label, value], i) => (
        <View
          key={label}
          style={[
            styles.cell,
            i % 3 !== 0 && { borderLeftWidth: StyleSheet.hairlineWidth, borderLeftColor: rule },
            i >= 3 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: rule },
          ]}>
          <AppText variant="eyebrow" color={labelColor}>
            {label}
          </AppText>
          <AppText variant="numberSmall" color={valueColor} numberOfLines={1} adjustsFontSizeToFit>
            {value}
          </AppText>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  cell: { width: '33.333%', paddingVertical: Spacing.md, paddingHorizontal: Spacing.md, gap: 4 },
});
