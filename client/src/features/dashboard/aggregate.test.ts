import { applyFilters, buildDashboard, CONSULTATION_PRICE, criticalHours, isoWeekday } from './aggregate';
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
    expect(d.porEspecialidad[0]).toEqual({ especialidad: 'Cardiología', total: 3, cancelados: 1, perdida: CONSULTATION_PRICE });
  });

  it('usa el precio del turno y, si falta, la tarifa por defecto', () => {
    const priced = buildDashboard(
      [row({ id: 1, precio: 45000 }), row({ id: 2, estado: 'cancelado', precio: 38000 }), row({ id: 3, estado: 'cancelado' })],
      all,
    );
    expect(priced.kpis.ingresos).toBe(45000);
    expect(priced.kpis.facturacionPerdida).toBe(38000 + CONSULTATION_PRICE);
    expect(priced.porEspecialidad[0]?.perdida).toBe(38000 + CONSULTATION_PRICE);
  });

  it('agrupa ausentismo por hora', () => {
    const h = buildDashboard([row({ id: 1, hora: '08:00', estado: 'cancelado' }), row({ id: 2, hora: '08:30' }), row({ id: 3, hora: '18:00' })], all).porHora;
    expect(h).toEqual([
      { hora: 8, total: 2, cancelados: 1, tasa: 50 },
      { hora: 18, total: 1, cancelados: 0, tasa: 0 },
    ]);
  });

  it('agrupa por día de semana × franja con ocupación promedio', () => {
    // 2026-11-02 y 2026-11-09 son lunes; 2026-11-04, miércoles.
    const s = buildDashboard(
      [
        row({ id: 1, fecha: '2026-11-02', hora: '08:00', estado: 'cancelado' }),
        row({ id: 2, fecha: '2026-11-09', hora: '12:30' }),
        row({ id: 3, fecha: '2026-11-09', hora: '09:00' }),
        row({ id: 4, fecha: '2026-11-04', hora: '13:00' }),
      ],
      all,
    ).porDiaFranja;
    expect(s).toEqual([
      { dia: 1, franja: 'mañana', total: 3, cancelados: 1, tasa: 33.3, promedio: 1.5 },
      { dia: 3, franja: 'tarde', total: 1, cancelados: 0, tasa: 0, promedio: 1 },
    ]);
  });

  it('devuelve ceros sin datos', () => {
    expect(buildDashboard([], all).kpis.tasaAusentismo).toBe(0);
  });
});

describe('helpers', () => {
  it('isoWeekday no depende de la zona horaria', () => {
    expect(isoWeekday('2026-11-02')).toBe(1);
    expect(isoWeekday('2026-11-08')).toBe(7);
  });

  it('criticalHours exige muestra mínima y 25% sobre el promedio', () => {
    const horas = [
      { hora: 8, total: 20, cancelados: 6, tasa: 30 },
      { hora: 9, total: 3, cancelados: 3, tasa: 100 },
      { hora: 10, total: 20, cancelados: 4, tasa: 20 },
    ];
    expect(criticalHours(horas, 20)).toEqual([8]);
  });
});
