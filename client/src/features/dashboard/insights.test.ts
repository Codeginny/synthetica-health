import type { AppointmentRow, DashboardFilters } from '@/types/analytics';
import { generateAppointments, mockDashboard } from '@/mocks/dashboard';
import { formatCurrency } from '@/lib/dates';
import { buildDashboard } from './aggregate';
import { buildInsights, REMINDER_RECOVERY } from './insights';

const filters: DashboardFilters = { from: '2026-10-12', to: '2026-11-10', doctor: null, status: null };
const anchor = new Date('2026-11-10T12:00:00');

describe('buildInsights con datos de ejemplo', () => {
  const data = mockDashboard(filters, anchor);
  const insights = buildInsights(data);
  const byKind = Object.fromEntries(insights.map((i) => [i.kind, i]));

  it('devuelve las cuatro recomendaciones con su "¿Cómo lo calculamos?"', () => {
    expect(insights.map((i) => i.kind)).toEqual(['franja', 'hora', 'ociosa', 'recordatorios']);
    insights.forEach((i) => expect(i.calculo.length).toBeGreaterThan(20));
  });

  it('detecta los patrones del dataset: lunes a la mañana, primera hora y miércoles a la tarde', () => {
    expect(byKind['franja']?.body).toMatch(/^Los lunes a la mañana/);
    expect(byKind['franja']?.body).toMatch(/seña previa/);
    expect(['8 h', '9 h']).toContain(byKind['hora']?.metric);
    expect(byKind['hora']?.body).toMatch(/WhatsApp 2 h antes/);
    expect(byKind['ociosa']?.body).toMatch(/^Los miércoles a la tarde/);
    expect(byKind['ociosa']?.body).toMatch(/chequeos preventivos/);
  });

  it('estima el ingreso mensual de los recordatorios y explicita el supuesto', () => {
    const top = [...data.porEspecialidad].sort((a, b) => b.perdida - a.perdida).slice(0, 2);
    const perdida = top[0]!.perdida + top[1]!.perdida;
    const mensual = Math.round(((perdida * REMINDER_RECOVERY) / 30) * 30);
    const r = byKind['recordatorios']!;
    expect(r.metric).toBe(`${formatCurrency(mensual)}/mes`);
    expect(r.body).toContain(`${top[0]!.especialidad} y ${top[1]!.especialidad}`);
    expect(r.calculo).toMatch(/^Suponiendo que los recordatorios evitan 3 de cada 10 faltas/);
  });
});

describe('buildInsights con datos importados', () => {
  it('sin faltas ni volumen no inventa recomendaciones', () => {
    const rows: AppointmentRow[] = [
      { id: 1, paciente: 'P', profesional: 'Dra. A', especialidad: 'Clínica', fecha: '2026-11-02', hora: '10:00', estado: 'completado' },
    ];
    expect(buildInsights(buildDashboard(rows, { ...filters, from: '2026-11-01', to: '2026-11-30' }))).toEqual([]);
  });

  it('usa el precio de cada turno y, si falta, la tarifa por defecto', () => {
    const rows = generateAppointments(anchor, 30, 3).map(({ precio: _p, ...r }, i) => (i % 2 ? r : { ...r, precio: 10000 }));
    const data = buildDashboard(rows, filters);
    const rec = buildInsights(data).find((i) => i.kind === 'recordatorios');
    expect(rec?.body).toContain(formatCurrency(data.porEspecialidad.sort((a, b) => b.perdida - a.perdida)[0]!.perdida + data.porEspecialidad[1]!.perdida));
  });
});
