import { NativeTabs } from 'expo-router/native-tabs';

import { ICONS } from '@/lib/icons';
import { useTheme } from '@/theme/use-theme';

/** Native iOS tab bar (Liquid Glass on iOS 26) with SF Symbols. */
export default function AppTabs() {
  const { c } = useTheme();
  return (
    <NativeTabs tintColor={c.accent} minimizeBehavior="onScrollDown">
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Label>Today</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf={{ default: ICONS.today.ios, selected: ICONS.todayFill.ios }} />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="beans">
        <NativeTabs.Trigger.Label>Beans</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf={{ default: ICONS.beans.ios, selected: ICONS.beansFill.ios }} />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="journal">
        <NativeTabs.Trigger.Label>Journal</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf={{ default: ICONS.journal.ios, selected: ICONS.journalFill.ios }} />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
