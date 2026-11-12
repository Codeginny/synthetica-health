import type { AppointmentRow, AppointmentStatus, AssistantAnswer, DashboardData, DashboardFilters } from '@/types/analytics';
import { APPOINTMENT_STATUSES } from '@/types/analytics';
import { buildDashboard } from '@/features/dashboard/aggregate';

/** Profesional, especialidad y valor de la consulta en $ ARS. */
const DOCTORS = [
  ['Dra. Lucía Paz', 'Cardiología', 45000],
  ['Dr. Martín Sosa', 'Pediatría', 28000],
  ['Dra. Ana Ruiz', 'Dermatología', 38000],
  ['Dr. Pablo Díaz', 'Traumatología', 42000],
] as const;

const PATIENTS = ['Sofía Gómez', 'Juan Pérez', 'Carla Méndez', 'Diego López', 'Valeria Torres', 'Tomás Herrera'];

/** PRNG determinista: mismas filas en Storybook, tests y modo demo. */
function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Probabilidad de falta según patrones habituales de consultorio: más ausencias a primera hora
 * y los lunes a la mañana, menos en el último turno de la tarde.
 */
function noShowChance(weekday: number, hour: number, especialidad: string): number {
  let p = 0.07;
  if (hour <= 9) p += 0.2;
  if (weekday === 1 && hour < 13) p += 0.18;
  if (hour >= 18) p -= 0.05;
  if (especialidad === 'Dermatología') p += 0.05;
  return p;
}

export function generateAppointments(anchor: Date, days = 60, seed = 7): AppointmentRow[] {
  const rand = mulberry32(seed);
  const rows: AppointmentRow[] = [];
  let id = 1;
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(anchor);
    d.setDate(d.getDate() - i);
    const fecha = d.toISOString().slice(0, 10);
    const weekday = new Date(`${fecha}T00:00:00Z`).getUTCDay();
    if (weekday === 0 || weekday === 6) continue; // sólo días hábiles
    const perDay = 14 + Math.floor(rand() * 7);
    for (let j = 0; j < perDay; j++) {
      const hour = 8 + Math.floor(rand() * 11);
      // Miércoles a la tarde la agenda queda casi vacía.
      if (weekday === 3 && hour >= 13 && rand() < 0.75) continue;
      const [profesional, especialidad, precio] = DOCTORS[Math.floor(rand() * DOCTORS.length)]!;
      const r = rand();
      const noShow = noShowChance(weekday, hour, especialidad);
      const estado: AppointmentStatus =
        r < noShow ? 'cancelado' : r < noShow + 0.12 ? 'pendiente' : r < noShow + 0.37 ? 'confirmado' : 'completado';
      rows.push({
        id: id++,
        paciente: PATIENTS[Math.floor(rand() * PATIENTS.length)]!,
        profesional,
        especialidad,
        fecha,
        hora: `${String(hour).padStart(2, '0')}:${rand() < 0.5 ? '00' : '30'}`,
        estado,
        precio,
      });
    }
  }
  return rows;
}

export const MOCK_DOCTORS: string[] = DOCTORS.map(([name]) => name);
export { APPOINTMENT_STATUSES };

export function mockDashboard(filters: DashboardFilters, anchor = new Date()): DashboardData {
  return buildDashboard(generateAppointments(anchor), filters);
}

/** Respuesta estructurada calculada localmente (modo demo o datos importados). */
export function answerFromDashboard({ filters, kpis, porEspecialidad }: DashboardData): AssistantAnswer {
  const top = [...porEspecialidad].sort((a, b) => b.cancelados - a.cancelados)[0];
  return {
    summary: top
      ? `Entre ${filters.from} y ${filters.to}, ${top.especialidad} concentra más cancelaciones (${top.cancelados}). El ausentismo general es ${kpis.tasaAusentismo}%.`
      : 'No hay turnos en el rango seleccionado.',
    highlights: [
      { label: 'Ausentismo', value: `${kpis.tasaAusentismo}%` },
      { label: 'Cancelados', value: String(kpis.cancelados) },
      { label: 'Turnos', value: String(kpis.total) },
    ],
    table: {
      columns: ['Especialidad', 'Turnos', 'Cancelados'],
      rows: porEspecialidad.map((e) => [e.especialidad, e.total, e.cancelados]),
    },
  };
}

/** Respuesta determinista del asistente para modo demo (sin clave del asistente). */
export const mockAssistant = (filters: DashboardFilters): AssistantAnswer => answerFromDashboard(mockDashboard(filters));
