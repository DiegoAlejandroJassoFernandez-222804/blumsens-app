import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { createSeed } from '@/data/seed';
import { getSpecies, SPECIES } from '@/data/species';
import type {
  AlertKind,
  GardenAlert,
  LeafHealth,
  PhotoSource,
  Plant,
  PlantDraft,
  SensorModule,
} from '@/data/types';
import { formatTime } from '@/lib/format';
import { diagnoseLeaf } from '@/lib/insights';
import { between, clamp, uid } from '@/lib/random';

/** Orden en que el "reconocimiento de especie" va proponiendo plantas nuevas. */
const DETECTION_ORDER = ['mentha-spicata', 'ocimum-basilicum', 'epipremnum-aureum', 'monstera-deliciosa'];

/** Cada cuánto llega una lectura simulada de los módulos (ms). */
export const TICK_MS = 3000;

interface Session {
  email: string;
  name: string;
}

interface GardenState {
  session: Session | null;
  plants: Plant[];
  modules: SensorModule[];
  alerts: GardenAlert[];
  draft: PlantDraft | null;
  detectionCursor: number;

  login: (email: string) => void;
  logout: () => void;
  resetDemo: () => void;

  /** Avanza la simulación: nuevas lecturas de todos los módulos en línea. */
  tick: () => void;
  waterPlant: (plantId: string, ml?: number) => void;
  disconnectModule: (moduleId: string) => void;
  reconnectModule: (moduleId: string) => void;
  resolveAlert: (alertId: string) => void;
  applyLeafScan: (plantId: string, photo: PhotoSource) => LeafHealth;

  startDraft: (photo: PhotoSource) => void;
  updateDraft: (patch: Partial<PlantDraft>) => void;
  finalizeDraft: (moduleId: string) => string | null;
}

function hasOpenAlert(alerts: GardenAlert[], kind: AlertKind, plantId: string) {
  return alerts.some((a) => a.kind === kind && a.plantId === plantId && !a.resolvedAt);
}

function resolveAlerts(alerts: GardenAlert[], kind: AlertKind, plantId: string, now: number) {
  return alerts.map((a) => (a.kind === kind && a.plantId === plantId && !a.resolvedAt ? { ...a, resolvedAt: now } : a));
}

function moistureAlert(plant: Plant, moisture: number, now: number): GardenAlert {
  return {
    id: uid('a'),
    kind: 'riego',
    tone: 'warn',
    plantId: plant.id,
    title: 'Humedad baja',
    subtitle: `${plant.name} · Riego`,
    body: `Humedad del suelo al ${Math.round(moisture)} %. Añade 150 ml y revisa de nuevo en 30 min.`,
    createdAt: now,
  };
}

function connectionAlert(plant: Plant, moduleId: string, now: number): GardenAlert {
  return {
    id: uid('a'),
    kind: 'conexion',
    tone: 'danger',
    plantId: plant.id,
    title: 'Módulo sin señal',
    subtitle: `${plant.name} · ${moduleId}`,
    body: `La conexión se perdió a las ${formatTime(now)}. Revisa la alimentación y la red Wi-Fi.`,
    createdAt: now,
  };
}

function healthAlert(plant: Plant, leaf: LeafHealth, now: number): GardenAlert {
  return {
    id: uid('a'),
    kind: 'salud',
    tone: 'warn',
    plantId: plant.id,
    title: leaf.title,
    subtitle: `${plant.name} · Salud foliar`,
    body: `${leaf.detail}. Análisis fotográfico: ${leaf.confidence} % de confianza.`,
    createdAt: now,
  };
}

export const useGarden = create<GardenState>()(
  persist(
    (set, get) => ({
      session: null,
      ...createSeed(),
      draft: null,
      detectionCursor: 0,

      login: (email) => {
        const raw = email.split('@')[0] ?? 'jardinero';
        const name = raw.charAt(0).toUpperCase() + raw.slice(1);
        set({ session: { email, name } });
      },
      logout: () => set({ session: null, draft: null }),
      resetDemo: () => set({ ...createSeed(), draft: null, detectionCursor: 0 }),

      tick: () =>
        set((s) => {
          const now = Date.now();
          const newAlerts: GardenAlert[] = [];
          const modules = s.modules.map((m) => {
            if (m.state !== 'online') return m;
            const plant = s.plants.find((p) => p.id === m.plantId);
            const r = m.reading;
            // La tierra se seca poco a poco; la temperatura y la luz oscilan alrededor del clima de la habitación.
            const moisture = clamp(r.moisture - between(0.005, 0.03) + (Math.random() - 0.5) * 0.25, 5, 80);
            const temp = r.temp + (m.target.temp - r.temp) * 0.15 + (Math.random() - 0.5) * 0.25;
            const light = Math.max(0, r.light + (m.target.light - r.light) * 0.15 + (Math.random() - 0.5) * 50);

            if (plant) {
              const min = getSpecies(plant.speciesId).ideal.moisture.min;
              const crossed = r.moisture >= min && moisture < min;
              if (crossed && !hasOpenAlert(s.alerts, 'riego', plant.id)) newAlerts.push(moistureAlert(plant, moisture, now));
            }
            return {
              ...m,
              lastSeen: now,
              battery: Math.max(1, m.battery - 0.002),
              rssi: clamp(Math.round(m.rssi + (Math.random() - 0.5) * 3), -80, -48),
              reading: { moisture, temp, light, ts: now },
            };
          });
          return { modules, alerts: newAlerts.length ? [...newAlerts, ...s.alerts] : s.alerts };
        }),

      waterPlant: (plantId, ml = 150) =>
        set((s) => {
          const now = Date.now();
          const plant = s.plants.find((p) => p.id === plantId);
          if (!plant) return s;
          return {
            plants: s.plants.map((p) =>
              p.id === plantId ? { ...p, waterLog: [{ id: uid('w'), ts: now, ml, mode: 'Manual' as const }, ...p.waterLog] } : p,
            ),
            modules: s.modules.map((m) =>
              m.id === plant.moduleId && m.state === 'online'
                ? { ...m, reading: { ...m.reading, moisture: clamp(m.reading.moisture + (ml / 150) * 24, 0, 75), ts: now } }
                : m,
            ),
            alerts: resolveAlerts(s.alerts, 'riego', plantId, now),
          };
        }),

      disconnectModule: (moduleId) =>
        set((s) => {
          const now = Date.now();
          const mod = s.modules.find((m) => m.id === moduleId);
          const plant = mod && s.plants.find((p) => p.id === mod.plantId);
          if (!mod || !plant) return s;
          return {
            modules: s.modules.map((m) => (m.id === moduleId ? { ...m, state: 'offline' as const, rssi: -90 } : m)),
            alerts: hasOpenAlert(s.alerts, 'conexion', plant.id)
              ? s.alerts
              : [connectionAlert(plant, moduleId, now), ...s.alerts],
          };
        }),

      reconnectModule: (moduleId) => {
        set((s) => ({
          modules: s.modules.map((m) => (m.id === moduleId ? { ...m, state: 'connecting' as const } : m)),
        }));
        // Simula el "handshake" con el ESP32.
        setTimeout(() => {
          const now = Date.now();
          set((s) => {
            const mod = s.modules.find((m) => m.id === moduleId);
            if (!mod || mod.state !== 'connecting') return s;
            return {
              modules: s.modules.map((m) =>
                m.id === moduleId
                  ? { ...m, state: 'online' as const, lastSeen: now, rssi: -60, battery: Math.max(m.battery, 40) }
                  : m,
              ),
              alerts: resolveAlerts(s.alerts, 'conexion', mod.plantId, now),
            };
          });
        }, 2200);
      },

      resolveAlert: (alertId) =>
        set((s) => ({ alerts: s.alerts.map((a) => (a.id === alertId ? { ...a, resolvedAt: Date.now() } : a)) })),

      applyLeafScan: (plantId, photo) => {
        const s = get();
        const now = Date.now();
        const plant = s.plants.find((p) => p.id === plantId);
        if (!plant) return diagnoseLeaf(undefined, SPECIES[0], now);
        const mod = s.modules.find((m) => m.id === plant.moduleId);
        const leaf = diagnoseLeaf(mod?.reading, getSpecies(plant.speciesId), now);
        const updated: Plant = {
          ...plant,
          leaf,
          leafTimeline: [...plant.leafTimeline, { id: uid('l'), ts: now, photo }],
        };
        let alerts = resolveAlerts(s.alerts, 'salud', plantId, now);
        if (leaf.tone !== 'ok') alerts = [healthAlert(updated, leaf, now), ...alerts];
        set({ plants: s.plants.map((p) => (p.id === plantId ? updated : p)), alerts });
        return leaf;
      },

      startDraft: (photo) => {
        const { detectionCursor, plants } = get();
        const species = getSpecies(DETECTION_ORDER[detectionCursor % DETECTION_ORDER.length]);
        const taken = new Set(plants.map((p) => p.name));
        let name = species.defaultName;
        for (let n = 2; taken.has(name); n++) name = `${species.defaultName} ${n}`;
        set({
          draft: { photo, speciesId: species.id, name, leaf: diagnoseLeaf(undefined, species) },
          detectionCursor: detectionCursor + 1,
        });
      },

      updateDraft: (patch) => set((s) => (s.draft ? { draft: { ...s.draft, ...patch } } : s)),

      finalizeDraft: (moduleId) => {
        const s = get();
        const draft = s.draft;
        if (!draft) return null;
        const now = Date.now();
        const species = getSpecies(draft.speciesId);
        const { ideal } = species;
        const plantId = uid('p');
        const plant: Plant = {
          id: plantId,
          name: draft.name.trim() || species.defaultName,
          speciesId: species.id,
          room: species.room,
          photo: draft.photo,
          hero: draft.photo,
          moduleId,
          leaf: draft.leaf,
          leafTimeline: [{ id: uid('l'), ts: now, photo: draft.photo }],
          waterLog: [],
          createdAt: now,
        };
        const light = Math.round(between(ideal.light.min, ideal.light.max));
        const temp = Math.round(between(ideal.temp.min + 3, ideal.temp.max - 2));
        const mod: SensorModule = {
          id: moduleId,
          plantId,
          state: 'online',
          lastSeen: now,
          battery: 100,
          rssi: -55,
          firmware: '1.4.2',
          reading: { moisture: Math.round(between(ideal.moisture.min + 2, ideal.moisture.max - 4)), temp, light, ts: now },
          target: { temp, light },
        };
        const alerts = plant.leaf.tone !== 'ok' ? [healthAlert(plant, plant.leaf, now), ...s.alerts] : s.alerts;
        set({ plants: [...s.plants, plant], modules: [...s.modules, mod], alerts, draft: null });
        return plantId;
      },
    }),
    {
      name: 'blumsens-garden',
      version: 1,
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({
        session: s.session,
        plants: s.plants,
        modules: s.modules.map((m) => (m.state === 'connecting' ? { ...m, state: 'offline' as const } : m)),
        alerts: s.alerts,
        detectionCursor: s.detectionCursor,
      }),
    },
  ),
);

/** Siguiente ID de módulo libre: BLM-ESP32-004, BLM-ESP32-005… */
export function nextModuleId(modules: SensorModule[]): string {
  let n = modules.length + 1;
  const ids = new Set(modules.map((m) => m.id));
  while (ids.has(`BLM-ESP32-${String(n).padStart(3, '0')}`)) n++;
  return `BLM-ESP32-${String(n).padStart(3, '0')}`;
}
