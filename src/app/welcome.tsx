import { Image } from 'expo-image';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import type { FC } from 'react';
import { Pressable, StyleSheet, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { SvgProps } from 'react-native-svg';

import { Graphics, Icons, Images } from '@/assets';
import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { colors, designWidth, gutter } from '@/theme';

/** Línea decorativa rotada, posicionada con las coordenadas del frame de Figma. */
function Deco({
  Svg,
  box,
  svg,
  rotate,
  s,
}: {
  Svg: FC<SvgProps>;
  box: { left: number; top: number; width: number; height: number };
  svg: { width: number; height: number };
  rotate: number;
  s: number;
}) {
  return (
    <View
      pointerEvents="none"
      style={[
        styles.deco,
        { left: box.left * s, top: box.top * s, width: box.width * s, height: box.height * s },
      ]}
    >
      <View style={{ transform: [{ rotate: `${rotate}deg` }] }}>
        <Svg width={svg.width * s} height={svg.height * s} />
      </View>
    </View>
  );
}

/** 01 · Bienvenida */
export default function Welcome() {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const s = width / designWidth;
  const sy = height / 917;

  return (
    <View style={styles.root}>
      <StatusBar style="light" />

      {/* Fondo decorativo (capas en el mismo orden que en Figma) */}
      <Deco
        Svg={Graphics.welcomeLine3}
        s={s}
        rotate={-56.12}
        box={{ left: -57.92, top: -164.27, width: 490.919, height: 511.565 }}
        svg={{ width: 404.256, height: 343.357 }}
      />
      <Deco
        Svg={Graphics.welcomeLine4}
        s={s}
        rotate={-2.69}
        box={{ left: -58, top: 192, width: 528.896, height: 347.122 }}
        svg={{ width: 518.38, height: 343.353 }}
      />
      <Deco
        Svg={Graphics.welcomeLine5}
        s={s}
        rotate={-66.75}
        box={{ left: -81, top: 395, width: 500.102, height: 600.171 }}
        svg={{ width: 518.38, height: 343.353 }}
      />
      <Image
        source={Images.welcomeBg}
        contentFit="cover"
        pointerEvents="none"
        style={{ position: 'absolute', left: -299 * s, top: -81 * s, width: 1280 * s, height: 1207 * s }}
      />

      {/* Marca */}
      <View style={[styles.brand, { marginTop: 122 * sy }]}>
        <View style={styles.logoBox}>
          <View style={{ transform: [{ rotate: '-40.16deg' }] }}>
            <Graphics.logoLeaf width={79.7831} height={132.535} />
          </View>
        </View>
        <AppText size={64} lineHeight={76} weight="semibold" color={colors.cream} style={styles.title}>
          BlümSens
        </AppText>
        <AppText size={24} lineHeight={46} weight="semibold" color={colors.cream} align="center" style={styles.tagline}>
          Más cerca de tus plantas,{'\n'}cada día.
        </AppText>
      </View>

      {/* Acciones */}
      <View style={[styles.actions, { paddingBottom: Math.max(insets.bottom, 16) + 56 * sy }]}>
        <Button label="Comenzar" trailingIcon={Icons.arrow} onPress={() => router.push('/login?mode=signup')} />
        <Pressable
          accessibilityRole="link"
          onPress={() => router.push('/login')}
          hitSlop={10}
          style={styles.loginLink}
        >
          <AppText size={16} lineHeight={18} weight="medium" color={colors.cream} align="center">
            ¿Ya tienes una cuenta?{'  '}
            <AppText size={16} lineHeight={18} weight="semibold" color={colors.cream} style={styles.underline}>
              Inicia sesión
            </AppText>
          </AppText>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.forest, overflow: 'hidden' },
  deco: { position: 'absolute', alignItems: 'center', justifyContent: 'center' },
  brand: { alignItems: 'center' },
  logoBox: { width: 145.361, height: 151.717, alignItems: 'center', justifyContent: 'center' },
  title: { marginTop: -12 },
  tagline: { marginTop: 4, width: 337 },
  actions: { marginTop: 'auto', paddingHorizontal: gutter },
  loginLink: { marginTop: 22, alignSelf: 'center' },
  underline: { textDecorationLine: 'underline' },
});
