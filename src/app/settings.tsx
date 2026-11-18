import { router } from 'expo-router';
import { View } from 'react-native';

import { Button } from '@/components/button';
import { Field } from '@/components/field';
import { Card, FormLabel, Screen, Section, SheetHeader } from '@/components/screen';
import { Segmented } from '@/components/segmented';
import { AppText } from '@/components/text';
import { useStore } from '@/data/store';
import { confirm } from '@/lib/confirm';
import { Spacing } from '@/theme/tokens';
import { useTheme } from '@/theme/use-theme';

const STEPS = [1, 0.5, 0.25, 0.1];

export default function SettingsScreen() {
  const settings = useStore((s) => s.settings);
  const updateSettings = useStore((s) => s.updateSettings);
  const loadSampleData = useStore((s) => s.loadSampleData);
  const eraseAll = useStore((s) => s.eraseAll);
  const beanCount = useStore((s) => s.beans.length);
  const brewCount = useStore((s) => s.brews.length);
  const { c } = useTheme();

  async function onErase() {
    const ok = await confirm({
      title: 'Erase everything?',
      message: `This deletes ${beanCount} beans and ${brewCount} extractions from this device. This can’t be undone.`,
      confirmLabel: 'Erase',
      destructive: true,
    });
    if (ok) eraseAll();
  }

  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      <SheetHeader title="Settings" onCancel={() => router.back()} onSave={() => router.back()} saveLabel="Done" />
      <Screen tabScreen={false} automaticallyAdjustKeyboardInsets contentStyle={{ paddingTop: Spacing.lg }}>
        <Section title="Your grinder">
          <AppText variant="subhead" tone="inkSoft" style={{ marginTop: -Spacing.xs }}>
            The coach speaks in your grinder’s numbers, so tell it how your dial works.
          </AppText>
          <Field
            label="Grinder"
            placeholder="e.g. Niche Zero, Comandante, Baratza Encore"
            value={settings.grinderName}
            onChangeText={(grinderName) => updateSettings({ grinderName })}
          />
          <View>
            <FormLabel hint="smallest change you make">Grind step</FormLabel>
            <Segmented<number>
              value={settings.grindStep}
              onChange={(grindStep) => updateSettings({ grindStep })}
              options={STEPS.map((s) => ({ value: s, label: String(s) }))}
            />
          </View>
          <View>
            <FormLabel>Direction</FormLabel>
            <Segmented<'lower' | 'higher'>
              value={settings.finerIsLower ? 'lower' : 'higher'}
              onChange={(v) => updateSettings({ finerIsLower: v === 'lower' })}
              options={[
                { value: 'lower', label: 'Lower = finer' },
                { value: 'higher', label: 'Higher = finer' },
              ]}
            />
          </View>
        </Section>

        <Section title="Your data">
          <Card style={{ gap: Spacing.md }}>
            <AppText variant="subhead" tone="inkSoft">
              {beanCount} beans and {brewCount} extractions, stored privately on this device. No account needed.
            </AppText>
            <Button label="Add sample beans" variant="secondary" icon="add" onPress={loadSampleData} />
            <Button label="Erase everything" variant="danger" icon="trash" onPress={onErase} />
          </Card>
        </Section>

        <AppText variant="caption" tone="inkFaint" align="center">
          Dialed · version 1.0
        </AppText>
      </Screen>
    </View>
  );
}
