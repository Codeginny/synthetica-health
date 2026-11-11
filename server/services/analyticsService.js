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
 * Tasa de ausentismo = cancelados / total del rango.
 */
async function getDashboard(filters) {
  const { where, params } = buildWhere(filters);

  const [kpis, serie, especialidades, turnos] = await Promise.all([
    query(
      `SELECT COUNT(*)::int AS total,
              COUNT(*) FILTER (WHERE estado = 'pendiente')::int  AS pendientes,
              COUNT(*) FILTER (WHERE estado = 'confirmado')::int AS confirmados,
              COUNT(*) FILTER (WHERE estado = 'completado')::int AS completados,
              COUNT(*) FILTER (WHERE estado = 'cancelado')::int  AS cancelados,
              COALESCE(SUM(precio_consulta) FILTER (WHERE estado IN ('confirmado','completado')), 0)::float AS ingresos
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
              COUNT(*) FILTER (WHERE estado = 'cancelado')::int AS cancelados
         FROM turnos WHERE ${where}
        GROUP BY 1 ORDER BY total DESC`,
      params,
    ),
    query(
      `SELECT id, COALESCE(paciente_nombre, '—') AS paciente, profesional,
              COALESCE(especialidad, 'Sin especialidad') AS especialidad,
              to_char(fecha, 'YYYY-MM-DD') AS fecha, to_char(hora, 'HH24:MI') AS hora, estado
         FROM turnos WHERE ${where}
        ORDER BY fecha DESC, hora DESC LIMIT 200`,
      params,
    ),
  ]);

  const k = kpis.rows[0];
  return {
    filters,
    kpis: { ...k, tasaAusentismo: k.total ? Math.round((k.cancelados / k.total) * 1000) / 10 : 0 },
    serie: serie.rows,
    porEspecialidad: especialidades.rows,
    turnos: turnos.rows,
  };
}

async function getDoctors() {
  const { rows } = await query('SELECT DISTINCT profesional FROM turnos ORDER BY profesional');
  return rows.map((r) => r.profesional);
}

module.exports = { getDashboard, getDoctors };
