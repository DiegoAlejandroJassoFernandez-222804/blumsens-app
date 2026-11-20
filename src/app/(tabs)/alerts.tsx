import { router } from 'expo-router';
import { useState } from 'react';
import { LayoutAnimation, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icons } from '@/assets';
import { AlertCard } from '@/components/AlertCard';
import { AppText, Eyebrow } from '@/components/AppText';
import { tapFeedback } from '@/components/Button';
import { BackButton } from '@/components/ScreenHeader';
import { SegmentedControl } from '@/components/SegmentedControl';
import type { AlertKind } from '@/data/types';
import { useGarden } from '@/store/garden';
import { useNow, useOpenAlerts } from '@/store/selectors';
import { colors, gutter, radius } from '@/theme';

type Filter = 'todas' | AlertKind;

const FILTERS: { value: Filter; label: string }[] = [
  { value: 'todas', label: 'Todas' },
  { value: 'riego', label: 'Riego' },
  { value: 'salud', label: 'Salud' },
  { value: 'conexion', label: 'Conexión' },
];

const KIND_ORDER: Record<AlertKind, number> = { conexion: 0, riego: 1, salud: 2 };

/** 09 · Centro de alertas */
export default function Alerts() {
  const insets = useSafeAreaInsets();
  const [filter, setFilter] = useState<Filter>('todas');
  const open = useOpenAlerts();
  const resolveAlert = useGarden((s) => s.resolveAlert);
  const now = useNow(20_000);

  // Orden: conexión → riego → salud; dentro de cada tipo, la más reciente primero.
  const visible = open
    .filter((a) => filter === 'todas' || a.kind === filter)
    .sort((a, b) => KIND_ORDER[a.kind] - KIND_ORDER[b.kind] || b.createdAt - a.createdAt);

  const count = open.length;
  const subtitle =
    count === 0
      ? 'Sin pendientes · Tu jardín está en calma.'
      : `${count} ${count === 1 ? 'pendiente' : 'pendientes'} · Un pequeño cuidado hace mucho.`;

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + 16 }]}
      showsVerticalScrollIndicator={false}
    >
      <Eyebrow>TU JARDÍN TE AVISA</Eyebrow>
      <View style={styles.titleRow}>
        <BackButton onPress={() => (router.canGoBack() ? router.back() : router.navigate('/plants'))} />
        <AppText size={28} lineHeight={38} weight="semibold">
          Centro de alertas
        </AppText>
      </View>
      <AppText size={12} lineHeight={16} color={colors.muted} style={styles.subtitle}>
        {subtitle}
      </AppText>

      <View style={styles.filters}>
        <SegmentedControl options={FILTERS} value={filter} onChange={setFilter} />
      </View>

      <View style={styles.list}>
        {visible.map((a) => (
          <AlertCard
            key={a.id}
            alert={a}
            now={now}
            onPress={() => router.push({ pathname: '/plant/[id]', params: { id: a.plantId } })}
            onResolve={() => {
              tapFeedback();
              LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
              resolveAlert(a.id);
            }}
          />
        ))}
        {visible.length === 0 ? (
          <View style={styles.empty}>
            <View style={styles.emptyIcon}>
              <Icons.leaf22 width={22} height={22} />
            </View>
            <AppText size={16} lineHeight={22} weight="semibold" align="center">
              Todo en calma
            </AppText>
            <AppText size={13} lineHeight={18} color={colors.muted} align="center">
              {filter === 'todas'
                ? 'No hay alertas pendientes. Te avisaremos si alguna planta necesita algo.'
                : 'No hay alertas de este tipo por ahora.'}
            </AppText>
          </View>
        ) : null}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.white },
  content: { paddingHorizontal: gutter, paddingBottom: 32 },
  titleRow: { marginTop: 4, marginLeft: -11, flexDirection: 'row', alignItems: 'center', gap: 12 },
  subtitle: { marginTop: 12 },
  filters: { marginTop: 18 },
  list: { marginTop: 24, gap: 14 },
  empty: {
    alignItems: 'center',
    gap: 8,
    paddingVertical: 40,
    paddingHorizontal: 24,
    borderRadius: radius.card,
    backgroundColor: colors.surface,
  },
  emptyIcon: {
    width: 44,
    height: 44,
    borderRadius: 16,
    backgroundColor: colors.okBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
});
