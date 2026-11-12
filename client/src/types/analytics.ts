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
  /** Suma del precio de los turnos cancelados (faltas). */
  facturacionPerdida: number;
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
  /** $ ARS que no se facturaron por faltas. */
  perdida: number;
}

export interface HourPoint {
  /** Hora del día, 0–23. */
  hora: number;
  total: number;
  cancelados: number;
  /** Porcentaje 0–100. */
  tasa: number;
}

export const FRANJAS = ['mañana', 'tarde'] as const;
export type Franja = (typeof FRANJAS)[number];

export interface DayShiftPoint {
  /** Día ISO: 1 = lunes … 7 = domingo. */
  dia: number;
  franja: Franja;
  total: number;
  cancelados: number;
  /** Porcentaje 0–100. */
  tasa: number;
  /** Turnos promedio por día en esa franja (mide la ocupación). */
  promedio: number;
}

export interface AppointmentRow {
  id: number;
  paciente: string;
  profesional: string;
  especialidad: string;
  fecha: IsoDate;
  hora: string;
  estado: AppointmentStatus;
  /** $ ARS; si falta se usa la tarifa por defecto. */
  precio?: number;
}

export interface DashboardData {
  filters: DashboardFilters;
  kpis: DashboardKpis;
  serie: DailyPoint[];
  porEspecialidad: SpecialtyPoint[];
  porHora: HourPoint[];
  porDiaFranja: DayShiftPoint[];
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
