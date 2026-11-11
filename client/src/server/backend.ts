import 'server-only';
import { cookies } from 'next/headers';
import { API_URL, DEMO_MODE, SESSION_COOKIE } from './config';
import { mockAssistant, mockDashboard, MOCK_DOCTORS } from '@/mocks/dashboard';
import type { AssistantAnswer, DashboardData, DashboardFilters } from '@/types/analytics';

export class BackendError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
  }
}

export const sessionToken = (): string | null => cookies().get(SESSION_COOKIE)?.value ?? null;

async function call<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = sessionToken();
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}), ...init.headers },
    cache: 'no-store',
  });
  const body = (await res.json().catch(() => ({}))) as { error?: string };
  if (!res.ok) throw new BackendError(res.status, body.error ?? `Error ${res.status}`);
  return body as T;
}

const toQuery = (f: DashboardFilters) =>
  new URLSearchParams({ from: f.from, to: f.to, ...(f.doctor ? { doctor: f.doctor } : {}), ...(f.status ? { status: f.status } : {}) });

/** Única puerta a los datos: la usan el render SSR y el BFF. */
export const backend = {
  dashboard: (f: DashboardFilters): Promise<DashboardData> =>
    DEMO_MODE ? Promise.resolve(mockDashboard(f)) : call(`/analytics/dashboard?${toQuery(f)}`),
  doctors: (): Promise<string[]> => (DEMO_MODE ? Promise.resolve(MOCK_DOCTORS) : call('/analytics/doctors')),
  ask: (question: string, filters: DashboardFilters): Promise<AssistantAnswer> =>
    DEMO_MODE
      ? Promise.resolve(mockAssistant(filters))
      : call('/assistant/query', { method: 'POST', body: JSON.stringify({ question, filters }) }),
};
