import type { DashboardData, DayShiftPoint } from '@/types/analytics';
import { formatCurrency } from '@/lib/dates';
import { criticalHours, DAY_NAMES } from './aggregate';

/** Supuesto: los recordatorios evitan 3 de cada 10 faltas. */
export const REMINDER_RECOVERY = 0.3;
/** Muestra mínima para no recomendar sobre una franja con dos turnos. */
const MIN_SHIFT_SAMPLE = 8;

export type InsightKind = 'franja' | 'hora' | 'ociosa' | 'recordatorios';

export interface Insight {
  kind: InsightKind;
  title: string;
  /** Recomendación en segunda persona, con los números del período. */
  body: string;
  /** Dato destacado (p. ej. "24,5%" o "$ 180.000/mes"). */
  metric: string;
  /** "¿Cómo lo calculamos?": fórmula y supuestos usados. */
  calculo: string;
}

const num = (n: number) => n.toLocaleString('es-AR', { maximumFractionDigits: 1 });
const pct = (n: number) => `${num(n)}%`;
const turnos = (n: number) => `${num(n)} ${n === 1 ? 'turno' : 'turnos'}`;
const dayPlural = (dia: number) => {
  const name = (DAY_NAMES[dia] ?? '').toLowerCase();
  return dia >= 6 ? `${name}s` : name;
};
const shiftLabel = (s: DayShiftPoint) => `los ${dayPlural(s.dia)} a la ${s.franja}`;
const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

const daysInRange = (from: string, to: string) =>
  Math.max(1, Math.round((Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) / 86_400_000) + 1);

/**
 * Recomendaciones de negocio a partir del dashboard ya agregado.
 * Función pura: sirve igual para datos de ejemplo, Excel importado o la API real.
 */
export function buildInsights({ filters, kpis, porEspecialidad, porHora, porDiaFranja }: DashboardData): Insight[] {
  const insights: Insight[] = [];
  const promedio = kpis.tasaAusentismo;
  const shifts = porDiaFranja.filter((s) => s.total >= MIN_SHIFT_SAMPLE);

  // Se ordena por faltas "de más" respecto del promedio: pesa la tasa y también el volumen.
  const excess = (p: { total: number; cancelados: number }) => p.cancelados - (p.total * promedio) / 100;
  const worstShift = [...shifts].sort((a, b) => excess(b) - excess(a))[0];
  if (worstShift && worstShift.cancelados > 0 && worstShift.tasa > promedio) {
    insights.push({
      kind: 'franja',
      title: 'Franja con más ausentismo',
      metric: pct(worstShift.tasa),
      body: `${capitalize(shiftLabel(worstShift))} falta el ${pct(worstShift.tasa)} de tus pacientes (tu promedio es ${pct(promedio)}). Pedí una seña previa para reservar en esa franja o sumá sobreturnos controlados para no perder la agenda.`,
      calculo: `Tasa = turnos cancelados ÷ turnos dados en esa franja: ${worstShift.cancelados} de ${worstShift.total}. Mañana = antes de las 13 h; tarde = desde las 13 h. Se elige la franja con más faltas por encima de tu promedio (con al menos ${MIN_SHIFT_SAMPLE} turnos).`,
    });
  }

  const critical = criticalHours(porHora, promedio);
  const worstHour = porHora.filter((h) => critical.includes(h.hora)).sort((a, b) => excess(b) - excess(a))[0];
  if (worstHour) {
    const otras = critical.filter((h) => h !== worstHour.hora).map((h) => `${h} h`);
    insights.push({
      kind: 'hora',
      title: 'Hora crítica',
      metric: `${worstHour.hora} h`,
      body: `A las ${worstHour.hora} h se pierde el ${pct(worstHour.tasa)} de los turnos${otras.length ? ` (también están por encima del promedio: ${otras.join(', ')})` : ''}. Mandá recordatorios por WhatsApp 2 h antes u ofrecé esos turnos por telemedicina.`,
      calculo: `Tasa por hora = cancelados ÷ turnos que empiezan en esa hora: ${worstHour.cancelados} de ${worstHour.total}. Una hora es crítica si supera en 25% tu promedio de ${pct(promedio)} y tiene al menos 5 turnos; se muestra la que más faltas suma por encima del promedio.`,
    });
  }

  // Para la ocupación no se exige muestra mínima: el poco volumen es justamente la señal.
  if (porDiaFranja.length >= 2) {
    const idle = [...porDiaFranja].sort((a, b) => a.promedio - b.promedio)[0]!;
    const rest = porDiaFranja.filter((s) => s !== idle);
    const restAvg = rest.reduce((acc, s) => acc + s.promedio, 0) / rest.length;
    if (idle.promedio < restAvg * 0.75) {
      insights.push({
        kind: 'ociosa',
        title: 'Franja ociosa',
        metric: `${turnos(idle.promedio)}/día`,
        body: `${capitalize(shiftLabel(idle))} tenés en promedio ${turnos(idle.promedio)} por día, contra ${num(restAvg)} en el resto de la semana. Usá ese hueco para una campaña de chequeos preventivos o controles anuales.`,
        calculo: `Ocupación = turnos de la franja ÷ cantidad de ${dayPlural(idle.dia)} con turnos en el período (${idle.total} turnos). Se compara con el promedio simple de las demás franjas.`,
      });
    }
  }

  const criticas = porEspecialidad.filter((e) => e.perdida > 0).sort((a, b) => b.perdida - a.perdida).slice(0, 2);
  if (criticas.length) {
    const dias = daysInRange(filters.from, filters.to);
    const perdida = criticas.reduce((acc, e) => acc + e.perdida, 0);
    const mensual = Math.round(((perdida * REMINDER_RECOVERY) / dias) * 30);
    const nombres = criticas.map((e) => e.especialidad).join(' y ');
    insights.push({
      kind: 'recordatorios',
      title: 'Recordatorios en especialidades críticas',
      metric: `${formatCurrency(mensual)}/mes`,
      body: `${nombres} ${criticas.length > 1 ? 'concentran' : 'concentra'} ${formatCurrency(perdida)} de facturación perdida por faltas. Si activás recordatorios automáticos ahí, podrías sumar unos ${formatCurrency(mensual)} por mes.`,
      calculo: `Suponiendo que los recordatorios evitan 3 de cada 10 faltas: ${formatCurrency(perdida)} perdidos en ${dias} días × ${REMINDER_RECOVERY * 100}% ÷ ${dias} × 30 días. La pérdida usa el precio de cada turno (o la tarifa por defecto si no lo tiene).`,
    });
  }

  return insights;
}
