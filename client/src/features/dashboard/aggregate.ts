import type {
  AppointmentRow,
  DashboardData,
  DashboardFilters,
  DailyPoint,
  DayShiftPoint,
  Franja,
  HourPoint,
  SpecialtyPoint,
} from '@/types/analytics';

/** Tarifa por defecto cuando el turno no trae precio (igual que `turnos.precio_consulta` en la base). */
export const CONSULTATION_PRICE = 30000;
/** La mañana termina a las 13 h; desde ahí es tarde. */
export const AFTERNOON_FROM = 13;
export const DAY_NAMES = ['', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'] as const;

export const priceOf = (r: AppointmentRow): number => r.precio ?? CONSULTATION_PRICE;
export const rate = (part: number, total: number): number => (total ? Math.round((part / total) * 1000) / 10 : 0);
export const hourOf = (hora: string): number => Number(hora.slice(0, 2));
export const franjaOf = (hora: string): Franja => (hourOf(hora) < AFTERNOON_FROM ? 'mañana' : 'tarde');
/** Día ISO (1 = lunes) de una fecha `AAAA-MM-DD`, sin depender de la zona horaria. */
export const isoWeekday = (fecha: string): number => new Date(`${fecha}T00:00:00Z`).getUTCDay() || 7;

/** Horas cuya tasa de faltas supera en 25% el promedio general (con muestra mínima de 5 turnos). */
export const criticalHours = (porHora: HourPoint[], promedio: number): number[] =>
  porHora.filter((h) => h.total >= 5 && h.cancelados > 0 && h.tasa >= promedio * 1.25).map((h) => h.hora);

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
  const byHour = new Map<number, HourPoint>();
  const byShift = new Map<string, DayShiftPoint>();
  const datesByWeekday = new Map<number, Set<string>>();
  let ingresos = 0;
  let facturacionPerdida = 0;

  for (const r of rows) {
    const cancel = r.estado === 'cancelado';
    if (cancel) facturacionPerdida += priceOf(r);
    if (r.estado === 'completado' || r.estado === 'confirmado') ingresos += priceOf(r);

    const d = byDay.get(r.fecha) ?? { fecha: r.fecha, total: 0, completados: 0, cancelados: 0 };
    d.total++;
    if (r.estado === 'completado') d.completados++;
    if (cancel) d.cancelados++;
    byDay.set(r.fecha, d);

    const s = bySpec.get(r.especialidad) ?? { especialidad: r.especialidad, total: 0, cancelados: 0, perdida: 0 };
    s.total++;
    if (cancel) {
      s.cancelados++;
      s.perdida += priceOf(r);
    }
    bySpec.set(r.especialidad, s);

    const hora = hourOf(r.hora);
    const h = byHour.get(hora) ?? { hora, total: 0, cancelados: 0, tasa: 0 };
    h.total++;
    if (cancel) h.cancelados++;
    byHour.set(hora, h);

    const dia = isoWeekday(r.fecha);
    const franja = franjaOf(r.hora);
    const f = byShift.get(`${dia}-${franja}`) ?? { dia, franja, total: 0, cancelados: 0, tasa: 0, promedio: 0 };
    f.total++;
    if (cancel) f.cancelados++;
    byShift.set(`${dia}-${franja}`, f);
    datesByWeekday.set(dia, (datesByWeekday.get(dia) ?? new Set<string>()).add(r.fecha));
  }

  for (const h of byHour.values()) h.tasa = rate(h.cancelados, h.total);
  for (const f of byShift.values()) {
    f.tasa = rate(f.cancelados, f.total);
    f.promedio = Math.round((f.total / (datesByWeekday.get(f.dia)?.size ?? 1)) * 10) / 10;
  }

  return {
    filters,
    kpis: {
      total: rows.length,
      pendientes: count('pendiente'),
      confirmados: count('confirmado'),
      completados,
      cancelados,
      tasaAusentismo: rate(cancelados, rows.length),
      ingresos,
      facturacionPerdida,
    },
    serie: [...byDay.values()].sort((a, b) => a.fecha.localeCompare(b.fecha)),
    porEspecialidad: [...bySpec.values()].sort((a, b) => b.total - a.total),
    porHora: [...byHour.values()].sort((a, b) => a.hora - b.hora),
    porDiaFranja: [...byShift.values()].sort((a, b) => a.dia - b.dia || a.franja.localeCompare(b.franja)),
    turnos: [...rows].sort((a, b) => (b.fecha + b.hora).localeCompare(a.fecha + a.hora)).slice(0, 200),
  };
}
