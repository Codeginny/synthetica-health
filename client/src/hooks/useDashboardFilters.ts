'use client';

import { useCallback, useMemo } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import type { DashboardFilters } from '@/types/analytics';
import { filtersToSearch, parseFilters } from '@/lib/filters';

export { defaultFilters, parseFilters } from '@/lib/filters';

/** Filtros sincronizados con la query string: compartibles por URL, estables como queryKey y legibles en SSR. */
export function useDashboardFilters() {
  const params = useSearchParams();
  const pathname = usePathname();
  const filters = useMemo(() => parseFilters(params), [params]);

  const update = useCallback(
    (patch: Partial<DashboardFilters>) => {
      // Shallow: actualiza la URL sin re-render del servidor; TanStack Query refetchea vía BFF.
      window.history.replaceState(null, '', `${pathname}?${filtersToSearch({ ...filters, ...patch })}`);
    },
    [filters, pathname],
  );

  const reset = useCallback(() => window.history.replaceState(null, '', pathname), [pathname]);

  return { filters, update, reset };
}
