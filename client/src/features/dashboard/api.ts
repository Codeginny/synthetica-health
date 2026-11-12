import { postJson } from '@/lib/http';
import { gql } from '@/lib/graphql';
import type { AssistantAnswer, DashboardData, DashboardFilters } from '@/types/analytics';

const DASHBOARD_QUERY = /* GraphQL */ `
  query Dashboard($filters: DashboardFiltersInput!) {
    dashboard(filters: $filters) {
      kpis { total pendientes confirmados completados cancelados tasaAusentismo ingresos facturacionPerdida }
      serie { fecha total completados cancelados }
      porEspecialidad { especialidad total cancelados perdida }
      porHora { hora total cancelados tasa }
      porDiaFranja { dia franja total cancelados tasa promedio }
      turnos { id paciente profesional especialidad fecha hora estado precio }
    }
  }
`;

const DOCTORS_QUERY = /* GraphQL */ `
  query Doctors {
    doctors
  }
`;

export const dashboardApi = {
  /** GraphQL: la UI pide exactamente los campos que renderiza. */
  async getDashboard(filters: DashboardFilters, signal?: AbortSignal): Promise<DashboardData> {
    const { dashboard } = await gql<{ dashboard: Omit<DashboardData, 'filters'> }>(DASHBOARD_QUERY, { filters }, signal);
    return { ...dashboard, filters };
  },
  async getDoctors(signal?: AbortSignal): Promise<string[]> {
    return (await gql<{ doctors: string[] }>(DOCTORS_QUERY, undefined, signal)).doctors;
  },
  /** REST: el asistente es una operación de comando, no de lectura de grafo. */
  askAssistant: (question: string, filters: DashboardFilters, signal?: AbortSignal) =>
    postJson<AssistantAnswer>('/bff/assistant/query', { question, filters }, signal),
};
