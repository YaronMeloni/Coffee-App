import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { RoastGradients, Spacing } from '@/theme/tokens';

import { BeanGlyph } from './bean-glyph';
import { AppText } from './text';

/** Three tumbling beans in light, medium and dark roast. */
export function BeanTrio({ size = 64 }: { size?: number }) {
  return (
    <View style={[styles.trio, { width: size * 2.2, height: size * 1.5 }]} accessibilityElementsHidden>
      <View style={[styles.abs, { left: 0, top: size * 0.35 }]}>
        <BeanGlyph size={size} fill={RoastGradients.light[0]} crease="rgba(0,0,0,0.22)" rotate={-50} />
      </View>
      <View style={[styles.abs, { left: size * 0.6, top: 0 }]}>
        <BeanGlyph size={size} fill={RoastGradients.medium[0]} crease="rgba(0,0,0,0.25)" rotate={-10} />
      </View>
      <View style={[styles.abs, { left: size * 1.2, top: size * 0.42 }]}>
        <BeanGlyph size={size} fill={RoastGradients.dark[0]} crease="rgba(255,255,255,0.18)" rotate={30} />
      </View>
    </View>
  );
}

export function EmptyState({ title, body, children }: { title: string; body: string; children?: ReactNode }) {
  return (
    <View style={styles.wrap}>
      <BeanTrio />
      <AppText variant="title" align="center">
        {title}
      </AppText>
      <AppText variant="callout" tone="inkSoft" align="center" style={{ maxWidth: 320 }}>
        {body}
      </AppText>
      {children && <View style={styles.actions}>{children}</View>}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', gap: Spacing.md, paddingVertical: Spacing.xxxl },
  trio: { marginBottom: Spacing.sm },
  abs: { position: 'absolute' },
  actions: { alignSelf: 'stretch', gap: Spacing.sm, marginTop: Spacing.md },
});
