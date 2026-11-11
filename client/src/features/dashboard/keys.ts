import type { DashboardFilters } from '@/types/analytics';

/** Query keys compartidas entre el prefetch del servidor y los hooks del cliente. */
export const dashboardKeys = {
  all: ['dashboard'] as const,
  data: (f: DashboardFilters) => [...dashboardKeys.all, 'data', f] as const,
  doctors: () => [...dashboardKeys.all, 'doctors'] as const,
};
