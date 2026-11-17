import { atDaysAgo, DAY, MINUTE } from '@/lib/format';
import type { GardenAlert, Plant, SensorModule } from './types';

/**
 * Jardín de demostración: reproduce el estado que muestran las pantallas de Figma
 * (Monstera óptima, Menta con poca humedad, Sansevieria sin señal).
 */
export function createSeed(now = Date.now()): {
  plants: Plant[];
  modules: SensorModule[];
  alerts: GardenAlert[];
} {
  const plants: Plant[] = [
    {
      id: 'monstera',
      name: 'Monstera de Sala',
      speciesId: 'monstera-deliciosa',
      room: 'Sala',
      photo: { kind: 'asset', key: 'plantMonstera' },
      hero: { kind: 'asset', key: 'plantMonstera' },
      moduleId: 'BLM-ESP32-001',
      leaf: {
        score: 94,
        tone: 'ok',
        label: 'Saludable',
        title: 'Hojas sanas',
        summary: 'Hojas sanas, crecimiento feliz.',
        detail: 'Sin manchas ni signos de estrés',
        confidence: 93,
        checkedAt: now - 3 * DAY,
      },
      leafTimeline: [
        { id: 'm-l1', ts: now - 12 * DAY, photo: { kind: 'asset', key: 'plantMonstera' } },
        { id: 'm-l2', ts: now - 3 * DAY, photo: { kind: 'asset', key: 'plantMonstera' } },
      ],
      waterLog: [
        { id: 'm-w1', ts: atDaysAgo(2, 19, 15, now), ml: 250, mode: 'Manual' },
        { id: 'm-w2', ts: atDaysAgo(6, 18, 40, now), ml: 250, mode: 'Manual' },
      ],
      createdAt: now - 30 * DAY,
    },
    {
      id: 'menta',
      name: 'Menta de Cocina',
      speciesId: 'mentha-spicata',
      room: 'Cocina',
      photo: { kind: 'asset', key: 'plantMenta' },
      hero: { kind: 'asset', key: 'leafHero' },
      moduleId: 'BLM-ESP32-002',
      leaf: {
        score: 72,
        tone: 'warn',
        label: 'Atención',
        title: 'Estrés hídrico leve',
        summary: 'Le falta un poco de agua.',
        detail: 'Ligera pérdida de turgencia',
        confidence: 96,
        checkedAt: now - 2 * MINUTE,
      },
      leafTimeline: [
        { id: 'n-l1', ts: atDaysAgo(7, 9, 0, now), photo: { kind: 'asset', key: 'leafOld' } },
        { id: 'n-l2', ts: atDaysAgo(4, 8, 30, now), photo: { kind: 'asset', key: 'leafOld' } },
        { id: 'n-l3', ts: now - 2 * MINUTE, photo: { kind: 'asset', key: 'leafHero' } },
      ],
      waterLog: [
        { id: 'n-w1', ts: atDaysAgo(4, 8, 30, now), ml: 150, mode: 'Manual' },
        { id: 'n-w2', ts: atDaysAgo(7, 9, 10, now), ml: 150, mode: 'Manual' },
      ],
      createdAt: now - 20 * DAY,
    },
    {
      id: 'sansevieria',
      name: 'Sansevieria',
      speciesId: 'dracaena-trifasciata',
      room: 'Recámara',
      photo: { kind: 'asset', key: 'plantSansevieria' },
      hero: { kind: 'asset', key: 'plantSansevieria' },
      moduleId: 'BLM-ESP32-003',
      leaf: {
        score: 91,
        tone: 'ok',
        label: 'Saludable',
        title: 'Hojas sanas',
        summary: 'Hojas firmes y erguidas.',
        detail: 'Sin manchas ni signos de estrés',
        confidence: 90,
        checkedAt: now - 5 * DAY,
      },
      leafTimeline: [{ id: 's-l1', ts: now - 5 * DAY, photo: { kind: 'asset', key: 'plantSansevieria' } }],
      waterLog: [{ id: 's-w1', ts: atDaysAgo(12, 10, 0, now), ml: 100, mode: 'Manual' }],
      createdAt: now - 45 * DAY,
    },
  ];

  const modules: SensorModule[] = [
    {
      id: 'BLM-ESP32-001',
      plantId: 'monstera',
      state: 'online',
      lastSeen: now,
      battery: 86,
      rssi: -58,
      firmware: '1.4.2',
      reading: { moisture: 48, temp: 24, light: 1250, ts: now },
      target: { temp: 24, light: 1250 },
    },
    {
      id: 'BLM-ESP32-002',
      plantId: 'menta',
      state: 'online',
      lastSeen: now,
      battery: 64,
      rssi: -63,
      firmware: '1.4.2',
      reading: { moisture: 22, temp: 23, light: 1800, ts: now },
      target: { temp: 23, light: 1800 },
    },
    {
      id: 'BLM-ESP32-003',
      plantId: 'sansevieria',
      state: 'offline',
      lastSeen: now - 13 * MINUTE,
      battery: 12,
      rssi: -88,
      firmware: '1.3.9',
      reading: { moisture: 35, temp: 22, light: 850, ts: now - 13 * MINUTE },
      target: { temp: 22, light: 850 },
    },
  ];

  const alerts: GardenAlert[] = [
    {
      id: 'a-conexion-sansevieria',
      kind: 'conexion',
      tone: 'danger',
      plantId: 'sansevieria',
      title: 'Módulo sin señal',
      subtitle: 'Sansevieria · BLM-ESP32-003',
      body: 'La conexión se perdió hace unos minutos. Revisa la alimentación y la red Wi-Fi.',
      createdAt: now - 13 * MINUTE,
    },
    {
      id: 'a-riego-menta',
      kind: 'riego',
      tone: 'warn',
      plantId: 'menta',
      title: 'Humedad baja',
      subtitle: 'Menta de Cocina · Riego',
      body: 'Humedad del suelo al 22 %. Añade 150 ml y revisa de nuevo en 30 min.',
      createdAt: now - 8 * MINUTE,
    },
    {
      id: 'a-salud-menta',
      kind: 'salud',
      tone: 'warn',
      plantId: 'menta',
      title: 'Estrés hídrico leve',
      subtitle: 'Menta de Cocina · Salud foliar',
      body: 'La hoja muestra pérdida de turgencia. Análisis fotográfico: 96 % de confianza.',
      createdAt: now - 2 * MINUTE,
    },
  ];

  return { plants, modules, alerts };
}
