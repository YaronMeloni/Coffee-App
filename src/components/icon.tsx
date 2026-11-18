import { SymbolView, type AndroidSymbol, type SymbolWeight } from 'expo-symbols';
import { Platform, type StyleProp, type ViewStyle } from 'react-native';

import { ICONS, type IconName } from '@/lib/icons';
import { useTheme } from '@/theme/use-theme';

export interface IconProps {
  name: IconName;
  size?: number;
  color?: string;
  weight?: SymbolWeight;
  style?: StyleProp<ViewStyle>;
}

/** SF Symbols on iOS, Material Symbols on Android and web. */
export function Icon({ name, size = 20, color, weight = 'medium', style }: IconProps) {
  const { c } = useTheme();
  const symbol = ICONS[name];
  return (
    <SymbolView
      name={{ ios: symbol.ios, android: symbol.web as AndroidSymbol, web: symbol.web as AndroidSymbol }}
      size={size}
      tintColor={color ?? c.ink}
      weight={Platform.OS === 'ios' ? weight : undefined}
      style={style}
    />
  );
}
