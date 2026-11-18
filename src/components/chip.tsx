import { ScrollView, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import type { IconName } from '@/lib/icons';
import { Radius, ScreenPadding, Spacing } from '@/theme/tokens';
import { useTheme } from '@/theme/use-theme';

import { Icon } from './icon';
import { Tap } from './tap';
import { AppText } from './text';

export interface ChipProps {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  icon?: IconName;
  /** Small colour dot before the label (identity, e.g. roast colour). */
  dot?: string;
  size?: 'sm' | 'md';
  style?: StyleProp<ViewStyle>;
}

export function Chip({ label, selected, onPress, icon, dot, size = 'md', style }: ChipProps) {
  const { c } = useTheme();
  const content = (
    <View
      style={[
        styles.chip,
        size === 'sm' && styles.sm,
        {
          backgroundColor: selected ? c.ink : c.surface,
          borderColor: selected ? c.ink : c.line,
        },
        style,
      ]}>
      {dot && <View style={[styles.dot, { backgroundColor: dot }]} />}
      {icon && <Icon name={icon} size={size === 'sm' ? 13 : 15} color={selected ? c.bg : c.inkSoft} />}
      <AppText
        variant={size === 'sm' ? 'caption' : 'subhead'}
        weight="600"
        color={selected ? c.bg : c.ink}
        numberOfLines={1}>
        {label}
      </AppText>
    </View>
  );
  if (!onPress) return content;
  return (
    <Tap
      onPress={onPress}
      haptic="select"
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={label}>
      {content}
    </Tap>
  );
}

/** A horizontally scrolling row of chips that bleeds to the screen edges. */
export function ChipScroller({ children }: { children: React.ReactNode }) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.scroller}
      contentContainerStyle={styles.scrollerContent}>
      {children}
    </ScrollView>
  );
}

export function ChipWrap({ children }: { children: React.ReactNode }) {
  return <View style={styles.wrap}>{children}</View>;
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: Radius.pill,
    borderWidth: StyleSheet.hairlineWidth,
  },
  sm: { paddingHorizontal: 10, paddingVertical: 5 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  scroller: { marginHorizontal: -ScreenPadding, flexGrow: 0 },
  scrollerContent: { paddingHorizontal: ScreenPadding, gap: Spacing.sm },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
});
