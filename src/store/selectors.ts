import { useEffect, useState, useSyncExternalStore } from 'react';
import { useShallow } from 'zustand/react/shallow';

import { getSpecies } from '@/data/species';
import type { Plant, SensorModule, Species } from '@/data/types';
import { useGarden } from './garden';

export interface PlantBundle {
  plant: Plant;
  module: SensorModule | undefined;
  species: Species;
}

/** Planta + su módulo + su especie, listo para pintar. */
export function usePlantBundle(plantId: string | undefined): PlantBundle | undefined {
  const plant = useGarden((s) => s.plants.find((p) => p.id === plantId));
  const module = useGarden((s) => (plant ? s.modules.find((m) => m.id === plant.moduleId) : undefined));
  if (!plant) return undefined;
  return { plant, module, species: getSpecies(plant.speciesId) };
}

export function useOpenAlertCount(): number {
  return useGarden((s) => s.alerts.filter((a) => !a.resolvedAt).length);
}

export function useOpenAlerts() {
  return useGarden(useShallow((s) => s.alerts.filter((a) => !a.resolvedAt)));
}

/** true cuando AsyncStorage ya restauró el estado guardado. */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    (onChange) => useGarden.persist.onFinishHydration(onChange),
    () => useGarden.persist.hasHydrated(),
  );
}

/** Reloj que se refresca cada `ms` para textos relativos ("Hace 2 min"). */
export function useNow(ms = 30_000): number {
  const [now, setNow] = useState(Date.now);
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), ms);
    return () => clearInterval(id);
  }, [ms]);
  return now;
}
