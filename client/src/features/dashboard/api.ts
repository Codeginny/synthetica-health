import { getJson, postJson } from '@/lib/http';
import type { AssistantAnswer, DashboardData, DashboardFilters } from '@/types/analytics';

const toParams = (f: DashboardFilters): Record<string, string> => ({
  from: f.from,
  to: f.to,
  ...(f.doctor ? { doctor: f.doctor } : {}),
  ...(f.status ? { status: f.status } : {}),
});

export const dashboardApi = {
  getDashboard: (filters: DashboardFilters, signal?: AbortSignal) =>
    getJson<DashboardData>('/bff/analytics/dashboard', toParams(filters), signal),
  getDoctors: (signal?: AbortSignal) => getJson<string[]>('/bff/analytics/doctors', undefined, signal),
  askAssistant: (question: string, filters: DashboardFilters, signal?: AbortSignal) =>
    postJson<AssistantAnswer>('/bff/assistant/query', { question, filters }, signal),
};
