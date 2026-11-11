import type { AppointmentRow } from '@/types/analytics';
import { formatShortDate } from '@/lib/dates';
import { Card } from './Card';
import { Skeleton } from './Skeleton';
import { EmptyState } from './StateMessage';
import { StatusBadge } from './StatusBadge';

export interface AppointmentsTableProps {
  rows: AppointmentRow[];
  loading?: boolean;
  /** Máximo de filas visibles. */
  limit?: number;
}

const COLUMNS = ['Fecha', 'Hora', 'Paciente', 'Profesional', 'Especialidad', 'Estado'] as const;

export function AppointmentsTable({ rows, loading = false, limit = 15 }: AppointmentsTableProps) {
  const visible = rows.slice(0, limit);
  return (
    <Card title="Turnos" description={loading ? 'Cargando…' : `${rows.length} resultados`}>
      {!loading && rows.length === 0 ? (
        <EmptyState message="No hay turnos que coincidan con los filtros" />
      ) : (
        <div className="-mx-section overflow-x-auto" tabIndex={0} role="region" aria-label="Tabla de turnos desplazable">
          <table className="w-full min-w-[640px] text-left text-body">
            <caption className="sr-only">Turnos filtrados, ordenados del más reciente al más antiguo</caption>
            <thead className="border-b border-line text-caption uppercase tracking-wide text-content-muted">
              <tr>
                {COLUMNS.map((c) => (
                  <th key={c} scope="col" className="px-section py-2 font-medium">{c}</th>
                ))}
              </tr>
            </thead>
            <tbody aria-busy={loading}>
              {loading
                ? Array.from({ length: 5 }, (_, i) => (
                    <tr key={i}>
                      <td colSpan={COLUMNS.length} className="px-section py-2"><Skeleton className="h-6 w-full" /></td>
                    </tr>
                  ))
                : visible.map((r) => (
                    <tr key={r.id} className="border-b border-line last:border-0 hover:bg-surface-muted">
                      <td className="px-section py-3 text-content">{formatShortDate(r.fecha)}</td>
                      <td className="px-section py-3 font-mono text-content-muted">{r.hora}</td>
                      <th scope="row" className="px-section py-3 font-medium text-content">{r.paciente}</th>
                      <td className="px-section py-3 text-content-muted">{r.profesional}</td>
                      <td className="px-section py-3 text-content-muted">{r.especialidad}</td>
                      <td className="px-section py-3"><StatusBadge status={r.estado} /></td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}
