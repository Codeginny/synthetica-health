import { getJson, postJson } from '@/lib/http';
import { mockAssistant, mockDashboard, MOCK_DOCTORS } from '@/mocks/dashboard';
import type { AssistantAnswer, DashboardData, DashboardFilters } from '@/types/analytics';

const USE_MOCKS = import.meta.env.VITE_USE_MOCKS === 'true';

const toParams = (f: DashboardFilters): Record<string, string> => ({
  from: f.from,
  to: f.to,
  ...(f.doctor ? { doctor: f.doctor } : {}),
  ...(f.status ? { status: f.status } : {}),
});

export const dashboardApi = {
  getDashboard(filters: DashboardFilters, signal?: AbortSignal): Promise<DashboardData> {
    if (USE_MOCKS) return Promise.resolve(mockDashboard(filters));
    return getJson<DashboardData>('/analytics/dashboard', toParams(filters), signal);
  },

  getDoctors(signal?: AbortSignal): Promise<string[]> {
    if (USE_MOCKS) return Promise.resolve(MOCK_DOCTORS);
    return getJson<string[]>('/analytics/doctors', undefined, signal);
  },

  askAssistant(question: string, filters: DashboardFilters, signal?: AbortSignal): Promise<AssistantAnswer> {
    if (USE_MOCKS) return Promise.resolve(mockAssistant(filters));
    return postJson<AssistantAnswer>('/assistant/query', { question, filters }, signal);
  },
};
