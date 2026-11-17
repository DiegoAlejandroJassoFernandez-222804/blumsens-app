import { useEffect } from 'react';
import { AppState } from 'react-native';

import { TICK_MS, useGarden } from '@/store/garden';

/**
 * "Gateway" IoT simulado: mientras la app está en primer plano, cada TICK_MS
 * llega una nueva lectura de cada módulo ESP32 en línea.
 */
export function useSimulator(enabled: boolean) {
  useEffect(() => {
    if (!enabled) return;
    let timer: ReturnType<typeof setInterval> | null = null;
    const start = () => {
      if (!timer) timer = setInterval(() => useGarden.getState().tick(), TICK_MS);
    };
    const stop = () => {
      if (timer) clearInterval(timer);
      timer = null;
    };
    start();
    const sub = AppState.addEventListener('change', (s) => (s === 'active' ? start() : stop()));
    return () => {
      stop();
      sub.remove();
    };
  }, [enabled]);
}
