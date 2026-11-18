import { StyleSheet, View } from 'react-native';

import type { IconName } from '@/lib/icons';
import { Radius } from '@/theme/tokens';
import { useTheme } from '@/theme/use-theme';

import { Icon } from './icon';
import { Tap } from './tap';
import { AppText } from './text';

export interface SegmentOption<T extends string | number> {
  value: T;
  label: string;
  icon?: IconName;
}

/** iOS-style segmented control with optional icons stacked over labels. */
export function Segmented<T extends string | number>({
  options,
  value,
  onChange,
  stacked,
}: {
  options: SegmentOption<T>[];
  value: T;
  onChange: (v: T) => void;
  stacked?: boolean;
}) {
  const { c, isDark } = useTheme();
  return (
    <View style={[styles.track, { backgroundColor: c.surfaceAlt }]} accessibilityRole="tablist">
      {options.map((o) => {
        const active = o.value === value;
        return (
          <Tap
            key={String(o.value)}
            onPress={() => onChange(o.value)}
            haptic="select"
            pressScale={0.98}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            accessibilityLabel={o.label}
            style={[
              styles.segment,
              stacked && styles.stacked,
              active && [
                styles.active,
                { backgroundColor: isDark ? c.surfacePressed : c.surface, shadowColor: '#3A2414' },
              ],
            ]}>
            {o.icon && <Icon name={o.icon} size={stacked ? 20 : 15} color={active ? c.accent : c.inkSoft} />}
            <AppText
              variant={stacked ? 'caption' : 'subhead'}
              weight={active ? '700' : '500'}
              tone={active ? 'ink' : 'inkSoft'}
              numberOfLines={1}>
              {o.label}
            </AppText>
          </Tap>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  track: { flexDirection: 'row', borderRadius: Radius.md, padding: 3, gap: 3 },
  segment: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    borderRadius: Radius.md - 3,
  },
  stacked: { flexDirection: 'column', gap: 3, paddingVertical: 9 },
  active: {
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
});
