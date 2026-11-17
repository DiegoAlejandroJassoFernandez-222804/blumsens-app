const MONTHS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

export const MINUTE = 60_000;
export const HOUR = 60 * MINUTE;
export const DAY = 24 * HOUR;

/** 1800 → "1.800" (separador de miles con punto, como en el diseño). */
export function formatNumber(value: number): string {
  const rounded = Math.round(value);
  return rounded.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

/** "09:28" */
export function formatTime(ts: number): string {
  const d = new Date(ts);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

/** "8 nov" */
export function formatDay(ts: number): string {
  const d = new Date(ts);
  return `${d.getDate()} ${MONTHS[d.getMonth()]}`;
}

export function isSameDay(a: number, b: number): boolean {
  const da = new Date(a);
  const db = new Date(b);
  return da.getFullYear() === db.getFullYear() && da.getMonth() === db.getMonth() && da.getDate() === db.getDate();
}

/** "Hoy", "Ayer" o "8 nov". */
export function formatRelativeDay(ts: number, now = Date.now()): string {
  if (isSameDay(ts, now)) return 'Hoy';
  if (isSameDay(ts, now - DAY)) return 'Ayer';
  return formatDay(ts);
}

/** "Hace 13 min", "Hace 2 h", "Hace 3 días". */
export function formatAgo(ts: number, now = Date.now()): string {
  const diff = Math.max(0, now - ts);
  if (diff < MINUTE) return 'Justo ahora';
  if (diff < HOUR) return `Hace ${Math.floor(diff / MINUTE)} min`;
  if (diff < DAY) return `Hace ${Math.floor(diff / HOUR)} h`;
  const days = Math.floor(diff / DAY);
  return `Hace ${days} ${days === 1 ? 'día' : 'días'}`;
}

/** Hoy a una hora concreta, desplazado N días: útil para datos semilla. */
export function atDaysAgo(days: number, hours: number, minutes: number, now = Date.now()): number {
  const d = new Date(now - days * DAY);
  d.setHours(hours, minutes, 0, 0);
  return d.getTime();
}

export function formatRange(min: number, max: number, unit = ''): string {
  return `${formatNumber(min)}–${formatNumber(max)}${unit}`;
}
