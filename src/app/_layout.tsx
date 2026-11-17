// Importamos solo los 3 pesos que usa el diseño (evita empaquetar las 18 variantes de Inter).
import { Inter_400Regular } from '@expo-google-fonts/inter/400Regular';
import { Inter_500Medium } from '@expo-google-fonts/inter/500Medium';
import { Inter_600SemiBold } from '@expo-google-fonts/inter/600SemiBold';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { useSimulator } from '@/hooks/useSimulator';
import { useGarden } from '@/store/garden';
import { useHydrated } from '@/store/selectors';
import { colors } from '@/theme';

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({ Inter_400Regular, Inter_500Medium, Inter_600SemiBold });
  const hydrated = useHydrated();
  const signedIn = useGarden((s) => !!s.session);
  const ready = (fontsLoaded || !!fontError) && hydrated;

  useSimulator(signedIn);

  useEffect(() => {
    if (ready) SplashScreen.hideAsync().catch(() => {});
  }, [ready]);

  if (!ready) return null;

  return (
    <SafeAreaProvider>
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.white } }}>
        <Stack.Screen name="index" />
        <Stack.Protected guard={!signedIn}>
          <Stack.Screen name="welcome" options={{ contentStyle: { backgroundColor: colors.forest } }} />
          <Stack.Screen name="login" options={{ contentStyle: { backgroundColor: colors.forest } }} />
        </Stack.Protected>

        {/* Sin sesión, cualquier ruta privada lleva a la bienvenida (no al login). */}
        <Stack.Protected guard={signedIn} redirectTo="/welcome">
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="plant/[id]/index" options={{ contentStyle: { backgroundColor: colors.cream } }} />
          <Stack.Screen name="plant/[id]/monitor" />
          <Stack.Screen name="plant/[id]/history" />
          <Stack.Screen name="scan" options={{ animation: 'fade', contentStyle: { backgroundColor: '#000' } }} />
          <Stack.Screen name="setup" />
          <Stack.Screen name="link" />
        </Stack.Protected>
      </Stack>
    </SafeAreaProvider>
  );
}
