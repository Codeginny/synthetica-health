'use client';

import { useEffect, useId, useRef, useState, type DragEvent } from 'react';
import { CheckCircle2, Download, FileSpreadsheet, Upload, X } from 'lucide-react';
import { Button, cn } from '@/components/ui';
import { formatShortDate } from '@/lib/dates';
import { useDatasetStore } from '@/stores/datasetStore';
import { ACCEPTED_FILES, ImportFileError, parseFile } from './parseFile';
import type { ImportResult } from './normalize';

const COLUMNS = [
  { name: 'profesional', example: 'Dra. Lucía Paz', required: true },
  { name: 'fecha', example: '2026-11-05 o 05/11/2026', required: true },
  { name: 'estado', example: 'pendiente · confirmado · completado · cancelado', required: true },
  { name: 'hora', example: '09:30', required: false },
  { name: 'especialidad', example: 'Cardiología', required: false },
  { name: 'paciente', example: 'Sofía Gómez', required: false },
  { name: 'precio', example: '45000 (si falta: $ 30.000)', required: false },
];

export interface ImportDialogProps {
  open: boolean;
  onClose: () => void;
  /** Se llama al aplicar el archivo, con el rango de fechas de los datos. */
  onImported: (range: { from: string; to: string }) => void;
}

export function ImportDialog({ open, onClose, onImported }: ImportDialogProps) {
  const titleId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const setDataset = useDatasetStore((s) => s.setDataset);
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (open) return;
    setFile(null);
    setResult(null);
    setError(null);
  }, [open]);

  async function handleFile(f: File | undefined) {
    if (!f) return;
    setFile(f);
    setResult(null);
    setError(null);
    setLoading(true);
    try {
      setResult(await parseFile(f));
    } catch (err) {
      setError(err instanceof ImportFileError ? err.message : 'No se pudo leer el archivo. Revisá que sea un .xlsx o .csv válido.');
    } finally {
      setLoading(false);
    }
  }

  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    setDragging(false);
    void handleFile(e.dataTransfer.files[0]);
  };

  function apply() {
    if (!result?.range || !file) return;
    setDataset({ fileName: file.name, rows: result.rows, range: result.range });
    onImported(result.range);
    onClose();
  }

  if (!open) return null;
  const canApply = !!result && result.rows.length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-950/60 p-gutter backdrop-blur-sm">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-card border border-line bg-surface-raised p-section shadow-card"
      >
        <header className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h2 id={titleId} className="text-title text-content">Probá Synthetica con tus datos</h2>
            <p className="text-caption text-content-muted">
              Subí un Excel o CSV con tus turnos. Se procesa en tu navegador: el archivo no se envía a ningún servidor.
            </p>
          </div>
          <Button ref={closeRef} variant="ghost" size="sm" onClick={onClose} aria-label="Cerrar importador">
            <X aria-hidden="true" className="h-4 w-4" />
          </Button>
        </header>

        <section aria-labelledby={`${titleId}-cols`} className="mb-4">
          <div className="mb-2 flex items-center justify-between gap-2">
            <h3 id={`${titleId}-cols`} className="text-body font-semibold text-content">1. Prepará el archivo con estas columnas</h3>
            <a
              href="/plantilla-turnos.csv"
              download
              className="inline-flex items-center gap-1.5 rounded-control px-2 py-1 text-caption font-medium text-accent hover:bg-surface-muted focus-visible:shadow-focus focus-visible:outline-none"
            >
              <Download aria-hidden="true" className="h-4 w-4" /> Descargar plantilla
            </a>
          </div>
          <table className="w-full text-left text-caption">
            <caption className="sr-only">Columnas del archivo de turnos</caption>
            <thead className="text-content-muted">
              <tr>
                <th scope="col" className="py-1 pr-3 font-medium">Columna</th>
                <th scope="col" className="py-1 pr-3 font-medium">Ejemplo</th>
                <th scope="col" className="py-1 font-medium">¿Obligatoria?</th>
              </tr>
            </thead>
            <tbody>
              {COLUMNS.map((c) => (
                <tr key={c.name} className="border-t border-line">
                  <th scope="row" className="py-1.5 pr-3 font-mono font-medium text-content">{c.name}</th>
                  <td className="py-1.5 pr-3 text-content-muted">{c.example}</td>
                  <td className="py-1.5 text-content-muted">{c.required ? 'Sí' : 'No'}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-2 text-caption text-content-subtle">
            Los encabezados pueden ir con o sin acentos. También se aceptan “atendido” (completado) y “ausente” (cancelado).
          </p>
        </section>

        <section aria-labelledby={`${titleId}-up`} className="mb-4">
          <h3 id={`${titleId}-up`} className="mb-2 text-body font-semibold text-content">2. Subilo</h3>
          <label
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
            className={cn(
              'flex cursor-pointer flex-col items-center justify-center gap-2 rounded-card border-2 border-dashed p-6 text-center transition-colors',
              'focus-within:shadow-focus',
              dragging ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/30' : 'border-line-strong hover:border-brand-400',
            )}
          >
            <Upload aria-hidden="true" className="h-7 w-7 text-accent" />
            <span className="text-body text-content">Arrastrá el archivo acá o <span className="font-semibold text-accent underline">elegilo</span></span>
            <span className="text-caption text-content-subtle">.xlsx o .csv · hasta 5 MB · hasta 20.000 turnos</span>
            <input
              ref={inputRef}
              type="file"
              accept={ACCEPTED_FILES}
              className="sr-only"
              onChange={(e) => void handleFile(e.target.files?.[0])}
            />
          </label>
        </section>

        <div aria-live="polite" aria-busy={loading}>
          {loading && <p className="text-caption text-content-muted">Leyendo {file?.name}…</p>}
          {error && <p role="alert" className="rounded-control bg-status-cancelled/10 p-3 text-caption text-status-cancelled">{error}</p>}
          {result && result.missingColumns.length > 0 && (
            <p role="alert" className="rounded-control bg-status-cancelled/10 p-3 text-caption text-status-cancelled">
              Faltan columnas obligatorias: <strong>{result.missingColumns.join(', ')}</strong>. Revisá los encabezados de la primera fila.
            </p>
          )}
          {result && result.missingColumns.length === 0 && (
            <div className="space-y-2 rounded-control border border-line bg-surface p-3">
              <p className="flex items-center gap-2 text-body text-content">
                <FileSpreadsheet aria-hidden="true" className="h-5 w-5 text-accent" />
                <span>
                  <strong>{result.rows.length.toLocaleString('es-AR')}</strong> turnos listos de {result.totalRows.toLocaleString('es-AR')} filas
                  {result.range && <> · del {formatShortDate(result.range.from)} al {formatShortDate(result.range.to)}</>}
                </span>
              </p>
              {result.errors.length > 0 && (
                <details className="text-caption text-content-muted">
                  <summary className="cursor-pointer">{result.errors.length} filas con problemas (no se importan)</summary>
                  <ul className="mt-1 list-disc pl-5">
                    {result.errors.slice(0, 8).map((e) => (
                      <li key={e.row}>Fila {e.row}: {e.message}</li>
                    ))}
                  </ul>
                </details>
              )}
            </div>
          )}
        </div>

        <footer className="mt-5 flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button onClick={apply} disabled={!canApply}>
            <CheckCircle2 aria-hidden="true" className="h-4 w-4" /> 3. Ver mi dashboard
          </Button>
        </footer>
      </div>
    </div>
  );
}
