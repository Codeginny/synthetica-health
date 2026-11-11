import { normalizeSheet, type ImportResult } from './normalize';

export const ACCEPTED_FILES = '.xlsx,.csv,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
const MAX_BYTES = 5 * 1024 * 1024;

export class ImportFileError extends Error {}

/** Lee el archivo en el navegador (no se sube a ningún servidor). Parsers cargados bajo demanda. */
export async function parseFile(file: File): Promise<ImportResult> {
  if (file.size > MAX_BYTES) throw new ImportFileError('El archivo supera los 5 MB.');
  const name = file.name.toLowerCase();

  if (name.endsWith('.csv')) {
    const Papa = (await import('papaparse')).default;
    const content = await file.text();
    const parsed = Papa.parse<string[]>(content.replace(/^﻿/, ''), { skipEmptyLines: 'greedy' });
    return normalizeSheet(parsed.data);
  }
  if (name.endsWith('.xlsx')) {
    const { readSheet } = await import('read-excel-file/browser');
    return normalizeSheet((await readSheet(file)) as unknown[][]);
  }
  throw new ImportFileError('Formato no soportado: usá un archivo .xlsx o .csv.');
}
