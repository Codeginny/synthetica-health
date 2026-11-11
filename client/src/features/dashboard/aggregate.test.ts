import { applyFilters, buildDashboard, CONSULTATION_PRICE } from './aggregate';
import type { AppointmentRow, DashboardFilters } from '@/types/analytics';

const row = (p: Partial<AppointmentRow>): AppointmentRow => ({
  id: 1, paciente: 'P', profesional: 'Dra. A', especialidad: 'Cardiología', fecha: '2026-11-01', hora: '09:00', estado: 'completado', ...p,
});

const rows: AppointmentRow[] = [
  row({ id: 1 }),
  row({ id: 2, estado: 'cancelado' }),
  row({ id: 3, fecha: '2026-11-02', estado: 'confirmado', profesional: 'Dr. B', especialidad: 'Pediatría' }),
  row({ id: 4, fecha: '2026-11-05', estado: 'pendiente' }),
];

const all: DashboardFilters = { from: '2026-11-01', to: '2026-11-30', doctor: null, status: null };

describe('applyFilters', () => {
  it('respeta rango inclusivo', () => {
    expect(applyFilters(rows, { ...all, to: '2026-11-02' }).map((r) => r.id)).toEqual([1, 2, 3]);
  });
  it('filtra por profesional y estado', () => {
    expect(applyFilters(rows, { ...all, doctor: 'Dra. A', status: 'cancelado' }).map((r) => r.id)).toEqual([2]);
  });
});

describe('buildDashboard', () => {
  const d = buildDashboard(rows, all);

  it('calcula KPIs y ausentismo', () => {
    expect(d.kpis).toMatchObject({ total: 4, completados: 1, cancelados: 1, pendientes: 1, confirmados: 1, tasaAusentismo: 25 });
    expect(d.kpis.ingresos).toBe(2 * CONSULTATION_PRICE);
  });

  it('agrupa serie diaria ordenada', () => {
    expect(d.serie.map((p) => p.fecha)).toEqual(['2026-11-01', '2026-11-02', '2026-11-05']);
    expect(d.serie[0]).toMatchObject({ total: 2, completados: 1, cancelados: 1 });
  });

  it('ordena especialidades por volumen', () => {
    expect(d.porEspecialidad[0]).toEqual({ especialidad: 'Cardiología', total: 3, cancelados: 1 });
  });

  it('devuelve ceros sin datos', () => {
    expect(buildDashboard([], all).kpis.tasaAusentismo).toBe(0);
  });
});
