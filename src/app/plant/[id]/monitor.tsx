import { Redirect, router, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import type { FC } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { SvgProps } from 'react-native-svg';

import { Dots, Icons } from '@/assets';
import { AppText, Eyebrow } from '@/components/AppText';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { StatusInline } from '@/components/StatusPill';
import { formatAgo, formatNumber, formatRange, formatRelativeDay, formatTime } from '@/lib/format';
import { lightDescription, lightStatus, moistureStatus, tempStatus } from '@/lib/insights';
import { useGarden } from '@/store/garden';
import { useNow, usePlantBundle } from '@/store/selectors';
import { colors, gutter } from '@/theme';

function Tile({
  title,
  icon: Icon,
  value,
  unit,
  status,
}: {
  title: string;
  icon: FC<SvgProps>;
  value: string;
  unit: string;
  status: { tone: 'ok' | 'warn' | 'danger'; label: string };
}) {
  return (
    <Card style={styles.tile}>
      <View style={styles.tileHeader}>
        <AppText size={12} lineHeight={16} weight="medium" color={colors.mutedAlt}>
          {title}
        </AppText>
        <Icon width={22} height={22} />
      </View>
      <View style={styles.valueRow}>
        <AppText size={36} lineHeight={49} weight="semibold">
          {value}
        </AppText>
        <AppText size={18} lineHeight={24} weight="medium" color={colors.mutedAlt}>
          {unit}
        </AppText>
      </View>
      <StatusInline tone={status.tone} label={status.label} />
    </Card>
  );
}

function CardHeader({ icon: Icon, title, status }: { icon: FC<SvgProps>; title: string; status?: { tone: 'ok' | 'warn' | 'danger'; label: string } }) {
  return (
    <View style={styles.cardHeader}>
      <Icon width={22} height={22} />
      <AppText size={14} lineHeight={19} weight="medium" style={styles.flex}>
        {title}
      </AppText>
      {status ? <StatusInline tone={status.tone} label={status.label} /> : null}
    </View>
  );
}

/** 3.1 · Monitoreo de mi planta */
export default function Monitor() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const bundle = usePlantBundle(id);
  const reconnect = useGarden((s) => s.reconnectModule);
  const insets = useSafeAreaInsets();
  const now = useNow(10_000);

  if (!bundle) return <Redirect href="/" />;
  const { plant, module, species } = bundle;
  const r = module?.reading ?? { moisture: 0, temp: 0, light: 0, ts: plant.createdAt };
  const online = module?.state === 'online';
  const connecting = module?.state === 'connecting';
  const ideal = species.ideal;
  const lightFill = Math.min(1, r.light / ideal.light.max);
  const lastReading = module?.lastSeen ?? plant.createdAt;

  return (
    <View style={styles.root}>
      <StatusBar style="dark" />
      <ScrollView
        contentContainerStyle={[styles.content, { paddingTop: insets.top + 12, paddingBottom: insets.bottom + 24 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.topBar}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Volver"
            hitSlop={10}
            onPress={() => (router.canGoBack() ? router.back() : router.navigate('/plants'))}
            style={({ pressed }) => pressed && { opacity: 0.6 }}
          >
            <Icons.backCompact width={25} height={25} />
          </Pressable>
          <AppText size={19} lineHeight={26} weight="semibold" color={colors.forest} style={styles.flex}>
            BlümSens
          </AppText>
          <Eyebrow color={colors.mutedAlt}>MI PLANTA</Eyebrow>
        </View>

        <View style={styles.tiles}>
          <Tile
            title="Humedad"
            icon={Icons.humidity22}
            value={`${Math.round(r.moisture)}`}
            unit="%"
            status={moistureStatus(r.moisture, ideal.moisture)}
          />
          <Tile
            title="Temperatura"
            icon={Icons.temp22}
            value={`${Math.round(r.temp)}`}
            unit="°C"
            status={tempStatus(r.temp, ideal.temp)}
          />
        </View>

        <AppText size={18} lineHeight={24} weight="semibold" style={styles.plantName}>
          {species.common.charAt(0).toUpperCase() + species.common.slice(1)} · {plant.room}
        </AppText>
        <AppText size={11} lineHeight={15} color={colors.mutedAlt}>
          {online
            ? `En tiempo real · ${plant.name}`
            : `Última lectura guardada: ${formatRelativeDay(lastReading, now).toLowerCase()}, ${formatTime(lastReading)}`}
        </AppText>

        {/* Iluminación */}
        <Card padding={20} style={styles.card}>
          <CardHeader icon={Icons.sun22} title="Iluminación" status={lightStatus(r.light, ideal.light)} />
          <View style={styles.bigRow}>
            <AppText size={34} lineHeight={46} weight="semibold">
              {formatNumber(r.light)}
            </AppText>
            <AppText size={14} lineHeight={19} weight="medium" color={colors.mutedAlt}>
              lux
            </AppText>
          </View>
          <AppText size={12} lineHeight={16} color={colors.mutedAlt}>
            {lightDescription(r.light, species)}
          </AppText>
          <View style={styles.track}>
            <View style={[styles.fill, { width: `${lightFill * 100}%` }]} />
          </View>
          <View style={styles.scale}>
            <AppText size={11} lineHeight={15} color={colors.mutedAlt}>
              Baja
            </AppText>
            <AppText size={11} lineHeight={15} color={colors.mutedAlt}>
              Rango ideal: {formatRange(ideal.light.min, ideal.light.max)} lux
            </AppText>
          </View>
        </Card>

        {/* Salud foliar */}
        <Card padding={20} style={styles.card}>
          <CardHeader icon={Icons.leaf22} title="Salud foliar" status={{ tone: plant.leaf.tone, label: plant.leaf.label }} />
          <View style={styles.bigRow}>
            <AppText size={36} lineHeight={49} weight="semibold">
              {plant.leaf.score}
            </AppText>
            <AppText size={14} lineHeight={19} color={colors.mutedAlt}>
              / 100
            </AppText>
          </View>
          <AppText size={13} lineHeight={18} weight="medium" color={colors.forest}>
            {plant.leaf.summary}
          </AppText>
          <View style={styles.separator} />
          <View style={styles.dotRow}>
            {plant.leaf.tone === 'ok' ? <Dots.ok7 width={7} height={7} /> : <Dots.warn7 width={7} height={7} />}
            <AppText size={12} lineHeight={16} color={colors.mutedAlt}>
              {plant.leaf.detail} · {formatAgo(plant.leaf.checkedAt, now).toLowerCase()}
            </AppText>
          </View>
        </Card>

        {/* Conexión del sensor */}
        <Card padding={20} style={styles.card}>
          <CardHeader icon={online ? Icons.chip : Icons.wifiOff} title={`Módulo de tu ${species.common}`} />
          <View style={styles.connStatus}>
            <StatusInline
              tone={online ? 'ok' : connecting ? 'warn' : 'danger'}
              label={online ? 'Conectado' : connecting ? 'Conectando…' : 'Sin conexión'}
            />
          </View>
          <AppText size={12} lineHeight={16} color={colors.mutedAlt} style={styles.connText}>
            {online
              ? `${module?.id} · señal ${module?.rssi} dBm · batería ${Math.round(module?.battery ?? 0)} %.\nLas lecturas se actualizan cada pocos segundos.`
              : `Sin señal desde las ${formatTime(lastReading)}. Las lecturas\nmostradas son las últimas guardadas.`}
          </AppText>
          <View style={styles.connActions}>
            {online ? (
              <View style={styles.flex} />
            ) : (
              <Button
                variant="compact"
                label="Reconectar sensor"
                icon={Icons.reconnect}
                loading={connecting}
                style={styles.reconnect}
                onPress={() => module && reconnect(module.id)}
              />
            )}
            <Pressable
              accessibilityRole="link"
              accessibilityLabel="Ver más sobre el módulo"
              hitSlop={10}
              style={styles.help}
              onPress={() => router.navigate('/modules')}
            >
              <AppText size={12} lineHeight={16} weight="medium" color={colors.forest}>
                Ver más
              </AppText>
              <Icons.chevronRight width={16} height={16} />
            </Pressable>
          </View>
        </Card>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.white },
  content: { paddingHorizontal: gutter + 5 },
  flex: { flex: 1 },
  topBar: { flexDirection: 'row', alignItems: 'center', gap: 9, marginTop: 6 },
  tiles: { marginTop: 14, flexDirection: 'row', gap: 16 },
  tile: { flex: 1, height: 136 },
  tileHeader: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  valueRow: { flexDirection: 'row', alignItems: 'baseline', gap: 5, marginTop: 2, marginBottom: 6 },
  plantName: { marginTop: 15 },
  card: { marginTop: 13 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  bigRow: { flexDirection: 'row', alignItems: 'baseline', gap: 8, marginTop: 14 },
  track: { marginTop: 17, height: 6, borderRadius: 3, backgroundColor: colors.track, overflow: 'hidden' },
  fill: { height: 6, borderRadius: 3, backgroundColor: colors.forest },
  scale: { marginTop: 12, flexDirection: 'row', justifyContent: 'space-between' },
  separator: { marginTop: 15, height: 1, backgroundColor: colors.track },
  dotRow: { marginTop: 17, flexDirection: 'row', alignItems: 'center', gap: 7 },
  connStatus: { marginTop: 17 },
  connText: { marginTop: 9 },
  connActions: { marginTop: 21, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  reconnect: { width: 193 },
  help: { flexDirection: 'row', alignItems: 'center', gap: 2 },
});
