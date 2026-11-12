import type { AppointmentRow, AppointmentStatus } from '@/types/analytics';

export const MAX_ROWS = 20_000;

/** Columnas aceptadas (encabezados sin acentos, en minúscula, espacios → _). */
const COLUMN_ALIASES = {
  paciente: ['paciente', 'paciente_nombre', 'nombre_paciente', 'nombre', 'paciente_nombre_completo'],
  profesional: ['profesional', 'medico', 'medica', 'doctor', 'doctora', 'profesional_nombre'],
  especialidad: ['especialidad', 'servicio', 'area'],
  fecha: ['fecha', 'fecha_turno', 'dia'],
  hora: ['hora', 'hora_turno', 'horario'],
  estado: ['estado', 'estado_turno', 'status'],
  precio: ['precio', 'precio_consulta', 'valor', 'importe', 'arancel', 'monto', 'tarifa'],
} as const;

type Field = keyof typeof COLUMN_ALIASES;
export const REQUIRED_FIELDS: Field[] = ['profesional', 'fecha', 'estado'];

const STATUS_ALIASES: Record<string, AppointmentStatus> = {
  pendiente: 'pendiente', pending: 'pendiente', reservado: 'pendiente', solicitado: 'pendiente',
  confirmado: 'confirmado', confirmada: 'confirmado', confirmed: 'confirmado',
  completado: 'completado', completada: 'completado', atendido: 'completado', atendida: 'completado', realizado: 'completado', presente: 'completado',
  cancelado: 'cancelado', cancelada: 'cancelado', ausente: 'cancelado', no_asistio: 'cancelado', no_show: 'cancelado', inasistencia: 'cancelado',
};

export interface ImportError {
  /** Fila del archivo (1 = encabezado). */
  row: number;
  message: string;
}

export interface ImportResult {
  rows: AppointmentRow[];
  errors: ImportError[];
  /** Columnas obligatorias que no se encontraron. */
  missingColumns: Field[];
  totalRows: number;
  range: { from: string; to: string } | null;
}

export const normalizeKey = (s: string): string =>
  s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '');

const pad = (n: number) => String(n).padStart(2, '0');
const iso = (y: number, m: number, d: number): string | null => {
  const date = new Date(Date.UTC(y, m - 1, d));
  return date.getUTCFullYear() === y && date.getUTCMonth() === m - 1 && date.getUTCDate() === d ? `${y}-${pad(m)}-${pad(d)}` : null;
};

/** Fecha desde Date, serial de Excel, `AAAA-MM-DD` o `DD/MM/AAAA` (formato argentino). */
export function parseDate(v: unknown): string | null {
  if (v instanceof Date && !Number.isNaN(v.getTime())) return iso(v.getUTCFullYear(), v.getUTCMonth() + 1, v.getUTCDate());
  if (typeof v === 'number' && v > 20000 && v < 80000) {
    const d = new Date(Date.UTC(1899, 11, 30) + Math.floor(v) * 86_400_000);
    return iso(d.getUTCFullYear(), d.getUTCMonth() + 1, d.getUTCDate());
  }
  if (typeof v !== 'string') return null;
  const s = v.trim();
  let m = /^(\d{4})-(\d{1,2})-(\d{1,2})/.exec(s);
  if (m) return iso(+m[1]!, +m[2]!, +m[3]!);
  m = /^(\d{1,2})[/.-](\d{1,2})[/.-](\d{2}|\d{4})$/.exec(s);
  if (m) {
    const y = m[3]!.length === 2 ? 2000 + +m[3]! : +m[3]!;
    return iso(y, +m[2]!, +m[1]!);
  }
  return null;
}

/** Hora desde `9:30`, `09:30:00`, fracción de día de Excel o Date. */
export function parseTime(v: unknown): string | null {
  if (v === null || v === undefined || v === '') return '00:00';
  if (v instanceof Date && !Number.isNaN(v.getTime())) return `${pad(v.getUTCHours())}:${pad(v.getUTCMinutes())}`;
  if (typeof v === 'number' && v >= 0 && v < 1) {
    const mins = Math.round(v * 24 * 60);
    return `${pad(Math.floor(mins / 60) % 24)}:${pad(mins % 60)}`;
  }
  const m = /^(\d{1,2})[:.hH](\d{2})/.exec(String(v).trim());
  if (!m || +m[1]! > 23 || +m[2]! > 59) return null;
  return `${pad(+m[1]!)}:${m[2]}`;
}

export function parseStatus(v: unknown): AppointmentStatus | null {
  return typeof v === 'string' ? (STATUS_ALIASES[normalizeKey(v)] ?? null) : null;
}

/** Precio desde número o texto argentino (`$ 45.000`, `45.000,50`, `45000`). `undefined` si la celda está vacía. */
export function parsePrice(v: unknown): number | null | undefined {
  if (v === null || v === undefined || v === '') return undefined;
  if (typeof v === 'number') return Number.isFinite(v) && v >= 0 ? v : null;
  let s = String(v).replace(/[$\s]|ARS/gi, '');
  if (s === '') return undefined;
  if (s.includes(',')) s = s.replace(/\./g, '').replace(',', '.');
  else if (/^\d{1,3}(\.\d{3})+$/.test(s)) s = s.replace(/\./g, '');
  const n = Number(s);
  return Number.isFinite(n) && n >= 0 ? n : null;
}

const text = (v: unknown): string => (v === null || v === undefined ? '' : String(v).trim());

/**
 * Convierte una matriz (encabezado + filas) de Excel/CSV en turnos tipados.
 * Las filas inválidas se descartan y se informan; las válidas se importan igual.
 */
export function normalizeSheet(matrix: unknown[][]): ImportResult {
  const [header = [], ...body] = matrix.filter((r) => r.some((c) => text(c) !== ''));
  const index = new Map<Field, number>();
  header.forEach((h, i) => {
    const key = normalizeKey(text(h));
    for (const [field, aliases] of Object.entries(COLUMN_ALIASES) as [Field, readonly string[]][]) {
      if (!index.has(field) && aliases.includes(key)) index.set(field, i);
    }
  });

  const missingColumns = REQUIRED_FIELDS.filter((f) => !index.has(f));
  if (missingColumns.length) return { rows: [], errors: [], missingColumns, totalRows: body.length, range: null };

  const get = (r: unknown[], f: Field) => (index.has(f) ? r[index.get(f)!] : undefined);
  const rows: AppointmentRow[] = [];
  const errors: ImportError[] = [];

  body.slice(0, MAX_ROWS).forEach((r, i) => {
    const rowNumber = i + 2;
    const profesional = text(get(r, 'profesional'));
    const fecha = parseDate(get(r, 'fecha'));
    const hora = parseTime(get(r, 'hora'));
    const estado = parseStatus(get(r, 'estado'));
    const precio = parsePrice(get(r, 'precio'));
    const problems = [
      !profesional && 'falta el profesional',
      !fecha && `fecha inválida (“${text(get(r, 'fecha'))}”)`,
      !hora && `hora inválida (“${text(get(r, 'hora'))}”)`,
      !estado && `estado desconocido (“${text(get(r, 'estado'))}”)`,
      precio === null && `precio inválido (“${text(get(r, 'precio'))}”)`,
    ].filter(Boolean);
    if (problems.length || !fecha || !hora || !estado) {
      errors.push({ row: rowNumber, message: problems.join(', ') });
      return;
    }
    rows.push({
      id: rows.length + 1,
      paciente: text(get(r, 'paciente')) || 'Sin nombre',
      profesional,
      especialidad: text(get(r, 'especialidad')) || 'Sin especialidad',
      fecha,
      hora,
      estado,
      ...(precio === undefined || precio === null ? {} : { precio }),
    });
  });

  if (body.length > MAX_ROWS) errors.push({ row: MAX_ROWS + 2, message: `se importaron sólo las primeras ${MAX_ROWS} filas` });

  const fechas = rows.map((r) => r.fecha).sort();
  return {
    rows,
    errors,
    missingColumns,
    totalRows: body.length,
    range: fechas.length ? { from: fechas[0]!, to: fechas.at(-1)! } : null,
  };
}
