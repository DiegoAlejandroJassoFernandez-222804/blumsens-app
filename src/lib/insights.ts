import { LEAF_DIAGNOSES, type LeafDiagnosisKey } from '@/data/species';
import type { LeafHealth, Plant, Range, Reading, SensorModule, Species } from '@/data/types';
import type { StatusTone } from '@/theme';
import { formatNumber, formatRange } from './format';
import { between } from './random';

export interface Status {
  tone: StatusTone;
  label: string;
}

/** Estado general de una planta (pastilla de la lista "Mis plantas"). */
export function plantStatus(plant: Plant, module: SensorModule | undefined, species: Species): Status {
  if (!module || module.state === 'offline') return { tone: 'danger', label: 'Sin señal' };
  if (module.state === 'connecting') return { tone: 'warn', label: 'Conectando…' };
  const { moisture } = module.reading;
  if (moisture < species.ideal.moisture.min) return { tone: 'warn', label: 'Regar hoy' };
  if (moisture > species.ideal.moisture.max + 5) return { tone: 'warn', label: 'Mucha agua' };
  if (plant.leaf.tone !== 'ok') return { tone: 'warn', label: 'Atención' };
  return { tone: 'ok', label: 'Óptima' };
}

export function needsWater(module: SensorModule | undefined, species: Species): boolean {
  return !!module && module.reading.moisture < species.ideal.moisture.min;
}

/** Estado por métrica (tarjetas de "Monitoreo de mi planta"). */
export function moistureStatus(value: number, ideal: Range): Status {
  if (value < ideal.min) return { tone: 'warn', label: 'Necesita riego' };
  if (value > ideal.max + 5) return { tone: 'warn', label: 'Muy húmeda' };
  return { tone: 'ok', label: 'Óptima' };
}

export function tempStatus(value: number, ideal: Range): Status {
  if (value < ideal.min) return { tone: 'warn', label: 'Muy fría' };
  if (value > ideal.max) return { tone: 'warn', label: 'Muy cálida' };
  return { tone: 'ok', label: 'Óptima' };
}

export function lightStatus(value: number, ideal: Range): Status {
  if (value < ideal.min) return { tone: 'warn', label: 'Poca luz' };
  if (value > ideal.max * 1.25) return { tone: 'warn', label: 'Demasiada luz' };
  return { tone: 'ok', label: 'Óptima' };
}

export function lightDescription(value: number, species: Species): string {
  const kind = value < 500 ? 'Luz baja' : value <= 2500 ? 'Luz indirecta' : 'Luz directa';
  const { min, max } = species.ideal.light;
  if (value < min) return `${kind} · tu ${species.common} quiere más`;
  if (value > max * 1.25) return `${kind} · demasiado intensa`;
  return `${kind} · ideal para tu ${species.common}`;
}

export interface Recommendation {
  title: string;
  body: string;
  action?: 'water' | 'reconnect';
  actionLabel?: string;
}

/** Recomendación principal de cuidado para la pantalla de detalle. */
export function recommendation(module: SensorModule | undefined, species: Species): Recommendation {
  if (!module || module.state !== 'online') {
    return {
      title: 'Tu módulo no responde.',
      body: 'Revisa la alimentación y la red Wi-Fi. Mostramos la última lectura guardada.',
      action: 'reconnect',
      actionLabel: 'Reconectar sensor',
    };
  }
  const { moisture, light } = module.reading;
  const { ideal } = species;
  if (moisture < ideal.moisture.min) {
    return {
      title: 'Un poco de agua, mucho bienestar.',
      body: 'Añade 150 ml de agua hoy y vuelve a revisar la humedad en 30 minutos.',
      action: 'water',
      actionLabel: 'Registrar riego · 150 ml',
    };
  }
  if (moisture > ideal.moisture.max + 5) {
    return {
      title: 'Deja descansar la tierra.',
      body: `La humedad está alta. Espera a que baje de ${ideal.moisture.max} % antes de volver a regar.`,
    };
  }
  if (light < ideal.light.min) {
    return {
      title: 'Busca un rincón más luminoso.',
      body: `Tu ${species.common} prefiere ${formatRange(ideal.light.min, ideal.light.max)} lx. Acércala a una ventana con luz indirecta.`,
    };
  }
  return {
    title: 'Todo en equilibrio.',
    body: 'Humedad, luz y temperatura dentro del rango ideal. Próxima revisión en 24 h.',
  };
}

/**
 * "Análisis foliar" simulado: elige un diagnóstico coherente con las lecturas
 * actuales para que la demostración sea consistente.
 */
export function diagnoseLeaf(reading: Reading | undefined, species: Species, now = Date.now()): LeafHealth {
  let key: LeafDiagnosisKey = 'healthy';
  if (reading) {
    if (reading.moisture < species.ideal.moisture.min) key = 'waterStress';
    else if (reading.light > species.ideal.light.max * 1.25) key = 'sunburn';
    else if (reading.light < species.ideal.light.min * 0.6) key = 'chlorosis';
  } else if (Math.random() < 0.3) {
    key = 'waterStress';
  }
  const t = LEAF_DIAGNOSES[key];
  return {
    tone: t.tone,
    label: t.label,
    title: t.title,
    summary: t.summary,
    detail: t.detail,
    score: Math.round(between(t.score[0], t.score[1])),
    confidence: Math.round(between(88, 98)),
    checkedAt: now,
  };
}

export function idealCareLines(species: Species) {
  const { moisture, light } = species.ideal;
  return {
    water: `Suelo húmedo · ${moisture.min}–${moisture.max} %`,
    light: `${light.max > 2500 ? 'Brillante' : 'Indirecta'} · ${formatNumber(light.min)}–${formatNumber(light.max)} lx`,
  };
}
