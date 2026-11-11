import { APPOINTMENT_STATUSES, type AppointmentStatus, type DashboardFilters } from '@/types/analytics';
import { daysAgo, toIsoDate } from './dates';

const ISO_RE = /^\d{4}-\d{2}-\d{2}$/;

const isStatus = (v: string | null): v is AppointmentStatus =>
  v !== null && (APPOINTMENT_STATUSES as readonly string[]).includes(v);

export const defaultFilters = (now = new Date()): DashboardFilters => ({
  from: daysAgo(29, now),
  to: toIsoDate(now),
  doctor: null,
  status: null,
});

interface ParamsLike {
  get(key: string): string | null;
}

/** Parsea filtros desde la URL (servidor y cliente); valores inválidos caen al default. */
export function parseFilters(params: ParamsLike, now = new Date()): DashboardFilters {
  const d = defaultFilters(now);
  const from = params.get('from');
  const to = params.get('to');
  // Rango invertido se conserva: la UI muestra el error y no se consulta.
  const range = from && to && ISO_RE.test(from) && ISO_RE.test(to) ? { from, to } : { from: d.from, to: d.to };
  const status = params.get('status');
  return { ...range, doctor: params.get('doctor') || null, status: isStatus(status) ? status : null };
}

export function filtersToSearch(f: DashboardFilters): string {
  const p = new URLSearchParams({ from: f.from, to: f.to });
  if (f.doctor) p.set('doctor', f.doctor);
  if (f.status) p.set('status', f.status);
  return p.toString();
}

/** Adaptador para `searchParams` de Next (Record) → interfaz `get`. */
export const recordParams = (sp: Record<string, string | string[] | undefined>): ParamsLike => ({
  get: (k) => {
    const v = sp[k];
    return typeof v === 'string' ? v : null;
  },
});
