export const APPOINTMENT_STATUSES = ['pendiente', 'confirmado', 'completado', 'cancelado'] as const;
export type AppointmentStatus = (typeof APPOINTMENT_STATUSES)[number];

/** ISO date `YYYY-MM-DD`. */
export type IsoDate = string;

export interface DashboardFilters {
  from: IsoDate;
  to: IsoDate;
  doctor: string | null;
  status: AppointmentStatus | null;
}

export interface DashboardKpis {
  total: number;
  pendientes: number;
  confirmados: number;
  completados: number;
  cancelados: number;
  /** Porcentaje 0–100. */
  tasaAusentismo: number;
  ingresos: number;
}

export interface DailyPoint {
  fecha: IsoDate;
  total: number;
  completados: number;
  cancelados: number;
}

export interface SpecialtyPoint {
  especialidad: string;
  total: number;
  cancelados: number;
}

export interface AppointmentRow {
  id: number;
  paciente: string;
  profesional: string;
  especialidad: string;
  fecha: IsoDate;
  hora: string;
  estado: AppointmentStatus;
}

export interface DashboardData {
  filters: DashboardFilters;
  kpis: DashboardKpis;
  serie: DailyPoint[];
  porEspecialidad: SpecialtyPoint[];
  turnos: AppointmentRow[];
}

export interface AssistantTable {
  columns: string[];
  rows: (string | number)[][];
}

export interface AssistantAnswer {
  summary: string;
  highlights: { label: string; value: string }[];
  table: AssistantTable | null;
}
