import { Redirect, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Fragment, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icons } from '@/assets';
import { AppText } from '@/components/AppText';
import { LineChartCard } from '@/components/LineChart';
import { PlantPhoto } from '@/components/PlantPhoto';
import { ScreenHeader } from '@/components/ScreenHeader';
import { SegmentedControl } from '@/components/SegmentedControl';
import type { HistoryRange } from '@/data/types';
import { formatDay, formatNumber, formatRelativeDay, formatTime } from '@/lib/format';
import { buildSeries } from '@/lib/history';
import { useNow, usePlantBundle } from '@/store/selectors';
import { colors, gutter } from '@/theme';

const RANGES: { value: HistoryRange; label: string }[] = [
  { value: '24h', label: '24 hrs' },
  { value: '7d', label: '7 días' },
  { value: '30d', label: '30 días' },
];

/** 08 · Historial y evolución */
export default function History() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const bundle = usePlantBundle(id);
  const insets = useSafeAreaInsets();
  const [range, setRange] = useState<HistoryRange>('7d');
  const now = useNow(60_000);

  if (!bundle) return <Redirect href="/" />;
  const { plant, module, species } = bundle;
  const current = module?.reading ?? { moisture: 0, temp: 0, light: 0, ts: plant.createdAt };
  const moisture = buildSeries('moisture', range, plant, species, current, now);
  const light = buildSeries('light', range, plant, species, current, now);
  const snapshots = plant.leafTimeline.slice(-6);

  return (
    <View style={styles.root}>
      <StatusBar style="dark" />
      <ScrollView
        contentContainerStyle={{ paddingTop: insets.top, paddingBottom: insets.bottom + 24 }}
        showsVerticalScrollIndicator={false}
      >
        <ScreenHeader title="Historial y evolución" subtitle={`${plant.name} · Tu jardín, día a día.`} />

        <View style={[styles.body, styles.filters]}>
          <SegmentedControl options={RANGES} value={range} onChange={setRange} />

          <View style={styles.charts}>
            <LineChartCard
              title="Humedad del suelo"
              value={`${Math.round(current.moisture)}`}
              unit="%"
              series={moisture}
            />
            <LineChartCard title="Iluminación" value={formatNumber(current.light)} unit="lx" series={light} />
          </View>

          <AppText size={17} lineHeight={23} weight="semibold" style={styles.section}>
            Tu hoja en el tiempo
          </AppText>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.snapshots}
        >
          {snapshots.map((snap) => (
            <View key={snap.id} style={styles.snapshot}>
              <PlantPhoto photo={snap.photo} style={styles.snapshotPhoto} />
              <AppText size={11} lineHeight={15} weight="medium" color={colors.muted} style={styles.snapshotLabel}>
                {formatRelativeDay(snap.ts, now)}
              </AppText>
            </View>
          ))}
        </ScrollView>

        <View style={styles.body}>
          <AppText size={17} lineHeight={23} weight="semibold" style={styles.section}>
            Registro de riegos
          </AppText>
          <View style={styles.log}>
            {plant.waterLog.length === 0 ? (
              <AppText size={12} lineHeight={16} color={colors.muted}>
                Aún no hay riegos registrados.
              </AppText>
            ) : (
              plant.waterLog.slice(0, 8).map((w, i) => (
                <Fragment key={w.id}>
                  {i > 0 ? <View style={styles.separator} /> : null}
                  <View style={styles.logRow}>
                    <Icons.drop19 width={19} height={19} />
                    <AppText size={12} lineHeight={16} weight="medium" style={styles.flex}>
                      {formatDay(w.ts)} · {formatTime(w.ts)}
                    </AppText>
                    <AppText size={11} lineHeight={15} color={colors.muted}>
                      {w.ml} ml · {w.mode}
                    </AppText>
                  </View>
                </Fragment>
              ))
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.white },
  flex: { flex: 1 },
  body: { paddingHorizontal: gutter },
  filters: { marginTop: 16 },
  charts: { marginTop: 16, gap: 16 },
  section: { marginTop: 20 },
  snapshots: { paddingHorizontal: gutter, gap: 11, marginTop: 12 },
  snapshot: { width: 114 },
  snapshotPhoto: { width: 114, height: 78, borderRadius: 16 },
  snapshotLabel: { marginTop: 9 },
  log: { marginTop: 16 },
  logRow: { flexDirection: 'row', alignItems: 'center', gap: 13, paddingVertical: 2 },
  separator: { height: 1, backgroundColor: colors.border, marginLeft: 32, marginVertical: 13 },
});
