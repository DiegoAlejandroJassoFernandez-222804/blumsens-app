import { CameraView, useCameraPermissions, type CameraType } from 'expo-camera';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { router, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef, useState } from 'react';
import { Platform, Pressable, StyleSheet, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Graphics, Icons, Images } from '@/assets';
import { AnalyzingOverlay } from '@/components/AnalyzingOverlay';
import { AppText } from '@/components/AppText';
import { Button, tapFeedback } from '@/components/Button';
import { photoSource } from '@/components/PlantPhoto';
import { BackButton } from '@/components/ScreenHeader';
import { StatusPill } from '@/components/StatusPill';
import type { LeafHealth, PhotoSource } from '@/data/types';
import { useGarden } from '@/store/garden';
import { colors, designWidth, gutter } from '@/theme';

const SAMPLE: PhotoSource = { kind: 'asset', key: 'leafHero' };

/**
 * 04 · Escaneo foliar
 *  - Sin parámetros: alta de una planta nueva (→ Configurar planta).
 *  - ?plantId=…: nuevo análisis de la hoja de una planta existente.
 */
export default function Scan() {
  const { plantId } = useLocalSearchParams<{ plantId?: string }>();
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const s = width / designWidth;

  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);
  const [facing, setFacing] = useState<CameraType>('back');
  const [torch, setTorch] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [captured, setCaptured] = useState<PhotoSource | null>(null);
  const [result, setResult] = useState<LeafHealth | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const plantName = useGarden((st) => st.plants.find((p) => p.id === plantId)?.name);
  const applyLeafScan = useGarden((st) => st.applyLeafScan);
  const startDraft = useGarden((st) => st.startDraft);

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  /** Simula el modelo de visión: espera breve y devuelve un diagnóstico predefinido. */
  const analyze = (photo: PhotoSource) => {
    setCaptured(photo);
    setTorch(false);
    timer.current = setTimeout(() => {
      if (plantId) {
        setResult(applyLeafScan(plantId, photo));
      } else {
        startDraft(photo);
        router.replace('/setup');
      }
    }, 1900);
  };

  const takePicture = async () => {
    tapFeedback();
    if (!cameraRef.current || !cameraReady) return analyze(SAMPLE);
    try {
      const pic = await cameraRef.current.takePictureAsync({ quality: 0.6 });
      analyze(pic?.uri ? { kind: 'uri', uri: pic.uri } : SAMPLE);
    } catch {
      analyze(SAMPLE);
    }
  };

  const pickFromGallery = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.6 });
    if (!res.canceled && res.assets[0]?.uri) analyze({ kind: 'uri', uri: res.assets[0].uri });
  };

  const granted = !!permission?.granted;
  const analyzing = !!captured && !result;

  return (
    <View style={styles.root}>
      <StatusBar style="light" />

      {/* Vista de cámara (o la foto ya capturada) */}
      {captured ? (
        <Image source={photoSource(captured)} style={StyleSheet.absoluteFill} contentFit="cover" />
      ) : granted ? (
        <CameraView
          ref={cameraRef}
          style={StyleSheet.absoluteFill}
          facing={facing}
          enableTorch={torch}
          onCameraReady={() => setCameraReady(true)}
        />
      ) : (
        <Image source={Images.leafHero} style={StyleSheet.absoluteFill} contentFit="cover" blurRadius={18} />
      )}

      {/* Cuadrícula de encuadre */}
      <View pointerEvents="none" style={[StyleSheet.absoluteFill, { left: 8 * s }]}>
        <Graphics.scanGrid width={width} height={height} />
      </View>

      {/* Barra superior */}
      <View style={[styles.topBar, { top: insets.top + 12 }]}>
        <BackButton variant="light" background="transparent" />
        <View style={styles.titleBox}>
          <AppText size={24} lineHeight={30} color={colors.white} align="center">
            BlümSens Scan
          </AppText>
          <AppText size={12} lineHeight={16} color={colors.white} align="center" style={styles.hint}>
            {plantName ? `Revisión de ${plantName}` : 'Mantén la hoja dentro del marco'}
          </AppText>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={torch ? 'Apagar linterna' : 'Encender linterna'}
          disabled={!granted || facing === 'front'}
          onPress={() => setTorch((t) => !t)}
          style={[styles.flash, !torch && styles.flashOff]}
          hitSlop={8}
        >
          <Icons.flash width={36} height={43} />
        </Pressable>
      </View>

      {/* Permiso de cámara */}
      {permission && !granted && !captured ? (
        <View style={styles.permission}>
          <AppText size={16} lineHeight={22} weight="semibold" align="center">
            Necesitamos tu cámara
          </AppText>
          <AppText size={13} lineHeight={18} color={colors.muted} align="center">
            Para analizar la hoja toma una foto. También puedes elegir una de tu galería o usar la foto de ejemplo.
          </AppText>
          {permission.canAskAgain ? (
            <Button variant="compact" label="Permitir cámara" onPress={requestPermission} style={styles.fullWidth} />
          ) : null}
          <Button variant="outline" height={40} label="Usar foto de ejemplo" onPress={() => analyze(SAMPLE)} style={styles.fullWidth} />
        </View>
      ) : null}

      {/* Controles inferiores */}
      {!captured ? (
        <View style={[styles.band, { height: 140 + insets.bottom, paddingBottom: insets.bottom }]}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Elegir foto de la galería"
            onPress={pickFromGallery}
            style={styles.side}
            hitSlop={10}
          >
            <Image source={Images.scanGallery} style={styles.gallery} contentFit="contain" />
          </Pressable>
          <View style={styles.side}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Capturar fotografía"
              onPress={takePicture}
              style={({ pressed }) => [styles.shutter, pressed && { transform: [{ scale: 0.94 }] }]}
            >
              <Graphics.scanShutterRing width={72} height={72} style={StyleSheet.absoluteFill} />
              <View style={styles.shutterInner} />
              <Icons.camera width={42} height={43} />
            </Pressable>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Cambiar de cámara"
            disabled={!granted || Platform.OS === 'web'}
            onPress={() => {
              setTorch(false);
              setFacing((f) => (f === 'back' ? 'front' : 'back'));
            }}
            style={styles.side}
            hitSlop={10}
          >
            <Icons.rotate width={32} height={32} />
          </Pressable>
        </View>
      ) : null}

      {analyzing ? (
        <AnalyzingOverlay
          title="Analizando hoja…"
          detail={plantId ? 'Buscando manchas, color y turgencia' : 'Identificando la especie y su estado'}
        />
      ) : null}

      {/* Resultado del análisis de una planta existente */}
      {result ? (
        <View style={[styles.sheet, { paddingBottom: insets.bottom + 20 }]}>
          <StatusPill tone={result.tone} label={result.label} />
          <AppText size={22} lineHeight={30} weight="semibold" style={styles.sheetTitle}>
            {result.title}
          </AppText>
          <AppText size={13} lineHeight={18} color={colors.muted}>
            {result.detail}. Puntuación {result.score}/100 · Confianza {result.confidence} %.
          </AppText>
          <Button label="Ver mi planta" onPress={() => router.back()} style={styles.sheetButton} />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#000' },
  topBar: {
    position: 'absolute',
    left: gutter,
    right: 18,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  titleBox: { flex: 1, paddingTop: 4 },
  hint: { opacity: 0.85, marginTop: 2 },
  flash: { width: 36, height: 43 },
  flashOff: { opacity: 0.7 },
  permission: {
    position: 'absolute',
    left: gutter,
    right: gutter,
    top: '32%',
    padding: 20,
    gap: 10,
    borderRadius: 24,
    backgroundColor: colors.white,
    alignItems: 'center',
  },
  fullWidth: { alignSelf: 'stretch' },
  band: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.2)',
    flexDirection: 'row',
    alignItems: 'center',
  },
  side: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  gallery: { width: 32, height: 32 },
  shutter: { width: 72, height: 72, alignItems: 'center', justifyContent: 'center' },
  shutterInner: {
    position: 'absolute',
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.14)',
  },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: gutter,
    paddingTop: 24,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    backgroundColor: colors.white,
  },
  sheetTitle: { marginTop: 12, marginBottom: 6 },
  sheetButton: { marginTop: 20 },
});
