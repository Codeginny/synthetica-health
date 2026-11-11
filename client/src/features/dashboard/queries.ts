import { keepPreviousData, useMutation, useQuery } from '@tanstack/react-query';
import { dashboardApi } from './api';
import { isValidRange } from '@/lib/dates';
import type { DashboardFilters } from '@/types/analytics';
import { dashboardKeys } from './keys';
import { buildDashboard } from './aggregate';
import { answerFromDashboard } from '@/mocks/dashboard';
import { datasetSource, useDatasetStore } from '@/stores/datasetStore';

export { dashboardKeys };


export function useDashboardData(filters: DashboardFilters) {
  const dataset = useDatasetStore((s) => s.dataset);
  return useQuery({
    queryKey: dashboardKeys.data(filters, datasetSource(dataset)),
    // Con un archivo importado se calcula en el navegador; si no, GraphQL vía BFF.
    queryFn: ({ signal }) =>
      dataset ? Promise.resolve(buildDashboard(dataset.rows, filters)) : dashboardApi.getDashboard(filters, signal),
    enabled: isValidRange(filters.from, filters.to),
    placeholderData: keepPreviousData,
    staleTime: 60_000,
  });
}

export function useDoctors() {
  const dataset = useDatasetStore((s) => s.dataset);
  return useQuery({
    queryKey: dashboardKeys.doctors(datasetSource(dataset)),
    queryFn: ({ signal }) =>
      dataset ? Promise.resolve([...new Set(dataset.rows.map((r) => r.profesional))].sort()) : dashboardApi.getDoctors(signal),
    staleTime: 10 * 60_000,
  });
}

export function useAssistantQuery(filters: DashboardFilters) {
  return useMutation({
    mutationFn: (question: string) => {
      const dataset = useDatasetStore.getState().dataset;
      return dataset
        ? Promise.resolve(answerFromDashboard(buildDashboard(dataset.rows, filters)))
        : dashboardApi.askAssistant(question, filters);
    },
  });
}
