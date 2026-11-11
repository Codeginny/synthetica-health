import type { DashboardFilters } from '@/types/analytics';

/** Query keys compartidas entre el prefetch del servidor y los hooks del cliente. */
export const dashboardKeys = {
  all: ['dashboard'] as const,
  /** `source`: 'server' (API / demo) o el id del dataset importado. */
  data: (f: DashboardFilters, source = 'server') => [...dashboardKeys.all, 'data', source, f] as const,
  doctors: (source = 'server') => [...dashboardKeys.all, 'doctors', source] as const,
};
