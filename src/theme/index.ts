/**
 * Tokens de diseño extraídos del archivo de Figma de BlümSens.
 * Todas las pantallas usan Inter (400 / 500 / 600) y esta paleta.
 */
export const colors = {
  // Marca
  forest: '#48684A', // verde principal (fondos de marca, acentos, gráficas)
  forestInk: '#233D2A', // texto principal
  terracotta: '#C86D44', // botones primarios
  cream: '#F7F4EF', // fondo cálido / texto sobre verde
  butter: '#FBF3DA', // fondo de aviso / texto sobre foto
  mint: '#DDE8DE', // texto secundario sobre verde

  // Superficies
  white: '#FFFFFF',
  surface: '#F4F7F5', // tarjetas
  border: '#E1E8E2',
  track: '#DFE8E0',
  scannerGrey: '#C2C2C2',

  // Texto
  muted: '#6E7C72',
  mutedAlt: '#66756A',

  // Estados
  okBg: '#E8F0E9',
  ok: '#48684A',
  warnBg: '#FBF3DA',
  warn: '#896916',
  warnBright: '#B98A19',
  dangerBg: '#FCEDEA',
  danger: '#B54641',
} as const;

export const fonts = {
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semibold: 'Inter_600SemiBold',
} as const;

export const radius = {
  pill: 999,
  card: 20,
  button: 18,
  chip: 16,
  photo: 24,
} as const;

/** Margen lateral estándar de las pantallas (24 px en el diseño de 412 px). */
export const gutter = 24;

/** Ancho del lienzo de Figma: se usa para escalar fondos decorativos. */
export const designWidth = 412;

export type StatusTone = 'ok' | 'warn' | 'danger';

export const toneColors: Record<StatusTone, { bg: string; fg: string }> = {
  ok: { bg: colors.okBg, fg: colors.ok },
  warn: { bg: colors.warnBg, fg: colors.warn },
  danger: { bg: colors.dangerBg, fg: colors.danger },
};
