import { StyleSheet, TextInput, View, type TextInputProps } from 'react-native';

import { Fonts, Radius, Spacing } from '@/theme/tokens';
import { useTheme } from '@/theme/use-theme';

import { FormLabel } from './screen';

export function Field({
  label,
  hint,
  multiline,
  ...input
}: { label: string; hint?: string } & TextInputProps) {
  const { c } = useTheme();
  return (
    <View>
      <FormLabel hint={hint}>{label}</FormLabel>
      <TextInput
        placeholderTextColor={c.inkFaint}
        selectionColor={c.accent}
        multiline={multiline}
        {...input}
        style={[
          styles.input,
          multiline && styles.multiline,
          { backgroundColor: c.surface, borderColor: c.line, color: c.ink, fontFamily: Fonts.ui },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  input: {
    borderRadius: Radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: Spacing.lg,
    paddingVertical: 13,
    fontSize: 16,
  },
  multiline: { minHeight: 96, textAlignVertical: 'top', paddingTop: 13 },
});
