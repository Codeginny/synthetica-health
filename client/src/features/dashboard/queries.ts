import { keepPreviousData, useMutation, useQuery } from '@tanstack/react-query';
import { dashboardApi } from './api';
import { isValidRange } from '@/lib/dates';
import type { DashboardFilters } from '@/types/analytics';
import { dashboardKeys } from './keys';

export { dashboardKeys };


export function useDashboardData(filters: DashboardFilters) {
  return useQuery({
    queryKey: dashboardKeys.data(filters),
    queryFn: ({ signal }) => dashboardApi.getDashboard(filters, signal),
    enabled: isValidRange(filters.from, filters.to),
    placeholderData: keepPreviousData,
    staleTime: 60_000,
  });
}

export function useDoctors() {
  return useQuery({
    queryKey: dashboardKeys.doctors(),
    queryFn: ({ signal }) => dashboardApi.getDoctors(signal),
    staleTime: 10 * 60_000,
  });
}

export function useAssistantQuery(filters: DashboardFilters) {
  return useMutation({
    mutationFn: (question: string) => dashboardApi.askAssistant(question, filters),
  });
}
