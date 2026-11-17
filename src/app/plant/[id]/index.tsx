import * as Haptics from 'expo-haptics';
import { Redirect, router, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState, type FC } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { SvgProps } from 'react-native-svg';

import { Icons } from '@/assets';
import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { PlantPhoto } from '@/components/PlantPhoto';
import { BackButton } from '@/components/ScreenHeader';
import { StatusPill } from '@/components/StatusPill';
import { formatNumber, formatTime } from '@/lib/format';
import { recommendation } from '@/lib/insights';
import { useGarden } from '@/store/garden';
import { usePlantBundle } from '@/store/selectors';
import { colors, designWidth, gutter } from '@/theme';

function Reading({ icon: Icon, value, label }: { icon: FC<SvgProps>; value: string; label: string }) {
  return (
    <View style={styles.reading}>
      <Icon width={18} height={18} />
      <AppText size={23} lineHeight={31} weight="semibold" style={styles.readingValue} numberOfLines={1}>
        {value}
      </AppText>
      <AppText size={10} lineHeight={14} color={colors.muted}>
        {label}
      </AppText>
    </View>
  );
}

/** 05 · Detalle de planta */
export default function PlantDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const bundle = usePlantBundle(id);
  const waterPlant = useGarden((s) => s.waterPlant);
  const reconnect = useGarden((s) => s.reconnectModule);
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const [watered, setWatered] = useState(false);

  useEffect(() => {
    if (!watered) return;
    const t = setTimeout(() => setWatered(false), 2500);
    return () => clearTimeout(t);
  }, [watered]);

  if (!bundle) return <Redirect href="/" />;
  const { plant, module, species } = bundle;
  const s = width / designWidth;
  const r = module?.reading;
  const rec = recommendation(module, species);
  const live = module?.state === 'online';

  const onAction = () => {
    if (rec.action === 'water') {
      waterPlant(plant.id, 150);
      setWatered(true);
      if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    } else if (rec.action === 'reconnect' && module) {
      reconnect(module.id);
    }
  };

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 24 }} showsVerticalScrollIndicator={false}>
        {/* Cámara de la maceta: foto con base redondeada */}
        <View
          style={[
            styles.hero,
            { width: 441 * s, height: 397 * s, borderBottomLeftRadius: 198.5 * s, borderBottomRightRadius: 198.5 * s },
          ]}
        >
          <PlantPhoto photo={plant.hero} style={StyleSheet.absoluteFill} />
        </View>

        <View style={styles.body}>
          <AppText size={27} lineHeight={36} weight="semibold">
            {plant.name}
          </AppText>
          <View style={styles.subRow}>
            <AppText size={13} lineHeight={18} color={colors.muted} style={styles.flex} numberOfLines={1}>
              {species.scientific} · {plant.room}
            </AppText>
            <Pressable
              hitSlop={8}
              onPress={() => router.push({ pathname: '/plant/[id]/monitor', params: { id: plant.id } })}
            >
              <AppText size={12} lineHeight={16} weight="medium" color={colors.forest}>
                Monitoreo
              </AppText>
            </Pressable>
            <Pressable
              hitSlop={8}
              onPress={() => router.push({ pathname: '/plant/[id]/history', params: { id: plant.id } })}
            >
              <AppText size={12} lineHeight={16} weight="medium" color={colors.forest}>
                Historial
              </AppText>
            </Pressable>
          </View>

          <Card
            padding={0}
            style={styles.readings}
            onPress={() => router.push({ pathname: '/plant/[id]/monitor', params: { id: plant.id } })}
            accessibilityLabel="Lecturas en tiempo real. Abrir monitoreo"
          >
            <Reading icon={Icons.drop18} value={r ? `${Math.round(r.moisture)} %` : '—'} label="Humedad" />
            <View style={styles.sensorDivider} />
            <Reading icon={Icons.temp18} value={r ? `${Math.round(r.temp)} °C` : '—'} label="Temperatura" />
            <View style={styles.sensorDivider} />
            <Reading icon={Icons.sun18} value={r ? formatNumber(r.light) : '—'} label="Luz · lx" />
          </Card>
          <AppText size={10} lineHeight={14} color={colors.muted} style={styles.liveNote}>
            {live
              ? '● En tiempo real desde ' + module?.id
              : module?.state === 'connecting'
                ? 'Reconectando con ' + module.id + '…'
                : `Sin señal · última lectura ${formatTime(module?.lastSeen ?? plant.createdAt)}`}
          </AppText>

          <Card style={styles.block}>
            <View style={styles.blockHeader}>
              <Icons.leaf width={22} height={22} />
              <AppText size={14} lineHeight={19} weight="semibold" style={styles.flex}>
                Salud foliar
              </AppText>
              <StatusPill tone={plant.leaf.tone} label={plant.leaf.label} style={styles.leafPill} />
            </View>
            <AppText size={18} lineHeight={24} weight="semibold" style={styles.leafTitle}>
              {plant.leaf.title}
            </AppText>
            <AppText size={12} lineHeight={16} color={colors.muted} style={styles.leafDetail}>
              {plant.leaf.detail}. Confianza: {plant.leaf.confidence} %.
            </AppText>
          </Card>

          <Card style={styles.block}>
            <View style={styles.blockHeader}>
              <Icons.drop22 width={22} height={22} />
              <AppText size={14} lineHeight={19} weight="semibold" color={colors.forest} style={styles.flex}>
                {watered ? '¡Riego registrado!' : rec.title}
              </AppText>
            </View>
            <AppText size={13} lineHeight={18} color={colors.muted} style={styles.recBody}>
              {watered
                ? 'La humedad del suelo ya está subiendo. Revisa de nuevo en 30 minutos.'
                : rec.body}
            </AppText>
            {rec.action && !watered ? (
              <Button
                variant="compact"
                label={rec.actionLabel ?? ''}
                icon={rec.action === 'reconnect' ? Icons.reconnect : undefined}
                loading={module?.state === 'connecting'}
                style={styles.recAction}
                onPress={onAction}
              />
            ) : null}
          </Card>

          <Button
            label="Escanear hoja"
            height={50}
            style={styles.scan}
            onPress={() => router.push({ pathname: '/scan', params: { plantId: plant.id } })}
          />
        </View>
      </ScrollView>

      <View style={[styles.back, { top: insets.top + 16 }]}>
        <BackButton background={colors.white} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.cream },
  flex: { flex: 1 },
  hero: { overflow: 'hidden', backgroundColor: colors.forest },
  back: { position: 'absolute', left: gutter },
  body: { paddingHorizontal: gutter, paddingTop: 10 },
  subRow: { marginTop: 4, flexDirection: 'row', alignItems: 'center', gap: 16 },
  readings: { marginTop: 20, flexDirection: 'row', height: 91, alignItems: 'center' },
  reading: { flex: 1, paddingLeft: 18, paddingTop: 2 },
  readingValue: { marginTop: 6 },
  sensorDivider: { width: 1, height: 64, backgroundColor: colors.border },
  liveNote: { marginTop: 6, marginLeft: 4 },
  block: { marginTop: 12 },
  blockHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  leafPill: { minWidth: 99, height: 28, borderRadius: 14 },
  leafTitle: { marginTop: 12 },
  leafDetail: { marginTop: 10 },
  recBody: { marginTop: 13 },
  recAction: { marginTop: 14, alignSelf: 'flex-start' },
  scan: { marginTop: 22 },
});
