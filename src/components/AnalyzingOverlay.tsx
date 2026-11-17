import { useEffect, useState } from 'react';
import { ActivityIndicator, Animated, Easing, StyleSheet, useWindowDimensions, View } from 'react-native';

import { colors } from '@/theme';
import { AppText } from './AppText';

/** Capa "Analizando hoja…" con una línea de escaneo que recorre la pantalla. */
export function AnalyzingOverlay({ title, detail }: { title: string; detail: string }) {
  const { height } = useWindowDimensions();
  const [progress] = useState(() => new Animated.Value(0));

  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(progress, { toValue: 1, duration: 1400, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
    );
    loop.start();
    return () => loop.stop();
  }, [progress]);

  const translateY = progress.interpolate({ inputRange: [0, 1], outputRange: [height * 0.12, height * 0.78] });

  return (
    <View style={styles.scrim} accessibilityLiveRegion="polite">
      <Animated.View style={[styles.scanLine, { transform: [{ translateY }] }]} />
      <View style={styles.box}>
        <ActivityIndicator color={colors.forest} />
        <AppText size={16} lineHeight={22} weight="semibold" align="center">
          {title}
        </AppText>
        <AppText size={12} lineHeight={16} color={colors.muted} align="center">
          {detail}
        </AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  scrim: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: 'rgba(35, 61, 42, 0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanLine: {
    position: 'absolute',
    top: 0,
    left: 24,
    right: 24,
    height: 2,
    borderRadius: 1,
    backgroundColor: colors.butter,
    shadowColor: colors.butter,
    shadowOpacity: 0.9,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 0 },
  },
  box: {
    width: 260,
    paddingVertical: 22,
    paddingHorizontal: 20,
    borderRadius: 24,
    backgroundColor: colors.white,
    alignItems: 'center',
    gap: 8,
  },
});
