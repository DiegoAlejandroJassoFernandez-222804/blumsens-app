import type { LeafHealth, Species } from './types';

/**
 * Catálogo predefinido de especies que el "reconocimiento" puede detectar.
 * Los rangos ideales alimentan estados, alertas y recomendaciones.
 */
export const SPECIES: Species[] = [
  {
    id: 'mentha-spicata',
    scientific: 'Mentha spicata',
    common: 'menta',
    defaultName: 'Menta de Cocina',
    room: 'Cocina',
    ideal: { moisture: { min: 40, max: 60 }, temp: { min: 15, max: 26 }, light: { min: 1500, max: 3000 } },
    photo: 'plantMenta',
  },
  {
    id: 'monstera-deliciosa',
    scientific: 'Monstera deliciosa',
    common: 'monstera',
    defaultName: 'Monstera de Sala',
    room: 'Sala',
    ideal: { moisture: { min: 40, max: 60 }, temp: { min: 18, max: 27 }, light: { min: 800, max: 2000 } },
    photo: 'plantMonstera',
  },
  {
    id: 'dracaena-trifasciata',
    scientific: 'Dracaena trifasciata',
    common: 'sansevieria',
    defaultName: 'Sansevieria',
    room: 'Recámara',
    ideal: { moisture: { min: 20, max: 40 }, temp: { min: 16, max: 29 }, light: { min: 500, max: 2000 } },
    photo: 'plantSansevieria',
  },
  {
    id: 'ocimum-basilicum',
    scientific: 'Ocimum basilicum',
    common: 'albahaca',
    defaultName: 'Albahaca del Balcón',
    room: 'Balcón',
    ideal: { moisture: { min: 45, max: 65 }, temp: { min: 18, max: 28 }, light: { min: 2000, max: 4000 } },
    photo: 'plantMenta',
  },
  {
    id: 'epipremnum-aureum',
    scientific: 'Epipremnum aureum',
    common: 'potus',
    defaultName: 'Potus del Estudio',
    room: 'Estudio',
    ideal: { moisture: { min: 30, max: 50 }, temp: { min: 17, max: 28 }, light: { min: 500, max: 1500 } },
    photo: 'plantMonstera',
  },
];

export function getSpecies(id: string): Species {
  return SPECIES.find((s) => s.id === id) ?? SPECIES[0];
}

/** Diagnósticos predefinidos que devuelve el "análisis foliar" simulado. */
type LeafTemplate = Omit<LeafHealth, 'score' | 'confidence' | 'checkedAt'> & { score: [number, number] };

export const LEAF_DIAGNOSES = {
  healthy: {
    tone: 'ok',
    label: 'Saludable',
    title: 'Hojas sanas',
    summary: 'Hojas sanas, crecimiento feliz.',
    detail: 'Sin manchas ni signos de estrés',
    score: [90, 97],
  },
  waterStress: {
    tone: 'warn',
    label: 'Atención',
    title: 'Estrés hídrico leve',
    summary: 'Le falta un poco de agua.',
    detail: 'Ligera pérdida de turgencia',
    score: [68, 76],
  },
  chlorosis: {
    tone: 'warn',
    label: 'Atención',
    title: 'Clorosis leve',
    summary: 'Amarilleo suave en los bordes.',
    detail: 'Revisa la luz y los nutrientes',
    score: [72, 80],
  },
  sunburn: {
    tone: 'warn',
    label: 'Atención',
    title: 'Exceso de luz',
    summary: 'Bordes secos por sol directo.',
    detail: 'Aléjala un poco de la ventana',
    score: [70, 78],
  },
} satisfies Record<string, LeafTemplate>;

export type LeafDiagnosisKey = keyof typeof LEAF_DIAGNOSES;
