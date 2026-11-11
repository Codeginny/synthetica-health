'use client';

import { Database, FileSpreadsheet, RotateCcw, Upload } from 'lucide-react';
import { Button } from '@/components/ui';
import { useDatasetStore } from '@/stores/datasetStore';

export function DataSourceBanner({ onImport, onReset }: { onImport: () => void; onReset: () => void }) {
  const dataset = useDatasetStore((s) => s.dataset);
  return (
    <div
      role="status"
      className="flex flex-wrap items-center justify-between gap-3 rounded-card border border-brand-200 bg-brand-50 px-gutter py-3 text-caption text-brand-900 dark:border-brand-800 dark:bg-brand-900/30 dark:text-brand-100"
    >
      {dataset ? (
        <>
          <span className="flex items-center gap-2">
            <FileSpreadsheet aria-hidden="true" className="h-4 w-4" />
            Estás viendo <strong>{dataset.fileName}</strong> · {dataset.rows.length.toLocaleString('es-AR')} turnos (sólo en este navegador)
          </span>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" onClick={onImport}><Upload aria-hidden="true" className="h-4 w-4" /> Otro archivo</Button>
            <Button variant="ghost" size="sm" onClick={onReset}><RotateCcw aria-hidden="true" className="h-4 w-4" /> Datos de ejemplo</Button>
          </div>
        </>
      ) : (
        <>
          <span className="flex items-center gap-2">
            <Database aria-hidden="true" className="h-4 w-4" />
            Estás viendo <strong>datos de ejemplo</strong>. Probá la plataforma con los turnos de tu clínica.
          </span>
          <Button size="sm" onClick={onImport}><Upload aria-hidden="true" className="h-4 w-4" /> Importar Excel/CSV</Button>
        </>
      )}
    </div>
  );
}
