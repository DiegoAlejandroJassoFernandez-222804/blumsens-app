import { router } from 'expo-router';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Icons } from '@/assets';
import { colors, gutter } from '@/theme';
import { AppText } from './AppText';

/** Botón cuadrado de 40 px con flecha (Volver). */
export function BackButton({
  onPress,
  background = colors.surface,
  variant = 'dark',
}: {
  onPress?: () => void;
  background?: string;
  variant?: 'dark' | 'light';
}) {
  const Icon = variant === 'light' ? Icons.backWhite : Icons.back;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Volver"
      hitSlop={8}
      onPress={onPress ?? (() => (router.canGoBack() ? router.back() : router.replace('/')))}
      style={({ pressed }) => [styles.back, { backgroundColor: background }, pressed && { opacity: 0.7 }]}
    >
      <Icon width={variant === 'light' ? 31 : 22} height={variant === 'light' ? 31 : 22} />
    </Pressable>
  );
}

/** Encabezado de pantallas secundarias: [←] Título + subtítulo. */
export function ScreenHeader({ title, subtitle, right }: { title: string; subtitle?: string; right?: ReactNode }) {
  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        <BackButton />
        <AppText size={22} lineHeight={30} weight="semibold" style={styles.title} numberOfLines={1}>
          {title}
        </AppText>
      </View>
      {subtitle || right ? (
        <View style={styles.subtitleRow}>
          <AppText size={13} lineHeight={18} color={colors.muted} style={styles.title}>
            {subtitle}
          </AppText>
          {right}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingHorizontal: gutter, paddingTop: 12 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  title: { flex: 1 },
  subtitleRow: { marginTop: 14, flexDirection: 'row', alignItems: 'center', gap: 12, paddingRight: 3 },
  back: { width: 40, height: 40, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
});
