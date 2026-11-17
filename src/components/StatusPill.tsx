import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { Dots } from '@/assets';
import { colors, toneColors, type StatusTone } from '@/theme';
import { AppText } from './AppText';

interface StatusPillProps {
  tone: StatusTone;
  label: string;
  /** Fondo opcional (en "Foto capturada" es blanco). */
  background?: string;
  style?: StyleProp<ViewStyle>;
}

/** Pastilla de estado: "● Óptima", "● Regar hoy", "● Sin señal". */
export function StatusPill({ tone, label, background, style }: StatusPillProps) {
  const Dot = Dots[tone];
  const c = toneColors[tone];
  return (
    <View style={[styles.pill, { backgroundColor: background ?? c.bg }, style]}>
      <Dot width={6} height={6} />
      <AppText size={11} lineHeight={15} weight="medium" color={tone === 'ok' && background ? colors.forest : c.fg}>
        {label}
      </AppText>
    </View>
  );
}

/** Indicador sin fondo (punto de 7 px + texto), usado en "Monitoreo". */
export function StatusInline({ tone, label }: { tone: StatusTone; label: string }) {
  const Dot = tone === 'ok' ? Dots.ok7 : tone === 'warn' ? Dots.warn7 : Dots.danger7;
  const fg = tone === 'ok' ? colors.forest : tone === 'warn' ? colors.warnBright : colors.danger;
  return (
    <View style={styles.inline}>
      <Dot width={7} height={7} />
      <AppText size={12} lineHeight={16} weight="medium" color={fg}>
        {label}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    height: 26,
    minWidth: 107,
    paddingLeft: 10,
    paddingRight: 14,
    borderRadius: 13,
  },
  inline: { flexDirection: 'row', alignItems: 'center', gap: 7 },
});
