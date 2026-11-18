import { TabList, TabSlot, TabTrigger, Tabs, type TabListProps, type TabTriggerSlotProps } from 'expo-router/ui';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { IconName } from '@/lib/icons';
import { Radius } from '@/theme/tokens';
import { useTheme } from '@/theme/use-theme';

import { Icon } from './icon';
import { AppText } from './text';

/** Web stand-in for the native tab bar: a floating, frosted pill like iOS 26. */
export default function AppTabs() {
  return (
    <Tabs>
      <TabSlot style={{ flex: 1 }} />
      {/* Triggers must be direct children of the TabList's asChild element. */}
      <TabList asChild>
        <FloatingBar>
          <TabTrigger name="index" href="/" asChild>
            <TabButton icon="todayFill" label="Today" />
          </TabTrigger>
          <TabTrigger name="beans" href="/beans" asChild>
            <TabButton icon="beansFill" label="Beans" />
          </TabTrigger>
          <TabTrigger name="journal" href="/journal" asChild>
            <TabButton icon="journalFill" label="Journal" />
          </TabTrigger>
        </FloatingBar>
      </TabList>
    </Tabs>
  );
}

function FloatingBar({ children, style: _style, ...props }: TabListProps) {
  const insets = useSafeAreaInsets();
  const { c, isDark } = useTheme();
  return (
    <View {...props} style={[styles.barWrap, { bottom: Math.max(insets.bottom, 12) }]} pointerEvents="box-none">
      <View
        style={[
          styles.bar,
          {
            backgroundColor: isDark ? 'rgba(38,30,24,0.82)' : 'rgba(255,251,245,0.82)',
            borderColor: c.line,
          },
        ]}>
        {children}
      </View>
    </View>
  );
}

function TabButton({ isFocused, icon, label, ref: _ref, ...props }: TabTriggerSlotProps & { icon: IconName; label: string }) {
  const { c } = useTheme();
  const color = isFocused ? c.accent : c.inkSoft;
  return (
    <Pressable {...props} style={[styles.tab, isFocused && { backgroundColor: c.accentSoft }]}>
      <Icon name={icon} size={22} color={color} />
      <AppText variant="caption" weight={isFocused ? '700' : '500'} color={color}>
        {label}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  barWrap: { position: 'absolute', left: 0, right: 0, flexDirection: 'row', justifyContent: 'center' },
  bar: {
    flexDirection: 'row',
    gap: 4,
    padding: 5,
    borderRadius: Radius.pill,
    borderWidth: StyleSheet.hairlineWidth,
    // @ts-expect-error web-only style
    backdropFilter: 'blur(20px) saturate(1.6)',
    shadowColor: '#2A1C14',
    shadowOpacity: 0.12,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 6 },
  },
  tab: {
    alignItems: 'center',
    gap: 1,
    paddingVertical: 7,
    paddingHorizontal: 22,
    borderRadius: Radius.pill,
  },
});
