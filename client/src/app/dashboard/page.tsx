import type { Metadata } from 'next';
import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import OperationsDashboard from '@/features/dashboard/OperationsDashboard';
import { dashboardKeys } from '@/features/dashboard/keys';
import { createQueryClient } from '@/lib/queryClient';
import { parseFilters, recordParams } from '@/lib/filters';
import { isValidRange } from '@/lib/dates';
import { backend } from '@/server/backend';

export const metadata: Metadata = { title: 'Inteligencia operativa' };
export const dynamic = 'force-dynamic';

type Props = { searchParams: Record<string, string | string[] | undefined> };

/**
 * Server Component: lee los filtros de la URL, precarga datos en el servidor
 * y los hidrata en TanStack Query → primer paint con KPIs reales, sin skeletons ni waterfall.
 */
export default async function DashboardPage({ searchParams }: Props) {
  const filters = parseFilters(recordParams(searchParams));
  const qc = createQueryClient();

  await Promise.allSettled([
    qc.prefetchQuery({ queryKey: dashboardKeys.doctors(), queryFn: () => backend.doctors() }),
    isValidRange(filters.from, filters.to)
      ? qc.prefetchQuery({ queryKey: dashboardKeys.data(filters), queryFn: () => backend.dashboard(filters) })
      : Promise.resolve(),
  ]);

  return (
    <HydrationBoundary state={dehydrate(qc)}>
      <OperationsDashboard />
    </HydrationBoundary>
  );
}
