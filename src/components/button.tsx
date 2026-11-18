import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import type { IconName } from '@/lib/icons';
import { Radius, Spacing } from '@/theme/tokens';
import { useTheme } from '@/theme/use-theme';

import { Icon } from './icon';
import { Tap } from './tap';
import { AppText } from './text';

export interface ButtonProps {
  label: string;
  onPress: () => void;
  icon?: IconName;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'crema';
  size?: 'md' | 'lg';
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  trailingIcon?: IconName;
}

export function Button({
  label,
  onPress,
  icon,
  trailingIcon,
  variant = 'primary',
  size = 'md',
  disabled,
  style,
}: ButtonProps) {
  const { c } = useTheme();
  const palette = {
    primary: { bg: c.accent, fg: c.accentInk, border: 'transparent' },
    crema: { bg: c.crema, fg: '#24150C', border: 'transparent' },
    secondary: { bg: c.surface, fg: c.ink, border: c.line },
    ghost: { bg: 'transparent', fg: c.accent, border: 'transparent' },
    danger: { bg: 'transparent', fg: c.danger, border: c.line },
  }[variant];

  return (
    <Tap
      onPress={onPress}
      disabled={disabled}
      haptic={variant === 'primary' || variant === 'crema' ? 'firm' : 'tap'}
      accessibilityLabel={label}
      style={[
        styles.base,
        size === 'lg' ? styles.lg : styles.md,
        { backgroundColor: palette.bg, borderColor: palette.border },
        style,
      ]}>
      <View style={styles.row}>
        {icon && <Icon name={icon} size={size === 'lg' ? 18 : 16} color={palette.fg} weight="semibold" />}
        <AppText variant={size === 'lg' ? 'headline' : 'callout'} weight="600" color={palette.fg}>
          {label}
        </AppText>
        {trailingIcon && <Icon name={trailingIcon} size={16} color={palette.fg} weight="semibold" />}
      </View>
    </Tap>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: Radius.pill,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
  },
  md: { paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md - 2, minHeight: 44 },
  lg: { paddingHorizontal: Spacing.xxl, paddingVertical: Spacing.lg - 2, minHeight: 54 },
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
});
