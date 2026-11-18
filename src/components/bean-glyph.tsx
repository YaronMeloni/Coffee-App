import { StyleSheet, View } from 'react-native';
import Svg, { Ellipse, G, Path } from 'react-native-svg';

import { haptics } from '@/lib/haptics';
import { useTheme } from '@/theme/use-theme';

import { Tap } from './tap';

/** A single coffee bean: a tilted oval with the signature S-shaped crease. */
export function BeanGlyph({
  size = 24,
  fill,
  crease,
  stroke,
  rotate = -28,
}: {
  size?: number;
  fill: string;
  crease: string;
  stroke?: string;
  rotate?: number;
}) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <G transform={`rotate(${rotate} 12 12)`}>
        <Ellipse
          cx="12"
          cy="12"
          rx="7.4"
          ry="10.2"
          fill={fill}
          stroke={stroke ?? 'none'}
          strokeWidth={stroke ? 1.4 : 0}
        />
        <Path
          d="M12.2 2.4 C 9.2 7.2, 14.9 11.4, 11.8 21.6"
          stroke={crease}
          strokeWidth={1.7}
          strokeLinecap="round"
          fill="none"
        />
      </G>
    </Svg>
  );
}

/** Read-only cup score shown as five little beans. */
export function RatingBeans({ value, size = 13, onDark }: { value: number; size?: number; onDark?: boolean }) {
  const { c } = useTheme();
  const on = onDark ? c.crema : c.accent;
  const off = onDark ? 'rgba(255,255,255,0.22)' : c.line;
  return (
    <View
      style={styles.row}
      accessible
      accessibilityLabel={`Cup score ${value} out of 5`}
      accessibilityRole="image">
      {[1, 2, 3, 4, 5].map((i) => (
        <BeanGlyph
          key={i}
          size={size}
          fill={i <= value ? on : off}
          crease={i <= value ? (onDark ? c.hero : c.surface) : 'transparent'}
        />
      ))}
    </View>
  );
}

/** Tap-to-score input: five large beans. */
export function RatingInput({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const { c } = useTheme();
  return (
    <View style={[styles.row, { gap: 6 }]} accessibilityRole="adjustable" accessibilityLabel="Cup score">
      {[1, 2, 3, 4, 5].map((i) => (
        <Tap
          key={i}
          haptic={false}
          pressScale={0.85}
          onPress={() => {
            if (i === 5) haptics.success();
            else haptics.select();
            onChange(i);
          }}
          accessibilityLabel={`${i} of 5`}
          accessibilityState={{ selected: i === value }}
          hitSlop={4}>
          <BeanGlyph
            size={42}
            fill={i <= value ? c.accent : 'transparent'}
            stroke={i <= value ? c.accent : c.inkFaint}
            crease={i <= value ? c.surface : c.inkFaint}
          />
        </Tap>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 1 },
});
