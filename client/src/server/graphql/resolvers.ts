import 'server-only';
import { GraphQLError } from 'graphql';
import { backend } from '@/server/backend';
import { isValidRange } from '@/lib/dates';
import type { DashboardFilters } from '@/types/analytics';

interface FiltersArg {
  filters: { from: string; to: string; doctor?: string | null; status?: DashboardFilters['status'] };
}

/** Root resolvers: delegan en la misma capa `backend` que usan el SSR y el BFF REST. */
export const rootValue = {
  async dashboard({ filters }: FiltersArg) {
    const f: DashboardFilters = { from: filters.from, to: filters.to, doctor: filters.doctor ?? null, status: filters.status ?? null };
    if (!isValidRange(f.from, f.to)) {
      throw new GraphQLError('Rango de fechas inválido', { extensions: { code: 'BAD_USER_INPUT' } });
    }
    const data = await backend.dashboard(f);
    return { ...data, turnos: ({ limit }: { limit: number }) => data.turnos.slice(0, Math.max(0, Math.min(limit, 200))) };
  },
  doctors: () => backend.doctors(),
};
