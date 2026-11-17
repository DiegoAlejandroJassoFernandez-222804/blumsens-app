import type { FC } from 'react';
import { StyleSheet, View } from 'react-native';
import type { SvgProps } from 'react-native-svg';

import { Icons } from '@/assets';
import { formatNumber, formatTime } from '@/lib/format';
import { plantStatus } from '@/lib/insights';
import type { PlantBundle } from '@/store/selectors';
import { colors } from '@/theme';
import { AppText } from './AppText';
import { Card } from './Card';
import { PlantPhoto } from './PlantPhoto';
import { StatusPill } from './StatusPill';

function Metric({ icon: Icon, value }: { icon: FC<SvgProps>; value: string }) {
  return (
    <View style={styles.metric}>
      <Icon width={14} height={14} />
      <AppText size={11} lineHeight={15} weight="medium">
        {value}
      </AppText>
    </View>
  );
}

/** Tarjeta de planta en "Mis plantas". */
export function PlantCard({ bundle, onPress }: { bundle: PlantBundle; onPress: () => void }) {
  const { plant, module, species } = bundle;
  const status = plantStatus(plant, module, species);
  const live = module?.state === 'online';
  const r = module?.reading;
  return (
    <Card onPress={onPress} style={styles.card} accessibilityLabel={`${plant.name}, ${status.label}`}>
      <View style={styles.top}>
        <PlantPhoto photo={plant.photo} style={styles.photo} />
        <View style={styles.info}>
          <AppText size={16} lineHeight={22} weight="semibold" numberOfLines={1}>
            {plant.name}
          </AppText>
          <AppText size={11} lineHeight={15} color={colors.muted} style={styles.species}>
            {species.scientific}
          </AppText>
          <StatusPill tone={status.tone} label={status.label} style={styles.pill} />
        </View>
      </View>
      <AppText size={10} lineHeight={14} color={colors.muted} style={styles.live}>
        {live ? 'En tiempo real · ahora' : `Última lectura · ${formatTime(module?.lastSeen ?? plant.createdAt)}`}
      </AppText>
      <View style={styles.metrics}>
        <Metric icon={Icons.drop14} value={r ? `${Math.round(r.moisture)} %` : '—'} />
        <Metric icon={Icons.temp14} value={r ? `${Math.round(r.temp)} °C` : '—'} />
        <Metric icon={Icons.sun14} value={r ? `${formatNumber(r.light)} lx` : '—'} />
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { minHeight: 164 },
  top: { flexDirection: 'row', gap: 14 },
  photo: { width: 82, height: 94, borderRadius: 16 },
  info: { flex: 1, paddingTop: 1 },
  species: { marginTop: 4 },
  pill: { marginTop: 13 },
  live: { marginTop: 8 },
  metrics: { flexDirection: 'row', marginTop: 4 },
  metric: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 6 },
});
