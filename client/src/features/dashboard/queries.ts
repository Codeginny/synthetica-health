import { keepPreviousData, useMutation, useQuery } from '@tanstack/react-query';
import { dashboardApi } from './api';
import { isValidRange } from '@/lib/dates';
import type { DashboardFilters } from '@/types/analytics';

export const dashboardKeys = {
  all: ['dashboard'] as const,
  data: (f: DashboardFilters) => [...dashboardKeys.all, 'data', f] as const,
  doctors: () => [...dashboardKeys.all, 'doctors'] as const,
};

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
