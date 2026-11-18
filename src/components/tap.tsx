import type { ReactNode } from 'react';
import { Pressable, StyleSheet, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';

import { haptics } from '@/lib/haptics';
import type { IconName } from '@/lib/icons';
import { useTheme } from '@/theme/use-theme';

import { Icon } from './icon';

export interface TapProps extends Omit<PressableProps, 'style' | 'children'> {
  style?: StyleProp<ViewStyle>;
  children?: ReactNode;
  haptic?: keyof typeof haptics | false;
  /** How much the element shrinks while pressed. */
  pressScale?: number;
}

/** Pressable with the app's tactile feedback: a gentle squeeze and a haptic tick. */
export function Tap({ style, children, haptic = 'tap', pressScale = 0.97, onPress, ...rest }: TapProps) {
  return (
    <Pressable
      accessibilityRole="button"
      {...rest}
      onPress={(e) => {
        if (haptic) haptics[haptic]();
        onPress?.(e);
      }}
      style={({ pressed }) => [
        style,
        pressed && { opacity: 0.88, transform: [{ scale: pressScale }] },
        rest.disabled && { opacity: 0.4 },
      ]}>
      {children}
    </Pressable>
  );
}

export function CircleButton({
  icon,
  onPress,
  label,
  variant = 'surface',
  size = 40,
}: {
  icon: IconName;
  onPress: () => void;
  label: string;
  variant?: 'surface' | 'glass' | 'accent';
  size?: number;
}) {
  const { c } = useTheme();
  const bg =
    variant === 'accent' ? c.accent : variant === 'glass' ? 'rgba(20, 12, 8, 0.32)' : c.surface;
  const fg = variant === 'accent' ? c.accentInk : variant === 'glass' ? '#FBF2E7' : c.ink;
  return (
    <Tap
      onPress={onPress}
      accessibilityLabel={label}
      hitSlop={6}
      style={[
        styles.circle,
        { width: size, height: size, borderRadius: size / 2, backgroundColor: bg },
        variant === 'surface' && { borderWidth: StyleSheet.hairlineWidth, borderColor: c.line },
      ]}>
      <Icon name={icon} size={size * 0.45} color={fg} weight="semibold" />
    </Tap>
  );
}

const styles = StyleSheet.create({
  circle: { alignItems: 'center', justifyContent: 'center' },
});
