import { router } from 'expo-router';
import { Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useShallow } from 'zustand/react/shallow';

import { Icons } from '@/assets';
import { AppText, Eyebrow } from '@/components/AppText';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { StatusPill } from '@/components/StatusPill';
import type { SensorModule } from '@/data/types';
import { formatAgo, formatTime } from '@/lib/format';
import { TICK_MS, useGarden } from '@/store/garden';
import { useNow } from '@/store/selectors';
import { colors, gutter, radius } from '@/theme';

const STATE_PILL = {
  online: { tone: 'ok', label: 'Conectado' },
  offline: { tone: 'danger', label: 'Sin señal' },
  connecting: { tone: 'warn', label: 'Conectando…' },
} as const;

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.stat}>
      <AppText size={15} lineHeight={20} weight="semibold">
        {value}
      </AppText>
      <AppText size={10} lineHeight={14} color={colors.muted}>
        {label}
      </AppText>
    </View>
  );
}

function ModuleCard({ module, plantName, now }: { module: SensorModule; plantName: string; now: number }) {
  const disconnect = useGarden((s) => s.disconnectModule);
  const reconnect = useGarden((s) => s.reconnectModule);
  const pill = STATE_PILL[module.state];
  const online = module.state === 'online';
  return (
    <Card>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Módulo ${module.id}, ${pill.label}. Ver monitoreo`}
        onPress={() => router.push({ pathname: '/plant/[id]/monitor', params: { id: module.plantId } })}
        style={({ pressed }) => [styles.cardHeader, pressed && styles.pressed]}
      >
        <View style={styles.chipBox}>
          {online ? <Icons.chip width={22} height={22} /> : <Icons.wifiOff width={22} height={22} />}
        </View>
        <View style={styles.flex}>
          <AppText size={16} lineHeight={22} weight="semibold">
            {module.id}
          </AppText>
          <AppText size={11} lineHeight={15} color={colors.muted}>
            {plantName} · Firmware {module.firmware}
          </AppText>
        </View>
        <StatusPill tone={pill.tone} label={pill.label} style={styles.pill} />
      </Pressable>

      <View style={styles.stats}>
        <Stat label="Señal Wi-Fi" value={online ? `${module.rssi} dBm` : '—'} />
        <View style={styles.vDivider} />
        <Stat label="Batería" value={`${Math.round(module.battery)} %`} />
        <View style={styles.vDivider} />
        <Stat label="Última lectura" value={online ? 'Ahora' : formatTime(module.lastSeen)} />
      </View>

      <View style={styles.cardFooter}>
        <AppText size={10} lineHeight={14} color={colors.muted} style={styles.flex}>
          {online
            ? `Envía datos cada ${TICK_MS / 1000} s`
            : module.state === 'connecting'
              ? 'Buscando el módulo en tu red…'
              : `Sin datos ${formatAgo(module.lastSeen, now).toLowerCase()}`}
        </AppText>
        {online ? (
          <Button variant="outline" label="Simular desconexión" onPress={() => disconnect(module.id)} />
        ) : (
          <Button
            variant="compact"
            label="Reconectar"
            icon={Icons.reconnect}
            height={32}
            loading={module.state === 'connecting'}
            onPress={() => reconnect(module.id)}
          />
        )}
      </View>
    </Card>
  );
}

/** Módulos IoT vinculados + controles del modo presentación. */
export default function Modules() {
  const insets = useSafeAreaInsets();
  const modules = useGarden(useShallow((s) => s.modules));
  const plants = useGarden(useShallow((s) => s.plants));
  const session = useGarden((s) => s.session);
  const resetDemo = useGarden((s) => s.resetDemo);
  const logout = useGarden((s) => s.logout);
  const now = useNow(15_000);

  const online = modules.filter((m) => m.state === 'online').length;
  const offline = modules.length - online;

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + 16 }]}
      showsVerticalScrollIndicator={false}
    >
      <Eyebrow>TUS DISPOSITIVOS</Eyebrow>
      <AppText size={29} lineHeight={39} weight="semibold" style={styles.title}>
        Módulos
      </AppText>
      <AppText size={12} lineHeight={16} color={colors.muted} style={styles.subtitle}>
        Sensores ESP32 de humedad, temperatura y luz en cada maceta.
      </AppText>

      <View style={styles.summary}>
        <View style={styles.summaryHalf}>
          <AppText size={27} lineHeight={36} weight="semibold" color={colors.forest}>
            {online}
          </AppText>
          <AppText size={13} lineHeight={18} weight="medium" color={colors.forest}>
            {online === 1 ? 'Conectado' : 'Conectados'}
          </AppText>
        </View>
        <View style={styles.divider} />
        <View style={styles.summaryHalf}>
          <AppText size={27} lineHeight={36} weight="semibold" color={offline ? colors.danger : colors.forest}>
            {offline}
          </AppText>
          <AppText size={12} lineHeight={16} weight="medium" color={offline ? colors.danger : colors.forest}>
            Sin señal
          </AppText>
        </View>
      </View>

      <View style={styles.list}>
        {modules.map((m) => (
          <ModuleCard
            key={m.id}
            module={m}
            now={now}
            plantName={plants.find((p) => p.id === m.plantId)?.name ?? 'Sin planta'}
          />
        ))}
      </View>

      <View style={styles.demo}>
        <AppText size={17} lineHeight={23} weight="semibold" color={colors.white}>
          Modo presentación
        </AppText>
        <AppText size={12} lineHeight={17} color={colors.mint} style={styles.demoText}>
          Los módulos y lecturas son simulados: cada {TICK_MS / 1000} s llega una lectura nueva, la tierra se seca poco a
          poco y las alertas se generan solas al cruzar los umbrales.
        </AppText>
        {session ? (
          <AppText size={11} lineHeight={15} color={colors.mint} style={styles.demoText}>
            Sesión: {session.email}
          </AppText>
        ) : null}
        <View style={styles.demoActions}>
          <Button
            variant="compact"
            label="Restablecer datos"
            style={styles.flex}
            onPress={() =>
              Alert.alert('Restablecer datos', 'Se restaurará el jardín de demostración original.', [
                { text: 'Cancelar', style: 'cancel' },
                { text: 'Restablecer', style: 'destructive', onPress: resetDemo },
              ])
            }
          />
          <Button variant="outline" label="Cerrar sesión" height={40} style={styles.flex} onPress={logout} />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.white },
  content: { paddingHorizontal: gutter, paddingBottom: 32 },
  flex: { flex: 1 },
  title: { marginTop: 8 },
  subtitle: { marginTop: 6 },
  summary: {
    marginTop: 20,
    height: 77,
    borderRadius: radius.card,
    backgroundColor: colors.surface,
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryHalf: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  divider: { width: 1, height: 41, backgroundColor: colors.border },
  list: { marginTop: 23, gap: 14 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  pressed: { opacity: 0.7 },
  chipBox: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pill: { minWidth: 0 },
  stats: {
    marginTop: 16,
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: 14,
    paddingVertical: 10,
  },
  stat: { flex: 1, alignItems: 'center', gap: 2 },
  vDivider: { width: 1, backgroundColor: colors.border },
  cardFooter: { marginTop: 14, flexDirection: 'row', alignItems: 'center', gap: 12 },
  demo: { marginTop: 28, borderRadius: radius.photo, backgroundColor: colors.forest, padding: 20 },
  demoText: { marginTop: 8 },
  demoActions: { marginTop: 16, flexDirection: 'row', gap: 10 },
});
