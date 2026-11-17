import { Redirect } from 'expo-router';

import { useGarden } from '@/store/garden';

/** Punto de entrada: con sesión → Mis plantas; sin sesión → Bienvenida. */
export default function Index() {
  const signedIn = useGarden((s) => !!s.session);
  return <Redirect href={signedIn ? '/plants' : '/welcome'} />;
}
