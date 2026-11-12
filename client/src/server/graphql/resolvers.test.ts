/** @jest-environment node */
import { graphql } from 'graphql';

jest.mock('server-only', () => ({}));
jest.mock('@/server/backend', () => {
  const { mockDashboard, MOCK_DOCTORS } = jest.requireActual('@/mocks/dashboard');
  return { backend: { dashboard: jest.fn(async (f) => mockDashboard(f, new Date('2026-11-10T12:00:00'))), doctors: jest.fn(async () => MOCK_DOCTORS) } };
});

import { schema } from './schema';
import { rootValue } from './resolvers';

const run = (source: string, variableValues?: Record<string, unknown>) => graphql({ schema, source, rootValue, variableValues: variableValues ?? null });

describe('GraphQL schema', () => {
  it('resuelve KPIs y limita turnos por argumento', async () => {
    const res = await run(
      `query($f: DashboardFiltersInput!) { dashboard(filters: $f) { kpis { total cancelados } turnos(limit: 3) { id estado } } }`,
      { f: { from: '2026-11-01', to: '2026-11-10', status: 'cancelado' } },
    );
    expect(res.errors).toBeUndefined();
    const d = res.data?.['dashboard'] as { kpis: { total: number; cancelados: number }; turnos: { estado: string }[] };
    expect(d.kpis.total).toBe(d.kpis.cancelados);
    expect(d.turnos).toHaveLength(3);
    expect(d.turnos.every((t) => t.estado === 'cancelado')).toBe(true);
  });

  it('expone las agregaciones de negocio: pérdida, horas y franjas', async () => {
    const res = await run(
      `query($f: DashboardFiltersInput!) { dashboard(filters: $f) {
        kpis { facturacionPerdida }
        porEspecialidad { especialidad perdida }
        porHora { hora tasa }
        porDiaFranja { dia franja promedio }
        turnos(limit: 1) { precio }
      } }`,
      { f: { from: '2026-10-12', to: '2026-11-10' } },
    );
    expect(res.errors).toBeUndefined();
    const d = res.data?.['dashboard'] as {
      kpis: { facturacionPerdida: number };
      porEspecialidad: { perdida: number }[];
      porHora: { hora: number }[];
      porDiaFranja: { dia: number; franja: string }[];
      turnos: { precio: number }[];
    };
    expect(d.kpis.facturacionPerdida).toBe(d.porEspecialidad.reduce((acc, e) => acc + e.perdida, 0));
    expect(d.porHora[0]?.hora).toBe(8);
    expect(d.porDiaFranja.every((s) => s.dia <= 5 && ['mañana', 'tarde'].includes(s.franja))).toBe(true);
    expect(d.turnos[0]?.precio).toBeGreaterThan(0);
  });

  it('rechaza estados fuera del enum', async () => {
    const res = await run(`{ dashboard(filters: { from: "2026-11-01", to: "2026-11-10", status: borrado }) { kpis { total } } }`);
    expect(res.errors?.[0]?.message).toMatch(/borrado/);
  });

  it('rechaza rangos invertidos con BAD_USER_INPUT', async () => {
    const res = await run(`{ dashboard(filters: { from: "2026-11-10", to: "2026-11-01" }) { kpis { total } } }`);
    expect(res.errors?.[0]?.extensions?.['code']).toBe('BAD_USER_INPUT');
  });

  it('lista profesionales', async () => {
    const res = await run(`{ doctors }`);
    expect(res.data?.['doctors']).toHaveLength(4);
  });
});
