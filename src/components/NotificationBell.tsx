import { router } from 'expo-router';
import { Pressable, StyleSheet, Text } from 'react-native';

import { Icons } from '@/assets';
import { useOpenAlertCount } from '@/store/selectors';
import { colors, fonts } from '@/theme';

/** Campana con contador de alertas pendientes (Historial). Abre el Centro de alertas. */
export function NotificationBell() {
  const count = useOpenAlertCount();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={count ? `Alertas, ${count} pendientes` : 'Alertas'}
      hitSlop={12}
      onPress={() => router.push('/alerts')}
      style={({ pressed }) => [styles.root, pressed && { opacity: 0.6 }]}
    >
      <Icons.bellNotification width={19} height={19} />
      {count ? (
        <>
          <Icons.badgeDot width={7} height={7} style={styles.dot} />
          <Text style={styles.count}>{count > 9 ? '9+' : count}</Text>
        </>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { width: 19, height: 19 },
  dot: { position: 'absolute', left: 11, top: 0 },
  count: {
    position: 'absolute',
    left: 11,
    top: 0,
    width: 7,
    textAlign: 'center',
    fontFamily: fonts.regular,
    fontSize: 6,
    lineHeight: 7,
    color: colors.danger,
    includeFontPadding: false,
  },
});
