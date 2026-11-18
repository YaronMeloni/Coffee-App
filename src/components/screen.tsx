import type { ReactNode, Ref } from 'react';
import {
  Platform,
  ScrollView,
  StyleSheet,
  View,
  type ScrollViewInstance,
  type ScrollViewProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { MaxContentWidth, Radius, ScreenPadding, Spacing } from '@/theme/tokens';
import { useTheme } from '@/theme/use-theme';

import { Tap } from './tap';
import { AppText } from './text';

/** Space reserved at the bottom of web tab screens for the floating tab bar. */
export const TAB_BAR_SPACE = 92;

/**
 * Native tabs on iOS automatically inset the first scroll view for the status
 * bar and the tab bar, and Android applies the bottom inset, so only the
 * remaining edges are padded by hand.
 */
function tabScreenPadding(insets: { top: number; bottom: number }) {
  if (Platform.OS === 'ios') return { paddingTop: Spacing.sm, paddingBottom: Spacing.xxl };
  if (Platform.OS === 'android') return { paddingTop: insets.top + Spacing.sm, paddingBottom: Spacing.xxl };
  return {
    paddingTop: Math.max(insets.top, Spacing.lg) + Spacing.sm,
    paddingBottom: insets.bottom + TAB_BAR_SPACE,
  };
}

export function Screen({
  children,
  tabScreen = true,
  padTop = true,
  contentStyle,
  ref,
  ...scrollProps
}: {
  children: ReactNode;
  ref?: Ref<ScrollViewInstance>;
  /** Adds room for the tab bar at the bottom. */
  tabScreen?: boolean;
  padTop?: boolean;
  contentStyle?: StyleProp<ViewStyle>;
} & ScrollViewProps) {
  const { c } = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <ScrollView
      ref={ref}
      style={{ flex: 1, backgroundColor: c.bg }}
      contentInsetAdjustmentBehavior={tabScreen ? 'automatic' : 'never'}
      contentContainerStyle={[
        styles.content,
        tabScreen
          ? tabScreenPadding(insets)
          : {
              paddingTop: padTop ? Math.max(insets.top, Spacing.lg) + Spacing.sm : 0,
              paddingBottom: insets.bottom + Spacing.xxxl,
            },
        contentStyle,
      ]}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="interactive"
      showsVerticalScrollIndicator={false}
      {...scrollProps}>
      {children}
    </ScrollView>
  );
}

/** Big editorial title used at the top of each tab. */
export function ScreenHeader({
  eyebrow,
  title,
  right,
}: {
  eyebrow?: string;
  title: string;
  right?: ReactNode;
}) {
  return (
    <View style={styles.header}>
      <View style={{ flex: 1 }}>
        {eyebrow && (
          <AppText variant="eyebrow" tone="inkFaint" style={{ marginBottom: 6 }}>
            {eyebrow}
          </AppText>
        )}
        <AppText variant="display" accessibilityRole="header">
          {title}
        </AppText>
      </View>
      {right && <View style={styles.headerRight}>{right}</View>}
    </View>
  );
}

/** Cancel · Title · Save bar for modal sheets. */
export function SheetHeader({
  title,
  onCancel,
  onSave,
  saveLabel = 'Save',
  saveDisabled,
}: {
  title: string;
  onCancel?: () => void;
  onSave?: () => void;
  saveLabel?: string;
  saveDisabled?: boolean;
}) {
  const { c } = useTheme();
  const insets = useSafeAreaInsets();
  // iOS page sheets already sit below the status bar.
  const top = Platform.OS === 'ios' ? Spacing.md : Math.max(insets.top, Spacing.sm) + Spacing.sm;
  return (
    <View style={[styles.sheetHeader, { paddingTop: top, backgroundColor: c.bg, borderBottomColor: c.line }]}>
      {onCancel ? (
        <Tap onPress={onCancel} haptic={false} hitSlop={10} style={styles.sheetSide}>
          <AppText variant="body" tone="inkSoft">
            Cancel
          </AppText>
        </Tap>
      ) : (
        <View style={styles.sheetSide} />
      )}
      <AppText variant="headline" numberOfLines={1} style={styles.sheetTitle}>
        {title}
      </AppText>
      <View style={[styles.sheetSide, { alignItems: 'flex-end' }]}>
        {onSave && (
          <Tap
            onPress={onSave}
            disabled={saveDisabled}
            haptic="success"
            hitSlop={10}
            style={[styles.savePill, { backgroundColor: c.accent }]}>
            <AppText variant="callout" weight="700" color={c.accentInk}>
              {saveLabel}
            </AppText>
          </Tap>
        )}
      </View>
    </View>
  );
}

export function Section({
  title,
  action,
  onAction,
  children,
  style,
}: {
  title: string;
  action?: string;
  onAction?: () => void;
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View style={[styles.section, style]}>
      <View style={styles.sectionHead}>
        <AppText variant="title2" accessibilityRole="header">
          {title}
        </AppText>
        {action && onAction && (
          <Tap onPress={onAction} haptic="select" hitSlop={8}>
            <AppText variant="subhead" tone="accent" weight="600">
              {action}
            </AppText>
          </Tap>
        )}
      </View>
      {children}
    </View>
  );
}

export function Card({
  children,
  style,
  padded = true,
}: {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  padded?: boolean;
}) {
  const { c } = useTheme();
  return (
    <View
      style={[
        styles.card,
        padded && styles.cardPadded,
        { backgroundColor: c.surface, borderColor: c.line },
        style,
      ]}>
      {children}
    </View>
  );
}

export function FormLabel({ children, hint }: { children: string; hint?: string }) {
  return (
    <View style={styles.formLabel}>
      <AppText variant="eyebrow" tone="inkSoft">
        {children}
      </AppText>
      {hint && (
        <AppText variant="caption" tone="inkFaint">
          {hint}
        </AppText>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: ScreenPadding,
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    gap: Spacing.xxl,
  },
  header: { flexDirection: 'row', alignItems: 'flex-end', gap: Spacing.md },
  headerRight: { flexDirection: 'row', gap: Spacing.sm, paddingBottom: 2 },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  sheetSide: { width: 84 },
  sheetTitle: { flex: 1, textAlign: 'center' },
  savePill: { paddingHorizontal: 16, paddingVertical: 7, borderRadius: Radius.pill },
  section: { gap: Spacing.md },
  sectionHead: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' },
  card: { borderRadius: Radius.lg, borderWidth: StyleSheet.hairlineWidth },
  cardPadded: { padding: Spacing.lg },
  formLabel: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: Spacing.sm,
  },
});
