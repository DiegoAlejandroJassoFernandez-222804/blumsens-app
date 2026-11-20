import { CameraView, useCameraPermissions, type BarcodeScanningResult } from 'expo-camera';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useRef, useState, type FC } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { SvgProps } from 'react-native-svg';
import { useShallow } from 'zustand/react/shallow';

import { Graphics, Icons } from '@/assets';
import { AppText } from '@/components/AppText';
import { Button, tapFeedback } from '@/components/Button';
import { ScreenHeader } from '@/components/ScreenHeader';
import { TextField } from '@/components/TextField';
import { getSpecies } from '@/data/species';
import { nextModuleId, useGarden } from '@/store/garden';
import { colors, gutter, radius } from '@/theme';

/**
 * Número de serie del módulo. El QR impreso en el módulo contiene solo este texto
 * (p. ej. "BLM-ESP32-004"). Se aceptan letras, números, guion, guion bajo y punto.
 */
const SERIAL_RE = /^[A-Z0-9][A-Z0-9._-]{2,39}$/;

function normalizeSerial(text: string): string {
  return text.trim().toUpperCase();
}

function CheckRow({ icon: Icon, label, done, busy }: { icon: FC<SvgProps>; label: string; done: boolean; busy: boolean }) {
  return (
    <View style={styles.checkRow}>
      <Icon width={18} height={18} />
      <AppText size={13} lineHeight={18} style={styles.flex} color={done || busy ? colors.forestInk : colors.muted}>
        {label}
      </AppText>
      {done ? (
        <Icons.check18 width={18} height={18} />
      ) : busy ? (
        <ActivityIndicator size="small" color={colors.forest} />
      ) : (
        <View style={styles.pending} />
      )}
    </View>
  );
}

/**
 * Verificación simulada del módulo: encontrado → humedad → temperatura y luz.
 * Se monta con `key={id}`, así cada ID nuevo reinicia la secuencia.
 */
function Verification({ status, onVerified }: { status: 'idle' | 'taken' | 'checking'; onVerified: () => void }) {
  const [step, setStep] = useState(0);
  useEffect(() => {
    if (status !== 'checking') return;
    const timers = [600, 1300, 2000].map((ms, i) =>
      setTimeout(() => {
        setStep(i + 1);
        if (i === 2) onVerified();
      }, ms),
    );
    return () => timers.forEach(clearTimeout);
  }, [status, onVerified]);

  const checking = status === 'checking';
  const title =
    status === 'idle'
      ? 'Esperando un módulo'
      : status === 'taken'
        ? 'Ese módulo ya está en uso'
        : step < 1
          ? 'Buscando módulo…'
          : step < 3
            ? 'Verificando sensores…'
            : 'Todo listo para conectar';

  return (
    <View style={styles.verify}>
      <AppText size={16} lineHeight={22} weight="semibold">
        {title}
      </AppText>
      <CheckRow icon={Icons.drop18} label="Humedad del suelo" done={checking && step >= 2} busy={checking && step < 2} />
      <CheckRow
        icon={Icons.sun18}
        label="Temperatura e iluminación"
        done={checking && step >= 3}
        busy={checking && step < 3}
      />
    </View>
  );
}

/** 07 · Vincular módulo */
export default function LinkModule() {
  const insets = useSafeAreaInsets();
  const draft = useGarden((s) => s.draft);
  const modules = useGarden(useShallow((s) => s.modules));
  const finalizeDraft = useGarden((s) => s.finalizeDraft);
  const [permission, requestPermission] = useCameraPermissions();
  const [cameraPaused, setCameraPaused] = useState(false);
  const [scannedSerial, setScannedSerial] = useState<string | null>(null);
  const [moduleId, setModuleId] = useState('');
  const [verifiedId, setVerifiedId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const scanned = useRef(false);

  const normalized = normalizeSerial(moduleId);
  const valid = SERIAL_RE.test(normalized);
  // La cámara arranca sola en cuanto hay permiso; se pausa al leer un código.
  const canScan = Platform.OS !== 'web' && !!permission?.granted;
  const cameraOn = canScan && !cameraPaused && !scannedSerial;
  const taken = valid && modules.some((m) => m.id === normalized);
  const ready = valid && !taken;
  const verified = ready && verifiedId === normalized;
  const onVerified = useCallback(() => setVerifiedId(normalized), [normalized]);

  if (!draft && !saving) {
    return (
      <View style={[styles.empty, { paddingTop: insets.top + 40 }]}>
        <AppText size={16} lineHeight={22} weight="semibold" align="center">
          Primero escanea la hoja de tu planta.
        </AppText>
        <Button label="Escanear una hoja" onPress={() => router.replace('/scan')} />
      </View>
    );
  }

  const species = getSpecies(draft?.speciesId ?? '');
  const suggested = nextModuleId(modules);

  /** El QR del módulo contiene únicamente su número de serie en texto plano. */
  const onBarcode = ({ data }: BarcodeScanningResult) => {
    if (scanned.current) return;
    scanned.current = true;
    const serial = normalizeSerial(data);
    if (SERIAL_RE.test(serial)) {
      tapFeedback();
      setScannedSerial(serial);
      setModuleId(serial);
    } else {
      setCameraPaused(true);
      Alert.alert(
        'QR no reconocido',
        'Ese código no contiene un número de serie de módulo válido. Prueba con el QR impreso en tu módulo.',
        [{ text: 'Reintentar', onPress: scanAgain }],
      );
    }
  };

  function scanAgain() {
    scanned.current = false;
    setScannedSerial(null);
    setCameraPaused(false);
  }

  const enableCamera = async () => {
    const res = permission?.granted ? permission : await requestPermission();
    if (res?.granted) scanAgain();
    else if (res && !res.canAskAgain) {
      Alert.alert('Cámara bloqueada', 'Activa el permiso de cámara para Expo Go en los ajustes del teléfono.');
    }
  };

  const caption = cameraOn
    ? 'Apunta al QR de tu dispositivo'
    : scannedSerial
      ? `Código leído: ${scannedSerial}`
      : canScan
        ? 'Cámara en pausa'
        : Platform.OS === 'web'
          ? 'Escaneo disponible en la app móvil'
          : 'Activa la cámara para escanear el QR';

  const finish = () => {
    setSaving(true);
    const plantId = finalizeDraft(normalized);
    if (!plantId) return setSaving(false);
    router.dismissAll();
    router.push({ pathname: '/plant/[id]', params: { id: plantId } });
  };

  return (
    <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <StatusBar style="dark" />
      <ScrollView
        contentContainerStyle={{ paddingTop: insets.top, paddingBottom: insets.bottom + 24 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <ScreenHeader title="Vincular módulo" subtitle={`Conecta la tecnología con tu ${species.common}.`} />

        <View style={styles.body}>
          {/* Lector de código QR */}
          <View style={styles.scanner}>
            {cameraOn ? (
              <CameraView
                style={StyleSheet.absoluteFill}
                facing="back"
                barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
                onBarcodeScanned={onBarcode}
              />
            ) : (
              <View style={styles.qr}>
                <Graphics.qrModule width={203} height={203} style={scannedSerial ? undefined : styles.qrIdle} />
              </View>
            )}
            <View pointerEvents="none" style={styles.frame}>
              <Graphics.qrFrame width={213} height={204} />
            </View>
            {scannedSerial ? (
              <View pointerEvents="none" style={styles.scannedBadge}>
                <Icons.check22 width={22} height={22} />
              </View>
            ) : null}
            <AppText
              size={12}
              lineHeight={16}
              weight="medium"
              color={cameraOn ? colors.white : colors.forest}
              align="center"
              style={styles.caption}
              numberOfLines={1}
            >
              {caption}
            </AppText>

            {/* Acciones del lector */}
            {!canScan && Platform.OS !== 'web' ? (
              <Button variant="compact" label="Activar cámara" onPress={enableCamera} style={styles.scanAction} />
            ) : null}
            {canScan && cameraPaused && !scannedSerial ? (
              <Button variant="compact" label="Reanudar cámara" onPress={scanAgain} style={styles.scanAction} />
            ) : null}
            {cameraOn ? (
              <Pressable onPress={() => setCameraPaused(true)} style={styles.cameraToggle}>
                <AppText size={11} lineHeight={15} weight="semibold" color={colors.forest}>
                  Pausar cámara
                </AppText>
              </Pressable>
            ) : canScan && scannedSerial ? (
              <Pressable onPress={scanAgain} style={styles.cameraToggle}>
                <AppText size={11} lineHeight={15} weight="semibold" color={colors.forest}>
                  Escanear otro
                </AppText>
              </Pressable>
            ) : (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Simular escaneo del código QR"
                onPress={() => {
                  tapFeedback();
                  setModuleId(suggested);
                }}
                style={styles.cameraToggle}
              >
                <AppText size={11} lineHeight={15} weight="semibold" color={colors.forest}>
                  Simular escaneo
                </AppText>
              </Pressable>
            )}
          </View>

          <AppText size={13} lineHeight={18} weight="medium" style={styles.label}>
            O introduce el ID del módulo
          </AppText>
          <TextField
            icon={Icons.chip}
            value={moduleId}
            onChangeText={setModuleId}
            placeholder={suggested}
            autoCapitalize="characters"
            autoCorrect={false}
            right={ready ? <Icons.check22 width={22} height={22} /> : null}
          />
          {taken ? (
            <AppText size={11} lineHeight={15} color={colors.danger} style={styles.error}>
              {normalized} ya está vinculado a otra planta. Prueba con {suggested}.
            </AppText>
          ) : null}

          <Verification
            key={normalized}
            status={!valid ? 'idle' : taken ? 'taken' : 'checking'}
            onVerified={onVerified}
          />

          <AppText size={11} lineHeight={15} color={colors.muted} align="center" style={styles.note}>
            Mantén el módulo encendido y cerca de tu Wi-Fi.
          </AppText>
          <Button label="Finalizar vinculación" disabled={!verified} loading={saving} onPress={finish} />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.white },
  flex: { flex: 1 },
  body: { paddingHorizontal: gutter, paddingTop: 21 },
  empty: { flex: 1, backgroundColor: colors.white, paddingHorizontal: gutter, gap: 20 },
  scanner: { height: 292, borderRadius: radius.card, backgroundColor: colors.scannerGrey, overflow: 'hidden' },
  qr: { position: 'absolute', top: 35.5, alignSelf: 'center' },
  qrIdle: { opacity: 0.25 },
  scannedBadge: {
    position: 'absolute',
    top: 122,
    alignSelf: 'center',
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanAction: { position: 'absolute', top: 117, alignSelf: 'center', paddingHorizontal: 18 },
  frame: { position: 'absolute', top: 36, alignSelf: 'center' },
  caption: { position: 'absolute', left: 0, right: 0, top: 263 },
  cameraToggle: {
    position: 'absolute',
    top: 12,
    right: 12,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    backgroundColor: colors.white,
  },
  label: { marginTop: 26, marginBottom: 10 },
  error: { marginTop: 6, marginLeft: 4 },
  verify: {
    marginTop: 24,
    padding: 16,
    paddingBottom: 22,
    gap: 16,
    borderRadius: radius.card,
    backgroundColor: colors.surface,
  },
  checkRow: { flexDirection: 'row', alignItems: 'center', gap: 11, paddingRight: 12 },
  pending: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.border, marginRight: 5 },
  note: { marginTop: 17, marginBottom: 24 },
});
