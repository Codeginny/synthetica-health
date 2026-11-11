import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { AppointmentRow } from '@/types/analytics';

export interface ImportedDataset {
  /** Identifica la versión del dataset (forma parte de la queryKey). */
  id: string;
  fileName: string;
  rows: AppointmentRow[];
  range: { from: string; to: string };
}

interface DatasetState {
  dataset: ImportedDataset | null;
  setDataset: (d: Omit<ImportedDataset, 'id'>) => void;
  clear: () => void;
}

/**
 * Datos importados desde Excel/CSV: viven sólo en este navegador (sessionStorage).
 * Mientras haya un dataset, el dashboard y el asistente calculan sobre él en el cliente.
 */
export const useDatasetStore = create<DatasetState>()(
  persist(
    (set) => ({
      dataset: null,
      setDataset: (d) => set({ dataset: { ...d, id: `${d.fileName}:${Date.now()}` } }),
      clear: () => set({ dataset: null }),
    }),
    { name: 'synthetica.dataset', storage: createJSONStorage(() => sessionStorage), skipHydration: true },
  ),
);

export const datasetSource = (d: ImportedDataset | null): string => d?.id ?? 'server';
export const resetDatasetStore = () => useDatasetStore.setState({ dataset: null });
