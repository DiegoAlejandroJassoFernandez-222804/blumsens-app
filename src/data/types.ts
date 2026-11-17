import type { ImageKey } from '@/assets';
import type { StatusTone } from '@/theme';

/** Una foto puede venir de los assets del proyecto o de la cámara / galería. */
export type PhotoSource = { kind: 'asset'; key: ImageKey } | { kind: 'uri'; uri: string };

export interface Range {
  min: number;
  max: number;
}

export interface Species {
  id: string;
  scientific: string;
  common: string; // nombre común en minúsculas: "menta"
  defaultName: string; // sugerencia al dar de alta: "Menta de Cocina"
  room: string;
  ideal: { moisture: Range; temp: Range; light: Range };
  photo: ImageKey;
}

/** Resultado del "análisis foliar" (simulado) de una foto de hoja. */
export interface LeafHealth {
  score: number; // 0–100
  tone: StatusTone;
  label: string; // pastilla: "Saludable", "Atención"
  title: string; // "Estrés hídrico leve"
  summary: string; // frase corta para la tarjeta de monitoreo
  detail: string; // explicación
  confidence: number; // %
  checkedAt: number;
}

export interface LeafSnapshot {
  id: string;
  ts: number;
  photo: PhotoSource;
}

export interface WaterEvent {
  id: string;
  ts: number;
  ml: number;
  mode: 'Manual' | 'Automático';
}

export interface Plant {
  id: string;
  name: string;
  speciesId: string;
  room: string;
  photo: PhotoSource; // miniatura de la lista
  hero: PhotoSource; // imagen grande del detalle
  moduleId: string;
  leaf: LeafHealth;
  leafTimeline: LeafSnapshot[];
  waterLog: WaterEvent[];
  createdAt: number;
}

export interface Reading {
  moisture: number; // % humedad del suelo
  temp: number; // °C
  light: number; // lux
  ts: number;
}

export type ModuleState = 'online' | 'offline' | 'connecting';

/** Módulo IoT (ESP32) que vive en la maceta y reporta las lecturas. */
export interface SensorModule {
  id: string; // BLM-ESP32-001
  plantId: string;
  state: ModuleState;
  lastSeen: number;
  battery: number; // %
  rssi: number; // dBm
  firmware: string;
  reading: Reading;
  /** Valores hacia los que tiende la simulación (clima de la habitación). */
  target: { temp: number; light: number };
}

export type AlertKind = 'riego' | 'salud' | 'conexion';

export interface GardenAlert {
  id: string;
  kind: AlertKind;
  tone: 'warn' | 'danger';
  plantId: string;
  title: string;
  subtitle: string;
  body: string;
  createdAt: number;
  resolvedAt?: number;
}

/** Planta en proceso de alta (escaneo → configurar → vincular). */
export interface PlantDraft {
  photo: PhotoSource;
  speciesId: string;
  name: string;
  leaf: LeafHealth;
}

export type HistoryRange = '24h' | '7d' | '30d';
