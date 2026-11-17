import { Pressable, StyleSheet, View } from 'react-native';

import { Icons } from '@/assets';
import type { GardenAlert } from '@/data/types';
import { formatAgo } from '@/lib/format';
import { colors } from '@/theme';
import { AppText } from './AppText';
import { Button } from './Button';
import { Card } from './Card';

const ICON = {
  conexion: Icons.wifiOffRed,
  riego: Icons.dropAmber,
  salud: Icons.leafAmber,
} as const;

/** Tarjeta del "Centro de alertas". */
export function AlertCard({
  alert,
  now,
  onResolve,
  onPress,
}: {
  alert: GardenAlert;
  now: number;
  onResolve: () => void;
  onPress: () => void;
}) {
  const Icon = ICON[alert.kind];
  const danger = alert.tone === 'danger';
  return (
    <Card style={styles.card}>
      <View style={[styles.level, { backgroundColor: danger ? colors.danger : colors.warn }]} />
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${alert.title}. ${alert.subtitle}. Ver planta`}
        onPress={onPress}
        style={({ pressed }) => [styles.header, pressed && styles.pressed]}
      >
        <View style={[styles.iconBox, { backgroundColor: danger ? colors.dangerBg : colors.warnBg }]}>
          <Icon width={18} height={18} />
        </View>
        <View style={styles.headerText}>
          <AppText size={16} lineHeight={22} weight="semibold">
            {alert.title}
          </AppText>
          <AppText size={11} lineHeight={15} color={colors.muted} style={styles.subtitle}>
            {alert.subtitle}
          </AppText>
        </View>
      </Pressable>
      <AppText size={13} lineHeight={18} color={colors.muted} style={styles.body}>
        {alert.body}
      </AppText>
      <View style={styles.footer}>
        <Button variant="outline" label="Marcar atendida" icon={Icons.check15} onPress={onResolve} style={styles.resolve} />
        <AppText size={10} lineHeight={14} color={colors.muted}>
          {formatAgo(alert.createdAt, now)}
        </AppText>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { minHeight: 170 },
  level: { position: 'absolute', left: 0, top: 22, bottom: 22, width: 3, borderRadius: 1.5 },
  header: { flexDirection: 'row', gap: 12 },
  pressed: { opacity: 0.7 },
  iconBox: { width: 32, height: 32, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  headerText: { flex: 1 },
  subtitle: { marginTop: 5 },
  body: { marginTop: 17 },
  footer: { marginTop: 13, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  resolve: { width: 158, paddingHorizontal: 0 },
});
