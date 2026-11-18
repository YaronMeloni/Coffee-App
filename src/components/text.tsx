import { Text, type TextProps, type TextStyle } from 'react-native';

import { Fonts, type Colors } from '@/theme/tokens';
import { useTheme } from '@/theme/use-theme';

const VARIANTS = {
  hero: { fontFamily: Fonts.display, fontSize: 40, lineHeight: 44, letterSpacing: -0.8 },
  display: { fontFamily: Fonts.display, fontSize: 34, lineHeight: 40, letterSpacing: -0.6 },
  title: { fontFamily: Fonts.display, fontSize: 26, lineHeight: 31, letterSpacing: -0.4 },
  title2: { fontFamily: Fonts.display, fontSize: 20, lineHeight: 25, letterSpacing: -0.2 },
  italic: { fontFamily: Fonts.displayItalic, fontSize: 34, lineHeight: 40, letterSpacing: -0.5 },
  headline: { fontFamily: Fonts.ui, fontSize: 17, lineHeight: 22, fontWeight: '600' },
  body: { fontFamily: Fonts.ui, fontSize: 16, lineHeight: 22 },
  callout: { fontFamily: Fonts.ui, fontSize: 15, lineHeight: 21 },
  subhead: { fontFamily: Fonts.ui, fontSize: 14, lineHeight: 19 },
  footnote: { fontFamily: Fonts.ui, fontSize: 13, lineHeight: 18 },
  caption: { fontFamily: Fonts.ui, fontSize: 12, lineHeight: 16 },
  eyebrow: {
    fontFamily: Fonts.ui,
    fontSize: 11.5,
    lineHeight: 14,
    fontWeight: '700',
    letterSpacing: 1.1,
    textTransform: 'uppercase',
  },
  number: { fontFamily: Fonts.number, fontSize: 30, lineHeight: 36, fontVariant: ['tabular-nums'] },
  numberSmall: { fontFamily: Fonts.number, fontSize: 22, lineHeight: 27, fontVariant: ['tabular-nums'] },
} satisfies Record<string, TextStyle>;

export type TextVariant = keyof typeof VARIANTS;

export interface AppTextProps extends TextProps {
  variant?: TextVariant;
  /** A palette colour name; text always wears text tokens. */
  tone?: keyof Colors;
  color?: string;
  weight?: TextStyle['fontWeight'];
  align?: TextStyle['textAlign'];
  tabular?: boolean;
}

export function AppText({
  variant = 'body',
  tone = 'ink',
  color,
  weight,
  align,
  tabular,
  style,
  ...rest
}: AppTextProps) {
  const { c } = useTheme();
  const toneColor = c[tone];
  return (
    <Text
      {...rest}
      style={[
        VARIANTS[variant],
        { color: color ?? (typeof toneColor === 'string' ? toneColor : c.ink) },
        weight !== undefined && { fontWeight: weight },
        align !== undefined && { textAlign: align },
        tabular && { fontVariant: ['tabular-nums'] },
        style,
      ]}
    />
  );
}
