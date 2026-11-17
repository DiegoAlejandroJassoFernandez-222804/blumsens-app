import { router } from 'expo-router';
import { useMemo } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useShallow } from 'zustand/react/shallow';

import { Icons } from '@/assets';
import { AppText, Eyebrow } from '@/components/AppText';
import { Button } from '@/components/Button';
import { PlantCard } from '@/components/PlantCard';
import { getSpecies } from '@/data/species';
import { needsWater } from '@/lib/insights';
import { useGarden } from '@/store/garden';
import { colors, gutter, radius } from '@/theme';

/** 03 · Mis plantas */
export default function MyPlants() {
  const insets = useSafeAreaInsets();
  const plants = useGarden(useShallow((s) => s.plants));
  const modules = useGarden(useShallow((s) => s.modules));

  const bundles = useMemo(
    () =>
      plants.map((plant) => ({
        plant,
        module: modules.find((m) => m.id === plant.moduleId),
        species: getSpecies(plant.speciesId),
      })),
    [plants, modules],
  );
  const thirsty = bundles.filter((b) => needsWater(b.module, b.species)).length;

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + 16 }]}
      showsVerticalScrollIndicator={false}
    >
      <Eyebrow>TU JARDÍN CONECTADO</Eyebrow>
      <View style={styles.titleRow}>
        <AppText size={29} lineHeight={39} weight="semibold">
          Mis plantas
        </AppText>
        <Button
          variant="compact"
          label="Maceta"
          icon={Icons.plus}
          height={42}
          style={styles.add}
          onPress={() => router.push('/scan')}
        />
      </View>

      <View style={styles.summary}>
        <View style={styles.summaryHalf}>
          <AppText size={27} lineHeight={36} weight="semibold" color={colors.forest}>
            {bundles.length}
          </AppText>
          <AppText size={13} lineHeight={18} weight="medium" color={colors.forest}>
            {bundles.length === 1 ? 'Planta' : 'Plantas'}
          </AppText>
        </View>
        <View style={styles.divider} />
        <View style={styles.summaryHalf}>
          <AppText size={27} lineHeight={36} weight="semibold" color={thirsty ? colors.warn : colors.forest}>
            {thirsty}
          </AppText>
          <AppText size={12} lineHeight={16} weight="medium" color={thirsty ? colors.warn : colors.forest}>
            {thirsty ? 'Requiere riego' : 'Todas regadas'}
          </AppText>
        </View>
      </View>

      <View style={styles.list}>
        {bundles.map((b) => (
          <PlantCard
            key={b.plant.id}
            bundle={b}
            onPress={() => router.push({ pathname: '/plant/[id]', params: { id: b.plant.id } })}
          />
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.white },
  content: { paddingHorizontal: gutter, paddingBottom: 32 },
  titleRow: { marginTop: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  add: { width: 106, borderRadius: radius.chip },
  summary: {
    marginTop: 23,
    height: 77,
    borderRadius: radius.card,
    backgroundColor: colors.surface,
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryHalf: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  divider: { width: 1, height: 41, backgroundColor: colors.border },
  list: { marginTop: 23, gap: 14 },
});
