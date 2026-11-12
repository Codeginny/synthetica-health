const { query } = require('../config/db');

/** WHERE parametrizado a partir de filtros ya validados por Zod. */
function buildWhere({ from, to, doctor, status }) {
  const params = [from, to];
  const clauses = ['fecha BETWEEN $1 AND $2', "estado IN ('pendiente','confirmado','completado','cancelado')"];
  if (doctor) {
    params.push(doctor);
    clauses.push(`profesional = $${params.length}`);
  }
  if (status) {
    params.push(status);
    clauses.push(`estado = $${params.length}`);
  }
  return { where: clauses.join(' AND '), params };
}

/**
 * Contrato: GET /api/analytics/dashboard → DashboardData (client/src/types/analytics.ts).
 * Tasa de ausentismo = cancelados / total del rango. Facturación perdida = suma de `precio_consulta` de los cancelados.
 * Franja: mañana = antes de las 13 h; día ISO 1 = lunes (igual que `buildDashboard` del cliente).
 */
const rate = (part, total) => (total ? Math.round((part / total) * 1000) / 10 : 0);

async function getDashboard(filters) {
  const { where, params } = buildWhere(filters);

  const [kpis, serie, especialidades, horas, franjas, turnos] = await Promise.all([
    query(
      `SELECT COUNT(*)::int AS total,
              COUNT(*) FILTER (WHERE estado = 'pendiente')::int  AS pendientes,
              COUNT(*) FILTER (WHERE estado = 'confirmado')::int AS confirmados,
              COUNT(*) FILTER (WHERE estado = 'completado')::int AS completados,
              COUNT(*) FILTER (WHERE estado = 'cancelado')::int  AS cancelados,
              COALESCE(SUM(precio_consulta) FILTER (WHERE estado IN ('confirmado','completado')), 0)::float AS ingresos,
              COALESCE(SUM(precio_consulta) FILTER (WHERE estado = 'cancelado'), 0)::float AS "facturacionPerdida"
         FROM turnos WHERE ${where}`,
      params,
    ),
    query(
      `SELECT to_char(fecha, 'YYYY-MM-DD') AS fecha,
              COUNT(*)::int AS total,
              COUNT(*) FILTER (WHERE estado = 'completado')::int AS completados,
              COUNT(*) FILTER (WHERE estado = 'cancelado')::int  AS cancelados
         FROM turnos WHERE ${where}
        GROUP BY fecha ORDER BY fecha`,
      params,
    ),
    query(
      `SELECT COALESCE(especialidad, 'Sin especialidad') AS especialidad,
              COUNT(*)::int AS total,
              COUNT(*) FILTER (WHERE estado = 'cancelado')::int AS cancelados,
              COALESCE(SUM(precio_consulta) FILTER (WHERE estado = 'cancelado'), 0)::float AS perdida
         FROM turnos WHERE ${where}
        GROUP BY 1 ORDER BY total DESC`,
      params,
    ),
    query(
      `SELECT EXTRACT(HOUR FROM hora)::int AS hora,
              COUNT(*)::int AS total,
              COUNT(*) FILTER (WHERE estado = 'cancelado')::int AS cancelados
         FROM turnos WHERE ${where}
        GROUP BY 1 ORDER BY 1`,
      params,
    ),
    query(
      `SELECT EXTRACT(ISODOW FROM fecha)::int AS dia,
              CASE WHEN EXTRACT(HOUR FROM hora) < 13 THEN 'mañana' ELSE 'tarde' END AS franja,
              COUNT(*)::int AS total,
              COUNT(*) FILTER (WHERE estado = 'cancelado')::int AS cancelados
         FROM turnos WHERE ${where}
        GROUP BY 1, 2 ORDER BY 1, 2`,
      params,
    ),
    query(
      `SELECT id, COALESCE(paciente_nombre, '—') AS paciente, profesional,
              COALESCE(especialidad, 'Sin especialidad') AS especialidad,
              to_char(fecha, 'YYYY-MM-DD') AS fecha, to_char(hora, 'HH24:MI') AS hora, estado,
              precio_consulta::float AS precio
         FROM turnos WHERE ${where}
        ORDER BY fecha DESC, hora DESC LIMIT 200`,
      params,
    ),
  ]);

  const k = kpis.rows[0];
  // Ocupación = turnos ÷ cantidad de fechas de ese día de semana con turnos (en cualquier franja).
  const fechasPorDia = await query(
    `SELECT EXTRACT(ISODOW FROM fecha)::int AS dia, COUNT(DISTINCT fecha)::int AS dias
       FROM turnos WHERE ${where} GROUP BY 1`,
    params,
  );
  const dias = new Map(fechasPorDia.rows.map((r) => [r.dia, r.dias]));
  return {
    filters,
    kpis: { ...k, tasaAusentismo: rate(k.cancelados, k.total) },
    serie: serie.rows,
    porEspecialidad: especialidades.rows,
    porHora: horas.rows.map((h) => ({ ...h, tasa: rate(h.cancelados, h.total) })),
    porDiaFranja: franjas.rows.map((f) => ({
      ...f,
      tasa: rate(f.cancelados, f.total),
      promedio: Math.round((f.total / (dias.get(f.dia) || 1)) * 10) / 10,
    })),
    turnos: turnos.rows,
  };
}

async function getDoctors() {
  const { rows } = await query('SELECT DISTINCT profesional FROM turnos ORDER BY profesional');
  return rows.map((r) => r.profesional);
}

module.exports = { getDashboard, getDoctors };
