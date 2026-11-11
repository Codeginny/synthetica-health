import { normalizeSheet, parseDate, parseStatus, parseTime } from './normalize';

describe('parseDate', () => {
  it.each([
    ['2026-11-05', '2026-11-05'],
    ['05/11/2026', '2026-11-05'],
    ['5/11/26', '2026-11-05'],
    [46331, '2026-11-05'], // serial de Excel
    [new Date(Date.UTC(2026, 10, 5)), '2026-11-05'],
  ])('%p → %p', (input, expected) => expect(parseDate(input)).toBe(expected));

  it('rechaza fechas imposibles', () => {
    expect(parseDate('31/02/2026')).toBeNull();
    expect(parseDate('mañana')).toBeNull();
  });
});

describe('parseTime y parseStatus', () => {
  it('normaliza horas', () => {
    expect(parseTime('9:30')).toBe('09:30');
    expect(parseTime('14:05:00')).toBe('14:05');
    expect(parseTime(0.5)).toBe('12:00');
    expect(parseTime('')).toBe('00:00');
    expect(parseTime('25:00')).toBeNull();
  });

  it('acepta sinónimos y acentos', () => {
    expect(parseStatus('Atendido')).toBe('completado');
    expect(parseStatus('No asistió')).toBe('cancelado');
    expect(parseStatus('CONFIRMADA')).toBe('confirmado');
    expect(parseStatus('borrado')).toBeNull();
  });
});

describe('normalizeSheet', () => {
  it('mapea encabezados con acentos, importa filas válidas e informa las inválidas', () => {
    const res = normalizeSheet([
      ['Paciente', 'Médico', 'Especialidad', 'Fecha', 'Hora', 'Estado', 'Obra social'],
      ['Ana', 'Dra. Paz', 'Cardiología', '03/11/2026', '9:00', 'atendido', 'OSDE'],
      ['Juan', 'Dra. Paz', 'Cardiología', '2026-11-01', '10:00', 'ausente', ''],
      ['', '', '', '', '', '', ''],
      ['Luis', 'Dr. Sosa', 'Pediatría', '32/11/2026', '11:00', 'confirmado', ''],
    ]);
    expect(res.missingColumns).toEqual([]);
    expect(res.rows).toHaveLength(2);
    expect(res.rows[0]).toMatchObject({ paciente: 'Ana', profesional: 'Dra. Paz', fecha: '2026-11-03', hora: '09:00', estado: 'completado' });
    expect(res.errors).toEqual([{ row: 4, message: expect.stringContaining('fecha inválida') }]);
    expect(res.range).toEqual({ from: '2026-11-01', to: '2026-11-03' });
  });

  it('informa columnas obligatorias faltantes', () => {
    const res = normalizeSheet([['paciente', 'fecha'], ['Ana', '2026-11-01']]);
    expect(res.missingColumns).toEqual(['profesional', 'estado']);
    expect(res.rows).toEqual([]);
  });

  it('completa opcionales vacíos', () => {
    const res = normalizeSheet([['profesional', 'fecha', 'estado'], ['Dr. X', '2026-11-01', 'pendiente']]);
    expect(res.rows[0]).toMatchObject({ paciente: 'Sin nombre', especialidad: 'Sin especialidad', hora: '00:00' });
  });
});
