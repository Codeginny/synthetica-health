import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { APPOINTMENT_STATUSES, type AppointmentStatus, type DashboardFilters } from '@/types/analytics';
import { daysAgo, toIsoDate } from '@/lib/dates';

const ISO_RE = /^\d{4}-\d{2}-\d{2}$/;

const isStatus = (v: string | null): v is AppointmentStatus =>
  v !== null && (APPOINTMENT_STATUSES as readonly string[]).includes(v);

export const defaultFilters = (now = new Date()): DashboardFilters => ({
  from: daysAgo(29, now),
  to: toIsoDate(now),
  doctor: null,
  status: null,
});

/** Parsea filtros desde la URL; valores inválidos caen al default. */
export function parseFilters(params: URLSearchParams, now = new Date()): DashboardFilters {
  const d = defaultFilters(now);
  const from = params.get('from');
  const to = params.get('to');
  // Rango invertido se conserva: la UI muestra el error y la query queda deshabilitada.
  const range = from && to && ISO_RE.test(from) && ISO_RE.test(to) ? { from, to } : { from: d.from, to: d.to };
  const status = params.get('status');
  return { ...range, doctor: params.get('doctor') || null, status: isStatus(status) ? status : null };
}

/** Filtros sincronizados con la query string: compartibles por URL y estables como queryKey. */
export function useDashboardFilters() {
  const [params, setParams] = useSearchParams();
  const filters = useMemo(() => parseFilters(params), [params]);

  const update = useCallback(
    (patch: Partial<DashboardFilters>) => {
      const next = { ...filters, ...patch };
      setParams(
        (prev) => {
          const p = new URLSearchParams(prev);
          p.set('from', next.from);
          p.set('to', next.to);
          next.doctor ? p.set('doctor', next.doctor) : p.delete('doctor');
          next.status ? p.set('status', next.status) : p.delete('status');
          return p;
        },
        { replace: true },
      );
    },
    [filters, setParams],
  );

  const reset = useCallback(() => setParams(new URLSearchParams(), { replace: true }), [setParams]);

  return { filters, update, reset };
}
