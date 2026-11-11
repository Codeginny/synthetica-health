import type { IsoDate } from '@/types/analytics';

export const toIsoDate = (d: Date): IsoDate => d.toISOString().slice(0, 10);

export function daysAgo(n: number, from: Date = new Date()): IsoDate {
  const d = new Date(from);
  d.setDate(d.getDate() - n);
  return toIsoDate(d);
}

export const isValidRange = (from: IsoDate, to: IsoDate): boolean => Boolean(from && to) && from <= to;

export const formatShortDate = (iso: IsoDate): string =>
  new Date(`${iso}T00:00:00`).toLocaleDateString('es-AR', { day: '2-digit', month: 'short' });

export const formatCurrency = (n: number, compact = false): string =>
  n.toLocaleString('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: compact ? 1 : 0,
    ...(compact ? { notation: 'compact' as const } : {}),
  });
