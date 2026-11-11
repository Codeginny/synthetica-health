import type { AppointmentRow, DashboardData, DashboardFilters, DailyPoint, SpecialtyPoint } from '@/types/analytics';

export const CONSULTATION_PRICE = 30000;

export const applyFilters = (rows: AppointmentRow[], f: DashboardFilters): AppointmentRow[] =>
  rows.filter(
    (r) =>
      r.fecha >= f.from &&
      r.fecha <= f.to &&
      (f.doctor === null || r.profesional === f.doctor) &&
      (f.status === null || r.estado === f.status),
  );

/** Misma agregación que `server/services/analyticsService.js`; usada en modo demo y mocks. */
export function buildDashboard(all: AppointmentRow[], filters: DashboardFilters): DashboardData {
  const rows = applyFilters(all, filters);
  const count = (s: AppointmentRow['estado']) => rows.filter((r) => r.estado === s).length;
  const completados = count('completado');
  const cancelados = count('cancelado');

  const byDay = new Map<string, DailyPoint>();
  const bySpec = new Map<string, SpecialtyPoint>();
  for (const r of rows) {
    const d = byDay.get(r.fecha) ?? { fecha: r.fecha, total: 0, completados: 0, cancelados: 0 };
    d.total++;
    if (r.estado === 'completado') d.completados++;
    if (r.estado === 'cancelado') d.cancelados++;
    byDay.set(r.fecha, d);

    const s = bySpec.get(r.especialidad) ?? { especialidad: r.especialidad, total: 0, cancelados: 0 };
    s.total++;
    if (r.estado === 'cancelado') s.cancelados++;
    bySpec.set(r.especialidad, s);
  }

  return {
    filters,
    kpis: {
      total: rows.length,
      pendientes: count('pendiente'),
      confirmados: count('confirmado'),
      completados,
      cancelados,
      tasaAusentismo: rows.length ? Math.round((cancelados / rows.length) * 1000) / 10 : 0,
      ingresos: (completados + count('confirmado')) * CONSULTATION_PRICE,
    },
    serie: [...byDay.values()].sort((a, b) => a.fecha.localeCompare(b.fecha)),
    porEspecialidad: [...bySpec.values()].sort((a, b) => b.total - a.total),
    turnos: [...rows].sort((a, b) => (b.fecha + b.hora).localeCompare(a.fecha + a.hora)).slice(0, 200),
  };
}
