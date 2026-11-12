import { createRequire } from 'node:module';
import { beforeAll, describe, expect, it } from 'vitest';

const require = createRequire(import.meta.url);
const calls = [];

/** Respuestas falsas por consulta: se reconoce cada SELECT por su GROUP BY. */
function fakeQuery(text, params) {
  calls.push({ text, params });
  if (text.includes('AS "facturacionPerdida"'))
    return { rows: [{ total: 10, pendientes: 1, confirmados: 2, completados: 4, cancelados: 3, ingresos: 240000, facturacionPerdida: 120000 }] };
  if (text.includes('EXTRACT(HOUR FROM hora)::int AS hora')) return { rows: [{ hora: 8, total: 4, cancelados: 2 }, { hora: 18, total: 6, cancelados: 1 }] };
  if (text.includes("'mañana'")) return { rows: [{ dia: 1, franja: 'mañana', total: 6, cancelados: 3 }] };
  if (text.includes('COUNT(DISTINCT fecha)')) return { rows: [{ dia: 1, dias: 4 }] };
  return { rows: [] };
}

let service;
beforeAll(() => {
  const dbPath = require.resolve('../config/db');
  require.cache[dbPath] = { id: dbPath, filename: dbPath, loaded: true, exports: { query: fakeQuery } };
  service = require('../services/analyticsService');
});

describe('getDashboard', () => {
  it('calcula pérdida, tasa por hora y ocupación por franja con SQL parametrizado', async () => {
    const d = await service.getDashboard({ from: '2026-11-01', to: '2026-11-30', doctor: "Dra. O'Paz", status: null });

    expect(d.kpis).toMatchObject({ facturacionPerdida: 120000, tasaAusentismo: 30 });
    expect(d.porHora).toEqual([
      { hora: 8, total: 4, cancelados: 2, tasa: 50 },
      { hora: 18, total: 6, cancelados: 1, tasa: 16.7 },
    ]);
    expect(d.porDiaFranja).toEqual([{ dia: 1, franja: 'mañana', total: 6, cancelados: 3, tasa: 50, promedio: 1.5 }]);

    for (const c of calls) {
      expect(c.params).toEqual(['2026-11-01', '2026-11-30', "Dra. O'Paz"]);
      expect(c.text).not.toContain("O'Paz");
      expect(c.text).toContain('profesional = $3');
    }
  });
});
