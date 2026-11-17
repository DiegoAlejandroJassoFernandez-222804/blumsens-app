import type { HistoryRange, Plant, Reading, Species } from '@/data/types';
import { DAY, formatDay, HOUR } from './format';
import { clamp, seededRandom } from './random';

export type Metric = 'moisture' | 'light';

export interface Series {
  values: number[];
  top: number; // valor del eje superior
  topLabel: string;
  bottomLabel: string;
  xLabels: [string, string, string];
}

const RANGE_CONFIG: Record<HistoryRange, { points: number; step: number }> = {
  '24h': { points: 24, step: HOUR },
  '7d': { points: 7, step: DAY },
  '30d': { points: 30, step: DAY },
};

/**
 * Genera un historial sintético pero coherente: el último punto es la lectura
 * actual, la humedad baja con el tiempo y "salta" en cada riego registrado.
 */
export function buildSeries(
  metric: Metric,
  range: HistoryRange,
  plant: Plant,
  species: Species,
  current: Reading,
  now = Date.now(),
): Series {
  const { points, step } = RANGE_CONFIG[range];
  const rand = seededRandom(`${plant.id}:${metric}:${range}`);
  const values: number[] = new Array(points);
  values[points - 1] = metric === 'moisture' ? current.moisture : current.light;

  if (metric === 'moisture') {
    // Recorremos hacia atrás: antes había más humedad, salvo justo antes de un riego.
    const decay = range === '24h' ? 0.35 : 3.2;
    for (let i = points - 2; i >= 0; i--) {
      const tEnd = now - (points - 1 - i) * step;
      const tStart = tEnd - step;
      const watered = plant.waterLog.some((w) => w.ts > tStart && w.ts <= tEnd);
      const next = values[i + 1];
      const prev = watered ? next - 22 + rand() * 4 : next + decay * (0.6 + rand() * 0.8);
      values[i] = clamp(prev + (rand() - 0.5) * 1.5, 8, 72);
    }
  } else {
    const base = (species.ideal.light.min + species.ideal.light.max) / 2;
    for (let i = points - 2; i >= 0; i--) {
      if (range === '24h') {
        const hour = new Date(now - (points - 1 - i) * step).getHours();
        const daylight = Math.max(0, Math.sin((Math.PI * (hour - 6)) / 13));
        values[i] = Math.max(0, daylight * current.light * (1.05 + rand() * 0.3) + rand() * 40);
      } else {
        const anchor = (current.light + base) / 2;
        values[i] = Math.max(0, anchor * (0.78 + rand() * 0.42));
      }
    }
  }

  const max = Math.max(...values);
  let top: number;
  let topLabel: string;
  let bottomLabel: string;
  if (metric === 'moisture') {
    top = Math.max(60, Math.ceil(max / 10) * 10);
    topLabel = `${top} %`;
    bottomLabel = '0 %';
  } else {
    top = Math.max(3000, Math.ceil(max / 1000) * 1000);
    topLabel = `${top / 1000} mil`;
    bottomLabel = '0';
  }

  const start = now - (points - 1) * step;
  const mid = now - Math.floor((points - 1) / 2) * step;
  const xLabels: [string, string, string] =
    range === '24h' ? ['-24 h', '-12 h', 'Ahora'] : [formatDay(start), formatDay(mid), 'Hoy'];

  return { values, top, topLabel, bottomLabel, xLabels };
}
