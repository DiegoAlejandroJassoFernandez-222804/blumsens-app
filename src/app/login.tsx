import { Image } from 'expo-image';
import { useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icons, Images } from '@/assets';
import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { TextField } from '@/components/TextField';
import { useGarden } from '@/store/garden';
import { colors, designWidth, gutter } from '@/theme';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** 02 · Iniciar sesión (y alta de cuenta simulada con ?mode=signup). */
export default function Login() {
  const params = useLocalSearchParams<{ mode?: string }>();
  const [signup, setSignup] = useState(params.mode === 'signup');
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const s = width / designWidth;
  const sy = height / 917;
  const login = useGarden((st) => st.login);

  // Credenciales de demostración precargadas para agilizar la presentación.
  const [email, setEmail] = useState('hola@blumsens.mx');
  const [password, setPassword] = useState('planta123');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = () => {
    if (!EMAIL_RE.test(email.trim())) return setError('Escribe un correo válido.');
    if (password.length < 6) return setError('La contraseña debe tener al menos 6 caracteres.');
    setError(null);
    setLoading(true);
    // Autenticación simulada: no hay servidor, solo una pequeña espera.
    setTimeout(() => login(email.trim().toLowerCase()), 700);
  };

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <Image
        source={Images.loginBg}
        contentFit="fill"
        pointerEvents="none"
        style={{ position: 'absolute', left: -151.956 * s, top: 90.42 * s, width: 674.54 * s, height: 759.237 * s }}
      />
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={[styles.content, { paddingTop: Math.max(insets.top, 20) + 120 * sy, paddingBottom: insets.bottom + 40 }]}
          keyboardShouldPersistTaps="handled"
        >
          <AppText size={64} lineHeight={76} weight="semibold" color={colors.cream} align="center">
            BlümSens
          </AppText>
          <AppText size={29} lineHeight={39} weight="semibold" color={colors.butter} align="center" style={styles.greeting}>
            {signup ? 'Crea tu jardín.' : 'Qué bueno verte.'}
          </AppText>

          <AppText size={13} lineHeight={18} weight="medium" color={colors.butter} style={styles.label}>
            Correo electrónico
          </AppText>
          <TextField
            icon={Icons.mailMuted}
            value={email}
            onChangeText={setEmail}
            placeholder="hola@ejemplo.com"
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            textContentType="emailAddress"
            returnKeyType="next"
          />

          <AppText size={13} lineHeight={18} weight="medium" color={colors.butter} style={styles.label}>
            Contraseña
          </AppText>
          <TextField
            icon={Icons.lockMuted}
            value={password}
            onChangeText={setPassword}
            placeholder="••••••••••"
            secureTextEntry={!showPassword}
            autoCapitalize="none"
            textContentType="password"
            returnKeyType="go"
            onSubmitEditing={submit}
            right={
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                hitSlop={10}
                onPress={() => setShowPassword((v) => !v)}
                style={!showPassword && styles.eyeOff}
              >
                <Icons.eyeMuted width={22} height={22} />
              </Pressable>
            }
          />

          {!signup ? (
            <Pressable
              hitSlop={8}
              style={styles.forgot}
              onPress={() =>
                Alert.alert('Recuperar contraseña', `Te enviamos un enlace de recuperación a ${email} (simulado).`)
              }
            >
              <AppText size={12} lineHeight={16} weight="medium" color={colors.butter}>
                ¿Olvidaste tu contraseña?
              </AppText>
            </Pressable>
          ) : (
            <View style={styles.forgot} />
          )}

          {error ? (
            <View style={styles.error}>
              <AppText size={12} lineHeight={16} weight="medium" color={colors.danger}>
                {error}
              </AppText>
            </View>
          ) : null}

          <Button label={signup ? 'Crear cuenta' : 'Entrar'} onPress={submit} loading={loading} style={styles.submit} />

          <Pressable hitSlop={8} style={styles.switch} onPress={() => setSignup((v) => !v)}>
            <AppText size={13} lineHeight={18} weight="medium" color={colors.butter} align="center">
              {signup ? '¿Ya tienes una cuenta?  ' : '¿Es tu primera vez?  '}
              <AppText size={13} lineHeight={18} weight="semibold" color={colors.butter} style={styles.underline}>
                {signup ? 'Inicia sesión' : 'Crea una cuenta'}
              </AppText>
            </AppText>
          </Pressable>

          <View style={styles.secure}>
            <Icons.lockSmall width={14} height={14} />
            <AppText size={11} lineHeight={15} color={colors.butter}>
              Tu jardín y tus datos, protegidos.
            </AppText>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.forest, overflow: 'hidden' },
  flex: { flex: 1 },
  content: { paddingHorizontal: gutter + 3 },
  greeting: { marginTop: 2 },
  label: { marginTop: 24, marginBottom: 8 },
  eyeOff: { opacity: 0.6 },
  forgot: { alignSelf: 'flex-end', marginTop: 19, marginRight: 26, minHeight: 16 },
  error: {
    marginTop: 16,
    alignSelf: 'stretch',
    backgroundColor: colors.dangerBg,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  submit: { marginTop: 34 },
  switch: { marginTop: 37, alignSelf: 'center' },
  underline: { textDecorationLine: 'underline' },
  secure: { marginTop: 48, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
});
