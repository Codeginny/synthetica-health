import type { AppointmentRow, AppointmentStatus, AssistantAnswer, DashboardData, DashboardFilters } from '@/types/analytics';
import { APPOINTMENT_STATUSES } from '@/types/analytics';
import { buildDashboard } from '@/features/dashboard/aggregate';

const DOCTORS = [
  ['Dra. Lucía Paz', 'Cardiología'],
  ['Dr. Martín Sosa', 'Pediatría'],
  ['Dra. Ana Ruiz', 'Dermatología'],
  ['Dr. Pablo Díaz', 'Traumatología'],
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

export function generateAppointments(anchor: Date, days = 60, seed = 7): AppointmentRow[] {
  const rand = mulberry32(seed);
  const rows: AppointmentRow[] = [];
  let id = 1;
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(anchor);
    d.setDate(d.getDate() - i);
    const fecha = d.toISOString().slice(0, 10);
    const perDay = 4 + Math.floor(rand() * 8);
    for (let j = 0; j < perDay; j++) {
      const [profesional, especialidad] = DOCTORS[Math.floor(rand() * DOCTORS.length)]!;
      const r = rand();
      const estado: AppointmentStatus = r < 0.18 ? 'cancelado' : r < 0.3 ? 'pendiente' : r < 0.55 ? 'confirmado' : 'completado';
      rows.push({
        id: id++,
        paciente: PATIENTS[Math.floor(rand() * PATIENTS.length)]!,
        profesional,
        especialidad,
        fecha,
        hora: `${String(8 + Math.floor(rand() * 10)).padStart(2, '0')}:${rand() < 0.5 ? '00' : '30'}`,
        estado,
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

/** Respuesta determinista del asistente para modo demo (sin API key). */
export function mockAssistant(filters: DashboardFilters): AssistantAnswer {
  const { kpis, porEspecialidad } = mockDashboard(filters);
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
